/** servicio de gestión de corrales */
import pool from '../config/database';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface CorralItem {
  id_corral: number;
  nombre: string;
  capacidad: number;
  es_enfermeria: boolean;
  activo: boolean;
  ocupados: number;
}

interface CorralRow extends RowDataPacket {
  id_corral: number;
  nombre: string;
  capacidad: number;
  es_enfermeria: number;
  activo: number;
  ocupados: number;
}

export interface CreateCorralRequest {
  nombre: string;
  capacidad: number;
  es_enfermeria?: boolean;
}

export interface UpdateCorralRequest {
  nombre?: string;
  capacidad?: number;
  es_enfermeria?: boolean;
  activo?: boolean;
}

function toCorral(row: CorralRow): CorralItem {
  return {
    id_corral: row.id_corral,
    nombre: row.nombre,
    capacidad: row.capacidad,
    es_enfermeria: row.es_enfermeria === 1,
    activo: row.activo === 1,
    ocupados: Number(row.ocupados || 0),
  };
}

export async function listCorrales(): Promise<CorralItem[]> {
  const [rows] = await pool.query<CorralRow[]>(
    `SELECT c.id_corral, c.nombre, c.capacidad, c.es_enfermeria, c.activo,
            COUNT(a.id_animal) AS ocupados
     FROM corrales c
     LEFT JOIN animales a ON a.id_corral = c.id_corral AND a.activo = 1
     WHERE c.activo = 1
     GROUP BY c.id_corral
     ORDER BY c.es_enfermeria DESC, c.nombre ASC`,
  );
  return rows.map(toCorral);
}

export async function createCorral(data: CreateCorralRequest): Promise<CorralItem> {
  const nombre = data.nombre.trim();
  const capacidad = Number(data.capacidad);
  const esEnfermeria = data.es_enfermeria ? 1 : 0;

  if (!nombre) throw new Error('el nombre del corral es requerido');
  if (isNaN(capacidad) || capacidad <= 0) throw new Error('la capacidad debe ser mayor a 0');

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO corrales (nombre, capacidad, es_enfermeria, activo)
       VALUES (?, ?, ?, 1)`,
      [nombre, capacidad, esEnfermeria],
    );

    const [rows] = await pool.query<CorralRow[]>(
      `SELECT c.id_corral, c.nombre, c.capacidad, c.es_enfermeria, c.activo, 0 AS ocupados
       FROM corrales c WHERE c.id_corral = ?`,
      [result.insertId],
    );

    return toCorral(rows[0]);
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'ER_DUP_ENTRY') {
      throw new Error('ya existe un corral con ese nombre');
    }
    throw err;
  }
}

export async function updateCorral(id: number, data: UpdateCorralRequest): Promise<CorralItem> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.nombre !== undefined) {
    const trimmed = data.nombre.trim();
    if (!trimmed) throw new Error('el nombre no puede estar vacío');
    fields.push('nombre = ?');
    values.push(trimmed);
  }
  if (data.capacidad !== undefined) {
    const cap = Number(data.capacidad);
    if (isNaN(cap) || cap <= 0) throw new Error('la capacidad debe ser mayor a 0');
    fields.push('capacidad = ?');
    values.push(cap);
  }
  if (data.es_enfermeria !== undefined) {
    fields.push('es_enfermeria = ?');
    values.push(data.es_enfermeria ? 1 : 0);
  }
  if (data.activo !== undefined) {
    fields.push('activo = ?');
    values.push(data.activo ? 1 : 0);
  }

  if (fields.length === 0) throw new Error('no hay datos para actualizar');

  values.push(id);

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE corrales SET ${fields.join(', ')} WHERE id_corral = ?`,
      values,
    );

    if (result.affectedRows === 0) throw new Error('corral no encontrado');

    const [rows] = await pool.query<CorralRow[]>(
      `SELECT c.id_corral, c.nombre, c.capacidad, c.es_enfermeria, c.activo,
              COUNT(a.id_animal) AS ocupados
       FROM corrales c
       LEFT JOIN animales a ON a.id_corral = c.id_corral AND a.activo = 1
       WHERE c.id_corral = ?
       GROUP BY c.id_corral`,
      [id],
    );

    return toCorral(rows[0]);
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'ER_DUP_ENTRY') {
      throw new Error('ya existe un corral con ese nombre');
    }
    throw err;
  }
}

export async function deleteCorral(id: number): Promise<void> {
  const [[countRow]] = await pool.query<RowDataPacket[]>(
    'SELECT COUNT(*) AS ocupados FROM animales WHERE id_corral = ? AND activo = 1',
    [id],
  );

  if (Number(countRow?.ocupados || 0) > 0) {
    throw new Error('no se puede eliminar el corral porque contiene animales activos. Reubicalos primero.');
  }

  const [result] = await pool.query<ResultSetHeader>(
    'UPDATE corrales SET activo = 0 WHERE id_corral = ?',
    [id],
  );

  if (result.affectedRows === 0) throw new Error('corral no encontrado');
}
