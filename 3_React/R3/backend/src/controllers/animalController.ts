// controlador de animales
// gestiona las solicitudes relacionadas con los animales, como listar, crear, actualizar,
// eliminar, reportar enfermedades y dar de alta a los animales.
import { Request, Response, NextFunction } from "express";
import * as animalService from "../services/animalService";
import type { EstadoSalud } from "../services/animalService";

// esta funci�n maneja la solicitud para listar animales,
// aplicando filtros opcionales como id_corral, estado_salud, id_especie y
// b�squeda por nombre o descripci�n.
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
    res.json({ success: true, message: "animales obtenidos", data: animales });
  } catch (error) {
    next(error);
  }
}
// esta funci�n maneja la solicitud para crear un nuevo animal,
// recibiendo los datos del animal en el cuerpo de la solicitud y
// devolviendo el animal creado.
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const animal = await animalService.createAnimal(req.body);
    res
      .status(201)
      .json({ success: true, message: "animal registrado", data: animal });
  } catch (error) {
    next(error);
  }
}
// esta funci�n maneja la solicitud para actualizar un animal existente,
//recibiendo los datos del animal en el cuerpo de la solicitud y
// los datos actualizados en el cuerpo de la solicitud.
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const animal = await animalService.updateAnimal(id, req.body);
    res.json({ success: true, message: "animal actualizado", data: animal });
  } catch (error) {
    next(error);
  }
}
// esta funci�n maneja la solicitud para eliminar un animal,
//los datos actualizados en el cuerpo de la solicitud.
// eliminando el animal correspondiente.
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await animalService.deleteAnimal(id);
    res.json({ success: true, message: "animal eliminado" });
  } catch (error) {
    next(error);
  }
}

// reporta enfermedad y traslada a enfermer�a
// el traslado a enfermer�a se realiza mediante la actualizaci�n del estado de salud
// del animal a "enfermo" y la asignaci�n de un corral de enfermer�a.
export async function reportarEnfermedad(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    const { comentarios } = req.body;
    const idUsuario = req.usuario?.id_usuario;
    if (!idUsuario) {
      res
        .status(401)
        .json({ success: false, message: "usuario no autenticado" });
      return;
    }
    const animal = await animalService.reportarEnfermedad(
      id,
      comentarios,
      idUsuario,
    );
    res.json({
      success: true,
      message: "animal reportado y trasladado a enfermería",
      data: animal,
    });
  } catch (error) {
    next(error);
  }
}

// da el alta veterinaria al animal y lo devuelve a su corral
export async function darDeAlta(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    const { notas_alta } = req.body;
    const idVeterinario = req.usuario?.id_usuario;
    if (!idVeterinario) {
      res
        .status(401)
        .json({ success: false, message: "usuario no autenticado" });
      return;
    }
    const animal = await animalService.darDeAlta(id, idVeterinario, notas_alta);
    res.json({
      success: true,
      message: "animal dado de alta y reintegrado a corral general",
      data: animal,
    });
  } catch (error) {
    next(error);
  }
}

