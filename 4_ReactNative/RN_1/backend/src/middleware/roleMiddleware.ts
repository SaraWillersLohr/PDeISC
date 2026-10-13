// Archivo backend/src/middleware/roleMiddleware.ts: middleware de express que procesa o protege solicitudes relacionado con role middleware. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
// limita el acceso segun los roles permitidos
import { Request, Response, NextFunction } from "express";
import type { RolNombre } from "../types";

// middleware factory � restringe acceso a roles espec�ficos
export function authorize(...rolesPermitidos: RolNombre[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      res.status(401).json({ success: false, message: "no autenticado" });
      return;
    }

    // El administrador superior hereda todos los permisos funcionales.
    if (req.usuario.rol !== 'administrador' && !rolesPermitidos.includes(req.usuario.rol)) {
      res.status(403).json({
        success: false,
        message: "no tenés permisos para esta acción",
      });
      return;
    }

    next();
  };
}

