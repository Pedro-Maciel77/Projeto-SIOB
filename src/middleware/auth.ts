import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export interface AuthRequest extends Request {
  userId?: number;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;

  if (!auth) return res.status(401).json({ error: 'Token ausente' });

  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Token invalido' });

  const token = parts[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.userId = payload.userId;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token invalido' });
  }
}