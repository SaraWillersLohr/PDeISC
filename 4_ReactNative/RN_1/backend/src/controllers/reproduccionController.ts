// Archivo backend/src/controllers/reproduccionController.ts: adapta peticiones HTTP al servicio de eventos reproductivos.
import type { NextFunction, Request, Response } from "express";
import * as reproduccionService from "../services/reproduccionService";

// Esta función lista el historial general o el historial de una hembra cuando se recibe id_animal.
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const rawId = req.query.id_animal;
    const idAnimal = rawId === undefined ? undefined : Number(rawId);
    if (rawId !== undefined && (!idAnimal || !Number.isInteger(idAnimal))) {
      res.status(400).json({ success: false, message: "id_animal debe ser un número válido" });
      return;
    }
    const events = await reproduccionService.listEvents(idAnimal);
    res.json({ success: true, message: "eventos reproductivos obtenidos", data: events });
  } catch (error) { next(error); }
}

// Esta función registra el evento y atribuye el cambio al usuario autenticado, sin aceptar su identidad desde el cliente.
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.usuario?.id_usuario;
    if (!userId) { res.status(401).json({ success: false, message: "usuario no autenticado" }); return; }
    const event = await reproduccionService.createEvent(req.body, userId);
    res.status(201).json({ success: true, message: "evento reproductivo registrado", data: event });
  } catch (error) { next(error); }
}
