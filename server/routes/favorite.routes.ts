import { Router, Response } from 'express';
import { User, Business, Favorite } from '../db/db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get current user's favorite businesses
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const favRecords = await Favorite.find({ user: req.user!._id });
    const favIds: string[] = Array.from(new Set([
      ...(user.favorites || []),
      ...favRecords.map(f => f.business),
    ]));

    const favBusinesses = await Business.find({ _id: { $in: favIds }, status: 'active' });

    return res.json({
      success: true,
      data: favBusinesses,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Add favorite
router.post('/:businessId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const business = await Business.findById(req.params.businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    const currentFavs: string[] = user.favorites || [];
    if (!currentFavs.includes(req.params.businessId)) {
      currentFavs.push(req.params.businessId);
      await User.findByIdAndUpdate(req.user!._id, { favorites: currentFavs });
    }

    // Persist to Favorite collection
    await Favorite.findOneAndUpdate(
      { user: req.user!._id, business: req.params.businessId },
      { user: req.user!._id, business: req.params.businessId },
      { upsert: true }
    );

    return res.json({
      success: true,
      message: 'Business added to your favorites.',
      data: { favorites: currentFavs },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Remove favorite
router.delete('/:businessId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const currentFavs: string[] = user.favorites || [];
    const updatedFavs = currentFavs.filter(id => id !== req.params.businessId);
    await User.findByIdAndUpdate(req.user!._id, { favorites: updatedFavs });

    // Remove from Favorite collection
    await Favorite.deleteOne({ user: req.user!._id, business: req.params.businessId });

    return res.json({
      success: true,
      message: 'Business removed from your favorites.',
      data: { favorites: updatedFavs },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
