import { Router, Response } from 'express';
import { Business, Product, Service, Review, calculateIsOpenNow } from '../db/db.js';
import { authenticateToken, AuthRequest, requireRole, optionalAuth } from '../middleware/auth.js';
import { geocodeAddress, isSanFranciscoPlaceholder, isValidCoordinate } from '../utils/geocoder.js';

const router = Router();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Get all businesses (with discovery search & filters)
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { q, category, minRating, openNow, sort, city } = req.query;

    const rawBusinesses = await Business.find();

    // Dynamically calculate Open Now status for every business from stored schedule
    let businesses = rawBusinesses.map(b => {
      const doc = typeof (b as any).toObject === 'function' ? (b as any).toObject() : { ...b };
      doc.isOpen = calculateIsOpenNow(b.openingHours);
      return doc;
    });

    // Admins can see pending/suspended businesses, customers and owners see active ones
    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin) {
      businesses = businesses.filter(b => b.status === 'active');
    }

    if (category && category !== 'all' && category !== 'All Categories') {
      const targetCat = decodeURIComponent(String(category)).trim().toLowerCase();
      const targetSlug = slugify(targetCat);
      businesses = businesses.filter(b => {
        if (!b.category) return false;
        const bCat = b.category.trim().toLowerCase();
        const bSlug = slugify(bCat);
        return (
          bCat === targetCat ||
          bSlug === targetSlug ||
          bCat.includes(targetCat) ||
          targetCat.includes(bCat) ||
          (targetSlug && bSlug.includes(targetSlug)) ||
          (bSlug && targetSlug.includes(bSlug))
        );
      });
    }

    if (city) {
      businesses = businesses.filter(b => 
        b.city?.toLowerCase().includes(String(city).toLowerCase())
      );
    }

    if (minRating) {
      const min = parseFloat(String(minRating));
      businesses = businesses.filter(b => (b.rating || 0) >= min);
    }

    if (openNow === 'true') {
      businesses = businesses.filter(b => b.isOpen === true);
    }

    if (q) {
      const queryStr = String(q).toLowerCase();
      // Search in matching products and services in MongoDB
      const matchingProducts = await Product.find({
        $or: [
          { name: { $regex: queryStr, $options: 'i' } },
          { description: { $regex: queryStr, $options: 'i' } },
          { category: { $regex: queryStr, $options: 'i' } },
        ],
      });
      const matchingServices = await Service.find({
        $or: [
          { name: { $regex: queryStr, $options: 'i' } },
          { description: { $regex: queryStr, $options: 'i' } },
        ],
      });
      const matchedBusinessIds = new Set([
        ...matchingProducts.map(p => p.business.toString()),
        ...matchingServices.map(s => s.business.toString()),
      ]);

      // Search in business name, tagline, description, address, city, category, or matching catalog items
      businesses = businesses.filter(b => {
        const idStr = b._id.toString();
        return (
          b.name?.toLowerCase().includes(queryStr) ||
          b.tagline?.toLowerCase().includes(queryStr) ||
          b.description?.toLowerCase().includes(queryStr) ||
          b.category?.toLowerCase().includes(queryStr) ||
          b.city?.toLowerCase().includes(queryStr) ||
          b.address?.toLowerCase().includes(queryStr) ||
          b.state?.toLowerCase().includes(queryStr) ||
          matchedBusinessIds.has(idStr)
        );
      });
    }

    // Sorting
    if (sort === 'rating') {
      businesses.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'reviews') {
      businesses.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    } else if (sort === 'name') {
      businesses.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Default: active and rating
      businesses.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return res.json({
      success: true,
      data: businesses,
      count: businesses.length,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Geocode an address/city on the fly
router.get('/geocode', async (req, res) => {
  try {
    const { address, city, state, postalCode, country } = req.query;
    const result = await geocodeAddress({
      address: address ? String(address) : undefined,
      city: city ? String(city) : undefined,
      state: state ? String(state) : undefined,
      postalCode: postalCode ? String(postalCode) : undefined,
      country: country ? String(country) : undefined,
    });
    if (result) {
      return res.json({ success: true, data: result });
    }
    return res.status(404).json({ success: false, message: 'Could not resolve coordinates for this location.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get business owned by current logged in owner
router.get('/owner/my-business', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const business = await Business.findOne({ owner: req.user!._id });
    if (!business) {
      return res.status(404).json({ success: false, message: 'No business profile found for this owner.' });
    }
    return res.json({
      success: true,
      data: business,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get business by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const business = await Business.findOne({ slug: req.params.slug });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }
    const doc = typeof (business as any).toObject === 'function' ? (business as any).toObject() : { ...business };
    doc.isOpen = calculateIsOpenNow(business.openingHours);
    return res.json({
      success: true,
      data: doc,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get business by ID
router.get('/:id', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }
    const doc = typeof (business as any).toObject === 'function' ? (business as any).toObject() : { ...business };
    doc.isOpen = calculateIsOpenNow(business.openingHours);
    return res.json({
      success: true,
      data: doc,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Create business
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      tagline,
      description,
      category,
      phone,
      email,
      address,
      city,
      state,
      postalCode,
      country,
      latitude,
      longitude,
      openingHours,
      logo,
      coverImage,
      minOrderAmount,
    } = req.body;

    if (!name || !category || !phone || !address || !city) {
      return res.status(400).json({
        success: false,
        message: 'Business name, category, phone, street address, and city are required.',
      });
    }

    let baseSlug = slugify(name) || 'business';
    let finalSlug = baseSlug;
    let counter = 1;

    while (await Business.findOne({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const defaultHours = {
      monday: { open: '09:00', close: '18:00', isClosed: false },
      tuesday: { open: '09:00', close: '18:00', isClosed: false },
      wednesday: { open: '09:00', close: '18:00', isClosed: false },
      thursday: { open: '09:00', close: '18:00', isClosed: false },
      friday: { open: '09:00', close: '19:00', isClosed: false },
      saturday: { open: '10:00', close: '19:00', isClosed: false },
      sunday: { open: '10:00', close: '16:00', isClosed: false },
    };

    const cleanCity = city.trim();
    const cleanState = state?.trim() || '';
    const cleanPostal = postalCode?.trim() || '';
    const cleanCountry = country?.trim() || 'India';

    let finalLat: number | null = null;
    let finalLng: number | null = null;

    const parsedLat = latitude !== undefined && latitude !== null && latitude !== '' ? Number(latitude) : null;
    const parsedLng = longitude !== undefined && longitude !== null && longitude !== '' ? Number(longitude) : null;

    if (
      isValidCoordinate(parsedLat, parsedLng) &&
      !isSanFranciscoPlaceholder(parsedLat, parsedLng, cleanCity)
    ) {
      finalLat = parsedLat;
      finalLng = parsedLng;
    } else {
      // Auto-geocode actual address
      const geocoded = await geocodeAddress({
        address: address.trim(),
        city: cleanCity,
        state: cleanState,
        postalCode: cleanPostal,
        country: cleanCountry,
      });
      if (geocoded && isValidCoordinate(geocoded.latitude, geocoded.longitude)) {
        finalLat = geocoded.latitude;
        finalLng = geocoded.longitude;
      }
    }

    const newBusiness = await Business.create({
      owner: req.user!._id,
      name: name.trim(),
      slug: finalSlug,
      tagline: tagline || '',
      description: description || '',
      category: category.trim(),
      phone: phone.trim(),
      email: email?.trim() || req.user!.email,
      address: address.trim(),
      city: cleanCity,
      state: cleanState,
      postalCode: cleanPostal,
      country: cleanCountry,
      latitude: finalLat,
      longitude: finalLng,
      openingHours: openingHours || defaultHours,
      status: 'pending',
      rating: 0,
      reviewCount: 0,
      logo: logo || '',
      coverImage: coverImage || '',
      deliveryAvailable: true,
      pickupAvailable: true,
      minOrderAmount: Number(minOrderAmount) || 0,
    });

    if (req.user!.role === 'customer') {
      const { User } = await import('../db/db.js');
      await User.findByIdAndUpdate(req.user!._id, { role: 'owner' });
    }

    return res.status(201).json({
      success: true,
      message: 'Business created successfully.',
      data: newBusiness,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Update business
router.put('/:id', authenticateToken, requireRole('owner', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    if (req.user!.role !== 'admin' && business.owner.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden. You do not own this business.' });
    }

    const updates = { ...req.body };

    const effectiveAddress = (updates.address !== undefined ? updates.address : business.address) || '';
    const effectiveCity = (updates.city !== undefined ? updates.city : business.city) || '';
    const effectiveState = (updates.state !== undefined ? updates.state : business.state) || '';
    const effectivePostal = (updates.postalCode !== undefined ? updates.postalCode : business.postalCode) || '';
    const effectiveCountry = (updates.country !== undefined ? updates.country : business.country) || 'India';

    const parsedLat = updates.latitude !== undefined && updates.latitude !== null && updates.latitude !== '' ? Number(updates.latitude) : null;
    const parsedLng = updates.longitude !== undefined && updates.longitude !== null && updates.longitude !== '' ? Number(updates.longitude) : null;

    const hasValidExplicitCoords = isValidCoordinate(parsedLat, parsedLng) && !isSanFranciscoPlaceholder(parsedLat, parsedLng, effectiveCity);
    const addressChanged = (updates.address && updates.address !== business.address) || (updates.city && updates.city !== business.city);

    if (hasValidExplicitCoords) {
      updates.latitude = parsedLat;
      updates.longitude = parsedLng;
    } else if (
      !isValidCoordinate(business.latitude, business.longitude) ||
      isSanFranciscoPlaceholder(business.latitude, business.longitude, effectiveCity) ||
      addressChanged
    ) {
      const geocoded = await geocodeAddress({
        address: effectiveAddress,
        city: effectiveCity,
        state: effectiveState,
        postalCode: effectivePostal,
        country: effectiveCountry,
      });
      if (geocoded && isValidCoordinate(geocoded.latitude, geocoded.longitude)) {
        updates.latitude = geocoded.latitude;
        updates.longitude = geocoded.longitude;
      } else if (!hasValidExplicitCoords) {
        updates.latitude = null;
        updates.longitude = null;
      }
    }

    const updated = await Business.findByIdAndUpdate(req.params.id, updates, { new: true });
    return res.json({
      success: true,
      message: 'Business profile updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Delete business
router.delete('/:id', authenticateToken, requireRole('owner', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    if (req.user!.role !== 'admin' && business.owner.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden. You do not own this business.' });
    }

    await Business.findByIdAndDelete(req.params.id);
    await Product.deleteMany({ business: req.params.id });
    await Service.deleteMany({ business: req.params.id });
    await Review.deleteMany({ business: req.params.id });

    return res.json({
      success: true,
      message: 'Business and associated inventory deleted successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
