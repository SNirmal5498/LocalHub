import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../db/db.js';
import { authenticateToken, AuthRequest, getJwtSecret } from '../middleware/auth.js';

const router = Router();

// Register
// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role = 'customer', profileImage } = req.body;

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Please provide a valid full name (at least 2 characters).' });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    // Validate password
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // Sanitize and validate role (strictly allow only public roles)
    const assignedRole = role === 'business_owner' ? 'business_owner' : 'customer';

    // Validate phone number (required for merchants, optional but validated for customers)
    const cleanPhone = typeof phone === 'string' ? phone.trim() : '';
    const phoneRegex = /^[+]?[0-9\s\-().]{10,15}$/;
    if (assignedRole === 'business_owner' && (!cleanPhone || !phoneRegex.test(cleanPhone))) {
      return res.status(400).json({ success: false, message: 'A valid 10-digit contact phone number is required for business owners.' });
    } else if (cleanPhone && !phoneRegex.test(cleanPhone)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid phone number (e.g. +91 98765 43210).' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists. Please sign in instead.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
      role: assignedRole,
      profileImage: profileImage || '',
      favorites: [],
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    const userObj = typeof (user as any).toObject === 'function' ? (user as any).toObject() : { ...user };
    const { password: _, __v: __, ...userWithoutPassword } = userObj;
    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        token,
        user: userWithoutPassword,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error?.name || 'Error');
    return res.status(500).json({ success: false, message: 'Unable to complete registration. Please try again later.' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    const userObj = typeof (user as any).toObject === 'function' ? (user as any).toObject() : { ...user };
    const { password: _, __v: __, ...userWithoutPassword } = userObj;
    return res.json({
      success: true,
      message: 'Signed in successfully.',
      data: {
        token,
        user: userWithoutPassword,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during sign in.' });
  }
});

// Get Current User Profile
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const userObj = typeof (user as any).toObject === 'function' ? (user as any).toObject() : { ...user };
    const { password: _, __v: __, ...userWithoutPassword } = userObj;
    return res.json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Update Profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, profileImage } = req.body;
    const updated = await User.findByIdAndUpdate(req.user!._id, {
      ...(name ? { name: name.trim() } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(profileImage !== undefined ? { profileImage } : {}),
    }, { new: true });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const userObj = typeof (updated as any).toObject === 'function' ? (updated as any).toObject() : { ...updated };
    const { password: _, __v: __, ...userWithoutPassword } = userObj;
    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: userWithoutPassword,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
