// consulto y actualizo avisos visibles por perfil.
// consulto el inventario vigente de animales y corrales.
import type { Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2';
import { database } from '../config/database.js';

// muestro avisos dirigidos a todo el equipo o al rol autenticado.
export async function listNotifications(req: Request, res: Response): Promise<void> {
  const role = req.rolVigente ?? '';
  const userId = req.usuario?.id_usuario;
  const before = req.query.before === undefined ? null : Number(req.query.before);
  if (!userId || (before !== null && (!Number.isInteger(before) || before < 1))) { res.status(400).json({ message: 'página de notificaciones inválida' }); return; }
  try {
    const cursorClause = before === null ? '' : 'AND n.id_notificacion < ?';
    const params: Array<number | string> = [userId, role, role];
    if (before !== null) params.push(before);
    const [rows] = await database.execute<RowDataPacket[]>(
      `SELECT n.id_notificacion, n.id_animal, n.titulo, n.mensaje, n.tipo,
              COALESCE(nu.leida, 0) AS leida, n.estado_respuesta, n.created_at
       FROM notificaciones n
       LEFT JOIN notificaciones_usuario nu ON nu.id_notificacion = n.id_notificacion AND nu.id_usuario = ?
       WHERE (n.rol_destino IS NULL OR n.rol_destino = ?) AND (? <> 'administrador' OR n.rol_destino IS NULL OR n.rol_destino = 'administrador') AND COALESCE(nu.eliminada, 0) = 0 ${cursorClause}
       ORDER BY n.id_notificacion DESC LIMIT 11`, params,
    );
    res.status(200).json({ data: rows.slice(0, 10), hasMore: rows.length > 10 });
  } catch {
    res.status(500).json({ message: 'no se pudieron cargar los avisos' });
  }
}

export async function getVisibleNotification(id: number, req: Request): Promise<RowDataPacket[]> {
  const role = req.rolVigente ?? '';
  const [rows] = await database.execute<RowDataPacket[]>(
    `SELECT n.id_notificacion, n.tipo FROM notificaciones n
     WHERE n.id_notificacion = ? AND (n.rol_destino IS NULL OR n.rol_destino = ?) AND (? <> 'administrador' OR n.rol_destino IS NULL OR n.rol_destino = 'administrador')`, [id, role, role],
  );
  return rows;
}

// guardo leído, borrado y respuesta por usuario para no alterar el estado del resto del equipo.
export async function updateNotification(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id); const userId = req.usuario?.id_usuario;
  const action = String(req.body.action ?? '');
  if (!Number.isInteger(id) || id < 1 || !userId || !['read', 'delete', 'accept', 'reject'].includes(action)) { res.status(400).json({ message: 'acción de notificación inválida' }); return; }
  try {
    const rows = await getVisibleNotification(id, req);
    if (!rows.length) { res.status(404).json({ message: 'no se encontró la notificación' }); return; }
    if (action === 'accept' || action === 'reject') {
      if (!String(rows[0].tipo).startsWith('solicitud')) { res.status(400).json({ message: 'esta notificación no admite una decisión' }); return; }
      await database.execute('UPDATE notificaciones SET estado_respuesta = ? WHERE id_notificacion = ? AND estado_respuesta IS NULL', [action === 'accept' ? 'aceptada' : 'rechazada', id]);
    }
    const read = action !== 'delete' ? 1 : 0; const deleted = action === 'delete' ? 1 : 0;
    await database.execute(
      `INSERT INTO notificaciones_usuario (id_notificacion, id_usuario, leida, eliminada)
       VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE leida = IF(VALUES(eliminada) = 1, leida, VALUES(leida)), eliminada = VALUES(eliminada)`,
      [id, userId, read, deleted],
    );
    res.status(200).json({ message: 'notificación actualizada' });
  } catch { res.status(500).json({ message: 'no se pudo actualizar la notificación' }); }
}
