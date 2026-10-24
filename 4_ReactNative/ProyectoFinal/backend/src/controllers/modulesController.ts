// conecto tareas y operaciones de reproducción con las tablas de la estancia.
import type { Request, Response } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { database } from '../config/database.js';

export async function listTasks(req: Request, res: Response): Promise<void> {
  const userId = req.usuario?.id_usuario ?? 0; const role = req.rolVigente ?? '';
  try {
    const [rows] = await database.execute<RowDataPacket[]>(
      `SELECT t.id_tarea,t.titulo,t.descripcion,t.id_responsable,t.fecha_vencimiento,t.estado,
              u.nombre AS responsable,u.apellido AS apellido_responsable
       FROM tareas t LEFT JOIN usuarios u ON u.id_usuario=t.id_responsable
       WHERE t.id_responsable=? OR ?='administrador' ORDER BY t.fecha_vencimiento IS NULL,t.fecha_vencimiento,t.created_at DESC`,
      [userId, role],
    );
    res.json({ data: rows });
  } catch { res.status(500).json({ message: 'no se pudieron cargar las tareas; verificá la migración productiva' }); }
}

export async function createTask(req: Request, res: Response): Promise<void> {
  const userId = req.usuario?.id_usuario;
  const title = String(req.body.titulo ?? '').trim();
  const description = String(req.body.descripcion ?? '').trim();
  const responsible = Number(req.body.id_responsable ?? userId);
  const dueDate = req.body.fecha_vencimiento || null;
  if (!userId || !title || title.length > 150 || !Number.isInteger(responsible) || (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(String(dueDate)))) {
    res.status(400).json({ message: 'indicá título y fecha válida para la tarea' }); return;
  }
  try {
    const [assignees] = await database.execute<RowDataPacket[]>(`SELECT u.id_usuario FROM usuarios u JOIN roles r ON r.id_rol=u.id_rol WHERE u.id_usuario=? AND u.activo=1 AND r.nombre='peon'`, [responsible]);
    if (!assignees.length) { res.status(400).json({ message: 'asigná la tarea a un peón activo' }); return; }
    const [result] = await database.execute<ResultSetHeader>(
      'INSERT INTO tareas (titulo,descripcion,id_responsable,fecha_vencimiento,id_creador) VALUES (?,?,?,?,?)',
      [title, description || null, responsible, dueDate, userId],
    );
    res.status(201).json({ data: { id_tarea: result.insertId } });
  } catch { res.status(409).json({ message: 'no se pudo crear la tarea; revisá el responsable' }); }
}

export async function updateTask(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id); const state = String(req.body.estado ?? '');
  const userId = req.usuario?.id_usuario ?? 0; const role = req.rolVigente ?? '';
  if (!Number.isInteger(id) || !['pendiente','en_progreso','completada','cancelada'].includes(state)) {
    res.status(400).json({ message: 'estado de tarea inválido' }); return;
  }
  try {
    const [result] = await database.execute<ResultSetHeader>(
      `UPDATE tareas SET estado=? WHERE id_tarea=? AND (id_responsable=? OR ?='administrador')`,
      [state, id, userId, role],
    );
    if (!result.affectedRows) { res.status(404).json({ message: 'tarea no encontrada o no asignada a tu usuario' }); return; }
    res.json({ message: 'tarea actualizada' });
  } catch { res.status(500).json({ message: 'no se pudo actualizar la tarea' }); }
}

export async function listReproduction(req: Request, res: Response): Promise<void> {
  try {
    const [services] = await database.execute<RowDataPacket[]>(
      `SELECT s.id_servicio,s.fecha,s.metodo,s.estado,s.observaciones,
              m.identificador AS madre,m.nombre AS nombre_madre,p.identificador AS padre,s.padre_texto
       FROM servicios_monta s JOIN animales m ON m.id_animal=s.id_madre
       LEFT JOIN animales p ON p.id_animal=s.id_padre ORDER BY s.fecha DESC LIMIT 200`,
    );
    const [births] = await database.execute<RowDataPacket[]>(
      `SELECT n.id_nacimiento,n.fecha,n.observaciones,c.identificador AS cria,c.nombre AS nombre_cria,
              m.identificador AS madre,n.madre_texto,p.identificador AS padre,n.padre_texto
       FROM nacimientos n JOIN animales c ON c.id_animal=n.id_cria
       LEFT JOIN animales m ON m.id_animal=n.id_madre LEFT JOIN animales p ON p.id_animal=n.id_padre
       ORDER BY n.fecha DESC LIMIT 200`,
    );
    res.json({ data: { servicios: services, nacimientos: births, usuario: req.usuario?.id_usuario } });
  } catch { res.status(500).json({ message: 'no se pudo cargar reproducción; verificá la migración productiva' }); }
}

export async function createMatingService(req: Request, res: Response): Promise<void> {
  const userId = req.usuario?.id_usuario;
  const mother = Number(req.body.id_madre); const father = req.body.id_padre ? Number(req.body.id_padre) : null;
  const date = String(req.body.fecha ?? ''); const method = String(req.body.metodo ?? '').trim();
  const fatherText = String(req.body.padre_texto ?? '').trim(); const notes = String(req.body.observaciones ?? '').trim();
  if (!userId || !Number.isInteger(mother) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !method || method.length > 60 || (!father && !fatherText)) {
    res.status(400).json({ message: 'indicá madre, fecha, método y padre o su nombre informado' }); return;
  }
  try {
    const [result] = await database.execute<ResultSetHeader>(
      `INSERT INTO servicios_monta (id_madre,id_padre,padre_texto,fecha,metodo,estado,observaciones,id_usuario)
       VALUES (?,?,?,?,?,'realizado',?,?)`,
      [mother, father, fatherText || null, date, method, notes || null, userId],
    );
    res.status(201).json({ data: { id_servicio: result.insertId } });
  } catch { res.status(409).json({ message: 'no se pudo guardar el servicio; verificá los animales' }); }
}

// registro una cría y sus dos progenitores en una sola operación transaccional.
export async function createBirth(req: Request, res: Response): Promise<void> {
  const userId = req.usuario?.id_usuario; const identifier = String(req.body.identificador ?? '').trim();
  const breedId = Number(req.body.id_raza); const corralId = Number(req.body.id_corral); const date = String(req.body.fecha ?? '');
  const motherId = req.body.id_madre ? Number(req.body.id_madre) : null; const fatherId = req.body.id_padre ? Number(req.body.id_padre) : null;
  const motherText = String(req.body.madre_texto ?? '').trim(); const fatherText = String(req.body.padre_texto ?? '').trim();
  const name = String(req.body.nombre ?? '').trim(); const notes = String(req.body.observaciones ?? '').trim();
  if (!userId || !identifier || identifier.length > 50 || !Number.isInteger(breedId) || !Number.isInteger(corralId) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || (!motherId && !motherText) || (!fatherId && !fatherText) || (motherId && !Number.isInteger(motherId)) || (fatherId && !Number.isInteger(fatherId))) {
    res.status(400).json({ message: 'completá identificador, raza, corral, fecha y ambos progenitores (animal o nombre)' }); return;
  }
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [corralRows] = await connection.execute<RowDataPacket[]>('SELECT capacidad, activo FROM corrales WHERE id_corral=? FOR UPDATE', [corralId]);
    if (!corralRows[0]?.activo) throw new Error('el corral seleccionado no está activo');
    const [counts] = await connection.execute<RowDataPacket[]>('SELECT COUNT(*) AS ocupacion FROM animales WHERE id_corral=? AND activo=1', [corralId]);
    if (Number(counts[0]?.ocupacion ?? 0) >= Number(corralRows[0].capacidad)) throw new Error('el corral alcanzó su capacidad');
    for (const parentId of [motherId, fatherId].filter((value): value is number => value !== null)) {
      const [parent] = await connection.execute<RowDataPacket[]>('SELECT id_animal FROM animales WHERE id_animal=?', [parentId]);
      if (!parent.length) throw new Error('uno de los progenitores seleccionados no existe');
    }
    const [created] = await connection.execute<ResultSetHeader>("INSERT INTO animales (id_corral,id_raza,identificador,nombre,fecha_nacimiento,estado_salud,activo) VALUES (?,?,?,?,?,'sano',1)", [corralId, breedId, identifier, name || null, date]);
    await connection.execute('INSERT INTO nacimientos (id_cria,id_madre,madre_texto,id_padre,padre_texto,fecha,id_usuario,observaciones) VALUES (?,?,?,?,?,?,?,?)', [created.insertId, motherId, motherText || null, fatherId, fatherText || null, date, userId, notes || null]);
    await connection.execute('INSERT INTO auditoria_cambios (entidad,id_entidad,accion,id_usuario,detalle) VALUES (?,?,?,?,?)', ['animal', created.insertId, 'nacimiento', userId, JSON.stringify({ madre: motherId ?? motherText, padre: fatherId ?? fatherText, fecha: date })]);
    await connection.commit(); res.status(201).json({ data: { id_animal: created.insertId } });
  } catch (error) {
    await connection.rollback(); const message = error instanceof Error ? error.message : 'no se pudo registrar el nacimiento';
    res.status(409).json({ message });
  } finally { connection.release(); }
}

// devuelvo los eventos que la estancia tiene cargados para su consulta.
export async function listEvents(_req: Request, res: Response): Promise<void> {
  try {
    const [rows] = await database.execute<RowDataPacket[]>(
      `SELECT id_evento,titulo,descripcion,fecha_inicio,fecha_fin,ubicacion,fuente,url
       FROM eventos_campo ORDER BY fecha_inicio DESC LIMIT 200`,
    );
    res.json({ data: rows });
  } catch { res.status(500).json({ message: 'no se pudieron cargar los eventos; verificá la migración productiva' }); }
}
