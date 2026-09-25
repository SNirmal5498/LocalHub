import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';

let isConnected = false;

export async function connectMongo(): Promise<void> {
  if (isConnected) return;

  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri || !mongoUri.trim()) {
    console.error('\n❌ [Environment Error] MONGO_URI is missing or empty in your .env file.');
    console.error('Please configure MONGO_URI in D:\\Projects\\LocalHub\\.env\n');
    throw new Error('[Environment Error] MONGO_URI is required in .env');
  }

  try {
    console.log(`[MongoDB] Connecting to MongoDB at MONGO_URI...`);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[MongoDB] ✅ Successfully connected to MongoDB database.`);
    await initBaseSystemData();
  } catch (err: any) {
    console.error(`\n❌ [MongoDB Connection Error] Failed to connect to MongoDB using MONGO_URI: ${err.message}\n`);
    throw err;
  }
}

/**
 * Ensures system baseline records (Platform Admin, Base Categories) exist if database is completely empty.
 * Does NOT seed demo businesses, fake products, fake orders, or fake reviews.
 */
async function initBaseSystemData() {
  try {
    // 1. Ensure platform administrator exists
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.toLowerCase().trim() : '';
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminEmail || !adminPassword) {
        console.warn('[MongoDB Warning] ADMIN_EMAIL or ADMIN_PASSWORD not configured in .env. Initial SuperAdmin creation skipped.');
      } else {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        await User.create({
          name: 'LocalHub SuperAdmin',
          email: adminEmail,
          phone: '+1 (555) 010-0000',
          password: hashedPassword,
          role: 'admin',
          profileImage: '',
          favorites: [],
        });
        console.log(`[MongoDB Security] Initial Platform SuperAdmin created (${adminEmail}).`);
      }
    }

    // 2. Ensure base category taxonomy exists for merchants to choose from
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      const baseCategories = [
        { name: 'Food & Bakery', slug: 'food-bakery', icon: 'Cake', description: 'Artisanal bakeries, local cafes, and specialty delicacies' },
        { name: 'Tech & Repairs', slug: 'tech-repairs', icon: 'Wrench', description: 'Mobile phone repairs, computer service, and electronics' },
        { name: 'Apparel & Boutique', slug: 'apparel-boutique', icon: 'Shirt', description: 'Independent clothing, bespoke tailors, and jewelry makers' },
        { name: 'Beauty & Wellness', slug: 'beauty-wellness', icon: 'Sparkles', description: 'Neighbourhood salons, barber shops, and wellness specialists' },
        { name: 'Home & Crafts', slug: 'home-crafts', icon: 'Store', description: 'Handcrafted furniture, pottery, florists, and home essentials' },
        { name: 'Grocery & Artisanal', slug: 'grocery-artisanal', icon: 'Store', description: 'Fresh farm produce, organic pantries, and local spices' },
      ];

      await Category.insertMany(baseCategories);
      console.log(`[MongoDB] Initialized ${baseCategories.length} core business category taxonomies.`);
    }

    // 3. Purge legacy demo accounts/businesses if present in database
    const demoEmails = [
      'customer@localhub.com',
      'owner@bakery.com',
      'owner@mobilecare.com',
      'owner@trendyfashion.com',
    ];
    await User.deleteMany({ email: { $in: demoEmails } });

    const { Business } = await import('../models/Business.js');
    const { Product } = await import('../models/Product.js');
    const { Service } = await import('../models/Service.js');
    const { Offer } = await import('../models/Offer.js');
    const { Order } = await import('../models/Order.js');
    const { Review } = await import('../models/Review.js');
    const { Message } = await import('../models/Message.js');

    const demoSlugs = ['sweet-home-bakery', 'city-mobile-care', 'trendy-fashion-boutique'];
    const demoBusinesses = await Business.find({ slug: { $in: demoSlugs } });
    const demoIds = demoBusinesses.map(b => b._id.toString());
    if (demoIds.length > 0) {
      await Business.deleteMany({ _id: { $in: demoIds } });
      await Product.deleteMany({ business: { $in: demoIds } });
      await Service.deleteMany({ business: { $in: demoIds } });
      await Offer.deleteMany({ business: { $in: demoIds } });
      await Order.deleteMany({ business: { $in: demoIds } });
      await Review.deleteMany({ business: { $in: demoIds } });
      await Message.deleteMany({ business: { $in: demoIds } });
      console.log(`[MongoDB] Cleaned up legacy demo storefronts and records.`);
    }
  } catch (err) {
    console.error('[MongoDB] Error during system initialization:', err);
  }
}

/**
 * Calculates dynamically if a business is open right now based on its 7-day schedule in MongoDB
 */
export function calculateIsOpenNow(openingHours?: Record<string, { open?: string; close?: string; isClosed?: boolean }>): boolean {
  if (!openingHours) return false;

  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayKey = dayNames[now.getDay()];

  const todayHours = openingHours[todayKey];
  if (!todayHours || todayHours.isClosed) {
    return false;
  }

  if (!todayHours.open || !todayHours.close) {
    return false;
  }

  const [openH, openM] = todayHours.open.split(':').map(Number);
  const [closeH, closeM] = todayHours.close.split(':').map(Number);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + (openM || 0);
  const closeMinutes = closeH * 60 + (closeM || 0);

  if (closeMinutes > openMinutes) {
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  } else {
    // Overnight hours (e.g. 21:00 to 03:00)
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }
}
