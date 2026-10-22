// verifico en la base que la sesión activa pertenezca al administrador actual.
import type { NextFunction, Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2';
import { database } from '../config/database.js';

// impido que un rol antiguo guardado en el jwt conserve privilegios administrativos.
export async function requireAdministrator(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.usuario?.id_usuario;
  if (!userId) { res.status(401).json({ message: 'se requiere autenticación' }); return; }
  try {
    const [rows] = await database.execute<RowDataPacket[]>(
      `SELECT 1 AS permitido FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol
       WHERE u.id_usuario = ? AND u.activo = 1 AND u.estado_cuenta = 'activo' AND r.nombre = 'administrador' LIMIT 1`,
      [userId],
    );
    if (!rows.length) { res.status(403).json({ message: 'solo el administrador puede revisar solicitudes' }); return; }
    next();
  } catch {
    res.status(500).json({ message: 'no se pudieron verificar los permisos administrativos' });
  }
}
