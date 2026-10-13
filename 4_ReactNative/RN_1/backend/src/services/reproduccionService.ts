// Archivo backend/src/services/reproduccionService.ts: registra y consulta el historial de servicios, gestaciones y eventos de cría.
import pool from "../config/database";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

// Contratos de tipos: conservan los valores admitidos por la migración 008 y evitan estados ambiguos en el historial.
export type ReproductionEventType = "servicio" | "inseminacion" | "diagnostico_gestacion" | "parto" | "aborto" | "destete";
export type ReproductionResult = "pendiente" | "prenada" | "vacia" | "inconcluso" | "exitoso" | "fallido";
export interface ReproductionEvent {
  id_evento: number;
  id_animal: number;
  animal_identificador: string;
  animal_nombre: string | null;
  id_reproductor: number | null;
  reproductor_identificador: string | null;
  reproductor_nombre: string | null;
  id_cria: number | null;
  cria_identificador: string | null;
  cria_nombre: string | null;
  tipo: ReproductionEventType;
  fecha_evento: string;
  resultado: ReproductionResult | null;
  fecha_probable_parto: string | null;
  observaciones: string | null;
  usuario_nombre: string | null;
}
export interface CreateReproductionEvent {
  id_animal: number;
  id_reproductor?: number | null;
  id_cria?: number | null;
  tipo: ReproductionEventType;
  fecha_evento: string;
  resultado?: ReproductionResult | null;
  fecha_probable_parto?: string | null;
  observaciones?: string | null;
}

// Esta función verifica que una fecha AAAA-MM-DD exista realmente en el calendario.
function isValidDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10) === value;
}

// Esta función devuelve el día local para validar que el historial no registre hechos futuros.
function localToday(): string { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }

// Esta función transforma filas SQL a objetos de respuesta con fechas normalizadas para el cliente móvil.
function mapEvent(row: RowDataPacket): ReproductionEvent {
  return {
    id_evento: Number(row.id_evento), id_animal: Number(row.id_animal),
    animal_identificador: row.animal_identificador, animal_nombre: row.animal_nombre,
    id_reproductor: row.id_reproductor == null ? null : Number(row.id_reproductor),
    reproductor_identificador: row.reproductor_identificador, reproductor_nombre: row.reproductor_nombre,
    id_cria: row.id_cria == null ? null : Number(row.id_cria), cria_identificador: row.cria_identificador, cria_nombre: row.cria_nombre,
    tipo: row.tipo, fecha_evento: String(row.fecha_evento).split("T")[0], resultado: row.resultado,
    fecha_probable_parto: row.fecha_probable_parto ? String(row.fecha_probable_parto).split("T")[0] : null,
    observaciones: row.observaciones, usuario_nombre: row.usuario_nombre,
  };
}

// Esta función devuelve eventos reproductivos ordenados del más reciente al más antiguo, opcionalmente para una hembra.
export async function listEvents(idAnimal?: number): Promise<ReproductionEvent[]> {
  const params: number[] = [];
  const filter = idAnimal ? "WHERE ev.id_animal = ?" : "";
  if (idAnimal) params.push(idAnimal);
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT ev.id_evento, ev.id_animal, a.identificador AS animal_identificador, a.nombre AS animal_nombre,
            ev.id_reproductor, sire.identificador AS reproductor_identificador, sire.nombre AS reproductor_nombre,
            ev.id_cria, calf.identificador AS cria_identificador, calf.nombre AS cria_nombre,
            ev.tipo, ev.fecha_evento, ev.resultado, ev.fecha_probable_parto, ev.observaciones,
            CONCAT(u.nombre, ' ', u.apellido) AS usuario_nombre
     FROM eventos_reproductivos ev
     JOIN animales a ON a.id_animal = ev.id_animal
     LEFT JOIN animales sire ON sire.id_animal = ev.id_reproductor
     LEFT JOIN animales calf ON calf.id_animal = ev.id_cria
     LEFT JOIN usuarios u ON u.id_usuario = ev.id_usuario_registro
     ${filter}
     ORDER BY ev.fecha_evento DESC, ev.id_evento DESC`,
    params,
  );
  return rows.map(mapEvent);
}

// Esta función valida especie, sexo y tipo de evento antes de guardar el registro histórico.
export async function createEvent(data: CreateReproductionEvent, userId: number): Promise<ReproductionEvent> {
  const types: ReproductionEventType[] = ["servicio", "inseminacion", "diagnostico_gestacion", "parto", "aborto", "destete"];
  const results: ReproductionResult[] = ["pendiente", "prenada", "vacia", "inconcluso", "exitoso", "fallido"];
  if (!types.includes(data.tipo)) throw new Error("el tipo de evento reproductivo no es válido");
  if (!isValidDateOnly(data.fecha_evento)) throw new Error("la fecha del evento debe ser una fecha real en formato AAAA-MM-DD");
  if (data.fecha_evento > localToday()) throw new Error("la fecha del evento no puede ser futura");
  if (data.fecha_probable_parto && !isValidDateOnly(data.fecha_probable_parto)) throw new Error("la fecha probable de parto no es válida");
  if (data.resultado && !results.includes(data.resultado)) throw new Error("el resultado del evento no es válido");
  if (data.fecha_probable_parto && data.fecha_probable_parto <= data.fecha_evento) throw new Error("la fecha probable de parto debe ser posterior al evento reproductivo");
  if (data.tipo === "diagnostico_gestacion" && !["prenada", "vacia", "inconcluso"].includes(data.resultado ?? "")) throw new Error("el diagnóstico requiere indicar preñada, vacía o inconclusa");
  if (data.tipo === "diagnostico_gestacion" && data.resultado === "prenada" && !data.fecha_probable_parto) throw new Error("indicá la fecha probable de parto para una gestación confirmada");
  if (data.tipo !== "diagnostico_gestacion" && data.resultado && data.tipo !== "parto") throw new Error("el resultado solo se usa en diagnósticos de gestación y partos");
  if (data.fecha_probable_parto && (data.tipo !== "diagnostico_gestacion" || data.resultado !== "prenada")) throw new Error("la fecha probable de parto solo corresponde a una gestación confirmada");
  if (data.tipo === "servicio" && !data.id_reproductor) throw new Error("seleccioná el macho utilizado en el servicio");
  if (data.tipo === "destete" && !data.id_cria) throw new Error("seleccioná la cría que se desteta");

  const [[dam]] = await pool.query<RowDataPacket[]>(
    `SELECT a.id_animal, a.sexo, a.fecha_nacimiento, e.id_especie
     FROM animales a JOIN razas r ON r.id_raza = a.id_raza JOIN especies e ON e.id_especie = r.id_especie
     WHERE a.id_animal = ? AND a.activo = 1`, [data.id_animal],
  );
  if (!dam) throw new Error("no se encontró una hembra activa para el evento");
  if (dam.sexo !== "hembra") throw new Error("los eventos reproductivos deben asociarse a una hembra");
  if (dam.fecha_nacimiento && new Date(data.fecha_evento) < new Date(String(dam.fecha_nacimiento).split("T")[0])) throw new Error("el evento no puede ocurrir antes del nacimiento del animal");

  // No admito nuevos servicios si el último control reproductivo dejó una gestación confirmada abierta.
  if (data.tipo === "servicio" || data.tipo === "inseminacion") {
    const [[latestOutcome]] = await pool.query<RowDataPacket[]>(
      `SELECT tipo, resultado FROM eventos_reproductivos
       WHERE id_animal = ? AND tipo IN ('diagnostico_gestacion','parto','aborto')
       ORDER BY fecha_evento DESC, id_evento DESC LIMIT 1`, [data.id_animal],
    );
    if (latestOutcome?.tipo === "diagnostico_gestacion" && latestOutcome.resultado === "prenada") throw new Error("no se puede registrar otro servicio mientras haya una gestación confirmada sin parto o aborto registrado");
  }

  if (data.id_reproductor) {
    const [[sire]] = await pool.query<RowDataPacket[]>(
      `SELECT a.sexo, a.fecha_nacimiento, e.id_especie
       FROM animales a JOIN razas r ON r.id_raza = a.id_raza JOIN especies e ON e.id_especie = r.id_especie
       WHERE a.id_animal = ? AND a.activo = 1`, [data.id_reproductor],
    );
    if (!sire || sire.sexo !== "macho") throw new Error("el reproductor seleccionado debe ser un macho activo");
    if (Number(sire.id_especie) !== Number(dam.id_especie)) throw new Error("la hembra y el reproductor deben ser de la misma especie");
    if (sire.fecha_nacimiento && new Date(data.fecha_evento) < new Date(String(sire.fecha_nacimiento).split("T")[0])) throw new Error("el evento no puede ocurrir antes del nacimiento del reproductor");
  }

  if (data.id_cria) {
    const [[calf]] = await pool.query<RowDataPacket[]>(
      `SELECT a.id_madre, a.fecha_nacimiento, e.id_especie
       FROM animales a JOIN razas r ON r.id_raza = a.id_raza JOIN especies e ON e.id_especie = r.id_especie
       WHERE a.id_animal = ? AND a.activo = 1`, [data.id_cria],
    );
    if (!calf) throw new Error("no se encontró la cría seleccionada o está inactiva");
    if (Number(calf.id_especie) !== Number(dam.id_especie)) throw new Error("la hembra y la cría deben pertenecer a la misma especie");
    if (calf.id_madre && Number(calf.id_madre) !== data.id_animal) throw new Error("la cría ya está vinculada a otra madre");
    if (data.tipo === "destete" && Number(calf.id_madre) !== data.id_animal) throw new Error("vinculá la cría con su madre antes de registrar el destete");
    if (calf.fecha_nacimiento && data.fecha_evento < String(calf.fecha_nacimiento).split("T")[0]) throw new Error("el evento no puede ocurrir antes del nacimiento de la cría");
  }

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO eventos_reproductivos (id_animal, id_reproductor, id_cria, tipo, fecha_evento, resultado, fecha_probable_parto, observaciones, id_usuario_registro)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.id_animal, data.id_reproductor || null, data.id_cria || null, data.tipo, data.fecha_evento, data.resultado || null, data.fecha_probable_parto || null, data.observaciones?.trim() || null, userId],
  );
  const created = (await listEvents(data.id_animal)).find((event) => event.id_evento === result.insertId);
  if (!created) throw new Error("se guardó el evento, pero no se pudo recuperar su ficha");
  return created;
}
