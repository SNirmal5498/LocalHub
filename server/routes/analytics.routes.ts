import { Router, Response, Request } from 'express';
import { Order, Product, Service, Review, Business, AnalyticsEvent } from '../db/db.js';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth.js';

const router = Router();

// Record an analytics event (e.g. storefront visit, product click)
router.post('/event', async (req: Request, res: Response) => {
  try {
    const { businessId, eventType, metadata } = req.body;
    if (!businessId || !eventType) {
      return res.status(400).json({ success: false, message: 'businessId and eventType are required.' });
    }

    const event = await AnalyticsEvent.create({
      business: businessId,
      eventType,
      metadata: metadata || {},
      ip: req.ip || '',
    });

    return res.status(201).json({ success: true, data: event });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/business/:businessId', authenticateToken, requireRole('owner', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.params;
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    if (req.user!.role !== 'admin' && business.owner.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden. You do not own this business.' });
    }

    const allOrders = await Order.find({ business: businessId });
    const allProducts = await Product.find({ business: businessId });
    const allServices = await Service.find({ business: businessId });
    const allReviews = await Review.find({ business: businessId });
    const actualStoreViews = await AnalyticsEvent.countDocuments({
      business: businessId,
      eventType: 'storefront_view',
    });

    const totalOrders = allOrders.length;
    const completedOrders = allOrders.filter(o => o.orderStatus === 'Completed');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

    // Unique customers count
    const customerSet = new Set(allOrders.map(o => o.customer));

    // Daily breakdown for last 7 days
    const dailyMap: Record<string, { date: string; orders: number; revenue: number }> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyMap[key] = { date: key, orders: 0, revenue: 0 };
    }

    // Populate with actual order dates
    allOrders.forEach(o => {
      const orderDate = new Date(o.createdAt);
      const key = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dailyMap[key]) {
        dailyMap[key].orders += 1;
        if (o.orderStatus === 'Completed') {
          dailyMap[key].revenue += Number(o.totalAmount) || 0;
        }
      }
    });

    // Real daily data calculated exclusively from actual MongoDB orders
    const dailyData = Object.values(dailyMap).map(d => ({
      ...d,
      revenue: Number(d.revenue.toFixed(2)),
    }));

    // Top selling products
    const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    allOrders.forEach(o => {
      o.items?.forEach((item: any) => {
        if (!productSalesMap[item.name]) {
          productSalesMap[item.name] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productSalesMap[item.name].quantity += item.quantity || 1;
        productSalesMap[item.name].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });

    const popularProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map(p => ({
        ...p,
        revenue: Number(p.revenue.toFixed(2)),
      }));

    // Status distribution
    const statusDistribution = [
      { name: 'Pending', count: allOrders.filter(o => o.orderStatus === 'Pending').length },
      { name: 'Accepted', count: allOrders.filter(o => o.orderStatus === 'Accepted').length },
      { name: 'Preparing', count: allOrders.filter(o => o.orderStatus === 'Preparing').length },
      { name: 'Ready', count: allOrders.filter(o => o.orderStatus === 'Ready').length },
      { name: 'Completed', count: completedOrders.length },
      { name: 'Cancelled', count: allOrders.filter(o => o.orderStatus === 'Cancelled').length },
    ];

    return res.json({
      success: true,
      data: {
        summary: {
          totalRevenue: Number(totalRevenue.toFixed(2)),
          totalOrders,
          completedOrdersCount: completedOrders.length,
          avgOrderValue: Number(avgOrderValue.toFixed(2)),
          totalProducts: allProducts.length,
          totalServices: allServices.length,
          totalCustomers: customerSet.size,
          rating: business.rating || 0,
          reviewCount: business.reviewCount || allReviews.length,
          storeViews: actualStoreViews,
        },
        dailyTrends: dailyData,
        popularProducts,
        statusDistribution,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
