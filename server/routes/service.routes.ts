import { Router, Response } from 'express';
import { Service, Business } from '../db/db.js';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth.js';

const router = Router();

// Get services by business
router.get('/business/:businessId', async (req, res) => {
  try {
    const services = await Service.find({ business: req.params.businessId });
    return res.json({
      success: true,
      data: services,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Create service
router.post('/', authenticateToken, requireRole('owner', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { businessId, name, description, price, duration, category, isAvailable = true, image } = req.body;

    if (!businessId || !name || price === undefined) {
      return res.status(400).json({ success: false, message: 'businessId, name, and price are required.' });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    if (req.user!.role !== 'admin' && business.owner !== req.user!._id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to add services to this business.' });
    }

    const newService = await Service.create({
      business: businessId,
      name: name.trim(),
      description: description || '',
      price: Number(price),
      duration: duration || '30 mins',
      category: category || 'Standard',
      isAvailable: Boolean(isAvailable),
      image: image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    });

    return res.status(201).json({
      success: true,
      message: 'Service added successfully.',
      data: newService,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Update service
router.put('/:id', authenticateToken, requireRole('owner', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    const business = await Business.findById(service.business);
    if (business && req.user!.role !== 'admin' && business.owner !== req.user!._id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this service.' });
    }

    const updated = await Service.findByIdAndUpdate(req.params.id, {
      ...req.body,
      ...(req.body.price !== undefined ? { price: Number(req.body.price) } : {}),
    });

    return res.json({
      success: true,
      message: 'Service updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Delete service
router.delete('/:id', authenticateToken, requireRole('owner', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    const business = await Business.findById(service.business);
    if (business && req.user!.role !== 'admin' && business.owner !== req.user!._id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this service.' });
    }

    await Service.findByIdAndDelete(req.params.id);
    return res.json({
      success: true,
      message: 'Service deleted successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
