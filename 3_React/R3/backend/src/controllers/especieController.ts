/** controlador de especies y razas */
import { Request, Response, NextFunction } from 'express';
import * as especieService from '../services/especieService';

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const especies = await especieService.listEspecies();
    res.json({ success: true, message: 'especies obtenidas', data: especies });
  } catch (error) {
    next(error);
  }
}

export async function createEspecie(req: Request, res: Response, next: NextFunction) {
  try {
    const { nombre } = req.body;
    const especie = await especieService.createEspecie(nombre);
    res.status(201).json({ success: true, message: 'especie creada', data: especie });
  } catch (error) {
    next(error);
  }
}

export async function createRaza(req: Request, res: Response, next: NextFunction) {
  try {
    const idEspecie = Number(req.params.idEspecie);
    const { nombre } = req.body;
    const raza = await especieService.createRaza(idEspecie, nombre);
    res.status(201).json({ success: true, message: 'raza creada', data: raza });
  } catch (error) {
    next(error);
  }
}
