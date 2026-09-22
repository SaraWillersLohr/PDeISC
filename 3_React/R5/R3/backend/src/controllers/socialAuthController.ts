// Controladores HTTP del flujo OAuth y del canje seguro de su código efímero.
import type { Request, Response } from 'express';
import passport from 'passport';
import { isSocialProviderEnabled } from '../config/passport';
import { createSocialTicket, consumeSocialTicket } from '../services/socialTicketService';
import { signToken } from '../utils/jwt';
import type { SocialProvider, UsuarioPublico } from '../types';

const providers: SocialProvider[] = ['google', 'facebook', 'github', 'discord', 'twitch', 'twitter'];
const frontendUrl = process.env.SOCIAL_AUTH_FRONTEND_URL ?? 'http://localhost:5173';

/** Comprueba que el parámetro de ruta representa un proveedor soportado. */
function getProvider(value: string): SocialProvider | null {
  return providers.includes(value as SocialProvider) ? (value as SocialProvider) : null;
}

/** Redirige al login mostrando un mensaje URL-codificado y sin filtrar detalles internos. */
function redirectWithError(res: Response, message: string): void {
  res.redirect(`${frontendUrl}/login?socialError=${encodeURIComponent(message)}`);
}

/** Inicia la autorización en el proveedor y conserva la preferencia de persistencia en la sesión temporal. */
export function startSocialLogin(req: Request, res: Response, next: (error?: unknown) => void): void {
  const provider = getProvider(req.params.provider);
  if (!provider) return redirectWithError(res, 'proveedor no soportado');
  if (!isSocialProviderEnabled(provider)) return redirectWithError(res, 'este proveedor aún no está configurado');

  req.session.rememberMe = req.query.remember === '1';
  const scopes: Record<SocialProvider, string[] | undefined> = {
    google: ['profile', 'email'], facebook: ['email'], github: ['user:email'],
    discord: ['identify', 'email'], twitch: ['user:read:email'], twitter: undefined,
  };
  (passport.authenticate as any)(provider, { session: false, state: true, scope: scopes[provider] })(req, res, next);
}

/** Procesa el callback, crea un código temporal y devuelve al frontend sin incluir un JWT en la URL. */
export function completeSocialLogin(req: Request, res: Response, next: (error?: unknown) => void): void {
  const provider = getProvider(req.params.provider);
  if (!provider || !isSocialProviderEnabled(provider)) return redirectWithError(res, 'proveedor no disponible');

  passport.authenticate(provider, { session: false, failureRedirect: undefined }, (error: Error | null, user: UsuarioPublico | false, info?: { message?: string }) => {
    if (error || !user) return redirectWithError(res, info?.message ?? 'no se pudo iniciar sesión con la cuenta social');
    const code = createSocialTicket(user, req.session.rememberMe === true);
    req.session.destroy(() => undefined);
    res.redirect(`${frontendUrl}/login?socialCode=${encodeURIComponent(code)}`);
  })(req, res, next);
}

/** Canjea un código social de un solo uso por el mismo JWT usado en el login tradicional. */
export function exchangeSocialCode(req: Request, res: Response): void {
  const code = typeof req.body?.code === 'string' ? req.body.code : '';
  const ticket = consumeSocialTicket(code);
  if (!ticket) {
    res.status(401).json({ success: false, message: 'el código de acceso social es inválido o venció' });
    return;
  }

  const token = signToken({
    id_usuario: ticket.usuario.id_usuario,
    email: ticket.usuario.email,
    rol: ticket.usuario.rol,
  });
  res.json({ success: true, message: 'sesión social iniciada correctamente', data: { token, usuario: ticket.usuario, rememberMe: ticket.rememberMe } });
}
