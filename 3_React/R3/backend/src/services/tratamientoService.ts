/** servicio de gestión de tratamientos médicos e historial clínico */
import pool from '../config/database';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface TratamientoItem {
  id_tratamiento: number;
  id_animal: number;
  id_veterinario: number;
  veterinario_nombre: string;
  descripcion: string;
  medicamento: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  observaciones: string | null;
  created_at: string;
}

interface TratamientoRow extends RowDataPacket {
  id_tratamiento: number;
  id_animal: number;
  id_veterinario: number;
  veterinario_nombre: string;
  descripcion: string;
  medicamento: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  observaciones: string | null;
  created_at: string;
}

export interface CreateTratamientoRequest {
  id_animal: number;
  id_veterinario: number;
  descripcion: string;
  medicamento?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  observaciones?: string | null;
}

/** listo el historial de tratamientos para un animal específico */
export async function listTratamientosByAnimal(idAnimal: number): Promise<TratamientoItem[]> {
  const [rows] = await pool.query<TratamientoRow[]>(
    `SELECT t.id_tratamiento, t.id_animal, t.id_veterinario,
            CONCAT(u.nombre, ' ', u.apellido) AS veterinario_nombre,
            t.descripcion, t.medicamento, t.fecha_inicio, t.fecha_fin,
            t.observaciones, t.created_at
     FROM tratamientos t
     INNER JOIN usuarios u ON u.id_usuario = t.id_veterinario
     WHERE t.id_animal = ?
     ORDER BY t.created_at DESC`,
    [idAnimal],
  );

  return rows.map((r) => ({
    id_tratamiento: r.id_tratamiento,
    id_animal: r.id_animal,
    id_veterinario: r.id_veterinario,
    veterinario_nombre: r.veterinario_nombre,
    descripcion: r.descripcion,
    medicamento: r.medicamento,
    fecha_inicio: r.fecha_inicio ? String(r.fecha_inicio).split('T')[0] : '',
    fecha_fin: r.fecha_fin ? String(r.fecha_fin).split('T')[0] : null,
    observaciones: r.observaciones,
    created_at: r.created_at,
  }));
}

/** registro una nueva nota clínica o tratamiento */
export async function createTratamiento(data: CreateTratamientoRequest): Promise<TratamientoItem> {
  const descripcion = data.descripcion?.trim();
  if (!descripcion) throw new Error('la descripción del tratamiento es obligatoria');
  if (!data.id_animal) throw new Error('debes especificar el animal');
  if (!data.id_veterinario) throw new Error('debes especificar el veterinario');

  const fechaInicio = data.fecha_inicio || new Date().toISOString().split('T')[0];
  const medicamento = data.medicamento?.trim() || null;
  const fechaFin = data.fecha_fin || null;
  const observaciones = data.observaciones?.trim() || null;

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO tratamientos (id_animal, id_veterinario, descripcion, medicamento, fecha_inicio, fecha_fin, observaciones)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.id_animal, data.id_veterinario, descripcion, medicamento, fechaInicio, fechaFin, observaciones],
  );

  const historial = await listTratamientosByAnimal(data.id_animal);
  const creado = historial.find((t) => t.id_tratamiento === result.insertId);
  if (!creado) throw new Error('error al recuperar el tratamiento creado');
  return creado;
}
