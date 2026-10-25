// traduzco las operaciones de autenticación entre http y los servicios.
import type { Request, Response } from 'express';
import * as authService from '../services/authService.js';
import * as registrationService from '../services/registrationService.js';

// convierto las operaciones del registro en respuestas http consistentes.
async function handleRegistrationAction(action: () => Promise<unknown>, res: Response, successMessage: string): Promise<void> {
  try {
    const data = await action();
    res.status(200).json({ message: successMessage, data });
  } catch (error) {
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
  } catch {
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
    const message = error instanceof Error ? error.message : 'No se pudo iniciar sesión con el proveedor.';
    res.status(401).json({ message });
  }
}

// renuevo la sesión cuando el token de acceso dejó de ser válido.
export function refresh(req: Request, res: Response): void {
  const { refreshToken } = req.body as { refreshToken?: string };

  if (!refreshToken) {
    res.status(400).json({ message: 'se requiere el token de renovación' });
    return;
  }

  try {
    res.status(200).json(authService.refresh(refreshToken));
  } catch {
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
    res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo cambiar la contraseña.' });
  }
}
