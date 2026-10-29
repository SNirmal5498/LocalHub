import { Router, Response } from 'express';
import { BusinessMessage, Business, Notification } from '../db/db.js';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth.js';

const router = Router();

// Rate limiting map for spam protection (max 5 inquiries per 10 minutes per IP)
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const timestamps = (rateLimitMap.get(ip) || []).filter(t => now - t < windowMs);
  if (timestamps.length >= 5) {
    return false;
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
}

// 1. Submit general platform support inquiry (Contact Page)
router.post('/support', async (req, res) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(ip)) {
      return res.status(429).json({
        success: false,
        message: 'Too many messages sent from this IP. Please wait a few minutes before submitting another inquiry.',
      });
    }

    const { name, email, subject, message, phone } = req.body;

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Please provide your full name (at least 2 characters).' });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    // Validate subject
    if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Please provide an inquiry subject (at least 3 characters).' });
    }

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Please enter a message of at least 10 characters.' });
    }

    if (message.length > 3000) {
      return res.status(400).json({ success: false, message: 'Message exceeds maximum length of 3000 characters.' });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();
    const cleanPhone = typeof phone === 'string' ? phone.trim() : '';

    const newMsg = await BusinessMessage.create({
      business: 'platform',
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      subject: cleanSubject,
      message: cleanMessage,
      type: 'platform_support',
      isRead: false,
    });

    // Notify platform admins
    try {
      const { User } = await import('../db/db.js');
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await Notification.create({
          user: admin._id,
          title: `Platform Inquiry: ${cleanSubject.substring(0, 35)}`,
          message: `${cleanName} (${cleanEmail}): ${cleanMessage.substring(0, 95)}`,
          type: 'message',
          relatedId: newMsg._id,
          isRead: false,
        });
      }
    } catch (notifErr) {
      console.warn('[Notification Error] Could not create admin notification for inquiry:', notifErr);
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received. Our support team will follow up with you shortly.',
      data: newMsg,
    });
  } catch (error: any) {
    console.error('Support message error:', error?.name || 'Error');
    return res.status(500).json({ success: false, message: 'Unable to process your inquiry. Please try again later.' });
  }
});

// 2. Submit contact form to business (Storefront inquiry)
router.post('/', async (req, res) => {
  try {
    const { businessId, name, email, phone, message, subject } = req.body;

    // If no businessId provided but subject is present, route to platform support handler
    if (!businessId && subject) {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      if (!checkRateLimit(ip)) {
        return res.status(429).json({
          success: false,
          message: 'Too many messages sent. Please wait a few minutes before submitting another inquiry.',
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!name || name.trim().length < 2) {
        return res.status(400).json({ success: false, message: 'Name is required (at least 2 characters).' });
      }
      if (!email || !emailRegex.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Valid email is required.' });
      }
      if (!subject || subject.trim().length < 3) {
        return res.status(400).json({ success: false, message: 'Subject is required.' });
      }
      if (!message || message.trim().length < 10) {
        return res.status(400).json({ success: false, message: 'Message must be at least 10 characters.' });
      }

      const newMsg = await BusinessMessage.create({
        business: 'platform',
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || '',
        subject: subject.trim(),
        message: message.trim(),
        type: 'platform_support',
        isRead: false,
      });

      return res.status(201).json({
        success: true,
        message: 'Thank you! Your message has been received. Our team will follow up shortly.',
        data: newMsg,
      });
    }

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
      subject: subject?.trim() || 'Storefront Inquiry',
      message: message.trim(),
      type: 'business_inquiry',
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
    return res.status(500).json({ success: false, message: 'Server error while sending message.' });
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
