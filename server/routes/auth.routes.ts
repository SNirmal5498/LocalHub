import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../db/db.js';
import { authenticateToken, AuthRequest, getJwtSecret } from '../middleware/auth.js';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role = 'customer', profileImage } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role === 'admin' ? 'customer' : role; // Prevent unauthorized admin signup

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || '',
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
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during registration.' });
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
