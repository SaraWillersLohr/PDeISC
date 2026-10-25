// administro cuentas activas y solicitudes de especies o razas.
import type { Request, Response } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { database } from '../config/database.js';

// devuelvo miembros con su rol actual para que el administrador los gestione.
export async function listUsers(_req: Request, res: Response): Promise<void> {
  try { const [data] = await database.execute<RowDataPacket[]>(`SELECT u.id_usuario,u.nombre,u.apellido,u.email,u.activo,r.nombre AS rol FROM usuarios u JOIN roles r ON r.id_rol=u.id_rol ORDER BY u.activo DESC,u.apellido`); res.json({ data }); }
  catch { res.status(500).json({ message: 'no se pudo cargar el equipo' }); }
}

// edito datos personales y rol sin permitir alterar al último administrador.
export async function updateUser(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id); const { nombre, apellido, rol } = req.body as Record<string, string>;
  if (!Number.isInteger(id) || !nombre?.trim() || !apellido?.trim() || !['dueno','peon','veterinario','administrador'].includes(rol ?? '')) { res.status(400).json({ message: 'completá nombre, apellido y un rol permitido' }); return; }
  try {
    const [rows] = await database.execute<RowDataPacket[]>('SELECT id_rol FROM roles WHERE nombre=?', [rol]);
    if (!rows.length) { res.status(409).json({ message: 'el rol no está configurado en la base; aplicá la migración de roles' }); return; }
    const [current] = await database.execute<RowDataPacket[]>(`SELECT r.nombre AS rol FROM usuarios u JOIN roles r ON r.id_rol=u.id_rol WHERE u.id_usuario=? AND u.activo=1`, [id]);
    if (!current.length) { res.status(404).json({ message: 'usuario activo no encontrado' }); return; }
    if (current[0].rol === 'administrador' && rol !== 'administrador') {
      const [admins] = await database.execute<RowDataPacket[]>(`SELECT COUNT(*) AS total FROM usuarios u JOIN roles r ON r.id_rol=u.id_rol WHERE r.nombre='administrador' AND u.activo=1`);
      if (Number(admins[0]?.total ?? 0) <= 1) { res.status(409).json({ message: 'la organización debe conservar al menos un administrador' }); return; }
    }
    const [result] = await database.execute<ResultSetHeader>('UPDATE usuarios SET nombre=?,apellido=?,id_rol=? WHERE id_usuario=? AND activo=1', [nombre.trim(), apellido.trim(), rows[0].id_rol, id]);
    if (!result.affectedRows) { res.status(404).json({ message: 'usuario activo no encontrado' }); return; } res.json({ message: 'usuario actualizado' });
  } catch { res.status(500).json({ message: 'no se pudo editar el usuario' }); }
}

// bloqueo la cuenta sin borrar su autoría histórica.
export async function deactivateUser(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id); const actor = req.usuario?.id_usuario;
  if (!Number.isInteger(id) || id === actor) { res.status(400).json({ message: 'no podés dar de baja tu propia cuenta' }); return; }
  try {
    const [rows] = await database.execute<RowDataPacket[]>(`SELECT u.id_usuario,r.nombre AS rol FROM usuarios u JOIN roles r ON r.id_rol=u.id_rol WHERE u.id_usuario=? AND u.activo=1`, [id]);
    if (!rows.length) { res.status(404).json({ message: 'usuario activo no encontrado' }); return; }
    if (rows[0].rol === 'administrador') {
      const [admins] = await database.execute<RowDataPacket[]>(`SELECT COUNT(*) AS total FROM usuarios u JOIN roles r ON r.id_rol=u.id_rol WHERE r.nombre='administrador' AND u.activo=1`);
      if (Number(admins[0]?.total) <= 1) { res.status(409).json({ message: 'la organización debe conservar al menos un administrador' }); return; }
    }
    await database.execute('UPDATE usuarios SET activo=0, estado_cuenta=\'inactivo\' WHERE id_usuario=?', [id]);
    res.json({ message: 'acceso bloqueado; se conserva la autoría histórica' });
  } catch { res.status(500).json({ message: 'no se pudo dar de baja al usuario' }); }
}

// listo especies y razas existentes con solicitudes pendientes.
export async function listCatalog(_req: Request, res: Response): Promise<void> {
  try {
    const [species] = await database.execute<RowDataPacket[]>('SELECT id_especie,nombre FROM especies ORDER BY nombre');
    const [breeds] = await database.execute<RowDataPacket[]>('SELECT id_raza,id_especie,nombre FROM razas ORDER BY nombre');
    const [pending] = await database.execute<RowDataPacket[]>(`SELECT p.*,e.nombre AS especie FROM especies_razas_pendientes p LEFT JOIN especies e ON e.id_especie=p.id_especie WHERE p.estado='pendiente' ORDER BY p.created_at`);
    res.json({ data: { especies: species, razas: breeds, pendientes: pending } });
  } catch { res.status(500).json({ message: 'no se pudo cargar el catálogo; aplicá la migración productiva' }); }
}

// agrego una especie aprobada al catálogo de la estancia para dueño o administrador.
export async function createSpecies(req: Request, res: Response): Promise<void> {
  const nombre = String(req.body.nombre ?? '').trim();
  const userId = req.usuario?.id_usuario;
  if (!userId || !nombre || nombre.length > 80) { res.status(400).json({ message: 'ingresá un nombre de especie de hasta 80 caracteres' }); return; }
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute<ResultSetHeader>('INSERT INTO especies (nombre) VALUES (?)', [nombre]);
    await connection.execute('INSERT INTO auditoria_cambios (entidad,id_entidad,accion,id_usuario,detalle) VALUES (?,?,?,?,?)', ['especie', result.insertId, 'alta', userId, JSON.stringify({ nombre })]);
    await connection.commit();
    res.status(201).json({ data: { id_especie: result.insertId, nombre } });
  } catch { await connection.rollback(); res.status(409).json({ message: 'esa especie ya existe o no se pudo guardar' }); }
  finally { connection.release(); }
}

// agrego una raza aprobada dentro de una especie existente.
export async function createBreed(req: Request, res: Response): Promise<void> {
  const idEspecie = Number(req.params.id);
  const nombre = String(req.body.nombre ?? '').trim();
  const userId = req.usuario?.id_usuario;
  if (!userId || !Number.isInteger(idEspecie) || idEspecie < 1 || !nombre || nombre.length > 80) {
    res.status(400).json({ message: 'seleccioná una especie e ingresá un nombre de raza de hasta 80 caracteres' }); return;
  }
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [species] = await connection.execute<RowDataPacket[]>('SELECT id_especie FROM especies WHERE id_especie = ? FOR UPDATE', [idEspecie]);
    if (!species.length) { await connection.rollback(); res.status(404).json({ message: 'la especie seleccionada ya no existe' }); return; }
    const [result] = await connection.execute<ResultSetHeader>('INSERT INTO razas (id_especie,nombre) VALUES (?,?)', [idEspecie, nombre]);
    await connection.execute('INSERT INTO auditoria_cambios (entidad,id_entidad,accion,id_usuario,detalle) VALUES (?,?,?,?,?)', ['raza', result.insertId, 'alta', userId, JSON.stringify({ nombre, id_especie: idEspecie })]);
    await connection.commit();
    res.status(201).json({ data: { id_raza: result.insertId, id_especie: idEspecie, nombre } });
  } catch { await connection.rollback(); res.status(409).json({ message: 'esa raza ya existe dentro de la especie o no se pudo guardar' }); }
  finally { connection.release(); }
}

// creo una solicitud del peón o agrego directamente una entrada aprobada.
export async function requestCatalog(req: Request, res: Response): Promise<void> {
  const tipo = String(req.body.tipo); const nombre = String(req.body.nombre ?? '').trim(); const especie = req.body.id_especie ? Number(req.body.id_especie) : null; const user = req.usuario?.id_usuario;
  if (!user || !['especie','raza'].includes(tipo) || !nombre || nombre.length > 80 || (tipo === 'raza' && !especie)) { res.status(400).json({ message: 'completá tipo, nombre y especie para la raza' }); return; }
  try { await database.execute('INSERT INTO especies_razas_pendientes (tipo,nombre,id_especie,id_usuario) VALUES (?,?,?,?)', [tipo,nombre,especie,user]); res.status(201).json({ message: 'solicitud enviada al administrador' }); }
  catch { res.status(409).json({ message: 'no se pudo registrar la solicitud' }); }
}

// apruebo o rechazo una propuesta de catálogo y creo el elemento si corresponde.
export async function reviewCatalog(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id); const user = req.usuario?.id_usuario; const decision = String(req.body.decision);
  if (!Number.isInteger(id) || !user || !['aprobar','rechazar'].includes(decision)) { res.status(400).json({ message: 'decisión inválida' }); return; }
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<RowDataPacket[]>(`SELECT * FROM especies_razas_pendientes WHERE id_solicitud_catalogo=? AND estado='pendiente' FOR UPDATE`, [id]);
    const item = rows[0]; if (!item) throw new Error('la solicitud ya fue revisada');
    if (decision === 'aprobar') {
      if (item.tipo === 'especie') await connection.execute('INSERT INTO especies (nombre) VALUES (?)', [item.nombre]);
      else await connection.execute('INSERT INTO razas (id_especie,nombre) VALUES (?,?)', [item.id_especie,item.nombre]);
    }
    await connection.execute('UPDATE especies_razas_pendientes SET estado=?,id_revisor=? WHERE id_solicitud_catalogo=?', [decision === 'aprobar' ? 'aprobada' : 'rechazada',user,id]);
    await connection.commit(); res.json({ message: decision === 'aprobar' ? 'elemento agregado al catálogo' : 'solicitud rechazada' });
  } catch (error) { await connection.rollback(); res.status(409).json({ message: error instanceof Error ? error.message : 'no se pudo revisar la solicitud' }); }
  finally { connection.release(); }
}
