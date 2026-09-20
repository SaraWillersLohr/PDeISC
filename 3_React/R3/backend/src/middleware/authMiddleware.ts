import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

/** middleware que exige token jwt válido en header authorization */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'token de autenticación requerido',
    });
    return;
  }

  const token = authHeader.slice(7);

  try {
    req.usuario = verifyToken(token);
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'token inválido o expirado',
    });
  }
}
