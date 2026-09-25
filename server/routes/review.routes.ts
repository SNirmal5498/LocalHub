import { Router, Response } from 'express';
import { Review, Business, Order, Notification } from '../db/db.js';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth.js';

const router = Router();

// Recalculate business average rating and review count
async function updateBusinessRating(businessId: string) {
  const reviews = await Review.find({ business: businessId });
  const reviewCount = reviews.length;
  let rating = 0;

  if (reviewCount > 0) {
    const totalStars = reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
    rating = Number((totalStars / reviewCount).toFixed(1));
  }

  await Business.findByIdAndUpdate(businessId, { rating, reviewCount });
}

// Get reviews for a business
router.get('/business/:businessId', async (req, res) => {
  try {
    const reviews = await Review.find({ business: req.params.businessId }).sort({ createdAt: -1 });
    return res.json({
      success: true,
      data: reviews,
      count: reviews.length,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Create review (Customer)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId, rating, comment, orderId } = req.body;

    if (!businessId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'businessId, rating (1-5), and comment are required.' });
    }

    const starRating = Math.min(5, Math.max(1, parseInt(String(rating), 10)));
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    // Optional check: if orderId is provided, verify it belongs to this customer & completed
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && order.customer.toString() !== req.user!._id.toString()) {
        return res.status(403).json({ success: false, message: 'Order does not belong to you.' });
      }
    }

    const newReview = await Review.create({
      customer: req.user!._id,
      customerName: req.user!.name,
      business: businessId,
      order: orderId || null,
      rating: starRating,
      comment: comment.trim(),
      ownerResponse: null,
    });

    await updateBusinessRating(businessId);

    // Notify business owner
    await Notification.create({
      user: business.owner,
      title: `New ${starRating}-Star Review!`,
      message: `${req.user!.name} left a ${starRating}-star review for ${business.name}.`,
      type: 'review',
      relatedId: newReview._id,
      isRead: false,
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been published.',
      data: newReview,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Update review
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    if (review.customer.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only edit your own reviews.' });
    }

    const { rating, comment } = req.body;
    const updated = await Review.findByIdAndUpdate(req.params.id, {
      ...(rating ? { rating: Math.min(5, Math.max(1, parseInt(String(rating), 10))) } : {}),
      ...(comment ? { comment: comment.trim() } : {}),
    }, { new: true });

    await updateBusinessRating(review.business);

    return res.json({
      success: true,
      message: 'Review updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Delete review
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    if (review.customer.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only delete your own reviews.' });
    }

    await Review.findByIdAndDelete(req.params.id);
    await updateBusinessRating(review.business);

    return res.json({
      success: true,
      message: 'Review removed successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Respond to review (Business Owner or Admin)
router.post('/:id/respond', authenticateToken, requireRole('owner', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { response } = req.body;
    if (!response || !response.trim()) {
      return res.status(400).json({ success: false, message: 'Response text is required.' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const business = await Business.findById(review.business);
    if (business && req.user!.role !== 'admin' && business.owner.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to respond to reviews for this business.' });
    }

    const updated = await Review.findByIdAndUpdate(req.params.id, {
      ownerResponse: response.trim(),
    }, { new: true });

    // Notify customer
    await Notification.create({
      user: review.customer,
      title: `${business?.name || 'Store Owner'} responded to your review`,
      message: `"${response.trim().substring(0, 100)}..."`,
      type: 'review',
      relatedId: review._id,
      isRead: false,
    });

    return res.json({
      success: true,
      message: 'Response posted successfully.',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
