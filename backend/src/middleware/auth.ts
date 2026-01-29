import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    isVerified: boolean;
  };
}

const JWT_SECRET = (process.env.JWT_SECRET || 'secret').trim();

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader?.split(' ')[1];

    if (!token || typeof token !== 'string') {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { id?: string; email?: string; isVerified?: boolean };
    if (decoded && typeof decoded === 'object' && typeof decoded.id === 'string') {
      req.user = {
        id: decoded.id,
        email: (decoded.email as string) ?? '',
        isVerified: Boolean(decoded.isVerified),
      };
      next();
    } else {
      res.status(401).json({ message: 'Invalid token' });
    }
  } catch {
    res.status(401).json({ message: 'Token verification failed' });
  }
};
