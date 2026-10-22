// traduzco las operaciones de autenticación entre http y los servicios.
import type { Request, Response } from 'express';
import * as authService from '../services/authService.js';

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
