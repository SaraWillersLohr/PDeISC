// Archivo backend/src/controllers/notificacionController.ts: controlador http de la api relacionado con notificacion controller. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
// controlador de notificaciones y alertas
import { Request, Response, NextFunction } from "express";
import * as notificacionService from "../services/notificacionService";

// lista notificaciones sanitarias activas
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.usuario) { res.status(401).json({ success: false, message: 'no autenticado' }); return; }
    const data = await notificacionService.getNotificacionesSanitarias(req.usuario.id_usuario);
    res.json({ success: true, message: "notificaciones obtenidas", data });
  } catch (error) {
    next(error);
  }
}

// elimina una notificaci�n individual
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res
        .status(400)
        .json({ success: false, message: "id de notificación inválido" });
      return;
    }
    await notificacionService.deleteNotificacion(id);
    res.json({ success: true, message: "notificación eliminada" });
  } catch (error) {
    next(error);
  }
}

// limpia todas las notificaciones
export async function clear(_req: Request, res: Response, next: NextFunction) {
  try {
    await notificacionService.clearNotificaciones();
    res.json({
      success: true,
      message: "todas las notificaciones han sido eliminadas",
    });
  } catch (error) {
    next(error);
  }
}

