// Archivo backend/src/controllers/animalHistoryController.ts: expone el historial de pesajes y movimientos del rodeo.
import type { NextFunction, Request, Response } from "express";
import * as animalHistoryService from "../services/animalHistoryService";

// Esta función valida el identificador y lista pesajes asociados a una ficha activa o archivada.
export async function listPesajes(req: Request, res: Response, next: NextFunction) {
  try { const id = Number(req.params.id); if (!Number.isInteger(id) || id < 1) { res.status(400).json({ success: false, message: "identificador de animal inválido" }); return; } const data = await animalHistoryService.listPesajes(id); res.json({ success: true, message: "pesajes obtenidos", data }); }
  catch (error) { next(error); }
}

// Esta función registra el pesaje con el usuario autenticado y devuelve el historial actualizado.
export async function createPesaje(req: Request, res: Response, next: NextFunction) {
  try { const id = Number(req.params.id); const userId = req.usuario?.id_usuario; const peso = Number(req.body.peso_kg); const fecha = req.body.fecha_pesaje; if (!userId) { res.status(401).json({ success: false, message: "usuario no autenticado" }); return; } const data = await animalHistoryService.createPesaje(id, peso, fecha, req.body.observaciones ?? null, userId); res.status(201).json({ success: true, message: "pesaje registrado", data }); }
  catch (error) { next(error); }
}

// Esta función devuelve la trazabilidad de corrales con la persona que registró cada traslado.
export async function listMovimientos(req: Request, res: Response, next: NextFunction) {
  try { const id = Number(req.params.id); if (!Number.isInteger(id) || id < 1) { res.status(400).json({ success: false, message: "identificador de animal inválido" }); return; } const data = await animalHistoryService.listMovimientos(id); res.json({ success: true, message: "movimientos obtenidos", data }); }
  catch (error) { next(error); }
}
