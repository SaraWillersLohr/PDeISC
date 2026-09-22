// controlador de usuarios
import { Request, Response } from "express";
import * as usuarioService from "../services/usuarioService";
import type { CreateUsuarioRequest, UpdateUsuarioRequest } from "../types";

// GET /api/usuarios  lista empleados (solo admins)
export async function list(req: Request, res: Response): Promise<void> {
  try {
    const usuarios = await usuarioService.listUsuarios();
    res.json({ success: true, message: "usuarios obtenidos", data: usuarios });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "error al listar usuarios";
    res.status(500).json({ success: false, message });
  }
}

// POST /api/usuarios  alta de empleado o copropietario
export async function create(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as CreateUsuarioRequest;

    const apellido = (body.apellido ?? "").trim();
    if (!body.nombre || !body.email || !body.password || !body.rol) {
      res
        .status(400)
        .json({
          success: false,
          message: "nombre, email, contraseña y rol son obligatorios",
        });
      return;
    }

    if (body.password.length < 6) {
      res
        .status(400)
        .json({
          success: false,
          message: "la contraseña debe tener al menos 6 caracteres",
        });
      return;
    }

    const usuario = await usuarioService.createUsuario(
      { ...body, apellido },
      req.usuario!.rol,
    );
    res
      .status(201)
      .json({ success: true, message: "usuario creado", data: usuario });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "error al crear usuario";
    const status = message.includes("permisos") ? 403 : 400;
    res.status(status).json({ success: false, message });
  }
}

// PATCH /api/usuarios/:id  actualiza datos de un usuario
export async function update(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ success: false, message: "id inválido" });
      return;
    }

    const usuario = await usuarioService.updateUsuario(
      id,
      req.body as UpdateUsuarioRequest,
      req.usuario!.rol,
    );
    res.json({ success: true, message: "usuario actualizado", data: usuario });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "error al actualizar";
    res.status(400).json({ success: false, message });
  }
}

// DELETE /api/usuarios/:id  desactiva usuario (soft delete)
export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);

    // evito que el due�o se elimine a s� mismo
    if (req.usuario?.id_usuario === id) {
      res
        .status(400)
        .json({
          success: false,
          message: "no podés desactivar tu propia cuenta",
        });
      return;
    }

    await usuarioService.deactivateUsuario(id);
    res.json({ success: true, message: "usuario desactivado" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "error al desactivar";
    res.status(400).json({ success: false, message });
  }
}

