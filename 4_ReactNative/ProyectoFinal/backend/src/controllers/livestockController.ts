// consulto el inventario vigente de animales y corrales.
import type { Request, Response } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { PoolConnection } from 'mysql2/promise';
import { database } from '../config/database.js';

interface MovementRow extends RowDataPacket { id_animal: number; id_corral: number; activo: number; origen_enfermeria: number; estado_salud: string; identificador: string; }
interface CorralRow extends RowDataPacket { capacidad: number; nombre: string; activo: number; es_enfermeria: number; }

// devuelvo animales activos con su ubicación operativa actual.
export async function listAnimals(_req: Request, res: Response): Promise<void> {
  try {
    const [rows] = await database.execute<RowDataPacket[]>(
      `SELECT a.id_animal, a.id_raza, a.identificador, a.nombre, a.fecha_nacimiento, a.peso_kg, a.version_dato,
              a.estado_salud, c.id_corral, c.nombre AS corral, r.nombre AS raza, e.nombre AS especie,
              EXISTS (SELECT 1 FROM altas_enfermeria h WHERE h.id_animal = a.id_animal AND h.id_movimiento IS NULL) AS alta_pendiente_traslado
       FROM animales a JOIN corrales c ON c.id_corral = a.id_corral
       JOIN razas r ON r.id_raza = a.id_raza JOIN especies e ON e.id_especie = r.id_especie
       WHERE a.activo = 1 AND c.activo = 1 ORDER BY a.identificador`,
    );
    res.status(200).json({ data: rows });
  } catch {
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
  const corralId = Number(req.body.id_corral); const breedId = Number(req.body.id_raza);
  const birth = req.body.fecha_nacimiento ? String(req.body.fecha_nacimiento) : null;
  const weight = req.body.peso_kg == null || req.body.peso_kg === '' ? null : Number(req.body.peso_kg);
  const userId = req.usuario?.id_usuario;
  if (!userId || !identifier || identifier.length > 50 || !Number.isInteger(corralId) || !Number.isInteger(breedId) || (birth && !/^\d{4}-\d{2}-\d{2}$/.test(birth)) || (weight !== null && (!Number.isFinite(weight) || weight <= 0))) {
    res.status(400).json({ message: 'completá identificador, especie/raza, corral y datos válidos' }); return;
  }
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [corrals] = await connection.execute<CorralRow[]>('SELECT capacidad, nombre, activo, es_enfermeria FROM corrales WHERE id_corral=? FOR UPDATE', [corralId]);
    const corral = corrals[0];
    if (!corral || !corral.activo) throw new Error('el corral seleccionado no está activo');
    const [counts] = await connection.execute<RowDataPacket[]>('SELECT COUNT(*) AS ocupacion FROM animales WHERE id_corral=? AND activo=1', [corralId]);
    if (Number(counts[0]?.ocupacion ?? 0) >= corral.capacidad) throw new Error('el corral alcanzó su capacidad');
    const [created] = await connection.execute<ResultSetHeader>(
      `INSERT INTO animales (id_corral,id_raza,identificador,nombre,fecha_nacimiento,peso_kg,estado_salud,activo)
       VALUES (?,?,?,?,?,?,'sano',1)`, [corralId, breedId, identifier, name, birth, weight],
    );
    await connection.execute('INSERT INTO auditoria_cambios (entidad,id_entidad,accion,id_usuario,detalle) VALUES (?,?,?,?,?)', ['animal', created.insertId, 'alta', userId, JSON.stringify({ identificador: identifier, id_corral: corralId })]);
    await connection.commit(); res.status(201).json({ data: { id_animal: created.insertId, identificador: identifier } });
  } catch (error) {
    await connection.rollback(); const message = error instanceof Error ? error.message : 'no se pudo registrar el animal';
    res.status(409).json({ message });
  } finally { connection.release(); }
}

// edito datos del animal y controlo conflictos por versión.
export async function updateAnimal(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id); const version = Number(req.body.version_dato);
  const { nombre, identificador, id_raza, fecha_nacimiento } = req.body as Record<string, unknown>;
  if (!Number.isInteger(id) || !Number.isInteger(version) || !String(identificador ?? '').trim() || !Number(id_raza)) { res.status(400).json({ message: 'faltan datos del animal o versión' }); return; }
  try {
    const [result] = await database.execute<ResultSetHeader>(
      'UPDATE animales SET nombre=?, identificador=?, id_raza=?, fecha_nacimiento=?, version_dato=version_dato+1 WHERE id_animal=? AND activo=1 AND version_dato=?',
      [String(nombre ?? '').trim() || null, String(identificador).trim(), Number(id_raza), typeof fecha_nacimiento === 'string' && fecha_nacimiento ? fecha_nacimiento : null, id, version],
    );
    if (!result.affectedRows) { res.status(409).json({ message: 'el animal cambió o ya no está activo; recargá sus datos' }); return; }
    res.json({ message: 'ficha actualizada' });
  } catch { res.status(500).json({ message: 'no se pudo editar el animal' }); }
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
  if (!Number.isInteger(id) || !nombre || !Number.isInteger(capacidad) || capacidad < 1) { res.status(400).json({ message: 'indicá nombre y capacidad válidos' }); return; }
  try {
    const [rows] = await database.execute<RowDataPacket[]>('SELECT COUNT(*) AS ocupacion FROM animales WHERE id_corral=? AND activo=1', [id]);
    if (capacidad < Number(rows[0]?.ocupacion ?? 0)) { res.status(409).json({ message: 'la capacidad no puede ser menor a la ocupación actual' }); return; }
    const [result] = await database.execute<ResultSetHeader>('UPDATE corrales SET nombre=?, capacidad=? WHERE id_corral=? AND activo=1', [nombre, capacidad, id]);
    if (!result.affectedRows) { res.status(404).json({ message: 'corral no encontrado' }); return; } res.json({ message: 'corral actualizado' });
  } catch { res.status(409).json({ message: 'no se pudo actualizar el corral' }); }
}

// doy de baja un corral solo cuando no quedan animales asignados.
export async function deleteCorral(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  try {
    const [rows] = await database.execute<RowDataPacket[]>('SELECT COUNT(*) AS ocupacion FROM animales WHERE id_corral=? AND activo=1', [id]);
    if (Number(rows[0]?.ocupacion ?? 0) > 0) { res.status(409).json({ message: 'mové los animales antes de dar de baja el corral' }); return; }
    const [result] = await database.execute<ResultSetHeader>('UPDATE corrales SET activo=0 WHERE id_corral=? AND activo=1 AND es_enfermeria=0', [id]);
    if (!result.affectedRows) { res.status(409).json({ message: 'corral no encontrado o reservado para enfermería' }); return; } res.json({ message: 'corral dado de baja' });
  } catch { res.status(500).json({ message: 'no se pudo dar de baja el corral' }); }
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
      if (req.rolVigente === 'peon' && (!discharges.length || animal.estado_salud !== 'sano')) {
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
    await transaction.execute('UPDATE animales SET id_corral = ? WHERE id_animal = ?', [destinationId, animalId]);
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
      `SELECT a.id_animal, a.identificador, a.nombre, a.estado_salud, a.peso_kg,
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
    await transaction.execute('UPDATE animales SET estado_salud = \'sano\' WHERE id_animal = ?', [animalId]);
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
  try {
    const role = req.rolVigente ?? '';
    const [rows] = await database.execute<RowDataPacket[]>(
      `SELECT id_notificacion, id_animal, titulo, mensaje, tipo, leida, created_at
       FROM notificaciones WHERE rol_destino IS NULL OR rol_destino = ? OR ? = 'administrador'
       ORDER BY created_at DESC LIMIT 50`, [role, role],
    );
    res.status(200).json({ data: rows });
  } catch {
    res.status(500).json({ message: 'no se pudieron cargar los avisos' });
  }
}
