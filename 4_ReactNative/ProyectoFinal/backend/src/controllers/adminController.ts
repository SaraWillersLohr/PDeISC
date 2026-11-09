// respondo consultas y decisiones administrativas sobre solicitudes de acceso.
import type { Request, Response } from 'express';
import { approveRegistrationRequest, listPendingRegistrationRequests, rejectRegistrationRequest, type RequestedRole } from '../services/registrationService.js';
import { isRequestedRole } from '../services/registrationCodeService.js';

// listo las solicitudes cuyo correo ya fue verificado.
export async function listRequests(_req: Request, res: Response): Promise<void> {
  try {
    const data = await listPendingRegistrationRequests();
    res.status(200).json({ data });
  } catch {
    res.status(500).json({ message: 'no se pudieron cargar las solicitudes' });
  }
}

// El dueño puede designar varios gestores, tanto al aprobar como al editar una cuenta.
export async function approveRequest(req: Request, res: Response): Promise<void> {
  const requestId = Number(req.params.id);
  const adminId = req.usuario?.id_usuario;
  const { rol } = req.body as { rol?: RequestedRole };
  if (!Number.isInteger(requestId) || requestId < 1 || !adminId || !rol || !isRequestedRole(rol)) {
    res.status(400).json({ message: 'seleccioná la solicitud y un rol válido' });
    return;
  }
  // Verifico el permiso en el servidor aunque se intente enviar el rol manualmente.
  if (rol === 'gestor_usuarios' && req.rolVigente !== 'dueno') {
    res.status(403).json({ message: 'Solo el dueño puede designar gestores de usuarios.' });
    return;
  }
  try {
    await approveRegistrationRequest(requestId, adminId, rol);
    res.status(200).json({ message: 'solicitud aprobada; la cuenta ya está habilitada' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'no se pudo aprobar la solicitud';
    res.status(400).json({ message });
  }
}

// rechazo una solicitud y conservo la decisión en el historial.
export async function rejectRequest(req: Request, res: Response): Promise<void> {
  const requestId = Number(req.params.id);
  const adminId = req.usuario?.id_usuario;
  if (!Number.isInteger(requestId) || requestId < 1 || !adminId) {
    res.status(400).json({ message: 'la solicitud indicada no es válida' });
    return;
  }
  try {
    await rejectRegistrationRequest(requestId, adminId);
    res.status(200).json({ message: 'solicitud rechazada' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'no se pudo rechazar la solicitud';
    res.status(400).json({ message });
  }
}
