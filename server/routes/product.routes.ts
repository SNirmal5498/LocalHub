import { Router, Response } from 'express';
import { Product, Business } from '../db/db.js';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth.js';

const router = Router();

// Get products by business
router.get('/business/:businessId', async (req, res) => {
  try {
    const products = await Product.find({ business: req.params.businessId });
    return res.json({
      success: true,
      data: products,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    return res.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Create product
router.post('/', authenticateToken, requireRole('owner', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { businessId, name, description, price, discountPrice, category, images, stock, isAvailable = true, sku, tags } = req.body;

    if (!businessId || !name || price === undefined) {
      return res.status(400).json({ success: false, message: 'businessId, name, and price are required.' });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    if (req.user!.role !== 'admin' && business.owner.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to add products to this business.' });
    }

    const newProduct = await Product.create({
      business: businessId,
      name: name.trim(),
      description: description || '',
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      category: category || 'General',
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'],
      stock: stock !== undefined ? Number(stock) : 10,
      isAvailable: Boolean(isAvailable),
      sku: sku || '',
      tags: Array.isArray(tags) ? tags : [],
    });

    return res.status(201).json({
      success: true,
      message: 'Product added successfully.',
      data: newProduct,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Update product
router.put('/:id', authenticateToken, requireRole('owner', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const business = await Business.findById(product.business);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Associated business not found.' });
    }

    if (req.user!.role !== 'admin' && business.owner.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this product.' });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, {
      ...req.body,
      ...(req.body.price !== undefined ? { price: Number(req.body.price) } : {}),
      ...(req.body.discountPrice !== undefined ? { discountPrice: req.body.discountPrice ? Number(req.body.discountPrice) : null } : {}),
      ...(req.body.stock !== undefined ? { stock: Number(req.body.stock) } : {}),
    });

    return res.json({
      success: true,
      message: 'Product updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Delete product
router.delete('/:id', authenticateToken, requireRole('owner', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const business = await Business.findById(product.business);
    if (business && req.user!.role !== 'admin' && business.owner.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this product.' });
    }

    await Product.findByIdAndDelete(req.params.id);
    return res.json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
