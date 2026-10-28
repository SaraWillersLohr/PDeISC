// consulto el inventario vigente de animales y corrales.
import type { Request, Response } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { PoolConnection } from 'mysql2/promise';
import { database } from '../config/database.js';

interface MovementRow extends RowDataPacket { id_animal: number; id_corral: number; activo: number; origen_enfermeria: number; estado_salud: string; identificador: string; }
interface CorralRow extends RowDataPacket { capacidad: number; nombre: string; activo: number; es_enfermeria: number; }
const animalGenders = ['hembra', 'macho', 'no_especificado'] as const;
type AnimalGender = typeof animalGenders[number];
function isAnimalGender(value: string): value is AnimalGender { return (animalGenders as readonly string[]).includes(value); }

function readPhoto(value: unknown): string | null | false {
  if (value == null || value === '') return null;
  if (typeof value !== 'string' || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value) || Buffer.byteLength(value, 'utf8') > 1_500_000) return false;
  return value;
}

// valido fechas reales y evito nacimientos posteriores al día actual.
function validBirthDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && date <= new Date(new Date().toISOString().slice(0, 10));
}

// devuelvo animales activos con su ubicación operativa actual.
export async function listAnimals(req: Request, res: Response): Promise<void> {
  const includeInactive = req.query.incluir_inactivos;
  if (includeInactive !== undefined && includeInactive !== 'true' && includeInactive !== 'false') {
    res.status(400).json({ message: 'el filtro de animales inactivos no es válido' }); return;
  }
  try {
    const [rows] = await database.execute<RowDataPacket[]>(
      `SELECT a.id_animal, a.id_raza, a.identificador, a.nombre, a.foto, a.genero, a.fecha_nacimiento, a.peso_kg, a.version_dato,
              a.estado_salud, a.activo, b.motivo AS motivo_baja, b.detalle AS detalle_baja, b.fecha AS fecha_baja,
              c.id_corral, c.nombre AS corral, r.nombre AS raza, e.nombre AS especie,
              EXISTS (SELECT 1 FROM altas_enfermeria h WHERE h.id_animal = a.id_animal AND h.id_movimiento IS NULL) AS alta_pendiente_traslado
       FROM animales a LEFT JOIN bajas_animales b ON b.id_animal=a.id_animal JOIN corrales c ON c.id_corral = a.id_corral
       JOIN razas r ON r.id_raza = a.id_raza JOIN especies e ON e.id_especie = r.id_especie
       WHERE (a.activo = 1 AND c.activo = 1) OR ? = 1 ORDER BY a.identificador`,
      [includeInactive === 'true' ? 1 : 0],
    );
    res.status(200).json({ data: rows });
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'UNKNOWN';
    console.error(`Error al consultar el inventario de animales (${code}).`);
    if (code === 'ER_NO_SUCH_TABLE' || code === 'ER_BAD_FIELD_ERROR') {
      console.error('Revisá las migraciones pendientes con npm run db:migrate.');
    }
    res.status(500).json({ message: 'no se pudo cargar el inventario de animales' });
  }
}

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

// registro un animal nuevo y valido disponibilidad del corral dentro de una transacción.
export async function createAnimal(req: Request, res: Response): Promise<void> {
  const identifier = String(req.body.identificador ?? '').trim();
  const name = String(req.body.nombre ?? '').trim() || null;
  const genderValue = req.body.genero == null ? 'no_especificado' : String(req.body.genero);
  if (!isAnimalGender(genderValue)) { res.status(400).json({ message: 'elegí un género válido para el animal' }); return; }
  const gender: AnimalGender = genderValue;
  const corralId = Number(req.body.id_corral); const breedId = Number(req.body.id_raza);
  const birth = req.body.fecha_nacimiento ? String(req.body.fecha_nacimiento) : null;
  const weight = req.body.peso_kg == null || req.body.peso_kg === '' ? null : Number(req.body.peso_kg);
  const photo = readPhoto(req.body.foto);
  const userId = req.usuario?.id_usuario;
  if (photo === false) { res.status(400).json({ message: 'la foto debe ser JPG, PNG o WebP y no superar 1,5 MB' }); return; }
  if (!userId || !identifier || identifier.length > 50 || !Number.isInteger(corralId) || !Number.isInteger(breedId) || (birth && !validBirthDate(birth)) || (weight !== null && (!Number.isFinite(weight) || weight <= 0))) {
    res.status(400).json({ message: 'completá identificador, especie/raza, corral y datos válidos' }); return;
  }
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [corrals] = await connection.execute<CorralRow[]>('SELECT capacidad, nombre, activo, es_enfermeria FROM corrales WHERE id_corral=? FOR UPDATE', [corralId]);
    const corral = corrals[0];
    if (!corral || !corral.activo) throw new Error('el corral seleccionado no está activo');
    if (corral.es_enfermeria) throw new Error('los animales ingresan a enfermería mediante un traslado sanitario');
    const [counts] = await connection.execute<RowDataPacket[]>('SELECT COUNT(*) AS ocupacion FROM animales WHERE id_corral=? AND activo=1', [corralId]);
    if (Number(counts[0]?.ocupacion ?? 0) >= corral.capacidad) throw new Error('el corral alcanzó su capacidad');
    const [created] = await connection.execute<ResultSetHeader>(
      `INSERT INTO animales (id_corral,id_raza,identificador,nombre,foto,genero,fecha_nacimiento,peso_kg,estado_salud,activo)
       VALUES (?,?,?,?,?,?,?, ?, 'sano',1)`, [corralId, breedId, identifier, name, photo, gender, birth, weight],
    );
    await connection.execute('INSERT INTO auditoria_cambios (entidad,id_entidad,accion,id_usuario,detalle) VALUES (?,?,?,?,?)', ['animal', created.insertId, 'alta', userId, JSON.stringify({ identificador: identifier, genero: gender, id_corral: corralId })]);
    await connection.commit(); res.status(201).json({ data: { id_animal: created.insertId, identificador: identifier } });
  } catch (error) {
    await connection.rollback(); const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
    const message = code === 'ER_DUP_ENTRY' ? 'ya existe un animal con ese identificador; revisá la caravana ingresada' : error instanceof Error ? error.message : 'no se pudo registrar el animal';
    res.status(409).json({ message });
  } finally { connection.release(); }
}

// edito datos del animal y controlo conflictos por versión.
export async function updateAnimal(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id); const version = Number(req.body.version_dato);
  const { nombre, identificador, id_raza, fecha_nacimiento } = req.body as Record<string, unknown>;
  const genderValue = req.body.genero == null ? null : String(req.body.genero);
  if (genderValue !== null && !isAnimalGender(genderValue)) { res.status(400).json({ message: 'elegí un género válido para el animal' }); return; }
  const cleanIdentifier = String(identificador ?? '').trim();
  const cleanBirth = typeof fecha_nacimiento === 'string' ? fecha_nacimiento.trim() : '';
  if (!Number.isInteger(id) || !Number.isInteger(version) || !cleanIdentifier || cleanIdentifier.length > 50 || !Number(id_raza) || (cleanBirth && !validBirthDate(cleanBirth))) { res.status(400).json({ message: 'completá identificador y raza, y revisá la fecha de nacimiento' }); return; }
  try {
    const [result] = await database.execute<ResultSetHeader>(
      'UPDATE animales SET nombre=?, identificador=?, id_raza=?, fecha_nacimiento=?, genero=COALESCE(?,genero), version_dato=version_dato+1 WHERE id_animal=? AND activo=1 AND version_dato=?',
      [String(nombre ?? '').trim() || null, cleanIdentifier, Number(id_raza), cleanBirth || null, genderValue, id, version],
    );
    if (!result.affectedRows) { res.status(409).json({ message: 'el animal cambió o ya no está activo; recargá sus datos' }); return; }
    res.json({ message: 'ficha actualizada' });
  } catch (error) {
    const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
    res.status(code === 'ER_DUP_ENTRY' ? 409 : 500).json({ message: code === 'ER_DUP_ENTRY' ? 'ya existe un animal con ese identificador; revisá la caravana ingresada' : 'no se pudo editar el animal' });
  }
}

// doy de baja un animal conservando su ficha, historia y el motivo informado.
export async function deactivateAnimal(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id); const userId = req.usuario?.id_usuario;
  const reason = String(req.body.motivo ?? ''); const notes = String(req.body.detalle ?? '').trim();
  const lat = req.body.latitud == null ? null : Number(req.body.latitud); const lon = req.body.longitud == null ? null : Number(req.body.longitud);
  const photoValue = req.body.foto;
  const photo = photoValue == null || photoValue === '' ? null : typeof photoValue === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(photoValue) && Buffer.byteLength(photoValue, 'utf8') <= 1_500_000 ? photoValue : false;
  const validLocation = lat !== null && lon !== null && Number.isFinite(lat) && Math.abs(lat) <= 90 && Number.isFinite(lon) && Math.abs(lon) <= 180;
  if (!Number.isInteger(id) || id < 1 || !userId || !['venta', 'muerte', 'otro'].includes(reason) || notes.length > 500) {
    res.status(400).json({ message: 'elegí venta, muerte u otro y escribí un detalle de hasta 500 caracteres' }); return;
  }
  if (reason === 'muerte' && !validLocation) { res.status(400).json({ message: 'la ubicación GPS es obligatoria para notificar una muerte' }); return; }
  if (photo === false) { res.status(400).json({ message: 'la foto debe ser JPG, PNG o WebP y no superar 1,5 MB' }); return; }
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [animals] = await connection.execute<RowDataPacket[]>('SELECT id_animal,identificador FROM animales WHERE id_animal=? AND activo=1 FOR UPDATE', [id]);
    if (!animals.length) { await connection.rollback(); res.status(409).json({ message: 'el animal no existe o ya está dado de baja' }); return; }
    await connection.execute('INSERT INTO bajas_animales (id_animal,id_usuario,motivo,detalle,fecha) VALUES (?,?,?,?,CURRENT_DATE())', [id, userId, reason, notes || null]);
    if (reason === 'muerte') {
      await connection.execute(
        `INSERT INTO reportes_muerte (id_animal,id_usuario,fecha,motivo,latitud,longitud,foto,estado,id_revisor,motivo_revision,revisado_en)
         VALUES (?, ?, CURRENT_DATE(), ?, ?, ?, ?, 'confirmado', ?, 'Confirmada por el dueño al dar de baja el animal', CURRENT_TIMESTAMP)`,
        [id, userId, notes || 'Muerte informada por el dueño', lat, lon, photo, userId],
      );
      await connection.execute('UPDATE animales SET activo=0, version_dato=version_dato+1 WHERE id_animal=?', [id]);
    } else {
      await connection.execute('UPDATE animales SET activo=0, version_dato=version_dato+1 WHERE id_animal=?', [id]);
    }
    await connection.execute('INSERT INTO auditoria_cambios (entidad,id_entidad,accion,id_usuario,detalle) VALUES (?,?,?,?,?)', ['animal', id, 'baja', userId, JSON.stringify({ motivo: reason, detalle: notes || null })]);
    await connection.commit(); res.json({ message: 'animal dado de baja; se conservó su ficha e historial' });
  } catch (error) {
    await connection.rollback(); const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
    res.status(500).json({ message: code === 'ER_NO_SUCH_TABLE' ? 'actualizá la base de datos para registrar bajas de animales' : 'no se pudo dar de baja el animal' });
  } finally { connection.release(); }
}

// elimino definitivamente solo fichas inactivas y sus registros vinculados.
export async function permanentlyDeleteInactiveAnimal(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id); const userId = req.usuario?.id_usuario;
  if (!Number.isInteger(id) || id < 1 || !userId) { res.status(400).json({ message: 'animal inválido' }); return; }
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [animals] = await connection.execute<RowDataPacket[]>(
      'SELECT id_animal, identificador, nombre, id_corral, id_raza FROM animales WHERE id_animal=? AND activo=0 FOR UPDATE', [id],
    );
    if (!animals.length) { await connection.rollback(); res.status(409).json({ message: 'solo se pueden eliminar fichas de animales inactivos' }); return; }
    const animal = animals[0];
    const snapshot = JSON.stringify({ identificador: animal.identificador, nombre: animal.nombre, id_corral: animal.id_corral, id_raza: animal.id_raza });

    // conservo el nombre del progenitor en nacimientos y servicios que pertenecen a otros animales.
    await connection.execute(`UPDATE nacimientos n JOIN animales a ON a.id_animal=n.id_madre SET n.madre_texto=COALESCE(n.madre_texto, CONCAT(a.identificador, IF(a.nombre IS NULL, '', CONCAT(' · ', a.nombre)))), n.id_madre=NULL WHERE n.id_madre=?`, [id]);
    await connection.execute(`UPDATE nacimientos n JOIN animales a ON a.id_animal=n.id_padre SET n.padre_texto=COALESCE(n.padre_texto, CONCAT(a.identificador, IF(a.nombre IS NULL, '', CONCAT(' · ', a.nombre)))), n.id_padre=NULL WHERE n.id_padre=?`, [id]);
    await connection.execute(`UPDATE servicios_monta s JOIN animales a ON a.id_animal=s.id_padre SET s.padre_texto=COALESCE(s.padre_texto, CONCAT(a.identificador, IF(a.nombre IS NULL, '', CONCAT(' · ', a.nombre)))), s.id_padre=NULL WHERE s.id_padre=?`, [id]);
    await connection.execute('DELETE FROM servicios_monta WHERE id_madre=?', [id]);
    await connection.execute('DELETE FROM nacimientos WHERE id_cria=?', [id]);

    await connection.execute('DELETE FROM altas_enfermeria WHERE id_animal=?', [id]);
    await connection.execute('DELETE FROM tratamientos WHERE id_animal=?', [id]);
    await connection.execute('DELETE FROM reportes_sanitarios WHERE id_animal=?', [id]);
    await connection.execute('DELETE FROM reportes_muerte WHERE id_animal=?', [id]);
    await connection.execute('DELETE FROM bajas_animales WHERE id_animal=?', [id]);
    await connection.execute('DELETE FROM historial_estado_salud WHERE id_animal=?', [id]);
    await connection.execute('DELETE FROM pesajes WHERE id_animal=?', [id]);
    await connection.execute('DELETE FROM movimientos_animales WHERE id_animal=?', [id]);
    await connection.execute('UPDATE notificaciones SET id_animal=NULL WHERE id_animal=?', [id]);
    await connection.execute('INSERT INTO auditoria_cambios (entidad,id_entidad,accion,id_usuario,detalle) VALUES (?,?,?,?,?)', ['animal', id, 'eliminacion_permanente', userId, snapshot]);
    await connection.execute('DELETE FROM animales WHERE id_animal=? AND activo=0', [id]);
    await connection.commit(); res.json({ message: 'ficha y registros vinculados eliminados definitivamente' });
  } catch (error) {
    await connection.rollback();
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
    res.status(code === 'ER_NO_SUCH_TABLE' ? 503 : 500).json({ message: code === 'ER_NO_SUCH_TABLE' ? 'actualizá la base de datos antes de eliminar fichas' : 'no se pudo eliminar definitivamente la ficha' });
  } finally { connection.release(); }
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

// traslado un animal activo y guardo su origen, destino, usuario y fecha.
export async function moveAnimal(req: Request, res: Response): Promise<void> {
  const animalId = Number(req.params.id);
  const destinationId = Number(req.body.id_corral_destino);
  const userId = req.usuario?.id_usuario;
  const notes = typeof req.body.observaciones === 'string' ? req.body.observaciones.trim().slice(0, 500) : null;
  if (!Number.isInteger(animalId) || animalId < 1 || !Number.isInteger(destinationId) || destinationId < 1 || !userId) {
    res.status(400).json({ message: 'indicá un animal y un corral de destino válidos' });
    return;
  }
  let connection: PoolConnection | undefined;
  try {
    const transaction = await database.getConnection();
    connection = transaction;
    await transaction.beginTransaction();
    const [corrals] = await transaction.execute<CorralRow[]>(
      'SELECT capacidad, nombre, activo, es_enfermeria FROM corrales WHERE id_corral = ? FOR UPDATE', [destinationId],
    );
    const destination = corrals[0];
    if (!destination || !destination.activo) throw new Error('el corral de destino no está activo');
    const [animals] = await transaction.execute<MovementRow[]>(
      `SELECT a.id_animal, a.id_corral, a.activo, a.estado_salud, c.es_enfermeria AS origen_enfermeria
       FROM animales a JOIN corrales c ON c.id_corral = a.id_corral WHERE a.id_animal = ? FOR UPDATE`, [animalId],
    );
    const animal = animals[0];
    if (!animal || !animal.activo) throw new Error('el animal no está activo y no se puede trasladar');
    if (animal.id_corral === destinationId) throw new Error('el animal ya está asignado a ese corral');
    // conservo el alta veterinaria como requisito para sacar un animal de enfermería.
    let pendingDischargeId: number | null = null;
    if (animal.origen_enfermeria && !destination.es_enfermeria) {
      const [discharges] = await transaction.execute<RowDataPacket[]>(
        'SELECT id_alta FROM altas_enfermeria WHERE id_animal = ? AND id_movimiento IS NULL ORDER BY fecha_alta DESC LIMIT 1 FOR UPDATE', [animalId],
      );
      if (req.rolVigente === 'peon' && !discharges.length) {
        throw new Error('el veterinario debe registrar el alta antes del traslado');
      }
      if (discharges.length) {
        pendingDischargeId = Number(discharges[0].id_alta);
      }
    }
    const [counts] = await transaction.execute<RowDataPacket[]>(
      'SELECT COUNT(*) AS ocupacion FROM animales WHERE id_corral = ? AND activo = 1', [destinationId],
    );
    if (Number(counts[0]?.ocupacion ?? 0) >= destination.capacidad) throw new Error('el corral de destino alcanzó su capacidad');
    const [movement] = await transaction.execute<ResultSetHeader>(
      `INSERT INTO movimientos_animales (id_animal, id_corral_origen, id_corral_destino, id_usuario, observaciones)
       VALUES (?, ?, ?, ?, ?)`,
      [animalId, animal.id_corral, destinationId, userId, notes],
    );
    if (pendingDischargeId) {
      await transaction.execute(
        'UPDATE altas_enfermeria SET id_movimiento = ?, fecha_traslado = CURRENT_TIMESTAMP WHERE id_alta = ?',
        [movement.insertId, pendingDischargeId],
      );
    }
    const newHealthStatus = destination.es_enfermeria
      ? animal.estado_salud === 'sano' ? 'enfermo' : animal.estado_salud
      : animal.origen_enfermeria && pendingDischargeId ? 'sano' : animal.estado_salud;
    await transaction.execute('UPDATE animales SET id_corral = ?, estado_salud = ?, version_dato = version_dato + 1 WHERE id_animal = ?', [destinationId, newHealthStatus, animalId]);
    if (newHealthStatus !== animal.estado_salud) {
      await transaction.execute(
        'INSERT INTO historial_estado_salud (id_animal, id_usuario, estado_anterior, estado_nuevo, observaciones) VALUES (?, ?, ?, ?, ?)',
        [animalId, userId, animal.estado_salud, newHealthStatus, destination.es_enfermeria ? `Ingreso a enfermería: ${notes || 'sin observaciones'}` : 'Traslado físico posterior al alta médica'],
      );
    }
    if (req.rolVigente === 'peon') {
      const nursingEntry = Boolean(destination.es_enfermeria);
      const recipients = nursingEntry ? ['dueno', 'administrador', 'veterinario'] : ['dueno', 'administrador'];
      const title = nursingEntry ? 'Animal ingresó a enfermería' : 'Traslado de animal realizado';
      const message = nursingEntry
        ? `${animal.identificador}: ingresó a ${destination.nombre} con estado ${newHealthStatus}. ${notes ? `Observación del peón: ${notes}` : 'El veterinario puede revisar el caso en enfermería.'}`
        : `${animal.identificador}: fue trasladado desde su corral anterior a ${destination.nombre}.`;
      for (const role of recipients) {
        await transaction.execute(
          'INSERT INTO notificaciones (id_animal, titulo, mensaje, tipo, rol_destino) VALUES (?, ?, ?, ?, ?)',
          [animalId, title, message, nursingEntry ? 'ingreso_enfermeria' : 'movimiento_animal', role],
        );
      }
    }
    await transaction.commit();
    res.status(201).json({ message: 'traslado registrado', data: { id_animal: animalId, id_corral_destino: destinationId, corral_destino: destination.nombre } });
  } catch (error) {
    if (connection) await connection.rollback();
    const message = error instanceof Error ? error.message : 'no se pudo registrar el traslado';
    res.status(message.includes('no está') || message.includes('ya está') || message.includes('alcanzó') || message.includes('el veterinario debe') ? 409 : 500).json({ message });
  } finally {
    connection?.release();
  }
}

// listo para veterinaria los animales que siguen asignados a enfermería.
export async function listNursingAnimals(_req: Request, res: Response): Promise<void> {
  try {
    const [rows] = await database.execute<RowDataPacket[]>(
      `SELECT a.id_animal, a.identificador, a.nombre, a.foto, a.estado_salud, a.peso_kg,
              c.nombre AS corral, r.nombre AS raza, e.nombre AS especie,
              EXISTS (SELECT 1 FROM altas_enfermeria h WHERE h.id_animal = a.id_animal AND h.id_movimiento IS NULL) AS alta_pendiente_traslado,
              (SELECT rs.motivo FROM reportes_sanitarios rs WHERE rs.id_animal=a.id_animal AND rs.estado='pendiente' ORDER BY rs.created_at DESC LIMIT 1) AS reporte_sanitario
       FROM animales a JOIN corrales c ON c.id_corral = a.id_corral
       JOIN razas r ON r.id_raza = a.id_raza JOIN especies e ON e.id_especie = r.id_especie
       WHERE a.activo = 1 AND c.es_enfermeria = 1 ORDER BY a.updated_at DESC`,
    );
    res.status(200).json({ data: rows });
  } catch {
    res.status(500).json({ message: 'no se pudo cargar enfermería' });
  }
}

// consulto la evolución veterinaria de un animal que permanece en enfermería.
export async function listVeterinaryRecords(req: Request, res: Response): Promise<void> {
  const animalId = Number(req.params.id);
  if (!Number.isInteger(animalId) || animalId < 1) { res.status(400).json({ message: 'el animal indicado no es válido' }); return; }
  try {
    const [animals] = await database.execute<RowDataPacket[]>(
      `SELECT a.id_animal FROM animales a JOIN corrales c ON c.id_corral=a.id_corral
       WHERE a.id_animal=? AND a.activo=1 AND c.es_enfermeria=1`, [animalId],
    );
    if (!animals.length) { res.status(404).json({ message: 'el animal ya no está en enfermería' }); return; }
    const [rows] = await database.execute<RowDataPacket[]>(
      `SELECT timeline.* FROM (
         SELECT CONCAT('tratamiento-', t.id_tratamiento) AS id_registro, t.id_animal, t.fecha_inicio AS fecha,
                t.tipo, t.descripcion AS detalle, t.foto, t.created_at, u.nombre AS nombre_autor, u.apellido AS apellido_autor
         FROM tratamientos t JOIN usuarios u ON u.id_usuario=t.id_veterinario WHERE t.id_animal=?
         UNION ALL
         SELECT CONCAT('alta-', h.id_alta), h.id_animal, DATE(h.fecha_alta), 'alta',
                COALESCE(h.observaciones, 'Alta médica registrada'), NULL, h.created_at, u.nombre, u.apellido
         FROM altas_enfermeria h JOIN usuarios u ON u.id_usuario=h.id_veterinario WHERE h.id_animal=?
         UNION ALL
         SELECT CONCAT('reporte-', r.id_reporte_sanitario), r.id_animal, r.fecha, 'reporte_sanitario',
                r.motivo, NULL, r.created_at, u.nombre, u.apellido
         FROM reportes_sanitarios r JOIN usuarios u ON u.id_usuario=r.id_usuario WHERE r.id_animal=?
         UNION ALL
         SELECT CONCAT('estado-', h.id_historial), h.id_animal, DATE(h.created_at), 'estado_salud',
                CONCAT('Estado sanitario: ', h.estado_anterior, ' → ', h.estado_nuevo, IF(h.observaciones IS NULL, '', CONCAT('. ', h.observaciones))),
                NULL, h.created_at, u.nombre, u.apellido
         FROM historial_estado_salud h JOIN usuarios u ON u.id_usuario=h.id_usuario WHERE h.id_animal=?
         UNION ALL
         SELECT CONCAT('movimiento-', m.id_movimiento), m.id_animal, DATE(m.fecha_hora),
                IF(cd.es_enfermeria = 1, 'ingreso_enfermeria', 'movimiento'),
                CONCAT('Traslado de ', co.nombre, ' a ', cd.nombre, IF(m.observaciones IS NULL, '', CONCAT('. ', m.observaciones))),
                NULL, m.created_at, u.nombre, u.apellido
         FROM movimientos_animales m JOIN corrales co ON co.id_corral=m.id_corral_origen
         JOIN corrales cd ON cd.id_corral=m.id_corral_destino JOIN usuarios u ON u.id_usuario=m.id_usuario
         WHERE m.id_animal=?
       ) timeline ORDER BY timeline.fecha DESC, timeline.id_registro DESC`, [animalId, animalId, animalId, animalId, animalId],
    );
    res.status(200).json({ data: rows });
  } catch { res.status(500).json({ message: 'no se pudo cargar la evolución veterinaria' }); }
}

// guardo una evolución fechada, con foto opcional, solo desde el rol veterinario.
export async function createVeterinaryRecord(req: Request, res: Response): Promise<void> {
  const animalId = Number(req.params.id); const userId = req.usuario?.id_usuario;
  const date = String(req.body.fecha ?? ''); const type = String(req.body.tipo ?? 'nota'); const detail = String(req.body.detalle ?? '').trim();
  const photo = readPhoto(req.body.foto);
  if (!Number.isInteger(animalId) || animalId < 1 || !userId || !validBirthDate(date) || !['tratamiento', 'nota'].includes(type) || !detail || detail.length > 5000 || photo === false) {
    res.status(400).json({ message: 'completá una fecha válida y una nota de hasta 5.000 caracteres; la foto debe ser válida y no superar 1,5 MB' }); return;
  }
  try {
    const [animals] = await database.execute<RowDataPacket[]>(
      `SELECT a.id_animal FROM animales a JOIN corrales c ON c.id_corral=a.id_corral
       WHERE a.id_animal=? AND a.activo=1 AND c.es_enfermeria=1`, [animalId],
    );
    if (!animals.length) { res.status(409).json({ message: 'solo se puede registrar la evolución de un animal activo en enfermería' }); return; }
    const [result] = await database.execute<ResultSetHeader>(
      'INSERT INTO tratamientos (id_animal,id_veterinario,fecha_inicio,tipo,descripcion,foto) VALUES (?,?,?,?,?,?)',
      [animalId, userId, date, type, detail, photo],
    );
    res.status(201).json({ data: { id_registro: result.insertId } });
  } catch { res.status(500).json({ message: 'no se pudo guardar la evolución veterinaria' }); }
}

// actualizo el diagnóstico veterinario y dejo constancia visible en la evolución.
export async function updateNursingHealthStatus(req: Request, res: Response): Promise<void> {
  const animalId = Number(req.params.id); const veterinarianId = req.usuario?.id_usuario;
  const status = String(req.body.estado_salud ?? '');
  const notes = typeof req.body.observaciones === 'string' ? req.body.observaciones.trim().slice(0, 450) : '';
  if (!Number.isInteger(animalId) || animalId < 1 || !veterinarianId || !['enfermo', 'herido'].includes(status)) {
    res.status(400).json({ message: 'seleccioná enfermo o herido para un animal válido' }); return;
  }
  let connection: PoolConnection | undefined;
  try {
    const transaction = await database.getConnection(); connection = transaction; await transaction.beginTransaction();
    const [animals] = await transaction.execute<RowDataPacket[]>(
      `SELECT a.identificador, a.estado_salud FROM animales a JOIN corrales c ON c.id_corral=a.id_corral
       WHERE a.id_animal=? AND a.activo=1 AND c.es_enfermeria=1 FOR UPDATE`, [animalId],
    );
    if (!animals.length) throw new Error('el animal ya no está en enfermería');
    const previous = String(animals[0].estado_salud);
    if (previous !== status) {
      await transaction.execute('UPDATE animales SET estado_salud=?, version_dato=version_dato+1 WHERE id_animal=?', [status, animalId]);
      await transaction.execute(
        'INSERT INTO historial_estado_salud (id_animal, id_usuario, estado_anterior, estado_nuevo, observaciones) VALUES (?, ?, ?, ?, ?)',
        [animalId, veterinarianId, previous, status, notes || 'Diagnóstico veterinario'],
      );
      const message = `${animals[0].identificador}: el veterinario actualizó el estado sanitario de ${previous} a ${status}.${notes ? ` ${notes}` : ''}`;
      for (const role of ['dueno', 'administrador']) {
        await transaction.execute('INSERT INTO notificaciones (id_animal, titulo, mensaje, tipo, rol_destino) VALUES (?, ?, ?, \'estado_salud\', ?)', [animalId, 'Actualización veterinaria', message, role]);
      }
    }
    await transaction.commit(); res.status(200).json({ message: previous === status ? 'el estado sanitario ya estaba actualizado' : 'diagnóstico actualizado y notificado' });
  } catch (error) {
    if (connection) await connection.rollback();
    const message = error instanceof Error ? error.message : 'no se pudo actualizar el diagnóstico';
    res.status(message.startsWith('el animal') ? 409 : 500).json({ message });
  } finally { connection?.release(); }
}

// registro el alta médica, mantengo la ubicación y aviso al equipo de campo.
export async function dischargeNursingAnimal(req: Request, res: Response): Promise<void> {
  const animalId = Number(req.params.id);
  const veterinarianId = req.usuario?.id_usuario;
  const notes = typeof req.body.observaciones === 'string' ? req.body.observaciones.trim().slice(0, 500) : null;
  if (!Number.isInteger(animalId) || animalId < 1 || !veterinarianId) { res.status(400).json({ message: 'el animal indicado no es válido' }); return; }
  let connection: PoolConnection | undefined;
  try {
    const transaction = await database.getConnection();
    connection = transaction;
    await transaction.beginTransaction();
    const [animals] = await transaction.execute<MovementRow[]>(
      `SELECT a.id_animal, a.id_corral, a.activo, a.estado_salud, a.identificador, c.es_enfermeria AS origen_enfermeria
       FROM animales a JOIN corrales c ON c.id_corral = a.id_corral WHERE a.id_animal = ? FOR UPDATE`, [animalId],
    );
    const animal = animals[0];
    if (!animal || !animal.activo || !animal.origen_enfermeria) throw new Error('el animal no está activo en enfermería');
    const [pending] = await transaction.execute<RowDataPacket[]>(
      'SELECT id_alta FROM altas_enfermeria WHERE id_animal = ? AND id_movimiento IS NULL LIMIT 1 FOR UPDATE', [animalId],
    );
    if (pending.length) throw new Error('el animal ya tiene un alta pendiente de traslado');
    if (animal.estado_salud !== 'sano') {
      await transaction.execute('UPDATE animales SET estado_salud = \'sano\', version_dato = version_dato + 1 WHERE id_animal = ?', [animalId]);
      await transaction.execute(
        'INSERT INTO historial_estado_salud (id_animal, id_usuario, estado_anterior, estado_nuevo, observaciones) VALUES (?, ?, ?, \'sano\', ?)',
        [animalId, veterinarianId, animal.estado_salud, notes || 'Alta médica veterinaria'],
      );
      for (const role of ['dueno', 'administrador']) {
        await transaction.execute(
          'INSERT INTO notificaciones (id_animal, titulo, mensaje, tipo, rol_destino) VALUES (?, ?, ?, \'estado_salud\', ?)',
          [animalId, 'Alta médica registrada', `${animal.identificador}: alta veterinaria confirmada; estado sanitario actualizado a sano. El peón realizará el traslado físico desde enfermería.`, role],
        );
      }
    }
    await transaction.execute("UPDATE reportes_sanitarios SET estado='atendido' WHERE id_animal=? AND estado='pendiente'", [animalId]);
    await transaction.execute('INSERT INTO altas_enfermeria (id_animal, id_veterinario, observaciones) VALUES (?, ?, ?)', [animalId, veterinarianId, notes]);
    await transaction.execute(
      `INSERT INTO notificaciones (id_animal, titulo, mensaje, tipo, rol_destino)
       VALUES (?, ?, ?, 'alta_enfermeria', 'peon')`,
      [animalId, 'Animal listo para traslado', `${animal.identificador}: el veterinario registró el alta. El animal sigue en enfermería y espera el traslado físico del peón.`],
    );
    await transaction.commit();
    res.status(201).json({ message: 'alta registrada; enfermería queda pendiente del traslado del peón' });
  } catch (error) {
    if (connection) await connection.rollback();
    const message = error instanceof Error ? error.message : 'no se pudo registrar el alta';
    res.status(message.startsWith('el animal') || message.startsWith('el alta') ? 409 : 500).json({ message });
  } finally { connection?.release(); }
}

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

async function getVisibleNotification(id: number, req: Request): Promise<RowDataPacket[]> {
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
