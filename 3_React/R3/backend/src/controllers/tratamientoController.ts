/** controlador de tratamientos médicos */
import { Request, Response, NextFunction } from 'express';
import * as tratamientoService from '../services/tratamientoService';

/** lista los tratamientos de un animal dado su id */
export async function listByAnimal(req: Request, res: Response, next: NextFunction) {
  try {
    const idAnimal = Number(req.query.id_animal);
    if (!idAnimal) {
      res.status(400).json({ success: false, message: 'se requiere id_animal en la consulta' });
      return;
    }
    const data = await tratamientoService.listTratamientosByAnimal(idAnimal);
    res.json({ success: true, message: 'tratamientos obtenidos', data });
  } catch (error) {
    next(error);
  }
}

/** crea un tratamiento o nota médica */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const idVeterinario = req.usuario?.id_usuario;
    if (!idVeterinario) {
      res.status(401).json({ success: false, message: 'usuario no autenticado' });
      return;
    }
    const payload = {
      ...req.body,
      id_veterinario: idVeterinario,
    };
    const tratamiento = await tratamientoService.createTratamiento(payload);
    res.status(201).json({ success: true, message: 'tratamiento registrado', data: tratamiento });
  } catch (error) {
    next(error);
  }
}
