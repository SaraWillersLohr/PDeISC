// consulto y modifico fichas de animales y sus bajas.
// consulto el inventario vigente de animales y corrales.
import type { Request, Response } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { database } from '../config/database.js';
import { isAnimalGender } from './livestockController.shared.js';
import { AnimalGender } from './livestockController.shared.js';
import { readPhoto } from './livestockController.shared.js';
import { validBirthDate } from './livestockController.shared.js';
import { CorralRow } from './livestockController.shared.js';

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
