/** controlador de notificaciones y alertas */
import { Request, Response, NextFunction } from 'express';
import * as notificacionService from '../services/notificacionService';

/** lista notificaciones sanitarias activas */
export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await notificacionService.getNotificacionesSanitarias();
    res.json({ success: true, message: 'notificaciones obtenidas', data });
  } catch (error) {
    next(error);
  }
}

/** elimina una notificación individual */
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'id de notificación inválido' });
      return;
    }
    await notificacionService.deleteNotificacion(id);
    res.json({ success: true, message: 'notificación eliminada' });
  } catch (error) {
    next(error);
  }
}

/** limpia todas las notificaciones */
export async function clear(_req: Request, res: Response, next: NextFunction) {
  try {
    await notificacionService.clearNotificaciones();
    res.json({ success: true, message: 'todas las notificaciones han sido eliminadas' });
  } catch (error) {
    next(error);
  }
}
