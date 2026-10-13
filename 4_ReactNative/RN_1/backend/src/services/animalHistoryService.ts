// Archivo backend/src/services/animalHistoryService.ts: conserva y consulta pesajes y traslados de animales.
import pool from "../config/database";
import type { RowDataPacket } from "mysql2";

// Esta función valida fechas de calendario y rechaza días imposibles como el 31 de febrero.
function isValidDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10) === value;
}

// Esta función obtiene la fecha civil del servidor en formato AAAA-MM-DD sin convertirla a UTC.
function localToday(): string { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }

// Esta función devuelve las mediciones históricas de una ficha, comenzando por la más reciente.
export async function listPesajes(idAnimal: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT p.id_pesaje, p.id_animal, p.fecha_pesaje, p.peso_kg, p.observaciones,
            CONCAT(u.nombre, ' ', u.apellido) AS usuario_nombre
     FROM historial_pesajes p LEFT JOIN usuarios u ON u.id_usuario = p.id_usuario_registro
     WHERE p.id_animal = ? ORDER BY p.fecha_pesaje DESC, p.id_pesaje DESC`, [idAnimal],
  );
  return rows.map((row) => ({ ...row, id_pesaje: Number(row.id_pesaje), peso_kg: Number(row.peso_kg), fecha_pesaje: String(row.fecha_pesaje).split("T")[0] }));
}

// Esta función registra una medición y actualiza el peso vigente de la ficha dentro de una misma transacción.
export async function createPesaje(idAnimal: number, pesoKg: number, fecha: string, observaciones: string | null, userId: number) {
  if (!Number.isFinite(pesoKg) || pesoKg <= 0 || pesoKg > 100_000) throw new Error("el peso debe ser un número mayor que cero y menor a 100.000 kg");
  if (!isValidDateOnly(fecha)) throw new Error("la fecha del pesaje debe ser una fecha real en formato AAAA-MM-DD");
  if (fecha > localToday()) throw new Error("la fecha del pesaje no puede ser futura");
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[animal]] = await connection.query<RowDataPacket[]>("SELECT id_animal, fecha_nacimiento FROM animales WHERE id_animal = ? AND activo = 1 FOR UPDATE", [idAnimal]);
    if (!animal) throw new Error("animal no encontrado o inactivo");
    if (animal.fecha_nacimiento && fecha < String(animal.fecha_nacimiento).split("T")[0]) throw new Error("el pesaje no puede ser anterior al nacimiento del animal");
    await connection.execute("INSERT INTO historial_pesajes (id_animal, fecha_pesaje, peso_kg, observaciones, id_usuario_registro) VALUES (?, ?, ?, ?, ?)", [idAnimal, fecha, pesoKg, observaciones?.trim() || null, userId]);
    await connection.execute("UPDATE animales SET peso_kg = ? WHERE id_animal = ?", [pesoKg, idAnimal]);
    await connection.commit();
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
  return listPesajes(idAnimal);
}

// Esta función entrega el registro de corrales de origen y destino de cada traslado.
export async function listMovimientos(idAnimal: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT h.id_movimiento, h.id_animal, h.fecha_movimiento, h.motivo, h.observaciones,
            origin.nombre AS corral_origen, destination.nombre AS corral_destino,
            CONCAT(u.nombre, ' ', u.apellido) AS usuario_nombre
     FROM historial_movimientos_animales h
     LEFT JOIN corrales origin ON origin.id_corral = h.id_corral_origen
     JOIN corrales destination ON destination.id_corral = h.id_corral_destino
     LEFT JOIN usuarios u ON u.id_usuario = h.id_usuario_registro
     WHERE h.id_animal = ? ORDER BY h.fecha_movimiento DESC, h.id_movimiento DESC`, [idAnimal],
  );
  return rows.map((row) => ({ ...row, id_movimiento: Number(row.id_movimiento) }));
}
