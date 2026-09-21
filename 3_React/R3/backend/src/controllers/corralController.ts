/** controlador de corrales */
import { Request, Response, NextFunction } from 'express';
import * as corralService from '../services/corralService';

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const corrales = await corralService.listCorrales();
    res.json({ success: true, message: 'corrales obtenidos', data: corrales });
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const corral = await corralService.createCorral(req.body);
    res.status(201).json({ success: true, message: 'corral creado', data: corral });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const corral = await corralService.updateCorral(id, req.body);
    res.json({ success: true, message: 'corral actualizado', data: corral });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await corralService.deleteCorral(id);
    res.json({ success: true, message: 'corral eliminado' });
  } catch (error) {
    next(error);
  }
}
