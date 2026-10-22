// verifico que la petición tenga un token jwt de acceso válido.
import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';

// protejo una ruta y agrego el usuario autenticado a la petición.
export function requireAuthentication(req: Request, res: Response, next: NextFunction): void {
  const authorization = req.header('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;

  if (!token) {
    res.status(401).json({ message: 'se requiere autenticación' });
    return;
  }

  try {
    req.usuario = verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({ message: 'la sesión no es válida o expiró' });
  }
}
