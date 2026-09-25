import { Router, Response } from 'express';
import { User, Business, Order, Review, Category } from '../db/db.js';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth.js';

const router = Router();

// Middleware: all admin routes require role 'admin'
router.use(authenticateToken, requireRole('admin'));

// Platform Analytics
router.get('/analytics', async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find();
    const businesses = await Business.find();
    const orders = await Order.find();
    const reviews = await Review.find();

    const activeBusinesses = businesses.filter(b => b.status === 'active');
    const suspendedBusinesses = businesses.filter(b => b.status === 'suspended');
    const completedOrders = orders.filter(o => o.orderStatus === 'Completed');
    const totalGmv = completedOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    const roleBreakdown = {
      customers: users.filter(u => u.role === 'customer').length,
      owners: users.filter(u => u.role === 'owner').length,
      admins: users.filter(u => u.role === 'admin').length,
    };

    // Category distribution
    const categoryCounts: Record<string, number> = {};
    businesses.forEach(b => {
      categoryCounts[b.category] = (categoryCounts[b.category] || 0) + 1;
    });

    const categoriesChart = Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value,
    }));

    return res.json({
      success: true,
      data: {
        totalUsers: users.length,
        totalBusinesses: businesses.length,
        activeBusinesses: activeBusinesses.length,
        suspendedBusinesses: suspendedBusinesses.length,
        totalOrders: orders.length,
        completedOrders: completedOrders.length,
        totalGmv: Number(totalGmv.toFixed(2)),
        totalReviews: reviews.length,
        roleBreakdown,
        categoriesChart,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get all users
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const sanitized = users.map((u: any) => {
      const obj = typeof u.toObject === 'function' ? u.toObject() : { ...u };
      const { password, ...rest } = obj;
      return rest;
    });
    return res.json({
      success: true,
      data: sanitized,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Delete user
router.delete('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (req.params.id === req.user!._id) {
      return res.status(400).json({ success: false, message: 'Admin cannot delete their own account.' });
    }
    await User.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get all businesses (with owner details)
router.get('/businesses', async (req: AuthRequest, res: Response) => {
  try {
    const businesses = await Business.find().sort({ createdAt: -1 });
    const users = await User.find();
    const userMap = new Map(users.map((u: any) => [u._id, u]));

    const enriched = businesses.map((b: any) => {
      const obj = typeof b.toObject === 'function' ? b.toObject() : { ...b };
      const ownerUser = userMap.get(obj.owner);
      return {
        ...obj,
        ownerDetails: ownerUser ? {
          name: ownerUser.name,
          email: ownerUser.email,
          phone: ownerUser.phone,
        } : null,
      };
    });

    return res.json({
      success: true,
      data: enriched,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Update business status (active / suspended)
router.put('/businesses/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be active, suspended, or pending.' });
    }

    const updated = await Business.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    return res.json({
      success: true,
      message: `Business status updated to ${status}.`,
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get all platform orders
router.get('/orders', async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get all reviews
router.get('/reviews', async (req: AuthRequest, res: Response) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    return res.json({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Delete inappropriate review
router.delete('/reviews/:id', async (req: AuthRequest, res: Response) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate business rating
    const remainingReviews = await Review.find({ business: review.business });
    const reviewCount = remainingReviews.length;
    let rating = 0;
    if (reviewCount > 0) {
      const totalStars = remainingReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
      rating = Number((totalStars / reviewCount).toFixed(1));
    }
    await Business.findByIdAndUpdate(review.business, { rating, reviewCount });

    return res.json({
      success: true,
      message: 'Review moderated and removed successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
