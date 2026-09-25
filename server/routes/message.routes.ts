import { Router, Response } from 'express';
import { BusinessMessage, Business, Notification } from '../db/db.js';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth.js';

const router = Router();

// Submit contact form to business
router.post('/', async (req, res) => {
  try {
    const { businessId, name, email, phone, message } = req.body;

    if (!businessId || !name || !email || !message) {
      return res.status(400).json({ success: false, message: 'businessId, name, email, and message are required.' });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    const newMsg = await BusinessMessage.create({
      business: businessId,
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || '',
      message: message.trim(),
      isRead: false,
    });

    // Notify business owner
    await Notification.create({
      user: business.owner,
      title: `New Inquiry from ${name.trim()}`,
      message: message.trim().substring(0, 100),
      type: 'message',
      relatedId: newMsg._id,
      isRead: false,
    });

    return res.status(201).json({
      success: true,
      message: 'Your message has been sent to the business owner.',
      data: newMsg,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get messages for a business (Owner or Admin)
router.get('/business/:businessId', authenticateToken, requireRole('owner', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const business = await Business.findById(req.params.businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    if (req.user!.role !== 'admin' && business.owner !== req.user!._id) {
      return res.status(403).json({ success: false, message: 'Forbidden. You do not own this business.' });
    }

    const messages = await BusinessMessage.find(
      { business: req.params.businessId },
      { sort: { createdAt: -1 } }
    );

    return res.json({
      success: true,
      data: messages,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Mark message as read
router.put('/:id/read', authenticateToken, requireRole('owner', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const msg = await BusinessMessage.findById(req.params.id);
    if (!msg) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    const updated = await BusinessMessage.findByIdAndUpdate(req.params.id, { isRead: true });
    return res.json({ success: true, data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
