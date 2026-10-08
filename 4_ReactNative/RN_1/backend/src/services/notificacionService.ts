// servicio de notificaciones y alertas sanitarias en tiempo real
import pool from '../config/database';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface NotificacionAlerta {
  id: string;
  id_notificacion: number;
  id_animal: number | null;
  identificador: string;
  nombre: string | null;
  estado_salud: string;
  corral_nombre: string;
  corral_origen_nombre: string | null;
  titulo: string;
  mensaje: string;
  fecha: string;
  tipo: 'alerta_sanitaria' | 'en_tratamiento' | 'alta' | 'info';
}

interface NotificacionRow extends RowDataPacket {
  id_notificacion: number;
  id_animal: number | null;
  titulo: string;
  mensaje: string;
  tipo: 'alerta_sanitaria' | 'en_tratamiento' | 'alta' | 'info';
  leida: number;
  fecha: string;
  identificador: string | null;
  nombre_animal: string | null;
  estado_salud: string | null;
  corral_nombre: string | null;
  corral_origen_nombre: string | null;
}

// crea una nueva notificaci�n persistente en la base de datos
export async function createNotificacion(
  titulo: string,
  mensaje: string,
  tipo: 'alerta_sanitaria' | 'en_tratamiento' | 'alta' | 'info' = 'alerta_sanitaria',
  idAnimal: number | null = null,
): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO notificaciones (id_animal, titulo, mensaje, tipo) VALUES (?, ?, ?, ?)`,
    [idAnimal, titulo, mensaje, tipo],
  );
  return result.insertId;
}

// obtengo todas las notificaciones persistentes ordenadas por fecha reciente
export async function getNotificacionesSanitarias(): Promise<NotificacionAlerta[]> {
  const [rows] = await pool.query<NotificacionRow[]>(
    `SELECT n.id_notificacion,
            n.id_animal,
            n.titulo,
            n.mensaje,
            n.tipo,
            n.leida,
            n.created_at AS fecha,
            a.identificador,
            a.nombre AS nombre_animal,
            COALESCE(a.estado_salud, 'sano') AS estado_salud,
            COALESCE(c.nombre, 'general') AS corral_nombre,
            co.nombre AS corral_origen_nombre
     FROM notificaciones n
     LEFT JOIN animales a ON a.id_animal = n.id_animal
     LEFT JOIN corrales c ON c.id_corral = a.id_corral
     LEFT JOIN corrales co ON co.id_corral = a.id_corral_origen
     ORDER BY n.created_at DESC`,
  );

  return rows.map((r) => ({
    id: String(r.id_notificacion),
    id_notificacion: r.id_notificacion,
    id_animal: r.id_animal,
    identificador: r.identificador || 'estancia',
    nombre: r.nombre_animal,
    estado_salud: r.estado_salud || 'alerta',
    corral_nombre: r.corral_nombre || 'enfermería',
    corral_origen_nombre: r.corral_origen_nombre,
    titulo: r.titulo,
    mensaje: r.mensaje,
    fecha: r.fecha,
    tipo: r.tipo,
  }));
}

// elimina una notificaci�n individual por su identificador
export async function deleteNotificacion(idNotificacion: number): Promise<void> {
  const [res] = await pool.query<ResultSetHeader>(
    `DELETE FROM notificaciones WHERE id_notificacion = ?`,
    [idNotificacion],
  );
  if (res.affectedRows === 0) {
    throw new Error('notificación no encontrada');
  }
}

// elimina todas las notificaciones de la estancia
export async function clearNotificaciones(): Promise<void> {
  await pool.query(`DELETE FROM notificaciones`);
}

