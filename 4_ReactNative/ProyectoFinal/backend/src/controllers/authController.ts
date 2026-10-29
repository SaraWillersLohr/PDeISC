// traduzco las operaciones de autenticación entre http y los servicios.
import type { Request, Response } from 'express';
import * as authService from '../services/authService.js';
import * as registrationService from '../services/registrationService.js';

// distingo una falla de mysql de un error causado por los datos enviados.
function isDatabaseFailure(error: unknown): boolean {
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
  return /^(ER_|ECONN|ETIMEDOUT|PROTOCOL|EHOST|ENET|QUEUE_LIMIT)/.test(code);
}

// convierto las operaciones del registro en respuestas http consistentes.
async function handleRegistrationAction(action: () => Promise<unknown>, res: Response, successMessage: string): Promise<void> {
  try {
    const data = await action();
    res.status(200).json({ message: successMessage, data });
  } catch (error) {
    if (isDatabaseFailure(error)) { res.status(503).json({ message: 'la base de datos no está disponible; intentá nuevamente en unos segundos' }); return; }
    const message = error instanceof Error ? error.message : 'no se pudo completar la solicitud';
    res.status(400).json({ message });
  }
}

// recibo una solicitud de acceso para la estancia asociada a esta instalación.
export async function register(req: Request, res: Response): Promise<void> {
  await handleRegistrationAction(
    () => registrationService.createRegistrationRequest(req.body),
    res,
    'solicitud creada; revisá tu correo para verificarlo',
  );
}

// verifico el correo y dejo la solicitud disponible para la aprobación del administrador.
export async function verifyRegistrationEmail(req: Request, res: Response): Promise<void> {
  const { email, code } = req.body as { email?: string; code?: string };
  if (!email?.trim() || !code) { res.status(400).json({ message: 'completá el correo y el código de seis dígitos' }); return; }
  await handleRegistrationAction(() => registrationService.verifyRegistrationEmail(email, code), res, 'correo verificado; la solicitud espera aprobación administrativa');
}

// reenvío el código para solicitudes que todavía no verificaron el correo.
export async function resendRegistrationCode(req: Request, res: Response): Promise<void> {
  const { email } = req.body as { email?: string };
  if (!email?.trim()) { res.status(400).json({ message: 'el correo es obligatorio' }); return; }
  await handleRegistrationAction(() => registrationService.resendRegistrationCode(email), res, 'si hay una solicitud pendiente, enviaremos otro código');
}

// canjeo el código aprobado y devuelvo una sesión de usuario activa.
export async function redeemAccessCode(req: Request, res: Response): Promise<void> {
  const { email, code } = req.body as { email?: string; code?: string };
  if (!email?.trim() || !code) { res.status(400).json({ message: 'completá el correo y el código de seis dígitos' }); return; }
  await handleRegistrationAction(() => registrationService.redeemAccessCode(email, code), res, 'acceso activado');
}

// solicito el reenvío del código sin revelar si el correo tiene una cuenta pendiente.
export async function resendAccessCode(req: Request, res: Response): Promise<void> {
  const { email } = req.body as { email?: string };
  if (!email?.trim()) { res.status(400).json({ message: 'el correo es obligatorio' }); return; }
  await handleRegistrationAction(() => registrationService.resendAccessCode(email), res, 'si el acceso fue aprobado y sigue pendiente, enviaremos un nuevo código');
}

// solicito un código sin revelar si el correo corresponde a una cuenta activa.
export async function requestPasswordRecovery(req: Request, res: Response): Promise<void> {
  const email = typeof req.body?.email === 'string' ? req.body.email : '';
  try { await authService.requestPasswordRecovery(email); }
  catch (error) {
    const detail = error instanceof Error ? error.message : 'error desconocido';
    console.error(`[auth] No se pudo completar una solicitud de recuperación: ${detail}`);
    if (isDatabaseFailure(error)) { res.status(503).json({ message: 'no se pudo consultar la base de datos; intentá nuevamente en unos segundos' }); return; }
  }
  res.status(202).json({ message: 'Si la cuenta puede recuperar el acceso, enviaremos un código al correo indicado.' });
}

// verifico el código enviado por correo y entrego un permiso de cambio de contraseña.
export async function redeemPasswordRecoveryCode(req: Request, res: Response): Promise<void> {
  try {
    const { email, code } = req.body as { email?: string; code?: string };
    if (!email?.trim() || !code) { res.status(400).json({ message: 'Completá el correo y el código de seis dígitos.' }); return; }
    const data = await authService.redeemPasswordRecoveryCode(email, code);
    res.json({ message: 'Código válido. Ahora elegí una contraseña nueva.', data });
  } catch (error) {
    if (isDatabaseFailure(error)) { res.status(503).json({ message: 'la base de datos no está disponible; intentá nuevamente en unos segundos' }); return; }
    res.status(400).json({ message: 'El correo o el código no son válidos, no corresponden a una cuenta activa o el código venció.' });
  }
}

// cambio la contraseña con el permiso temporal y devuelvo la sesión iniciada.
export async function completePasswordRecovery(req: Request, res: Response): Promise<void> {
  try {
    const { resetToken, password } = req.body as { resetToken?: string; password?: string };
    if (!resetToken || !password) { res.status(400).json({ message: 'Ingresá el código válido y la contraseña nueva.' }); return; }
    const data = await authService.completePasswordRecovery(resetToken, password);
    res.json({ message: 'Contraseña actualizada. Iniciaste sesión.', data });
  } catch (error) {
    if (isDatabaseFailure(error)) { res.status(503).json({ message: 'la base de datos no está disponible; intentá nuevamente en unos segundos' }); return; }
    const raw = error instanceof Error ? error.message : '';
    const message = raw.includes('entre 10 y 72 bytes') ? raw : 'El código venció o ya fue usado. Solicitá uno nuevo e intentá otra vez.';
    res.status(400).json({ message });
  }
}

// proceso el inicio de sesión y devuelvo tokens jwt al cliente móvil.
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email?.trim() || !password) {
    res.status(400).json({ message: 'el correo y la contraseña son obligatorios' });
    return;
  }

  try {
    const session = await authService.login({ email, password });
    res.status(200).json(session);
  } catch (error) {
    if (isDatabaseFailure(error)) { res.status(503).json({ message: 'la base de datos no está disponible; intentá nuevamente en unos segundos' }); return; }
    const message = error instanceof Error ? error.message : 'no se pudo iniciar sesión';
    res.status(401).json({ message });
  }
}

// verifico credenciales OAuth con el proveedor y solo habilito cuentas ya aprobadas.
export async function socialLogin(req: Request, res: Response): Promise<void> {
  const provider = Array.isArray(req.params.provider) ? req.params.provider[0] : req.params.provider;
  const { code, redirectUri, codeVerifier, clientId } = req.body as { code?: string; redirectUri?: string; codeVerifier?: string; clientId?: string };
  if (!['google', 'facebook', 'github'].includes(provider) || typeof code !== 'string' || !code.trim()) {
    res.status(400).json({ message: 'El proveedor o la credencial no son válidos.' }); return;
  }
  try {
    const session = await authService.loginWithSocial(provider as 'google' | 'facebook' | 'github', code, redirectUri, codeVerifier, clientId);
    res.status(200).json(session);
  } catch (error) {
    if (isDatabaseFailure(error)) { res.status(503).json({ message: 'la base de datos no está disponible; intentá nuevamente en unos segundos' }); return; }
    const message = error instanceof Error ? error.message : 'No se pudo iniciar sesión con el proveedor.';
    res.status(401).json({ message });
  }
}

// vuelvo a abrir la app con la respuesta de oauth para que el navegador móvil cierre el flujo.
export function socialOAuthCallback(req: Request, res: Response): void {
  const provider = Array.isArray(req.params.provider) ? req.params.provider[0] : req.params.provider;
  if (!['google', 'facebook', 'github'].includes(provider)) {
    res.status(404).send('el proveedor de acceso no existe');
    return;
  }

  const callbackUrl = new URL('estanciaapp://oauth/callback');
  callbackUrl.searchParams.set('provider', provider);
  const state = typeof req.query.state === 'string' ? req.query.state : '';
  const code = typeof req.query.code === 'string' ? req.query.code : '';
  const providerError = typeof req.query.error === 'string' ? req.query.error : '';

  if (state.length > 256 || code.length > 4096 || providerError.length > 128) {
    callbackUrl.searchParams.set('error', 'invalid_response');
  } else {
    if (state) callbackUrl.searchParams.set('state', state);
    if (code) callbackUrl.searchParams.set('code', code);
    if (providerError) callbackUrl.searchParams.set('error', providerError);
    if (!code && !providerError) callbackUrl.searchParams.set('error', 'missing_response');
  }

  // Algunos navegadores móviles no abren esquemas de app al recibir un 302
  // desde el proveedor. Lanzamos el enlace desde una página HTTPS del mismo
  // callback y dejamos un enlace manual como alternativa.
  const target = callbackUrl.toString();
  const safeTarget = JSON.stringify(target).replace(/</g, '\\u003c');
  res.status(200).type('html').send(`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Volviendo a EstanciaApp</title>
<style>body{font:16px system-ui,sans-serif;background:#123824;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center}main{padding:32px}a{color:#a7f3c0}</style></head>
<body><main><p>Volviendo a EstanciaApp…</p><p><a id="open-app" href="${target.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}">Abrir EstanciaApp</a></p></main>
<script>window.location.replace(${safeTarget});</script></body></html>`);
}

// renuevo la sesión cuando el token de acceso dejó de ser válido.
export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body as { refreshToken?: string };

  if (!refreshToken) {
    res.status(400).json({ message: 'se requiere el token de renovación' });
    return;
  }

  try {
    res.status(200).json(await authService.refresh(refreshToken));
  } catch (error) {
    if (isDatabaseFailure(error)) { res.status(503).json({ message: 'la base de datos no está disponible; intentá nuevamente en unos segundos' }); return; }
    res.status(401).json({ message: 'la sesión no puede renovarse' });
  }
}

// devuelvo el usuario autenticado para restaurar la sesión en la app.
export function me(req: Request, res: Response): void {
  res.status(200).json({ usuario: req.usuario });
}

// permito que cualquier usuario autenticado actualice sus propios datos visibles.
export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.usuario) { res.status(401).json({ message: 'se requiere autenticación' }); return; }
    const data = await authService.updateProfile(req.usuario.id_usuario, req.body);
    res.json({ message: 'Perfil actualizado.', data });
  } catch (error) {
    if (isDatabaseFailure(error)) { res.status(503).json({ message: 'la base de datos no está disponible; intentá nuevamente en unos segundos' }); return; }
    res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo actualizar el perfil.' });
  }
}

// cambio la contraseña solo después de validar la contraseña vigente.
export async function changePassword(req: Request, res: Response): Promise<void> {
  try {
    if (!req.usuario) { res.status(401).json({ message: 'se requiere autenticación' }); return; }
    const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
    await authService.changePassword(req.usuario.id_usuario, currentPassword ?? '', newPassword ?? '');
    res.json({ message: 'Contraseña actualizada.' });
  } catch (error) {
    if (isDatabaseFailure(error)) { res.status(503).json({ message: 'la base de datos no está disponible; intentá nuevamente en unos segundos' }); return; }
    res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo cambiar la contraseña.' });
  }
}
