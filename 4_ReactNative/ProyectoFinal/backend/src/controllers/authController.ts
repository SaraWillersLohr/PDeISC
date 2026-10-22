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
