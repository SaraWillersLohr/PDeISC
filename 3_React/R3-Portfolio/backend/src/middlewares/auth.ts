import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

// Extiende la solicitud para guardar el identificador del administrador autenticado.
export interface AuthRequest extends Request {
  adminId?: number;
}
// Verifica el token antes de permitir el acceso a una ruta de administración.
export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  // Lee el token de autenticación enviado en la cabecera de la solicitud.
  const token = req.headers.authorization?.replace("Bearer ", "");
  try {
    // Verifica la firma del token usando el secreto configurado.
    const payload = jwt.verify(
      token || "",
      process.env.JWT_SECRET ||
        process.env.ADMIN_SECRET ||
        "development-only-secret",
    );
    // Obtiene el identificador del administrador incluido en el token.
    const id =
      typeof payload === "object" && payload !== null
        ? Number(payload.sub)
        : NaN;
    if (!Number.isInteger(id)) throw new Error("Invalid token");
    req.adminId = id;
    next();
  } catch {
    res.status(401).json({ message: "Tu sesión no es válida o venció." });
  }
}
