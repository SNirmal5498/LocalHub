import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../db/db.js';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || !secret.trim()) {
    throw new Error('[Environment Error] JWT_SECRET is missing from your .env file.');
  }
  return secret;
}

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string;
    role: 'customer' | 'owner' | 'business_owner' | 'admin';
    name: string;
    favorites?: string[];
  };
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { id: string; email: string; role: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User session invalid. Please log in again.' });
    }

    req.user = {
      _id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      favorites: user.favorites || [],
    };
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
}

export function requireRole(...allowedRoles: Array<'customer' | 'owner' | 'business_owner' | 'admin'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const role = req.user.role;
    const matches = allowedRoles.some(
      r => r === role ||
      (r === 'owner' && role === 'business_owner') ||
      (r === 'business_owner' && role === 'owner')
    );

    if (!matches) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. This action requires one of the following roles: ${allowedRoles.join(', ')}.`,
      });
    }

    next();
  };
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { id: string; email: string; role: string };
    User.findById(decoded.id).then(user => {
      if (user) {
        req.user = {
          _id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
          favorites: user.favorites || [],
        };
      }
      next();
    }).catch(() => next());
  } catch {
    next();
  }
}
