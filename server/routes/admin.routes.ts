import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, Business, Order, Review, Category, Notification } from '../db/db.js';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth.js';

const router = Router();

// Middleware: all admin routes require role 'admin'
router.use(authenticateToken, requireRole('admin'));

// Helper: recalculate business average rating excluding hidden reviews
async function updateBusinessRating(businessId: string) {
  const reviews = await Review.find({ business: businessId, status: { $ne: 'hidden' } });
  const reviewCount = reviews.length;
  let rating = 0;
  if (reviewCount > 0) {
    const totalStars = reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
    rating = Number((totalStars / reviewCount).toFixed(1));
  }
  await Business.findByIdAndUpdate(businessId, { rating, reviewCount });
}

// -------------------------------------------------------------
// 1. Platform Analytics & Overview
// -------------------------------------------------------------
router.get('/analytics', async (req: AuthRequest, res: Response) => {
  try {
    const range = (req.query.range as string) || 'all';

    const now = new Date();
    let startDate: Date | null = null;
    if (range === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (range === 'this_month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Fetch baseline collections
    const [allUsers, allBusinesses, allOrders, allReviews] = await Promise.all([
      User.find(),
      Business.find(),
      Order.find(),
      Review.find(),
    ]);

    // Filter orders and reviews if range is specified
    const orders = startDate
      ? allOrders.filter(o => new Date(o.createdAt) >= startDate!)
      : allOrders;

    const completedOrders = orders.filter(o => o.orderStatus === 'Completed');
    const pendingOrders = orders.filter(o => ['Pending', 'Accepted', 'Preparing', 'Ready', 'Out for Delivery'].includes(o.orderStatus));
    const cancelledOrders = orders.filter(o => ['Cancelled', 'Rejected'].includes(o.orderStatus));

    const totalGmv = completedOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const averageOrderValue = completedOrders.length > 0 ? Number((totalGmv / completedOrders.length).toFixed(2)) : 0;

    // Business statuses
    const activeBusinesses = allBusinesses.filter(b => b.status === 'active');
    const pendingBusinesses = allBusinesses.filter(b => b.status === 'pending');
    const suspendedBusinesses = allBusinesses.filter(b => b.status === 'suspended');
    const rejectedBusinesses = allBusinesses.filter(b => b.status === 'rejected');

    // User breakdown
    const roleBreakdown = {
      customers: allUsers.filter(u => u.role === 'customer').length,
      owners: allUsers.filter(u => u.role === 'owner' || u.role === 'business_owner').length,
      admins: allUsers.filter(u => u.role === 'admin').length,
    };

    // Category distribution
    const categoryCounts: Record<string, number> = {};
    allBusinesses.forEach(b => {
      if (b.category) {
        categoryCounts[b.category] = (categoryCounts[b.category] || 0) + 1;
      }
    });

    const categoriesChart = Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // Order status breakdown chart data
    const orderStatusCounts: Record<string, number> = {
      Completed: completedOrders.length,
      Pending: orders.filter(o => o.orderStatus === 'Pending').length,
      In_Progress: orders.filter(o => ['Accepted', 'Preparing', 'Ready', 'Out for Delivery'].includes(o.orderStatus)).length,
      Cancelled: cancelledOrders.length,
    };

    const orderStatusChart = Object.entries(orderStatusCounts).map(([status, count]) => ({
      status: status.replace('_', ' '),
      count,
    }));

    // Review counts
    const hiddenReviewsCount = allReviews.filter(r => r.status === 'hidden').length;
    const flaggedReviewsCount = allReviews.filter(r => r.status === 'flagged').length;

    return res.json({
      success: true,
      data: {
        range,
        totalUsers: allUsers.length,
        totalBusinesses: allBusinesses.length,
        activeBusinesses: activeBusinesses.length,
        pendingBusinesses: pendingBusinesses.length,
        suspendedBusinesses: suspendedBusinesses.length,
        rejectedBusinesses: rejectedBusinesses.length,
        totalOrders: orders.length,
        completedOrders: completedOrders.length,
        pendingOrders: pendingOrders.length,
        cancelledOrders: cancelledOrders.length,
        totalGmv: Number(totalGmv.toFixed(2)),
        averageOrderValue,
        totalReviews: allReviews.length,
        hiddenReviews: hiddenReviewsCount,
        flaggedReviews: flaggedReviewsCount,
        roleBreakdown,
        categoriesChart,
        orderStatusChart,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// 2. Manage Businesses
// -------------------------------------------------------------
router.get('/businesses', async (req: AuthRequest, res: Response) => {
  try {
    const { q, category, status } = req.query;

    const [businesses, users, orders] = await Promise.all([
      Business.find().sort({ createdAt: -1 }),
      User.find(),
      Order.find(),
    ]);

    const userMap = new Map(users.map((u: any) => [u._id, u]));

    // Map order counts and gmv per business
    const orderStatsMap = new Map<string, { orderCount: number; gmv: number }>();
    orders.forEach(o => {
      const bId = o.business?.toString();
      if (bId) {
        const current = orderStatsMap.get(bId) || { orderCount: 0, gmv: 0 };
        current.orderCount += 1;
        if (o.orderStatus === 'Completed') {
          current.gmv += Number(o.totalAmount) || 0;
        }
        orderStatsMap.set(bId, current);
      }
    });

    let enriched = businesses.map((b: any) => {
      const obj = typeof b.toObject === 'function' ? b.toObject() : { ...b };
      const ownerUser = userMap.get(obj.owner);
      const stats = orderStatsMap.get(obj._id) || { orderCount: 0, gmv: 0 };
      return {
        ...obj,
        orderCount: stats.orderCount,
        totalRevenue: Number(stats.gmv.toFixed(2)),
        ownerDetails: ownerUser ? {
          name: ownerUser.name,
          email: ownerUser.email,
          phone: ownerUser.phone,
        } : null,
      };
    });

    // Apply filtering
    if (status && status !== 'all') {
      enriched = enriched.filter(b => b.status === status);
    }

    if (category && category !== 'all') {
      const catLower = String(category).toLowerCase().trim();
      enriched = enriched.filter(b => (b.category || '').toLowerCase().trim() === catLower);
    }

    if (q) {
      const queryStr = String(q).toLowerCase().trim();
      enriched = enriched.filter(b =>
        (b.name || '').toLowerCase().includes(queryStr) ||
        (b.city || '').toLowerCase().includes(queryStr) ||
        (b.category || '').toLowerCase().includes(queryStr) ||
        (b.ownerDetails?.name || '').toLowerCase().includes(queryStr) ||
        (b.ownerDetails?.email || '').toLowerCase().includes(queryStr)
      );
    }

    return res.json({
      success: true,
      data: enriched,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Update business status (approve, suspend, reject, reactivate) with reason and audit
router.put('/businesses/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { status, reason } = req.body;
    const allowedStatuses = ['active', 'suspended', 'pending', 'rejected'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be active, suspended, pending, or rejected.',
      });
    }

    // Require reason for suspension or rejection
    if (['suspended', 'rejected'].includes(status) && (!reason || typeof reason !== 'string' || reason.trim().length < 3)) {
      return res.status(400).json({
        success: false,
        message: `A reason of at least 3 characters is required to ${status === 'rejected' ? 'reject' : 'suspend'} a store.`,
      });
    }

    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    const cleanReason = (reason || '').trim();
    const adminIdentifier = req.user?.email || req.user?.name || 'Administrator';

    business.status = status;
    business.statusReason = cleanReason;
    if (!business.statusAudit) {
      business.statusAudit = [];
    }
    business.statusAudit.push({
      status,
      reason: cleanReason,
      changedBy: adminIdentifier,
      changedAt: new Date(),
    });

    await business.save();

    // Send notification to store owner
    let notificationTitle = 'Storefront Status Update';
    let notificationMessage = `Your storefront "${business.name}" status has been set to ${status}.`;

    if (status === 'active') {
      notificationTitle = 'Storefront Approved & Published!';
      notificationMessage = `Congratulations! Your store "${business.name}" is now live on LocalHub.`;
    } else if (status === 'rejected') {
      notificationTitle = 'Storefront Application Rejected';
      notificationMessage = `Your store application was rejected. Reason: ${cleanReason}`;
    } else if (status === 'suspended') {
      notificationTitle = 'Storefront Suspended';
      notificationMessage = `Your store has been suspended. Reason: ${cleanReason}`;
    }

    await Notification.create({
      user: business.owner,
      title: notificationTitle,
      message: notificationMessage,
      type: 'message',
      relatedId: business._id,
      isRead: false,
    });

    return res.json({
      success: true,
      message: `Business status updated to ${status}.`,
      data: business,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// 3. Manage Users
// -------------------------------------------------------------
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const { q, role } = req.query;
    let users = await User.find().sort({ createdAt: -1 });

    if (role && role !== 'all') {
      if (role === 'owner') {
        users = users.filter(u => u.role === 'owner' || u.role === 'business_owner');
      } else {
        users = users.filter(u => u.role === role);
      }
    }

    if (q) {
      const queryStr = String(q).toLowerCase().trim();
      users = users.filter(u =>
        (u.name || '').toLowerCase().includes(queryStr) ||
        (u.email || '').toLowerCase().includes(queryStr) ||
        (u.phone || '').toLowerCase().includes(queryStr)
      );
    }

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

// Admin creates a user
router.post('/users', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, role, password } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Please provide a full name of at least 2 characters.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const allowedRoles = ['customer', 'owner', 'admin'];
    const assignedRole = allowedRoles.includes(role) ? role : 'customer';

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      phone: (phone || '').trim(),
      role: assignedRole,
      password: hashedPassword,
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: userObj,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin updates a user (role, name, phone)
router.put('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userToUpdate = await User.findById(req.params.id);
    if (!userToUpdate) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { role, name, phone } = req.body;

    // Guard: Prevent demoting the last remaining admin
    if (role && role !== 'admin' && userToUpdate.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot revoke admin role. Platform requires at least one active administrator.',
        });
      }
    }

    if (role && ['customer', 'owner', 'admin'].includes(role)) {
      userToUpdate.role = role;
    }
    if (name && typeof name === 'string' && name.trim().length >= 2) {
      userToUpdate.name = name.trim();
    }
    if (phone !== undefined) {
      userToUpdate.phone = String(phone).trim();
    }

    await userToUpdate.save();

    const sanitized = userToUpdate.toObject();
    delete sanitized.password;

    return res.json({
      success: true,
      message: 'User account updated successfully.',
      data: sanitized,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin deletes user account with safeguards
router.delete('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    // Safeguard 1: Admin cannot delete their own account
    if (req.params.id === req.user!._id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own administrator account while logged in.',
      });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    // Safeguard 2: Cannot delete the last administrator
    if (targetUser.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last remaining administrator account on the platform.',
        });
      }
    }

    await User.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: `Account for ${targetUser.name} deleted successfully.` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// 4. Platform Orders
// -------------------------------------------------------------
router.get('/orders', async (req: AuthRequest, res: Response) => {
  try {
    const { q, status, range } = req.query;

    let orders = await Order.find().sort({ createdAt: -1 });

    if (status && status !== 'all') {
      orders = orders.filter(o => o.orderStatus === status);
    }

    if (range && range !== 'all') {
      const now = new Date();
      let startDate: Date | null = null;
      if (range === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (range === '7d') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (range === '30d') {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      if (startDate) {
        orders = orders.filter(o => new Date(o.createdAt) >= startDate!);
      }
    }

    if (q) {
      const queryStr = String(q).toLowerCase().trim();
      orders = orders.filter(o =>
        (o.orderNumber || '').toLowerCase().includes(queryStr) ||
        (o.customerName || '').toLowerCase().includes(queryStr) ||
        (o.businessName || '').toLowerCase().includes(queryStr)
      );
    }

    return res.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// 5. Review Moderation
// -------------------------------------------------------------
router.get('/reviews', async (req: AuthRequest, res: Response) => {
  try {
    const { q, status, rating } = req.query;

    const [reviews, businesses] = await Promise.all([
      Review.find().sort({ createdAt: -1 }),
      Business.find(),
    ]);

    const businessMap = new Map(businesses.map((b: any) => [b._id, b.name]));

    let enriched = reviews.map((r: any) => {
      const obj = typeof r.toObject === 'function' ? r.toObject() : { ...r };
      return {
        ...obj,
        businessName: businessMap.get(obj.business) || 'Store',
      };
    });

    if (status && status !== 'all') {
      enriched = enriched.filter(r => (r.status || 'published') === status);
    }

    if (rating && rating !== 'all') {
      const star = parseInt(String(rating), 10);
      if (!isNaN(star)) {
        enriched = enriched.filter(r => r.rating === star);
      }
    }

    if (q) {
      const queryStr = String(q).toLowerCase().trim();
      enriched = enriched.filter(r =>
        (r.comment || '').toLowerCase().includes(queryStr) ||
        (r.customerName || '').toLowerCase().includes(queryStr) ||
        (r.businessName || '').toLowerCase().includes(queryStr)
      );
    }

    return res.json({
      success: true,
      data: enriched,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Moderate review (hide, restore, flag) with reason
router.put('/reviews/:id/moderate', async (req: AuthRequest, res: Response) => {
  try {
    const { status, reason } = req.body;
    if (!['published', 'hidden', 'flagged'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be published, hidden, or flagged.' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    review.status = status;
    review.moderationReason = (reason || '').trim();
    review.moderatedBy = req.user?.name || req.user?.email || 'Administrator';
    review.moderatedAt = new Date();

    await review.save();

    // Recalculate store rating
    await updateBusinessRating(review.business);

    return res.json({
      success: true,
      message: `Review marked as ${status}.`,
      data: review,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Delete review permanently
router.delete('/reviews/:id', async (req: AuthRequest, res: Response) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const businessId = review.business;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate business rating
    await updateBusinessRating(businessId);

    return res.json({
      success: true,
      message: 'Review permanently removed and business rating updated.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
