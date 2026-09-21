/** servicio de gestión de animales */
import pool from '../config/database';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { createNotificacion } from './notificacionService';

export type EstadoSalud = 'sano' | 'enfermo' | 'herido' | 'en_tratamiento';

export interface AnimalItem {
  id_animal: number;
  identificador: string;
  nombre: string | null;
  id_corral: number;
  corral_nombre: string;
  corral_es_enfermeria: boolean;
  id_raza: number;
  raza_nombre: string;
  id_especie: number;
  especie_nombre: string;
  fecha_nacimiento: string | null;
  peso_kg: number | null;
  estado_salud: EstadoSalud;
  id_corral_origen: number | null;
  activo: boolean;
  created_at: string;
}

interface AnimalRow extends RowDataPacket {
  id_animal: number;
  identificador: string;
  nombre: string | null;
  id_corral: number;
  corral_nombre: string;
  corral_es_enfermeria: number;
  id_raza: number;
  raza_nombre: string;
  id_especie: number;
  especie_nombre: string;
  fecha_nacimiento: string | null;
  peso_kg: string | number | null;
  estado_salud: EstadoSalud;
  id_corral_origen: number | null;
  activo: number;
  created_at: string;
}

function toAnimal(row: AnimalRow): AnimalItem {
  return {
    id_animal: row.id_animal,
    identificador: row.identificador,
    nombre: row.nombre,
    id_corral: row.id_corral,
    corral_nombre: row.corral_nombre,
    corral_es_enfermeria: row.corral_es_enfermeria === 1,
    id_raza: row.id_raza,
    raza_nombre: row.raza_nombre,
    id_especie: row.id_especie,
    especie_nombre: row.especie_nombre,
    fecha_nacimiento: row.fecha_nacimiento ? String(row.fecha_nacimiento).split('T')[0] : null,
    peso_kg: row.peso_kg !== null ? Number(row.peso_kg) : null,
    estado_salud: row.estado_salud,
    id_corral_origen: row.id_corral_origen,
    activo: row.activo === 1,
    created_at: row.created_at,
  };
}

export interface AnimalFilters {
  id_corral?: number;
  estado_salud?: EstadoSalud;
  id_especie?: number;
  search?: string;
}

export async function listAnimales(filters: AnimalFilters = {}): Promise<AnimalItem[]> {
  const conditions: string[] = ['a.activo = 1'];
  const params: unknown[] = [];

  if (filters.id_corral) {
    conditions.push('a.id_corral = ?');
    params.push(filters.id_corral);
  }
  if (filters.estado_salud) {
    conditions.push('a.estado_salud = ?');
    params.push(filters.estado_salud);
  }
  if (filters.id_especie) {
    conditions.push('e.id_especie = ?');
    params.push(filters.id_especie);
  }
  if (filters.search) {
    conditions.push('(a.identificador LIKE ? OR a.nombre LIKE ?)');
    const term = `%${filters.search.trim()}%`;
    params.push(term, term);
  }

  const query = `
    SELECT a.id_animal, a.identificador, a.nombre, a.id_corral, a.id_raza,
           a.fecha_nacimiento, a.peso_kg, a.estado_salud, a.id_corral_origen,
           a.activo, a.created_at,
           c.nombre AS corral_nombre, c.es_enfermeria AS corral_es_enfermeria,
           r.nombre AS raza_nombre,
           e.id_especie, e.nombre AS especie_nombre
    FROM animales a
    INNER JOIN corrales c ON c.id_corral = a.id_corral
    INNER JOIN razas r ON r.id_raza = a.id_raza
    INNER JOIN especies e ON e.id_especie = r.id_especie
    WHERE ${conditions.join(' AND ')}
    ORDER BY a.created_at DESC
  `;

  const [rows] = await pool.query<AnimalRow[]>(query, params);
  return rows.map(toAnimal);
}

export interface CreateAnimalRequest {
  identificador: string;
  nombre?: string | null;
  id_corral: number;
  id_raza: number;
  fecha_nacimiento?: string | null;
  peso_kg?: number | null;
  estado_salud?: EstadoSalud;
}

export async function createAnimal(data: CreateAnimalRequest): Promise<AnimalItem> {
  const identificador = data.identificador?.trim();
  if (!identificador) throw new Error('el identificador/caravana es obligatorio');
  if (!data.id_corral) throw new Error('debes asignar un corral');
  if (!data.id_raza) throw new Error('debes asignar una raza');

  // chequeo capacidad del corral
  const [[corralInfo]] = await pool.query<RowDataPacket[]>(
    `SELECT c.capacidad,
            (SELECT COUNT(*) FROM animales a WHERE a.id_corral = c.id_corral AND a.activo = 1) AS ocupados
     FROM corrales c WHERE c.id_corral = ? AND c.activo = 1`,
    [data.id_corral],
  );

  if (!corralInfo) throw new Error('el corral seleccionado no existe o está inactivo');
  if (Number(corralInfo.ocupados) >= Number(corralInfo.capacidad)) {
    throw new Error('el corral seleccionado ha alcanzado su capacidad máxima');
  }

  const nombre = data.nombre?.trim() || null;
  const fechaNac = data.fecha_nacimiento || null;
  const peso = data.peso_kg !== undefined && data.peso_kg !== null && !isNaN(Number(data.peso_kg))
    ? Number(data.peso_kg)
    : null;
  const estadoSalud = data.estado_salud || 'sano';

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO animales (identificador, nombre, id_corral, id_raza, fecha_nacimiento, peso_kg, estado_salud, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [identificador, nombre, data.id_corral, data.id_raza, fechaNac, peso, estadoSalud],
    );

    const animales = await listAnimales();
    const creado = animales.find((a) => a.id_animal === result.insertId);
    if (!creado) throw new Error('error al recuperar el animal creado');
    return creado;
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'ER_DUP_ENTRY') {
      throw new Error('ya existe un animal con ese identificador');
    }
    throw err;
  }
}

export interface UpdateAnimalRequest {
  identificador?: string;
  nombre?: string | null;
  id_corral?: number;
  id_raza?: number;
  fecha_nacimiento?: string | null;
  peso_kg?: number | null;
  estado_salud?: EstadoSalud;
  activo?: boolean;
}

export async function updateAnimal(id: number, data: UpdateAnimalRequest): Promise<AnimalItem> {
  const [[actual]] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM animales WHERE id_animal = ? AND activo = 1',
    [id],
  );
  if (!actual) throw new Error('animal no encontrado');

  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.identificador !== undefined) {
    const idf = data.identificador.trim();
    if (!idf) throw new Error('el identificador no puede estar vacío');
    fields.push('identificador = ?');
    values.push(idf);
  }
  if (data.nombre !== undefined) {
    fields.push('nombre = ?');
    values.push(data.nombre ? data.nombre.trim() : null);
  }
  if (data.id_raza !== undefined) {
    fields.push('id_raza = ?');
    values.push(data.id_raza);
  }
  if (data.fecha_nacimiento !== undefined) {
    fields.push('fecha_nacimiento = ?');
    values.push(data.fecha_nacimiento || null);
  }
  if (data.peso_kg !== undefined) {
    fields.push('peso_kg = ?');
    values.push(data.peso_kg !== null && !isNaN(Number(data.peso_kg)) ? Number(data.peso_kg) : null);
  }
  if (data.estado_salud !== undefined) {
    fields.push('estado_salud = ?');
    values.push(data.estado_salud);
  }
  if (data.activo !== undefined) {
    fields.push('activo = ?');
    values.push(data.activo ? 1 : 0);
  }

  // cambio de corral (traslado)
  if (data.id_corral !== undefined && data.id_corral !== actual.id_corral) {
    const [[destInfo]] = await pool.query<RowDataPacket[]>(
      `SELECT c.capacidad, c.es_enfermeria,
              (SELECT COUNT(*) FROM animales a WHERE a.id_corral = c.id_corral AND a.activo = 1) AS ocupados
       FROM corrales c WHERE c.id_corral = ? AND c.activo = 1`,
      [data.id_corral],
    );

    if (!destInfo) throw new Error('el corral destino no existe o está inactivo');
    if (Number(destInfo.ocupados) >= Number(destInfo.capacidad)) {
      throw new Error('el corral destino ha alcanzado su capacidad máxima');
    }

    fields.push('id_corral = ?');
    values.push(data.id_corral);

    // si se traslada a enfermería, guardo el corral de origen
    if (destInfo.es_enfermeria === 1) {
      fields.push('id_corral_origen = ?');
      values.push(actual.id_corral);
    }
  }

  if (fields.length === 0) throw new Error('no hay datos para actualizar');

  values.push(id);

  try {
    await pool.query(`UPDATE animales SET ${fields.join(', ')} WHERE id_animal = ?`, values);

    // si cambió el estado de salud se registra la notificación correspondiente
    if (data.estado_salud && data.estado_salud !== actual.estado_salud) {
      if (data.estado_salud === 'enfermo' || data.estado_salud === 'en_tratamiento') {
        await createNotificacion(
          data.estado_salud === 'enfermo' ? 'Alerta sanitaria' : 'Inicio de tratamiento',
          `Estado del animal ${actual.identificador} actualizado a ${data.estado_salud}`,
          data.estado_salud === 'enfermo' ? 'alerta_sanitaria' : 'en_tratamiento',
          id,
        );
      } else if (data.estado_salud === 'sano' && actual.estado_salud !== 'sano') {
        await createNotificacion(
          'Recuperación registrada',
          `El animal ${actual.identificador} ha sido marcado como sano`,
          'alta',
          id,
        );
      }
    }

    const animales = await listAnimales();
    const actualizado = animales.find((a) => a.id_animal === id);
    if (!actualizado) throw new Error('error al recuperar el animal actualizado');
    return actualizado;
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'ER_DUP_ENTRY') {
      throw new Error('ya existe un animal con ese identificador');
    }
    throw err;
  }
}

/** reporta un animal enfermo, lo traslada automáticamente a enfermería y registra síntomas */
export async function reportarEnfermedad(
  idAnimal: number,
  comentarios: string,
  idUsuarioReporta: number,
): Promise<AnimalItem> {
  const [[animal]] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM animales WHERE id_animal = ? AND activo = 1',
    [idAnimal],
  );
  if (!animal) throw new Error('animal no encontrado');

  // busco el corral designado como enfermería
  const [[enfermeria]] = await pool.query<RowDataPacket[]>(
    'SELECT id_corral, capacidad FROM corrales WHERE es_enfermeria = 1 AND activo = 1 LIMIT 1',
  );
  if (!enfermeria) throw new Error('no se encontró un corral de enfermería configurado');

  // si ya está en enfermería no se vuelve a trasladar
  if (animal.id_corral === enfermeria.id_corral) {
    throw new Error('el animal ya se encuentra en el corral de enfermería');
  }

  // actualizo animal: guardo corral previo, mudo a enfermería y marco como enfermo
  await pool.query(
    `UPDATE animales
     SET id_corral_origen = ?, id_corral = ?, estado_salud = 'enfermo'
     WHERE id_animal = ?`,
    [animal.id_corral, enfermeria.id_corral, idAnimal],
  );

  // registro reporte inicial en tabla tratamientos si se enviaron comentarios
  const descripcionReporte = comentarios?.trim()
    ? `reporte de ingreso a enfermería: ${comentarios.trim()}`
    : 'reporte de ingreso a enfermería por síntomas observados en campo';

  await pool.query(
    `INSERT INTO tratamientos (id_animal, id_veterinario, descripcion, fecha_inicio)
     VALUES (?, ?, ?, CURDATE())`,
    [idAnimal, idUsuarioReporta, descripcionReporte],
  );

  // registro la alerta sanitaria persistente para la campanita
  await createNotificacion(
    'Animal derivado a Enfermería',
    `Animal ${animal.identificador} trasladado a enfermería. Síntomas: ${comentarios?.trim() || 'observados en campo'}`,
    'alerta_sanitaria',
    idAnimal,
  );

  const animales = await listAnimales();
  const actualizado = animales.find((a) => a.id_animal === idAnimal);
  if (!actualizado) throw new Error('error al recuperar animal trasladado');
  return actualizado;
}

/** da de alta a un animal en enfermería y lo devuelve a su corral original */
export async function darDeAlta(
  idAnimal: number,
  idVeterinario: number,
  notasAlta?: string,
): Promise<AnimalItem> {
  const [[animal]] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM animales WHERE id_animal = ? AND activo = 1',
    [idAnimal],
  );
  if (!animal) throw new Error('animal no encontrado');

  // determino corral destino (el de origen o el primer corral general con espacio)
  let destCorralId = animal.id_corral_origen;

  if (destCorralId) {
    const [[destInfo]] = await pool.query<RowDataPacket[]>(
      `SELECT c.id_corral, c.capacidad,
              (SELECT COUNT(*) FROM animales a WHERE a.id_corral = c.id_corral AND a.activo = 1) AS ocupados
       FROM corrales c WHERE c.id_corral = ? AND c.activo = 1`,
      [destCorralId],
    );
    if (!destInfo || Number(destInfo.ocupados) >= Number(destInfo.capacidad)) {
      destCorralId = null; // buscaremos alternativo
    }
  }

  if (!destCorralId) {
    const [[altCorral]] = await pool.query<RowDataPacket[]>(
      `SELECT c.id_corral
       FROM corrales c
       LEFT JOIN animales a ON a.id_corral = c.id_corral AND a.activo = 1
       WHERE c.activo = 1 AND c.es_enfermeria = 0
       GROUP BY c.id_corral
       HAVING COUNT(a.id_animal) < c.capacidad
       LIMIT 1`,
    );
    if (!altCorral) throw new Error('no hay corrales generales con capacidad disponible para el alta');
    destCorralId = altCorral.id_corral;
  }

  // actualizo animal a sano, nuevo corral y remuevo corral de origen
  await pool.query(
    `UPDATE animales
     SET id_corral = ?, estado_salud = 'sano', id_corral_origen = NULL
     WHERE id_animal = ?`,
    [destCorralId, idAnimal],
  );

  // registro nota de alta médica
  const detalleAlta = notasAlta?.trim()
    ? `alta médica: ${notasAlta.trim()}`
    : 'alta médica emitida por veterinario — animal recuperado';

  await pool.query(
    `INSERT INTO tratamientos (id_animal, id_veterinario, descripcion, fecha_inicio, fecha_fin)
     VALUES (?, ?, ?, CURDATE(), CURDATE())`,
    [idAnimal, idVeterinario, detalleAlta],
  );

  // registro notificación de alta médica persistente
  await createNotificacion(
    'Alta médica emitida',
    `Animal ${animal.identificador} declarado sano y reintegrado a corral`,
    'alta',
    idAnimal,
  );

  const animales = await listAnimales();
  const actualizado = animales.find((a) => a.id_animal === idAnimal);
  if (!actualizado) throw new Error('error al recuperar animal dado de alta');
  return actualizado;
}

export async function deleteAnimal(id: number): Promise<void> {
  const [result] = await pool.query<ResultSetHeader>(
    'UPDATE animales SET activo = 0 WHERE id_animal = ?',
    [id],
  );
  if (result.affectedRows === 0) throw new Error('animal no encontrado');
}
