// controlador de usuarios
import { Request, Response } from "express";
import * as usuarioService from "../services/usuarioService";
import * as registrationService from '../services/registrationService';
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

export async function listRegistrationRequests(_req: Request, res: Response): Promise<void> {
  try {
    const requests = await registrationService.listPendingRequests();
    res.json({ success: true, message: 'solicitudes pendientes', data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'error al listar solicitudes' });
  }
}

export async function approveRegistrationRequest(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1 || !req.usuario) { res.status(400).json({ success: false, message: 'solicitud inválida' }); return; }
  try {
    await registrationService.approveRequest(id, req.usuario.id_usuario);
    res.json({ success: true, message: 'solicitud aprobada; se creó la cuenta con rol peón' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'no se pudo aprobar la solicitud';
    res.status(message.includes('permisos') ? 403 : 400).json({ success: false, message });
  }
}

export async function rejectRegistrationRequest(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1 || !req.usuario) { res.status(400).json({ success: false, message: 'solicitud inválida' }); return; }
  try {
    await registrationService.rejectRequest(id, req.usuario.id_usuario);
    res.json({ success: true, message: 'solicitud rechazada' });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'no se pudo rechazar la solicitud' });
  }
}

// POST /api/usuarios  alta de empleado o copropietario
export async function create(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as CreateUsuarioRequest;

    if (!body || typeof body.nombre !== 'string' || typeof body.email !== 'string' || typeof body.password !== 'string') {
      res
        .status(400)
        .json({
          success: false,
          message: "nombre, email y contraseña son obligatorios",
        });
      return;
    }

    const apellido = typeof body.apellido === 'string' ? body.apellido.trim() : '';
    if (!body.nombre.trim() || !apellido || !/^\S+@\S+\.\S+$/.test(body.email.trim())) {
      res.status(400).json({ success: false, message: 'nombre, apellido y correo válido son obligatorios' }); return;
    }

    if (body.password.length < 10 || Buffer.byteLength(body.password, 'utf8') > 72) {
      res
        .status(400)
        .json({
          success: false,
          message: "la contraseña debe tener entre 10 y 72 bytes",
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

    if (req.usuario?.id_usuario === id && (req.body?.rol !== undefined || req.body?.activo === false)) {
      res.status(400).json({ success: false, message: 'no podés cambiar tu rol ni desactivar tu propia cuenta' }); return;
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

