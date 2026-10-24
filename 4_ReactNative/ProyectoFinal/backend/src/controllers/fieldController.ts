// gestiono estadísticas y operaciones de campo con validación de rol en las rutas.
import type { Request, Response } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { database } from '../config/database.js';

// obtengo las métricas de cría sin atribuir resultados a quien cargó los datos.
export async function dashboard(_req: Request, res: Response): Promise<void> {
  try {
    const [rows] = await database.execute<RowDataPacket[]>(
      `SELECT (SELECT COUNT(*) FROM nacimientos WHERE YEAR(fecha) = YEAR(CURRENT_DATE())) AS crias_ano,
       (SELECT COUNT(*) FROM servicios_monta WHERE estado = 'realizado' AND fecha >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)) AS servicios_90_dias,
       (SELECT COUNT(*) FROM reportes_muerte WHERE estado = 'pendiente') AS muertes_pendientes,
       (SELECT COUNT(*) FROM animales WHERE activo = 1 AND estado_salud <> 'sano') AS alertas_sanitarias,
       (SELECT COUNT(*) FROM animales WHERE activo = 1 AND estado_salud IN ('preñada','prenada')) AS hembras_prenadas`,
    );
    res.json({ data: rows[0] });
  } catch { res.status(500).json({ message: 'no se pudieron cargar las estadísticas; aplicá la migración productiva' }); }
}

// guardo un pesaje y actualizo el peso actual dentro de una transacción.
export async function createWeight(req: Request, res: Response): Promise<void> {
  const animalId = Number(req.params.id); const peso = Number(req.body.peso_kg); const fecha = String(req.body.fecha ?? '');
  const userId = req.usuario?.id_usuario;
  if (!Number.isInteger(animalId) || !userId || !Number.isFinite(peso) || peso <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) { res.status(400).json({ message: 'indicá animal, peso válido y fecha' }); return; }
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [animal] = await connection.execute<RowDataPacket[]>('SELECT id_animal FROM animales WHERE id_animal = ? AND activo = 1 FOR UPDATE', [animalId]);
    if (!animal.length) throw new Error('animal no activo');
    const [result] = await connection.execute<ResultSetHeader>('INSERT INTO pesajes (id_animal, id_usuario, peso_kg, fecha) VALUES (?, ?, ?, ?)', [animalId, userId, peso, fecha]);
    await connection.execute('UPDATE animales SET peso_kg = ?, version_dato = version_dato + 1 WHERE id_animal = ?', [peso, animalId]);
    await connection.execute('INSERT INTO auditoria_cambios (entidad, id_entidad, accion, id_usuario, detalle) VALUES (?, ?, ?, ?, ?)', ['animal', animalId, 'pesaje', userId, JSON.stringify({ peso_kg: peso, fecha })]);
    await connection.commit(); res.status(201).json({ data: { id_pesaje: result.insertId } });
  } catch (error) { await connection.rollback(); res.status(409).json({ message: error instanceof Error ? error.message : 'no se pudo guardar el pesaje' }); }
  finally { connection.release(); }
}

// registro reporte sanitario o de muerte; una muerte desactiva al animal de inmediato.
export async function createReport(req: Request, res: Response): Promise<void> {
  const kind = String(req.params.kind); const animalId = Number(req.body.id_animal); const userId = req.usuario?.id_usuario;
  const fecha = String(req.body.fecha ?? ''); const motivo = String(req.body.motivo ?? '').trim().slice(0, 500);
  if (!['sanitario', 'muerte'].includes(kind) || !Number.isInteger(animalId) || !userId || !motivo || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) { res.status(400).json({ message: 'completá animal, fecha y motivo' }); return; }
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [animals] = await connection.execute<RowDataPacket[]>('SELECT id_animal, identificador FROM animales WHERE id_animal = ? AND activo = 1 FOR UPDATE', [animalId]);
    if (!animals.length) throw new Error('el animal ya no está activo');
    if (kind === 'muerte') {
      const lat = req.body.latitud == null ? null : Number(req.body.latitud); const lon = req.body.longitud == null ? null : Number(req.body.longitud);
      if ((lat === null) !== (lon === null) || (lat !== null && (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lon) || lon! < -180 || lon! > 180))) throw new Error('coordenadas GPS inválidas');
      await connection.execute('INSERT INTO reportes_muerte (id_animal, id_usuario, fecha, motivo, latitud, longitud) VALUES (?, ?, ?, ?, ?, ?)', [animalId, userId, fecha, motivo, lat, lon]);
      await connection.execute('UPDATE animales SET activo = 0, version_dato = version_dato + 1 WHERE id_animal = ?', [animalId]);
    } else {
      await connection.execute('INSERT INTO reportes_sanitarios (id_animal, id_usuario, fecha, motivo) VALUES (?, ?, ?, ?)', [animalId, userId, fecha, motivo]);
      await connection.execute("UPDATE animales SET estado_salud = 'enfermo', version_dato = version_dato + 1 WHERE id_animal = ?", [animalId]);
      await connection.execute(`INSERT INTO notificaciones (id_animal, titulo, mensaje, tipo, rol_destino) VALUES (?, ?, ?, 'reporte_sanitario', 'peon')`, [animalId, 'Reporte sanitario guardado', `${animals[0].identificador}: el animal quedó marcado como enfermo. Trasladalo al corral de enfermería para que lo revise el veterinario.`]);
    }
    await connection.execute('INSERT INTO auditoria_cambios (entidad, id_entidad, accion, id_usuario, detalle) VALUES (?, ?, ?, ?, ?)', ['animal', animalId, `reporte_${kind}`, userId, JSON.stringify({ fecha, motivo })]);
    await connection.commit(); res.status(201).json({ message: kind === 'muerte' ? 'baja operativa inmediata; revisión pendiente' : 'reporte sanitario registrado' });
  } catch (error) { await connection.rollback(); res.status(409).json({ message: error instanceof Error ? error.message : 'no se pudo guardar el reporte' }); }
  finally { connection.release(); }
}

// listo reportes de muerte y reviso confirmando la baja o reactivando el animal.
export async function reviewDeaths(req: Request, res: Response): Promise<void> {
  const userId = req.usuario?.id_usuario; const id = Number(req.params.id); const decision = String(req.body.decision);
  const notes = typeof req.body.motivo_revision === 'string' ? req.body.motivo_revision.trim().slice(0, 500) : '';
  if (req.method === 'GET') {
    try { const [rows] = await database.execute<RowDataPacket[]>(`SELECT m.*, a.identificador, a.nombre, c.nombre AS corral, u.nombre AS reportado_por FROM reportes_muerte m JOIN animales a ON a.id_animal=m.id_animal JOIN corrales c ON c.id_corral=a.id_corral JOIN usuarios u ON u.id_usuario=m.id_usuario WHERE m.estado='pendiente' ORDER BY m.created_at`); res.json({ data: rows }); }
    catch { res.status(500).json({ message: 'no se pudieron cargar las muertes pendientes' }); }
    return;
  }
  if (!userId || !Number.isInteger(id) || !['confirmar', 'rechazar'].includes(decision) || (decision === 'rechazar' && !notes)) { res.status(400).json({ message: 'decisión o motivo de rechazo inválido' }); return; }
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<RowDataPacket[]>('SELECT id_animal FROM reportes_muerte WHERE id_reporte = ? AND estado = \'pendiente\' FOR UPDATE', [id]);
    if (!rows.length) throw new Error('el reporte ya fue revisado');
    const state = decision === 'confirmar' ? 'confirmado' : 'rechazado';
    await connection.execute('UPDATE reportes_muerte SET estado = ?, id_revisor = ?, motivo_revision = ?, revisado_en = CURRENT_TIMESTAMP WHERE id_reporte = ?', [state, userId, notes || null, id]);
    if (decision === 'rechazar') await connection.execute('UPDATE animales SET activo = 1, version_dato = version_dato + 1 WHERE id_animal = ?', [rows[0].id_animal]);
    await connection.commit(); res.json({ message: decision === 'confirmar' ? 'muerte confirmada' : 'animal reactivado; reporte conservado' });
  } catch (error) { await connection.rollback(); res.status(409).json({ message: error instanceof Error ? error.message : 'no se pudo revisar el reporte' }); }
  finally { connection.release(); }
}

// leo la geometría fija de los corrales para representarla en el mapa.
export async function mapAreas(_req: Request, res: Response): Promise<void> {
  try { const [rows] = await database.execute<RowDataPacket[]>('SELECT id_corral, nombre, capacidad, puntos_mapa FROM corrales WHERE activo=1 ORDER BY nombre'); res.json({ data: rows }); }
  catch { res.status(500).json({ message: 'no se pudieron cargar los puntos del mapa' }); }
}

// guardo puntos gps de perímetro; el veterinario no tiene permiso para editar el mapa.
export async function saveMapArea(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id); const points = req.body.puntos; const userId = req.usuario?.id_usuario;
  if (!Number.isInteger(id) || !userId || !Array.isArray(points) || points.length < 3 || points.some((p: { lat?: number; lon?: number }) => !Number.isFinite(p.lat) || !Number.isFinite(p.lon) || p.lat! < -90 || p.lat! > 90 || p.lon! < -180 || p.lon! > 180)) { res.status(400).json({ message: 'el perímetro requiere al menos tres puntos gps válidos' }); return; }
  try { await database.execute('UPDATE corrales SET puntos_mapa = ? WHERE id_corral = ? AND activo = 1', [JSON.stringify(points), id]); await database.execute('INSERT INTO auditoria_cambios (entidad, id_entidad, accion, id_usuario, detalle) VALUES (?, ?, ?, ?, ?)', ['corral', id, 'mapa_actualizado', userId, JSON.stringify({ puntos: points })]); res.json({ message: 'perímetro guardado' }); }
  catch { res.status(500).json({ message: 'no se pudo guardar el perímetro' }); }
}
