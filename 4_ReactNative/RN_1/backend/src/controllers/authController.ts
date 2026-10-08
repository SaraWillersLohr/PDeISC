// en este archivo se encuentran los controladores de autenticaci�n,
// que manejan las solicitudes relacionadas con el inicio de sesi�n,
// la obtenci�n del perfil del usuario y el cambio de contrase�a inicial.
import { Request, Response } from "express";
import * as authService from "../services/authService";
import type { LoginRequest } from "../types";
import * as registrationService from '../services/registrationService';

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
    const message =
      error instanceof Error ? error.message : "error al iniciar sesión";
    res.status(401).json({ success: false, message });
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

