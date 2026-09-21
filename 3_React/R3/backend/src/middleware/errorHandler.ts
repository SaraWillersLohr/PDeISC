// middleware global de errores
import { Request, Response, NextFunction } from "express";

// captura errores no manejados y responde en formato uniforme
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error("[api] error:", err.message);

  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "error interno del servidor"
        : err.message,
  });
}
