import { Router, Response } from 'express';
import { Notification } from '../db/db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get notifications for current user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.find({ user: req.user!._id }).sort({ createdAt: -1 });
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return res.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Mark single notification as read
router.put('/:id/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    if (notification.user.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const updated = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    return res.json({ success: true, data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany({ user: req.user!._id, isRead: false }, { isRead: true });
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
