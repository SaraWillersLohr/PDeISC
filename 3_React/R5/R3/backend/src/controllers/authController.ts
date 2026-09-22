// en este archivo se encuentran los controladores de autenticaci�n,
// que manejan las solicitudes relacionadas con el inicio de sesi�n,
// la obtenci�n del perfil del usuario y el cambio de contrase�a inicial.
import { Request, Response } from "express";
import * as authService from "../services/authService";
import type { LoginRequest } from "../types";

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

