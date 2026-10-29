import { Router, Response } from 'express';
import { Category } from '../db/db.js';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth.js';

const router = Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const showAll = req.query.all === 'true';
    const query = showAll ? {} : { isActive: true };
    let categories = await Category.find(query);

    if (categories.length === 0 && !showAll) {
      const baseCategories = [
        { name: 'Food & Bakery', slug: 'food-bakery', icon: 'Cake', description: 'Artisanal bakeries, local cafes, and specialty delicacies', isActive: true },
        { name: 'Tech & Repairs', slug: 'tech-repairs', icon: 'Wrench', description: 'Mobile phone repairs, computer service, and electronics', isActive: true },
        { name: 'Apparel & Boutique', slug: 'apparel-boutique', icon: 'Shirt', description: 'Independent clothing, bespoke tailors, and jewelry makers', isActive: true },
        { name: 'Beauty & Wellness', slug: 'beauty-wellness', icon: 'Sparkles', description: 'Neighbourhood salons, barber shops, and wellness specialists', isActive: true },
        { name: 'Home & Crafts', slug: 'home-crafts', icon: 'Store', description: 'Handcrafted furniture, pottery, florists, and home essentials', isActive: true },
        { name: 'Grocery & Artisanal', slug: 'grocery-artisanal', icon: 'Store', description: 'Fresh farm produce, organic pantries, and local spices', isActive: true },
      ];
      await Category.insertMany(baseCategories);
      categories = await Category.find(query);
    }

    const { Business } = await import('../db/db.js');
    const businesses = await Business.find();

    function slugify(text: string): string {
      return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    const data = categories.map(c => {
      const doc = typeof (c as any).toObject === 'function' ? (c as any).toObject() : { ...c };
      const catName = (c.name || '').toLowerCase().trim();
      const catSlug = (c.slug || slugify(catName)).toLowerCase().trim();

      const count = businesses.filter(b => {
        if (!b.category) return false;
        const bCat = b.category.toLowerCase().trim();
        const bSlug = slugify(bCat);
        return (
          bCat === catName ||
          bSlug === catSlug ||
          bCat === catSlug ||
          (bCat.includes(catName) || catName.includes(bCat)) ||
          (catSlug && (bSlug.includes(catSlug) || catSlug.includes(bSlug)))
        );
      }).length;

      doc.businessCount = count;
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
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return res.status(400).json({ success: false, message: 'Category name must be at least 2 characters.' });
    }

    // Check duplicate name
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${trimmedName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: `Category "${trimmedName}" already exists.` });
    }

    const slug = trimmedName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
    const newCat = await Category.create({
      name: trimmedName,
      slug,
      description: description?.trim() || '',
      icon: icon?.trim() || 'Tag',
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
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const { name, description, icon, isActive } = req.body;
    if (name) {
      const trimmedName = name.trim();
      if (trimmedName.length < 2) {
        return res.status(400).json({ success: false, message: 'Category name must be at least 2 characters.' });
      }

      // Check duplicate among other categories
      const existing = await Category.findOne({
        _id: { $ne: req.params.id },
        name: { $regex: new RegExp(`^${trimmedName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') },
      });
      if (existing) {
        return res.status(400).json({ success: false, message: `Category "${trimmedName}" already exists.` });
      }

      category.name = trimmedName;
      category.slug = trimmedName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
    }

    if (description !== undefined) category.description = description.trim();
    if (icon !== undefined) category.icon = icon.trim();
    if (isActive !== undefined) category.isActive = Boolean(isActive);

    await category.save();

    return res.json({
      success: true,
      message: 'Category updated successfully.',
      data: category,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin toggles category status
router.patch('/:id/toggle', authenticateToken, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    category.isActive = !category.isActive;
    await category.save();

    return res.json({
      success: true,
      message: `Category is now ${category.isActive ? 'active' : 'inactive'}.`,
      data: category,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin safe deletes category
router.delete('/:id', authenticateToken, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const { Business } = await import('../db/db.js');
    const safeRegex = new RegExp(`^${category.name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i');
    const inUseCount = await Business.countDocuments({
      $or: [
        { category: category.name },
        { category: { $regex: safeRegex } },
      ],
    });

    if (inUseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category "${category.name}" because ${inUseCount} store(s) are currently registered under it. Please reassign the businesses or deactivate the category instead.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    return res.json({
      success: true,
      message: `Category "${category.name}" deleted successfully.`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
