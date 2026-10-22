// Archivo backend/src/controllers/authController.ts: controlador http de la api relacionado con auth controller. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
// en este archivo se encuentran los controladores de autenticaci�n,
// que manejan las solicitudes relacionadas con el inicio de sesi�n,
// la obtenci�n del perfil del usuario y el cambio de contrase�a inicial.
import { Request, Response } from "express";
import * as authService from "../services/authService";
import type { LoginRequest } from "../types";
import * as registrationService from '../services/registrationService';
// Esta función atiende el endpoint HTTP: recibe los datos del formulario y comienza el flujo de registro; responde que el código de verificación fue solicitado. Recibe req, res como entrada.
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { nombre, apellido, email, password } = req.body as Record<string, string>;
    await registrationService.register({ nombre, apellido, email, password });
    res.status(202).json({ success: true, message: 'Si el registro puede continuar, enviamos un código al correo indicado.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo iniciar el registro.';
    res.status(400).json({ success: false, message });
  }
}
// Esta función atiende el endpoint HTTP: comprueba que se enviaron correo y código, delega la verificación y responde que la solicitud espera la aprobación administrativa. Recibe req, res como entrada.
export async function verifyEmail(req: Request, res: Response): Promise<void> {
  try {
    const { email, code } = req.body as { email?: string; code?: string };
    if (!email || !code) { res.status(400).json({ success: false, message: 'Correo y código son obligatorios.' }); return; }
    await registrationService.verifyEmail(email, code);
    res.json({ success: true, message: 'Correo verificado. La cuenta quedó pendiente de aprobación del administrador.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo verificar el correo.';
    res.status(400).json({ success: false, message });
  }
}
// Esta función atiende el endpoint HTTP: valida el correo recibido, solicita un nuevo código y devuelve una respuesta que no revela si el correo existe. Recibe req, res como entrada.
export async function resendVerification(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body as { email?: string };
    if (!email?.trim()) { res.status(400).json({ success: false, message: 'El correo es obligatorio.' }); return; }
    await registrationService.resendVerification(email);
    res.json({ success: true, message: 'Si hay una cuenta pendiente, se envió un nuevo código.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo reenviar el código.';
    res.status(429).json({ success: false, message });
  }
}
// Esta función atiende el endpoint HTTP: valida correo y token, consume el token aprobado y responde con el JWT y el perfil público. Recibe req, res como entrada.
export async function redeemAccessToken(req: Request, res: Response): Promise<void> {
  try {
    const { email, token } = req.body as { email?: string; token?: string };
    if (!email?.trim() || !token?.trim()) { res.status(400).json({ success: false, message: 'Correo y token son obligatorios.' }); return; }
    const data = await registrationService.redeemAccessToken(email, token);
    res.json({ success: true, message: 'Token canjeado. Sesión iniciada.', data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo validar el token.';
    res.status(400).json({ success: false, message });
  }
}
// Esta función atiende el endpoint HTTP: valida el correo y solicita el reenvío del token de primer acceso con respuesta que evita revelar cuentas. Recibe req, res como entrada.
export async function resendAccessToken(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body as { email?: string };
    if (!email?.trim()) { res.status(400).json({ success: false, message: 'El correo es obligatorio.' }); return; }
    await registrationService.resendAccessToken(email);
    res.json({ success: true, message: 'Si la cuenta fue aprobada y todavía no ingresó, enviaremos un token al correo indicado.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo reenviar el token.';
    const status = /esperá|límite diario/i.test(message) ? 429 : 400;
    res.status(status).json({ success: false, message });
  }
}

// Esta función acepta solicitudes de recuperación con una respuesta neutra, incluso si el correo no existe, para evitar enumerar cuentas.
export async function requestPasswordRecovery(req: Request, res: Response): Promise<void> {
  const email = typeof req.body?.email === 'string' ? req.body.email : '';
  try {
    await authService.requestPasswordRecovery(email);
  } catch {
    // No se revela si el correo existe ni si falló el servicio de correo.
    console.error('[auth] No se pudo completar una solicitud de recuperación.');
  }
  res.status(202).json({ success: true, message: 'Si la cuenta puede recuperar el acceso, enviaremos un código al correo indicado.' });
}

// Esta función verifica y consume el código de recuperación y entrega un permiso breve para establecer la contraseña nueva.
export async function redeemPasswordRecoveryCode(req: Request, res: Response): Promise<void> {
  try {
    const { email, code } = req.body as { email?: string; code?: string };
    if (!email?.trim() || !code) {
      res.status(400).json({ success: false, message: 'Completá el correo y el código de seis dígitos.' });
      return;
    }
    const result = await authService.redeemPasswordRecoveryCode(email, code);
    res.json({ success: true, message: 'Código válido. Ahora elegí una contraseña nueva.', data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: 'El correo o el código no son válidos, no corresponden a una cuenta activa o el código venció.' });
  }
}

// Esta función guarda obligatoriamente una contraseña nueva usando el permiso temporal y devuelve la sesión autenticada.
export async function completePasswordRecovery(req: Request, res: Response): Promise<void> {
  try {
    const { resetToken, password } = req.body as { resetToken?: string; password?: string };
    if (!resetToken || !password) {
      res.status(400).json({ success: false, message: 'Ingresá el código válido y la contraseña nueva.' });
      return;
    }
    const session = await authService.completePasswordRecovery(resetToken, password);
    res.json({ success: true, message: 'Contraseña actualizada. Iniciaste sesión.', data: session });
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : '';
    const message = rawMessage.includes('entre 10 y 72 bytes')
      ? rawMessage
      : 'El código venció o ya fue usado. Solicitá uno nuevo e intentá otra vez.';
    res.status(400).json({ success: false, message });
  }
}

// Esta función revoca todos los tokens activos de la cuenta autenticada al cerrar sesión.
export async function logout(req: Request, res: Response): Promise<void> {
  if (!req.usuario) {
    res.status(401).json({ success: false, message: 'No hay una sesión activa.' });
    return;
  }
  try {
    await authService.revokeUserSessions(req.usuario.id_usuario);
    res.json({ success: true, message: 'Sesión cerrada.' });
  } catch {
    res.status(500).json({ success: false, message: 'No se pudo cerrar la sesión en el servidor.' });
  }
}

// POST /api/auth/login  valida credenciales y devuelve jwt
// esta funcion maneja la solicitud de inicio de sesi�n,
// valida las credenciales del usuario y devuelve un token jwt si son correctas.
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body as LoginRequest;

    if (!email?.trim() || !password) {
      res
        .status(400)
        .json({
          success: false,
          message: "email y contraseña son obligatorios",
        });
      return;
    }

    const result = await authService.login({ email, password });
    res.json({
      success: true,
      message: "sesión iniciada correctamente",
      data: result,
    });
  } catch (error) {
    // La misma respuesta cubre correo inexistente, clave incorrecta y cuenta pendiente o inactiva.
    res.status(401).json({ success: false, message: 'No se pudo iniciar sesión. Revisá tus datos o recuperá el acceso.' });
  }
}

// GET /api/auth/me  devuelve perfil del usuario autenticado
export async function me(req: Request, res: Response): Promise<void> {
  try {
    if (!req.usuario) {
      res.status(401).json({ success: false, message: "no autenticado" });
      return;
    }

    const usuario = await authService.getProfile(req.usuario.id_usuario);
    res.json({ success: true, message: "perfil obtenido", data: usuario });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "error al obtener perfil";
    res.status(404).json({ success: false, message });
  }
}

// post /api/auth/cambiar-password-inicial � cambia la contrase�a predeterminada
export async function cambiarPasswordInicial(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    if (!req.usuario) {
      res.status(401).json({ success: false, message: "no autenticado" });
      return;
    }

    const { password } = req.body as { password?: string };
    if (!password || typeof password !== "string") {
      res
        .status(400)
        .json({ success: false, message: "la contraseña es requerida" });
      return;
    }

    const usuarioActualizado = await authService.cambiarPasswordInicial(
      req.usuario.id_usuario,
      password,
    );
    res.json({
      success: true,
      message: "contraseña actualizada correctamente",
      data: usuarioActualizado,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "error al actualizar la contraseña";
    res.status(400).json({ success: false, message });
  }
}

