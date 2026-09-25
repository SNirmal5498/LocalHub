import { Router, Response } from 'express';
import { Order, Product, Business, Notification, Offer } from '../db/db.js';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth.js';

const router = Router();

// Place order (Customer)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId, items, deliveryType, deliveryAddress, phone, notes, paymentMethod, couponCode } = req.body;

    if (!businessId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Valid businessId and non-empty items array are required.' });
    }

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Contact phone number is required for fulfillment.' });
    }

    if (deliveryType === 'delivery' && (!deliveryAddress || !deliveryAddress.street)) {
      return res.status(400).json({ success: false, message: 'Delivery address is required for delivery orders.' });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    if (business.status !== 'active') {
      return res.status(400).json({ success: false, message: 'This business is currently unavailable.' });
    }

    // Secure backend verification of items, prices, and stock
    let subtotal = 0;
    const verifiedItems: any[] = [];

    for (const item of items) {
      const prod = await Product.findById(item.productId || item.product);
      if (!prod) {
        return res.status(400).json({ success: false, message: `Product ${item.name || item.productId} no longer exists.` });
      }

      if (!prod.isAvailable) {
        return res.status(400).json({ success: false, message: `Item "${prod.name}" is currently unavailable.` });
      }

      const qty = Math.max(1, parseInt(String(item.quantity || 1), 10));
      if (prod.stock !== undefined && prod.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${prod.name}". Only ${prod.stock} remaining.`,
        });
      }

      const itemPrice = prod.discountPrice !== null && prod.discountPrice !== undefined ? prod.discountPrice : prod.price;
      subtotal += itemPrice * qty;

      verifiedItems.push({
        product: prod._id,
        name: prod.name,
        price: itemPrice,
        quantity: qty,
        image: prod.images?.[0] || '',
      });

      // Deduct stock
      await Product.findByIdAndUpdate(prod._id, {
        stock: Math.max(0, (prod.stock || 0) - qty),
      });
    }

    if (business.minOrderAmount && subtotal < business.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount for ${business.name} is $${business.minOrderAmount.toFixed(2)}. Current subtotal: $${subtotal.toFixed(2)}`,
      });
    }

    // Coupon calculation
    let discount = 0;
    let appliedCoupon = '';
    if (couponCode) {
      const offer = await Offer.findOne({
        business: businessId,
        couponCode: couponCode.trim().toUpperCase(),
        isActive: true,
      });

      if (offer && (!offer.minimumOrder || subtotal >= offer.minimumOrder)) {
        appliedCoupon = offer.couponCode;
        if (offer.discountType === 'percentage') {
          discount = (subtotal * offer.discountValue) / 100;
          if (offer.maximumDiscount && discount > offer.maximumDiscount) {
            discount = offer.maximumDiscount;
          }
        } else {
          discount = Math.min(offer.discountValue, subtotal);
        }
      }
    }

    const totalAmount = Math.max(0, Number((subtotal - discount).toFixed(2)));
    const orderNumber = 'LH-' + Math.floor(1000 + Math.random() * 9000);

    const order = await Order.create({
      orderNumber,
      customer: req.user!._id,
      customerName: req.user!.name,
      business: business._id,
      businessName: business.name,
      items: verifiedItems,
      subtotal: Number(subtotal.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      couponCode: appliedCoupon || null,
      totalAmount,
      deliveryType: deliveryType || 'pickup',
      deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : null,
      phone,
      notes: notes || '',
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: 'pending',
      orderStatus: 'Pending',
    });

    // Notify Business Owner
    await Notification.create({
      user: business.owner,
      title: `New Order #${orderNumber}`,
      message: `${req.user!.name} placed an order for $${totalAmount.toFixed(2)} (${deliveryType || 'pickup'}).`,
      type: 'order',
      relatedId: order._id,
      isRead: false,
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: order,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error placing order.' });
  }
});

// Get customer orders
router.get('/my-orders', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ customer: req.user!._id }).sort({ createdAt: -1 });
    return res.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get orders for a business (Owner or Admin)
router.get('/business/:businessId', authenticateToken, requireRole('owner', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const business = await Business.findById(req.params.businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    if (req.user!.role !== 'admin' && business.owner.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden. You do not own this business.' });
    }

    const { status } = req.query;
    const filter: Record<string, any> = { business: req.params.businessId };
    if (status && status !== 'all') {
      filter.orderStatus = status;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return res.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get single order
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const business = await Business.findById(order.business);

    // Only customer who placed it, business owner, or admin can view
    const isCustomer = order.customer.toString() === req.user!._id.toString();
    const isOwner = business && business.owner.toString() === req.user!._id.toString();
    const isAdmin = req.user!.role === 'admin';

    if (!isCustomer && !isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this order.' });
    }

    return res.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Update order status (Owner, Admin, or Customer cancellation)
router.put('/:id/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Out for Delivery', 'Completed', 'Cancelled', 'Rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const business = await Business.findById(order.business);
    const isOwner = business && business.owner.toString() === req.user!._id.toString();
    const isAdmin = req.user!.role === 'admin';
    const isCustomer = order.customer.toString() === req.user!._id.toString();

    // Customer can only cancel if still Pending
    if (isCustomer && !isOwner && !isAdmin) {
      if (status !== 'Cancelled') {
        return res.status(403).json({ success: false, message: 'Customers can only cancel pending orders.' });
      }
      if (order.orderStatus !== 'Pending') {
        return res.status(400).json({ success: false, message: 'This order has already been processed and cannot be cancelled.' });
      }
    } else if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this order status.' });
    }

    const updated = await Order.findByIdAndUpdate(req.params.id, {
      orderStatus: status,
      ...(status === 'Completed' ? { paymentStatus: 'paid' } : {}),
    }, { new: true });

    // Notify customer about status change
    await Notification.create({
      user: order.customer,
      title: `Order #${order.orderNumber} Status: ${status}`,
      message: `${business?.name || 'Store'} has updated your order status to "${status}".`,
      type: 'order',
      relatedId: order._id,
      isRead: false,
    });

    // If customer cancelled, notify owner
    if (isCustomer && status === 'Cancelled' && business) {
      await Notification.create({
        user: business.owner,
        title: `Order #${order.orderNumber} Cancelled by Customer`,
        message: `${order.customerName} cancelled their order.`,
        type: 'order',
        relatedId: order._id,
        isRead: false,
      });
    }

    return res.json({
      success: true,
      message: `Order status updated to ${status}.`,
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
