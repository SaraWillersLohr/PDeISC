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

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      res.status(403).json({
        success: false,
        message: "no tenés permisos para esta acción",
      });
      return;
    }

    next();
  };
}

