import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request { adminId?: number }
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token || '', process.env.JWT_SECRET || process.env.ADMIN_SECRET || 'development-only-secret');
    const id = typeof payload === 'object' && payload !== null ? Number(payload.sub) : NaN;
    if (!Number.isInteger(id)) throw new Error('Invalid token');
    req.adminId = id; next();
  } catch { res.status(401).json({ message: 'Tu sesión no es válida o venció.' }); }
}
