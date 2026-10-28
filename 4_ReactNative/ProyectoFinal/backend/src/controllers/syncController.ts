// aplico operaciones offline una sola vez y conservo la revisión administrativa de muertes.
import type { Request, Response } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { PoolConnection } from 'mysql2/promise';
import { database } from '../config/database.js';

interface SyncOperation { id_operacion: string; tipo_operacion: string; entidad: string; payload: unknown; }
type SyncResult = { id_operacion: string; estado: 'aplicada' | 'repetida' | 'rechazada'; mensaje?: string; data?: unknown };

export async function synchronizeOperations(req: Request, res: Response): Promise<void> {
  const userId = req.usuario?.id_usuario; const role = req.rolVigente ?? '';
  const operations = req.body?.operaciones;
  if (!userId || !Array.isArray(operations) || operations.length < 1 || operations.length > 50) {
    res.status(400).json({ message: 'enviá entre una y cincuenta operaciones pendientes' }); return;
  }
  const results: SyncResult[] = [];
  for (const operation of operations as SyncOperation[]) results.push(await synchronizeOne(operation, userId, role));
  res.json({ data: results });
}

// ejecuto cada elemento en una transacción independiente para conservar los éxitos parciales.
async function synchronizeOne(operation: SyncOperation, userId: number, role: string): Promise<SyncResult> {
  const id = String(operation?.id_operacion ?? '');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) return { id_operacion: id, estado: 'rechazada', mensaje: 'identificador de operación inválido' };
  const entityByType: Record<string, string> = { pesaje: 'animal', movimiento: 'animal', reporte_sanitario: 'animal', reporte_muerte: 'animal', nota_veterinaria: 'animal' };
  const roleByType: Record<string, string> = { pesaje: 'peon', movimiento: 'peon', reporte_sanitario: 'peon', reporte_muerte: 'peon', nota_veterinaria: 'veterinario' };
  if (!operation || entityByType[operation.tipo_operacion] !== operation.entidad) return { id_operacion: id, estado: 'rechazada', mensaje: 'tipo o entidad de operación inválidos' };
  if (roleByType[operation.tipo_operacion] !== role) return { id_operacion: id, estado: 'rechazada', mensaje: 'tu perfil no puede sincronizar esta operación' };
  let connection: PoolConnection | undefined;
  try {
    connection = await database.getConnection();
    await connection.beginTransaction();
    const [previous] = await connection.execute<RowDataPacket[]>('SELECT id_usuario,resultado FROM operaciones_sincronizacion WHERE id_operacion=? FOR UPDATE', [id]);
    if (previous.length) {
      await connection.rollback();
      if (Number(previous[0].id_usuario) !== userId) return { id_operacion: id, estado: 'rechazada', mensaje: 'el identificador pertenece a otra cuenta' };
      return { id_operacion: id, estado: 'repetida', data: parseResult(previous[0].resultado) };
    }
    const payload = asObject(operation.payload);
    const entityId = await applyOperation(connection, operation.tipo_operacion, payload, userId);
    const result = { id_entidad: entityId };
    await connection.execute<ResultSetHeader>(
      'INSERT INTO operaciones_sincronizacion (id_operacion,id_usuario,tipo_operacion,entidad,id_entidad_remota,resultado) VALUES (?,?,?,?,?,?)',
      [id,userId,operation.tipo_operacion,operation.entidad,entityId,JSON.stringify(result)],
    );
    await connection.commit();
    return { id_operacion: id, estado: 'aplicada', data: result };
  } catch (error) {
    if (connection) await connection.rollback();
    if (isDuplicateKey(error) && connection) {
      const [previous] = await connection.execute<RowDataPacket[]>('SELECT id_usuario,resultado FROM operaciones_sincronizacion WHERE id_operacion=?', [id]);
      if (previous.length && Number(previous[0].id_usuario) === userId) return { id_operacion: id, estado: 'repetida', data: parseResult(previous[0].resultado) };
    }
    const message = error instanceof Error && error.name === 'OperationRejected' ? error.message : 'no se pudo sincronizar la operación; el cambio sigue guardado en el dispositivo';
    return { id_operacion: id, estado: 'rechazada', mensaje: message };
  } finally { connection?.release(); }
}

async function applyOperation(connection: PoolConnection, kind: string, payload: Record<string, unknown>, userId: number): Promise<number> {
  const animalId = positiveInteger(payload.id_animal);
  if (!animalId) rejectOperation('el animal indicado no es válido');
  if (kind === 'pesaje') {
    const weight = Number(payload.peso_kg); const date = validDate(payload.fecha);
    if (!Number.isFinite(weight) || weight <= 0 || !date) rejectOperation('el peso y la fecha deben ser válidos');
    const [animals] = await connection.execute<RowDataPacket[]>('SELECT id_animal FROM animales WHERE id_animal=? AND activo=1 FOR UPDATE', [animalId]);
    if (!animals.length) rejectOperation('el animal ya no está activo');
    const [created] = await connection.execute<ResultSetHeader>('INSERT INTO pesajes (id_animal,id_usuario,peso_kg,fecha) VALUES (?,?,?,?)', [animalId,userId,weight,date]);
    await connection.execute('UPDATE animales SET peso_kg=?,version_dato=version_dato+1 WHERE id_animal=?', [weight,animalId]);
    await audit(connection,'animal',animalId,'pesaje',userId,{ peso_kg: weight, fecha: date });
    return created.insertId;
  }
  if (kind === 'movimiento') return moveAnimal(connection,payload,animalId,userId);
  if (kind === 'reporte_sanitario' || kind === 'reporte_muerte') return reportAnimal(connection,payload,animalId,userId,kind);
  if (kind === 'nota_veterinaria') {
    const date = validDate(payload.fecha); const detail = shortText(payload.detalle,5000); const type = payload.tipo === 'tratamiento' || payload.tipo === 'nota' ? payload.tipo : '';
    const photo = readPhoto(payload.foto);
    if (!date || !detail || !type || photo === false) rejectOperation('completá fecha, tipo y detalle válidos para la evolución');
    const [animals] = await connection.execute<RowDataPacket[]>(`SELECT a.id_animal FROM animales a JOIN corrales c ON c.id_corral=a.id_corral WHERE a.id_animal=? AND a.activo=1 AND c.es_enfermeria=1 FOR UPDATE`, [animalId]);
    if (!animals.length) rejectOperation('solo se registra evolución de animales activos en enfermería');
    const [created] = await connection.execute<ResultSetHeader>('INSERT INTO tratamientos (id_animal,id_veterinario,fecha_inicio,tipo,descripcion,foto) VALUES (?,?,?,?,?,?)', [animalId,userId,date,type,detail,photo]);
    await audit(connection,'animal',animalId,'evolucion_veterinaria',userId,{ tipo: type, fecha: date });
    return created.insertId;
  }
  rejectOperation('tipo de operación offline no reconocido');
}

async function moveAnimal(connection: PoolConnection, payload: Record<string, unknown>, animalId: number, userId: number): Promise<number> {
  const destinationId = positiveInteger(payload.id_corral_destino); const notes = shortText(payload.observaciones,500) || null;
  if (!destinationId) rejectOperation('seleccioná un corral de destino válido');
  const [corrals] = await connection.execute<RowDataPacket[]>('SELECT capacidad,nombre,activo,es_enfermeria FROM corrales WHERE id_corral=? FOR UPDATE', [destinationId]);
  const destination = corrals[0];
  const [animals] = await connection.execute<RowDataPacket[]>(`SELECT a.id_animal,a.id_corral,a.estado_salud,a.identificador,c.es_enfermeria AS origen_enfermeria FROM animales a JOIN corrales c ON c.id_corral=a.id_corral WHERE a.id_animal=? AND a.activo=1 FOR UPDATE`, [animalId]);
  const animal = animals[0];
  if (!destination?.activo || !animal) rejectOperation('el animal o corral de destino ya no está activo');
  if (Number(animal.id_corral) === destinationId) rejectOperation('el animal ya está en ese corral');
  let dischargeId: number | null = null;
  if (animal.origen_enfermeria && !destination.es_enfermeria) {
    const [discharges] = await connection.execute<RowDataPacket[]>('SELECT id_alta FROM altas_enfermeria WHERE id_animal=? AND id_movimiento IS NULL ORDER BY fecha_alta DESC LIMIT 1 FOR UPDATE', [animalId]);
    if (!discharges.length) rejectOperation('el veterinario debe dar el alta antes del traslado');
    dischargeId = Number(discharges[0].id_alta);
  }
  const [occupancy] = await connection.execute<RowDataPacket[]>('SELECT COUNT(*) AS total FROM animales WHERE id_corral=? AND activo=1', [destinationId]);
  if (Number(occupancy[0]?.total ?? 0) >= Number(destination.capacidad)) rejectOperation('el corral de destino alcanzó su capacidad');
  const [movement] = await connection.execute<ResultSetHeader>('INSERT INTO movimientos_animales (id_animal,id_corral_origen,id_corral_destino,id_usuario,observaciones) VALUES (?,?,?,?,?)', [animalId,animal.id_corral,destinationId,userId,notes]);
  if (dischargeId) await connection.execute('UPDATE altas_enfermeria SET id_movimiento=?,fecha_traslado=CURRENT_TIMESTAMP WHERE id_alta=?', [movement.insertId,dischargeId]);
  const health = destination.es_enfermeria ? animal.estado_salud === 'sano' ? 'enfermo' : animal.estado_salud : dischargeId ? 'sano' : animal.estado_salud;
  await connection.execute('UPDATE animales SET id_corral=?,estado_salud=?,version_dato=version_dato+1 WHERE id_animal=?', [destinationId,health,animalId]);
  if (health !== animal.estado_salud) await connection.execute('INSERT INTO historial_estado_salud (id_animal,id_usuario,estado_anterior,estado_nuevo,observaciones) VALUES (?,?,?,?,?)', [animalId,userId,animal.estado_salud,health,notes || 'movimiento sincronizado desde el dispositivo']);
  const targetRoles = destination.es_enfermeria ? ['dueno','administrador','veterinario'] : ['dueno','administrador'];
  for (const role of targetRoles) await connection.execute('INSERT INTO notificaciones (id_animal,titulo,mensaje,tipo,rol_destino) VALUES (?,?,?,?,?)', [animalId,destination.es_enfermeria ? 'Animal ingresó a enfermería' : 'Traslado de animal realizado',`${animal.identificador}: traslado registrado en ${destination.nombre}.`,'movimiento_animal',role]);
  await audit(connection,'animal',animalId,'movimiento',userId,{ id_corral_origen: animal.id_corral,id_corral_destino: destinationId,id_movimiento: movement.insertId });
  return movement.insertId;
}

async function reportAnimal(connection: PoolConnection, payload: Record<string, unknown>, animalId: number, userId: number, kind: string): Promise<number> {
  const date = validDate(payload.fecha); const reason = shortText(payload.motivo,500) || (kind === 'reporte_muerte' ? 'Muerte notificada desde la ficha' : 'Reporte de enfermedad desde la ficha');
  if (!date) rejectOperation('la fecha del reporte no es válida');
  const [animals] = await connection.execute<RowDataPacket[]>(`SELECT a.id_animal,a.id_corral,a.estado_salud,a.identificador,c.es_enfermeria FROM animales a JOIN corrales c ON c.id_corral=a.id_corral WHERE a.id_animal=? AND a.activo=1 FOR UPDATE`, [animalId]);
  const animal = animals[0];
  if (!animal) rejectOperation('el animal ya no está activo');
  if (kind === 'reporte_muerte') {
    const lat = Number(payload.latitud); const lon = Number(payload.longitud); const photo = readPhoto(payload.foto);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lon) || lon < -180 || lon > 180 || photo === false) rejectOperation('la muerte requiere una ubicación gps válida y una foto válida si se adjunta');
    const [created] = await connection.execute<ResultSetHeader>('INSERT INTO reportes_muerte (id_animal,id_usuario,fecha,motivo,latitud,longitud,foto) VALUES (?,?,?,?,?,?,?)', [animalId,userId,date,reason,lat,lon,photo]);
    // La baja operativa es inmediata; el reporte queda pendiente y el administrador puede reactivarlo si lo rechaza.
    await connection.execute('UPDATE animales SET activo=0,version_dato=version_dato+1 WHERE id_animal=?', [animalId]);
    await audit(connection,'animal',animalId,'reporte_muerte',userId,{ fecha: date,motivo: reason,id_reporte: created.insertId,revision: 'pendiente' });
    return created.insertId;
  }
  const destinationId = positiveInteger(payload.id_corral_destino);
  if (!destinationId) rejectOperation('seleccioná el corral de enfermería');
  const [corrals] = await connection.execute<RowDataPacket[]>('SELECT nombre,capacidad,activo,es_enfermeria FROM corrales WHERE id_corral=? FOR UPDATE', [destinationId]);
  const destination = corrals[0];
  if (!destination?.activo || !destination.es_enfermeria) rejectOperation('elegí un corral de enfermería activo');
  if (Number(animal.id_corral) !== destinationId) {
    const [occupancy] = await connection.execute<RowDataPacket[]>('SELECT COUNT(*) AS total FROM animales WHERE id_corral=? AND activo=1', [destinationId]);
    if (Number(occupancy[0]?.total ?? 0) >= Number(destination.capacidad)) rejectOperation('enfermería alcanzó su capacidad');
    await connection.execute('INSERT INTO movimientos_animales (id_animal,id_corral_origen,id_corral_destino,id_usuario,observaciones) VALUES (?,?,?,?,?)', [animalId,animal.id_corral,destinationId,userId,reason]);
  }
  const [created] = await connection.execute<ResultSetHeader>('INSERT INTO reportes_sanitarios (id_animal,id_usuario,fecha,motivo) VALUES (?,?,?,?)', [animalId,userId,date,reason]);
  await connection.execute("UPDATE animales SET id_corral=?,estado_salud='enfermo',version_dato=version_dato+1 WHERE id_animal=?", [destinationId,animalId]);
  if (animal.estado_salud !== 'enfermo') await connection.execute('INSERT INTO historial_estado_salud (id_animal,id_usuario,estado_anterior,estado_nuevo,observaciones) VALUES (?,?,?,?,?)', [animalId,userId,animal.estado_salud,'enfermo',reason]);
  for (const role of ['veterinario','dueno','administrador']) await connection.execute('INSERT INTO notificaciones (id_animal,titulo,mensaje,tipo,rol_destino) VALUES (?,?,?,?,?)', [animalId,'Animal ingresó a enfermería',`${animal.identificador}: reporte sanitario sincronizado. ${reason}`,'reporte_sanitario',role]);
  await audit(connection,'animal',animalId,'reporte_sanitario',userId,{ fecha: date,motivo: reason,id_corral_destino: destinationId });
  return created.insertId;
}

async function audit(connection: PoolConnection, entity: string, id: number, action: string, userId: number, detail: unknown): Promise<void> {
  await connection.execute('INSERT INTO auditoria_cambios (entidad,id_entidad,accion,id_usuario,detalle) VALUES (?,?,?,?,?)', [entity,id,action,userId,JSON.stringify(detail)]);
}
function asObject(value: unknown): Record<string, unknown> {
  const parsed = typeof value === 'string' ? parseResult(value) : value;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) rejectOperation('el contenido de la operación no es válido');
  return parsed as Record<string, unknown>;
}
function positiveInteger(value: unknown): number | null { const number = Number(value); return Number.isInteger(number) && number > 0 ? number : null; }
function validDate(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0,10) === value ? value : null;
}
function shortText(value: unknown, limit: number): string { return typeof value === 'string' ? value.trim().slice(0,limit) : ''; }
function readPhoto(value: unknown): string | null | false {
  if (value == null || value === '') return null;
  return typeof value === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value) && Buffer.byteLength(value,'utf8') <= 1_500_000 ? value : false;
}
function parseResult(value: unknown): unknown { if (typeof value !== 'string') return value; try { return JSON.parse(value); } catch { return null; } }
function isDuplicateKey(error: unknown): boolean { return Boolean(error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'ER_DUP_ENTRY'); }
function rejectOperation(message: string): never { const error = new Error(message); error.name = 'OperationRejected'; throw error; }
