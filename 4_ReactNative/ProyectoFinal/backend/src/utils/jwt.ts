// firmo y verifico los tokens jwt de acceso y renovación.
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { AuthenticatedUser } from '../types/auth.js';

// creo el token breve que protege las peticiones a la api.
export function createAccessToken(user: AuthenticatedUser): string {
  return jwt.sign(user, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

// creo el token de renovación con una clave distinta.
export function createRefreshToken(user: AuthenticatedUser): string {
  return jwt.sign(user, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

// valido un token de acceso antes de aceptar una ruta protegida.
export function verifyAccessToken(token: string): AuthenticatedUser {
  return jwt.verify(token, env.jwt.accessSecret) as AuthenticatedUser;
}

// valido un token de renovación antes de emitir una nueva sesión.
export function verifyRefreshToken(token: string): AuthenticatedUser {
  return jwt.verify(token, env.jwt.refreshSecret) as AuthenticatedUser;
}
