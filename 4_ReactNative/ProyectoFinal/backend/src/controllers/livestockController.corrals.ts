// consulto y modifico corrales y capacidad.
// consulto el inventario vigente de animales y corrales.
import type { Request, Response } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { database } from '../config/database.js';

// devuelvo corrales activos y su ocupación confirmada.
export async function listCorrals(_req: Request, res: Response): Promise<void> {
  try {
    const [rows] = await database.execute<RowDataPacket[]>(
      `SELECT c.id_corral, c.nombre, c.capacidad, c.es_enfermeria,
              COUNT(a.id_animal) AS ocupacion
       FROM corrales c LEFT JOIN animales a ON a.id_corral = c.id_corral AND a.activo = 1
       WHERE c.activo = 1 GROUP BY c.id_corral, c.nombre, c.capacidad, c.es_enfermeria
       ORDER BY c.es_enfermeria DESC, c.nombre`,
    );
    res.status(200).json({ data: rows });
  } catch {
    res.status(500).json({ message: 'no se pudo cargar la lista de corrales' });
  }
}

// creo un corral operativo o un potrero según el indicador enviado.
export async function createCorral(req: Request, res: Response): Promise<void> {
  const nombre = String(req.body.nombre ?? '').trim(); const capacidad = Number(req.body.capacidad);
  if (!nombre || nombre.length > 80 || !Number.isInteger(capacidad) || capacidad < 1) { res.status(400).json({ message: 'indicá nombre y capacidad válidos' }); return; }
  try { const [result] = await database.execute<ResultSetHeader>('INSERT INTO corrales (nombre, capacidad, es_enfermeria) VALUES (?, ?, ?)', [nombre, capacidad, req.body.es_enfermeria ? 1 : 0]); res.status(201).json({ data: { id_corral: result.insertId } }); }
  catch { res.status(409).json({ message: 'no se pudo crear; verificá si ya existe un corral con ese nombre' }); }
}

// actualizo capacidad y nombre sin permitir que la capacidad quede por debajo de la ocupación.
export async function updateCorral(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id); const nombre = String(req.body.nombre ?? '').trim(); const capacidad = Number(req.body.capacidad);
  const userId = req.usuario?.id_usuario;
  if (!Number.isInteger(id) || id < 1 || !userId || !nombre || !Number.isInteger(capacidad) || capacidad < 1) { res.status(400).json({ message: 'indicá nombre y capacidad válidos' }); return; }
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [corrals] = await connection.execute<RowDataPacket[]>('SELECT nombre,capacidad FROM corrales WHERE id_corral=? AND activo=1 FOR UPDATE', [id]);
    if (!corrals.length) { await connection.rollback(); res.status(404).json({ message: 'corral no encontrado' }); return; }
    const [rows] = await connection.execute<RowDataPacket[]>('SELECT COUNT(*) AS ocupacion FROM animales WHERE id_corral=? AND activo=1', [id]);
    if (capacidad < Number(rows[0]?.ocupacion ?? 0)) { await connection.rollback(); res.status(409).json({ message: 'la capacidad no puede ser menor a la ocupación actual' }); return; }
    await connection.execute<ResultSetHeader>('UPDATE corrales SET nombre=?, capacidad=? WHERE id_corral=? AND activo=1', [nombre, capacidad, id]);
    await connection.execute('INSERT INTO auditoria_cambios (entidad,id_entidad,accion,id_usuario,detalle) VALUES (?,?,?,?,?)', ['corral',id,'edicion',userId,JSON.stringify({ nombre_anterior: corrals[0].nombre, capacidad_anterior: corrals[0].capacidad, nombre, capacidad })]);
    await connection.commit(); res.json({ message: 'corral actualizado' });
  } catch { await connection.rollback(); res.status(409).json({ message: 'no se pudo actualizar el corral' }); }
  finally { connection.release(); }
}

// doy de baja un corral solo cuando no quedan animales asignados.
export async function deleteCorral(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id); const userId = req.usuario?.id_usuario;
  if (!Number.isInteger(id) || id < 1 || !userId) { res.status(400).json({ message: 'corral inválido' }); return; }
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [corrals] = await connection.execute<RowDataPacket[]>('SELECT nombre FROM corrales WHERE id_corral=? AND activo=1 AND es_enfermeria=0 FOR UPDATE', [id]);
    if (!corrals.length) { await connection.rollback(); res.status(409).json({ message: 'corral no encontrado o reservado para enfermería' }); return; }
    const [rows] = await connection.execute<RowDataPacket[]>('SELECT COUNT(*) AS ocupacion FROM animales WHERE id_corral=? AND activo=1', [id]);
    if (Number(rows[0]?.ocupacion ?? 0) > 0) { await connection.rollback(); res.status(409).json({ message: 'mové los animales antes de dar de baja el corral' }); return; }
    await connection.execute<ResultSetHeader>('UPDATE corrales SET activo=0 WHERE id_corral=? AND activo=1 AND es_enfermeria=0', [id]);
    await connection.execute('INSERT INTO auditoria_cambios (entidad,id_entidad,accion,id_usuario,detalle) VALUES (?,?,?,?,?)', ['corral',id,'baja_logica',userId,JSON.stringify({ nombre: corrals[0].nombre })]);
    await connection.commit(); res.json({ message: 'corral dado de baja' });
  } catch { await connection.rollback(); res.status(500).json({ message: 'no se pudo dar de baja el corral' }); }
  finally { connection.release(); }
}
