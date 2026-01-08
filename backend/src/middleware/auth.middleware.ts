//backend/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '@/config/config';
import User, { IUser } from '@/models/User.model';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticateUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authorization header missing or malformed' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };

    if (!decoded.userId) {
      res.status(401).json({ success: false, message: 'Invalid token format' });
      return;
    }

    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'Invalid token or user inactive' });
      return;
    }

    req.user = user;
    next();
    return;
  } catch (e) {
    const error = e as Error;
    // Only log in development, never expose token details
    if (process.env.NODE_ENV === 'development') {
      console.error('JWT verification error:', error.message);
    }
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
    return;
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin access required' });
    return;
  }
  next();
};

export const checkOwnershipOrAdmin = <T extends { createdBy: { userId: { toString: () => string } } }>(
  model: { findById: (id: string) => Promise<T | null> }
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role === 'admin') {
        next();
        return;
      }

      const resource = await model.findById(req.params.id);
      if (!resource) {
        res.status(404).json({ success: false, message: 'Resource not found' });
        return;
      }

      if (resource.createdBy.userId.toString() !== req.user?._id.toString()) {
        res.status(403).json({ success: false, message: 'Not authorized to modify this resource' });
        return;
      }

      next();
      return;
    } catch (error) {
      next(error);
    }
  };
};