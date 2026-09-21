/** controlador de animales */
import { Request, Response, NextFunction } from 'express';
import * as animalService from '../services/animalService';
import type { EstadoSalud } from '../services/animalService';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { id_corral, estado_salud, id_especie, search } = req.query;
    const filters = {
      id_corral: id_corral ? Number(id_corral) : undefined,
      estado_salud: estado_salud as EstadoSalud | undefined,
      id_especie: id_especie ? Number(id_especie) : undefined,
      search: search as string | undefined,
    };
    const animales = await animalService.listAnimales(filters);
    res.json({ success: true, message: 'animales obtenidos', data: animales });
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const animal = await animalService.createAnimal(req.body);
    res.status(201).json({ success: true, message: 'animal registrado', data: animal });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const animal = await animalService.updateAnimal(id, req.body);
    res.json({ success: true, message: 'animal actualizado', data: animal });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await animalService.deleteAnimal(id);
    res.json({ success: true, message: 'animal eliminado' });
  } catch (error) {
    next(error);
  }
}

/** reporta enfermedad y traslada a enfermería */
export async function reportarEnfermedad(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { comentarios } = req.body;
    const idUsuario = req.usuario?.id_usuario;
    if (!idUsuario) {
      res.status(401).json({ success: false, message: 'usuario no autenticado' });
      return;
    }
    const animal = await animalService.reportarEnfermedad(id, comentarios, idUsuario);
    res.json({ success: true, message: 'animal reportado y trasladado a enfermería', data: animal });
  } catch (error) {
    next(error);
  }
}

/** da el alta veterinaria al animal y lo devuelve a su corral */
export async function darDeAlta(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { notas_alta } = req.body;
    const idVeterinario = req.usuario?.id_usuario;
    if (!idVeterinario) {
      res.status(401).json({ success: false, message: 'usuario no autenticado' });
      return;
    }
    const animal = await animalService.darDeAlta(id, idVeterinario, notas_alta);
    res.json({ success: true, message: 'animal dado de alta y reintegrado a corral general', data: animal });
  } catch (error) {
    next(error);
  }
}
