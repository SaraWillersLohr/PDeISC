// Archivo backend/src/controllers/socialAuthController.ts: controlador http de la api relacionado con social auth controller. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
// Controladores HTTP del flujo OAuth y del canje seguro de su código efímero.
import type { Request, Response } from "express";
import passport from "passport";
import { isSocialProviderEnabled } from "../config/passport";
import {
  createSocialTicket,
  consumeSocialTicket,
} from "../services/socialTicketService";
import { signToken } from "../utils/jwt";
import type { SocialProvider, UsuarioPublico } from "../types";
import { authorizeSocialIdentity } from '../services/socialAuthService';
import * as registrationService from '../services/registrationService';
import pool from '../config/database';
import type { RowDataPacket } from 'mysql2';

const providers: SocialProvider[] = [
  "google",
  "facebook",
  "github",
  "discord",
  "twitch",
  "twitter",
];
const frontendUrl = process.env.SOCIAL_AUTH_FRONTEND_URL ?? "http://localhost:8081";
// Esta función recibe la petición del endpoint para social auth, valida o extrae sus parámetros, llama al servicio correspondiente y responde con JSON o delega el error al middleware. Recibe base, params como entrada.
function makeRedirectUrl(base: string, params: Record<string, string>): string {
  const query = new URLSearchParams(params).toString();
  return `${base}${base.includes('?') ? '&' : '?'}${query}`;
}

// Comprueba que el parámetro de ruta representa un proveedor soportado.
function getProvider(value: string): SocialProvider | null {
  return providers.includes(value as SocialProvider)
    ? (value as SocialProvider)
    : null;
}

// Redirige al login mostrando un mensaje URL-codificado y sin filtrar detalles internos.
function redirectWithError(res: Response, message: string, redirectUri?: string, mode: 'login' | 'register' = 'login'): void {
  res.redirect(makeRedirectUrl(redirectUri ?? frontendUrl, { socialError: message, socialMode: mode }));
}

// Expone únicamente los proveedores que cuentan con sus dos credenciales.
export function listSocialProviders(_req: Request, res: Response): void {
  res.json({ success: true, message: 'proveedores sociales disponibles', data: { providers: providers.filter(isSocialProviderEnabled) } });
}

// Inicia la autorización en el proveedor y conserva la preferencia de persistencia en la sesión temporal.
export function startSocialLogin(
  req: Request,
  res: Response,
  next: (error?: unknown) => void,
): void {
  const provider = getProvider(req.params.provider);
  if (!provider) return redirectWithError(res, "proveedor no soportado");
  if (!isSocialProviderEnabled(provider))
    return redirectWithError(res, "este proveedor aún no está configurado");

  const requestedRedirect = typeof req.query.redirect === 'string' ? req.query.redirect : '';
  const allowedMobileRedirect = process.env.SOCIAL_AUTH_MOBILE_REDIRECT_URI ?? 'estanciaapp://auth/callback';
  if (requestedRedirect && requestedRedirect !== allowedMobileRedirect) {
    return redirectWithError(res, 'la dirección de retorno de la app no está autorizada');
  }
  req.session.socialRedirect = requestedRedirect || undefined;
  req.session.socialMode = req.query.mode === 'register' ? 'register' : 'login';
  req.session.rememberMe = req.query.remember === "1";
  const scopes: Record<SocialProvider, string[] | undefined> = {
    google: ["profile", "email"],
    facebook: ["public_profile", "email"],
    github: ["user:email"],
    discord: ["identify", "email"],
    twitch: ["user:read:email"],
    twitter: undefined,
  };
  (passport.authenticate as any)(provider, {
    session: false,
    state: true,
    scope: scopes[provider],
  })(req, res, next);
}

// Procesa el callback, crea un código temporal y devuelve al frontend sin incluir un JWT en la URL.
export function completeSocialLogin(
  req: Request,
  res: Response,
  next: (error?: unknown) => void,
): void {
  const provider = getProvider(req.params.provider);
  if (!provider || !isSocialProviderEnabled(provider))
    return redirectWithError(res, "proveedor no disponible");

  passport.authenticate(
    provider,
    { session: false, failureRedirect: undefined },
    (
      error: Error | null,
      user: unknown | false,
      info?: { message?: string },
    ) => {
      const redirectTarget = req.session.socialRedirect;
      const mode = req.session.socialMode ?? 'login';
      if (error || !user)
        return req.session.destroy(() => redirectWithError(
          res,
          info?.message ?? "no se pudo iniciar sesión con la cuenta social",
          redirectTarget,
          mode,
        ));
      void (async () => {
        const profile = user as { provider: SocialProvider; providerUserId: string; email: string | null; name: string };
        if (mode === 'register') {
          if (!profile.email) throw new Error('El proveedor no compartió un correo. Elegí otro método de registro.');
          const parts = profile.name.trim().split(/\s+/);
          await registrationService.registerSocial({ nombre: parts.shift() ?? '', apellido: parts.join(' '), email: profile.email, provider: profile.provider, providerUserId: profile.providerUserId });
          req.session.destroy(() => res.redirect(makeRedirectUrl(redirectTarget ?? frontendUrl, { socialRegistered: '1', socialMode: 'register' })));
          return;
        }
        const authorized = await authorizeSocialIdentity(profile);
        const code = createSocialTicket(authorized, req.session.rememberMe === true);
        req.session.destroy(() => res.redirect(makeRedirectUrl(redirectTarget ?? frontendUrl, { socialCode: code, socialMode: 'login' })));
      })().catch((cause: unknown) => {
        const message = cause instanceof Error ? cause.message : 'No se pudo completar la autenticación social.';
        req.session.destroy(() => redirectWithError(res, message, redirectTarget, mode));
      });
    },
  )(req, res, next);
}

// Canjea un código social de un solo uso por el mismo JWT usado en el login tradicional.
export async function exchangeSocialCode(req: Request, res: Response): Promise<void> {
  const code = typeof req.body?.code === "string" ? req.body.code : "";
  const ticket = consumeSocialTicket(code);
  if (!ticket) {
    res
      .status(401)
      .json({
        success: false,
        message: "el código de acceso social es inválido o venció",
      });
    return;
  }

  // Lee la versión actual para que la sesión social respete las mismas revocaciones que el acceso por contraseña.
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT token_version FROM usuarios WHERE id_usuario = ? AND activo = 1 AND estado_cuenta = 'activo' LIMIT 1",
    [ticket.usuario.id_usuario],
  );
  if (!rows.length) {
    res.status(401).json({ success: false, message: 'No se pudo iniciar sesión con esta cuenta.' });
    return;
  }

  const token = signToken({
    id_usuario: ticket.usuario.id_usuario,
    email: ticket.usuario.email,
    rol: ticket.usuario.rol,
    token_version: Number(rows[0].token_version),
  });
  res.json({
    success: true,
    message: "sesión social iniciada correctamente",
    data: { token, usuario: ticket.usuario, rememberMe: ticket.rememberMe },
  });
}
