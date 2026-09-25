import { Router, Response } from 'express';
import { Offer, Business } from '../db/db.js';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth.js';

const router = Router();

// Get offers by business
router.get('/business/:businessId', async (req, res) => {
  try {
    const offers = await Offer.find({ business: req.params.businessId, isActive: true });
    return res.json({
      success: true,
      data: offers,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Validate coupon code
router.post('/validate', async (req, res) => {
  try {
    const { businessId, couponCode, subtotal } = req.body;

    if (!businessId || !couponCode) {
      return res.status(400).json({ success: false, message: 'businessId and couponCode are required.' });
    }

    const offer = await Offer.findOne({
      business: businessId,
      couponCode: couponCode.trim().toUpperCase(),
      isActive: true,
    });

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code for this business.' });
    }

    const now = new Date();
    if (offer.endDate && new Date(offer.endDate) < now) {
      return res.status(400).json({ success: false, message: 'This coupon offer has expired.' });
    }

    if (offer.startDate && new Date(offer.startDate) > now) {
      return res.status(400).json({ success: false, message: 'This offer is not yet active.' });
    }

    const orderSubtotal = Number(subtotal) || 0;
    if (offer.minimumOrder && orderSubtotal < offer.minimumOrder) {
      return res.status(400).json({
        success: false,
        message: `Order subtotal of $${orderSubtotal.toFixed(2)} does not meet the minimum requirement of $${offer.minimumOrder.toFixed(2)} for this coupon.`,
      });
    }

    let discount = 0;
    if (offer.discountType === 'percentage') {
      discount = (orderSubtotal * Number(offer.discountValue)) / 100;
      if (offer.maximumDiscount && discount > offer.maximumDiscount) {
        discount = offer.maximumDiscount;
      }
    } else {
      discount = Math.min(Number(offer.discountValue), orderSubtotal);
    }

    return res.json({
      success: true,
      message: `Coupon applied: ${offer.title}`,
      data: {
        couponCode: offer.couponCode,
        discount: Number(discount.toFixed(2)),
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        offerId: offer._id,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Create offer
router.post('/', authenticateToken, requireRole('owner', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { businessId, title, description, discountType, discountValue, couponCode, startDate, endDate, minimumOrder, maximumDiscount } = req.body;

    if (!businessId || !title || !discountType || discountValue === undefined) {
      return res.status(400).json({ success: false, message: 'businessId, title, discountType, and discountValue are required.' });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    if (req.user!.role !== 'admin' && business.owner !== req.user!._id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to add offers for this business.' });
    }

    const newOffer = await Offer.create({
      business: businessId,
      title: title.trim(),
      description: description || '',
      discountType,
      discountValue: Number(discountValue),
      couponCode: couponCode ? couponCode.trim().toUpperCase() : '',
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || new Date(Date.now() + 30 * 86400000).toISOString(),
      minimumOrder: Number(minimumOrder) || 0,
      maximumDiscount: maximumDiscount ? Number(maximumDiscount) : null,
      applicableProducts: [],
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Offer created successfully.',
      data: newOffer,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Update offer
router.put('/:id', authenticateToken, requireRole('owner', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    const business = await Business.findById(offer.business);
    if (business && req.user!.role !== 'admin' && business.owner !== req.user!._id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this offer.' });
    }

    const updated = await Offer.findByIdAndUpdate(req.params.id, {
      ...req.body,
      ...(req.body.couponCode ? { couponCode: req.body.couponCode.trim().toUpperCase() } : {}),
      ...(req.body.discountValue !== undefined ? { discountValue: Number(req.body.discountValue) } : {}),
    });

    return res.json({
      success: true,
      message: 'Offer updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Delete offer
router.delete('/:id', authenticateToken, requireRole('owner', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    const business = await Business.findById(offer.business);
    if (business && req.user!.role !== 'admin' && business.owner !== req.user!._id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this offer.' });
    }

    await Offer.findByIdAndDelete(req.params.id);
    return res.json({
      success: true,
      message: 'Offer deleted successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
