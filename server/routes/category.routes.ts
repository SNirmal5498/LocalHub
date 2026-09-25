import { Router, Response } from 'express';
import { Category } from '../db/db.js';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth.js';

const router = Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    let categories = await Category.find({ isActive: true });
    if (categories.length === 0) {
      const baseCategories = [
        { name: 'Food & Bakery', slug: 'food-bakery', icon: 'Cake', description: 'Artisanal bakeries, local cafes, and specialty delicacies', isActive: true },
        { name: 'Tech & Repairs', slug: 'tech-repairs', icon: 'Wrench', description: 'Mobile phone repairs, computer service, and electronics', isActive: true },
        { name: 'Apparel & Boutique', slug: 'apparel-boutique', icon: 'Shirt', description: 'Independent clothing, bespoke tailors, and jewelry makers', isActive: true },
        { name: 'Beauty & Wellness', slug: 'beauty-wellness', icon: 'Sparkles', description: 'Neighbourhood salons, barber shops, and wellness specialists', isActive: true },
        { name: 'Home & Crafts', slug: 'home-crafts', icon: 'Store', description: 'Handcrafted furniture, pottery, florists, and home essentials', isActive: true },
        { name: 'Grocery & Artisanal', slug: 'grocery-artisanal', icon: 'Store', description: 'Fresh farm produce, organic pantries, and local spices', isActive: true },
      ];
      await Category.insertMany(baseCategories);
      categories = await Category.find({ isActive: true });
    }

    const { Business } = await import('../db/db.js');
    const businesses = await Business.find({ status: 'active' });
    const countMap: Record<string, number> = {};
    for (const b of businesses) {
      if (b.category) {
        const catKey = b.category.toLowerCase().trim();
        countMap[catKey] = (countMap[catKey] || 0) + 1;
      }
    }

    const data = categories.map(c => {
      const doc = typeof (c as any).toObject === 'function' ? (c as any).toObject() : { ...c };
      const catKey = (c.name || '').toLowerCase().trim();
      doc.businessCount = countMap[catKey] || 0;
      return doc;
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin creates category
router.post('/', authenticateToken, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, icon } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const slug = name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
    const newCat = await Category.create({
      name: name.trim(),
      slug,
      description: description || '',
      icon: icon || 'Tag',
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: newCat,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin updates category
router.put('/:id', authenticateToken, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body);
    return res.json({
      success: true,
      message: 'Category updated.',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
