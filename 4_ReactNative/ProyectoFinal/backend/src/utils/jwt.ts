// firmo y verifico los tokens jwt de acceso y renovación.
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { AuthenticatedUser } from '../types/auth.js';

type TokenKind = 'access' | 'refresh' | 'password-recovery';
type TokenClaims = AuthenticatedUser & { token_kind: TokenKind; purpose?: string; token_version?: number; exp?: number };

// creo el token breve que protege las peticiones a la api.
export function createAccessToken(user: AuthenticatedUser): string {
  return jwt.sign({ ...user, token_version: user.token_version ?? 0, token_kind: 'access' }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

// creo el token de renovación con una clave distinta.
export function createRefreshToken(user: AuthenticatedUser): string {
  return jwt.sign({ ...user, token_version: user.token_version ?? 0, token_kind: 'refresh' }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

// valido un token de acceso antes de aceptar una ruta protegida.
export function verifyAccessToken(token: string): AuthenticatedUser {
  const claims = jwt.verify(token, env.jwt.accessSecret) as TokenClaims;
  if (claims.token_kind !== 'access' || !isAuthenticatedUser(claims)) throw new Error('el token no es de acceso');
  return pickAuthenticatedUser(claims);
}

// valido un token de renovación antes de emitir una nueva sesión.
export function verifyRefreshToken(token: string): AuthenticatedUser {
  const claims = jwt.verify(token, env.jwt.refreshSecret) as TokenClaims;
  if (claims.token_kind !== 'refresh' || !isAuthenticatedUser(claims)) throw new Error('el token no es de renovación');
  return pickAuthenticatedUser(claims);
}

// firmo un permiso corto que solo puede cambiar la contraseña de una cuenta.
export function createPasswordRecoveryToken(user: AuthenticatedUser & { token_version: number }): string {
  return jwt.sign({ ...user, token_kind: 'password-recovery', purpose: 'password-recovery' }, env.jwt.accessSecret, { expiresIn: '15m' });
}

// rechazo tokens vencidos o emitidos para cualquier otro propósito.
export function verifyPasswordRecoveryToken(token: string): AuthenticatedUser & { token_version: number } {
  const claims = jwt.verify(token, env.jwt.accessSecret) as TokenClaims;
  if (claims.token_kind !== 'password-recovery' || claims.purpose !== 'password-recovery' || !isAuthenticatedUser(claims) || !Number.isInteger(claims.token_version)) {
    throw new Error('El permiso de recuperación venció o ya fue utilizado.');
  }
  return { ...pickAuthenticatedUser(claims), token_version: claims.token_version! };
}

// obtengo el vencimiento firmado para programar la renovación en el cliente.
export function getTokenExpirationTimestamp(token: string): number {
  const claims = jwt.decode(token) as TokenClaims | null;
  if (!claims?.exp) throw new Error('el token no tiene una fecha de vencimiento válida');
  return claims.exp * 1000;
}

// valido que el token contenga la identidad mínima esperada.
function isAuthenticatedUser(claims: TokenClaims): boolean {
  return Number.isInteger(claims.id_usuario) && claims.id_usuario > 0
    && typeof claims.email === 'string' && typeof claims.rol === 'string';
}

// descarto los metadatos jwt para que no formen parte de la sesión de usuario.
function pickAuthenticatedUser(claims: TokenClaims): AuthenticatedUser {
  return { id_usuario: claims.id_usuario, email: claims.email, rol: claims.rol, token_version: claims.token_version ?? 0 };
}
