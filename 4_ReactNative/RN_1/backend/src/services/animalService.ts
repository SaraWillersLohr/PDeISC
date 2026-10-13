// Archivo backend/src/services/animalService.ts: servicio que conecta con la api o implementa lógica de negocio relacionado con animal service. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
// servicio de gesti�n de animales
import pool from "../config/database";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { createNotificacion } from "./notificacionService";

// Contrato de datos EstadoSalud: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
export type EstadoSalud = "sano" | "enfermo" | "herido" | "en_tratamiento";
// Contrato de datos SexoAnimal: define los sexos necesarios para aplicar reglas de parentesco y reproducción.
export type SexoAnimal = "hembra" | "macho" | "indeterminado";
// intefaxz de animal
// muestra informacion
export interface AnimalItem {
  id_animal: number;
  identificador: string;
  nombre: string | null;
  sexo: SexoAnimal;
  id_madre: number | null;
  madre_nombre: string | null;
  id_padre: number | null;
  padre_nombre: string | null;
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
// interfaz de fila de animal para mapear resultados de la base de datos
// los resultadso se mapean a la interfaz animalitem para su uso en el servicio y controlador
interface AnimalRow extends RowDataPacket {
  id_animal: number;
  identificador: string;
  nombre: string | null;
  sexo: SexoAnimal;
  id_madre: number | null;
  madre_nombre: string | null;
  id_padre: number | null;
  padre_nombre: string | null;
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
// funci�n para mapear una fila de animal a un objeto animalitem
// esta funci�n convierte los datos de la base de datos a un formato m�s amigable para la aplicaci�n
function toAnimal(row: AnimalRow): AnimalItem {
  return {
    id_animal: row.id_animal,
    identificador: row.identificador,
    nombre: row.nombre,
    sexo: row.sexo,
    id_madre: row.id_madre,
    madre_nombre: row.madre_nombre,
    id_padre: row.id_padre,
    padre_nombre: row.padre_nombre,
    id_corral: row.id_corral,
    corral_nombre: row.corral_nombre,
    corral_es_enfermeria: row.corral_es_enfermeria === 1,
    id_raza: row.id_raza,
    raza_nombre: row.raza_nombre,
    id_especie: row.id_especie,
    especie_nombre: row.especie_nombre,
    fecha_nacimiento: row.fecha_nacimiento
      ? String(row.fecha_nacimiento).split("T")[0]
      : null,
    peso_kg: row.peso_kg !== null ? Number(row.peso_kg) : null,
    estado_salud: row.estado_salud,
    id_corral_origen: row.id_corral_origen,
    activo: row.activo === 1,
    created_at: row.created_at,
  };
}
// interfaz para los filtros de b�squeda de animales
export interface AnimalFilters {
  id_corral?: number;
  estado_salud?: EstadoSalud;
  id_especie?: number;
  sexo?: SexoAnimal;
  search?: string;
}
// esta funci�n lista los animales aplicando filtros opcionales como id_corral, estado_salud, id_especie y b�squeda por nombre o descripci�n.
export async function listAnimales(
  filters: AnimalFilters = {},
): Promise<AnimalItem[]> {
  const conditions: string[] = ["a.activo = 1"];
  const params: unknown[] = [];

  if (filters.id_corral) {
    conditions.push("a.id_corral = ?");
    params.push(filters.id_corral);
  }
  if (filters.estado_salud) {
    conditions.push("a.estado_salud = ?");
    params.push(filters.estado_salud);
  }
  if (filters.id_especie) {
    conditions.push("e.id_especie = ?");
    params.push(filters.id_especie);
  }
  if (filters.sexo) {
    conditions.push("a.sexo = ?");
    params.push(filters.sexo);
  }
  if (filters.search) {
    conditions.push("(a.identificador LIKE ? OR a.nombre LIKE ?)");
    const term = `%${filters.search.trim()}%`;
    params.push(term, term);
  }

  const query = `
    SELECT a.id_animal, a.identificador, a.nombre, a.sexo, a.id_madre, a.id_padre,
           CONCAT(m.identificador, IF(m.nombre IS NULL, '', CONCAT(' · ', m.nombre))) AS madre_nombre,
           CONCAT(p.identificador, IF(p.nombre IS NULL, '', CONCAT(' · ', p.nombre))) AS padre_nombre,
           a.id_corral, a.id_raza,
           a.fecha_nacimiento, a.peso_kg, a.estado_salud, a.id_corral_origen,
           a.activo, a.created_at,
           c.nombre AS corral_nombre, c.es_enfermeria AS corral_es_enfermeria,
           r.nombre AS raza_nombre,
           e.id_especie, e.nombre AS especie_nombre
    FROM animales a
    INNER JOIN corrales c ON c.id_corral = a.id_corral
    INNER JOIN razas r ON r.id_raza = a.id_raza
    INNER JOIN especies e ON e.id_especie = r.id_especie
    LEFT JOIN animales m ON m.id_animal = a.id_madre
    LEFT JOIN animales p ON p.id_animal = a.id_padre
    WHERE ${conditions.join(" AND ")}
    ORDER BY a.created_at DESC
  `;

  const [rows] = await pool.query<AnimalRow[]>(query, params);
  return rows.map(toAnimal);
}

// Contrato de datos CreateAnimalRequest: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
export interface CreateAnimalRequest {
  identificador: string;
  nombre?: string | null;
  sexo?: SexoAnimal;
  id_madre?: number | null;
  id_padre?: number | null;
  id_corral: number;
  id_raza: number;
  fecha_nacimiento?: string | null;
  peso_kg?: number | null;
  estado_salud?: EstadoSalud;
}

// Esta función valida una fecha de calendario real, no solo el formato de sus números.
function isValidDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10) === value;
}

// Esta función obtiene el día civil del servidor sin convertirlo a UTC.
function localToday(): string { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }

// Esta función valida que la madre sea hembra, el padre macho y ambos compartan especie con la cría.
async function validateLineage(speciesId: number, sexo: SexoAnimal, idMadre?: number | null, idPadre?: number | null, animalId?: number, fechaNacimiento?: string | null): Promise<void> {
  if (sexo !== "hembra" && sexo !== "macho" && sexo !== "indeterminado") throw new Error("el sexo seleccionado no es válido");
  if ((idMadre && idMadre === animalId) || (idPadre && idPadre === animalId) || (idMadre && idMadre === idPadre)) throw new Error("un animal no puede ser su propio progenitor ni ocupar ambos parentescos");
  const parents = [
    ...(idMadre ? [{ id: Number(idMadre), expected: "hembra" as const, label: "madre" }] : []),
    ...(idPadre ? [{ id: Number(idPadre), expected: "macho" as const, label: "padre" }] : []),
  ];
  if (animalId && parents.length) {
    // Camino hacia abajo por generaciones para impedir ciclos indirectos en el árbol genealógico.
    const descendants = new Set<number>([animalId]);
    let frontier = [animalId];
    while (frontier.length) {
      const placeholders = frontier.map(() => "?").join(", ");
      const [children] = await pool.query<RowDataPacket[]>(
        `SELECT id_animal FROM animales WHERE activo = 1 AND (id_madre IN (${placeholders}) OR id_padre IN (${placeholders}))`,
        [...frontier, ...frontier],
      );
      frontier = children.map((child) => Number(child.id_animal)).filter((childId) => !descendants.has(childId));
      frontier.forEach((childId) => descendants.add(childId));
    }
    if (parents.some((parent) => descendants.has(parent.id))) throw new Error("la relación de parentesco generaría un ciclo en el árbol genealógico");
  }
  for (const parent of parents) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT a.id_animal, a.sexo, a.fecha_nacimiento, e.id_especie
       FROM animales a JOIN razas r ON r.id_raza = a.id_raza
       JOIN especies e ON e.id_especie = r.id_especie
       WHERE a.id_animal = ? AND a.activo = 1 LIMIT 1`,
      [parent.id],
    );
    const row = rows[0];
    if (!row) throw new Error(`la ficha seleccionada como ${parent.label} no existe o está inactiva`);
    if (row.sexo !== parent.expected) throw new Error(`el progenitor seleccionado como ${parent.label} debe tener sexo ${parent.expected}`);
    if (Number(row.id_especie) !== speciesId) throw new Error("la cría y sus progenitores deben pertenecer a la misma especie");
    if (fechaNacimiento && row.fecha_nacimiento && new Date(fechaNacimiento) < new Date(String(row.fecha_nacimiento).split("T")[0])) throw new Error("la fecha de nacimiento de la cría debe ser posterior a la de sus progenitores");
  }
}

// ejecuto createanimal
export async function createAnimal(
  data: CreateAnimalRequest,
  userId?: number,
): Promise<AnimalItem> {
  const identificador = data.identificador?.trim();
  if (!identificador)
    throw new Error("el identificador/caravana es obligatorio");
  if (!data.id_corral) throw new Error("debes asignar un corral");
  if (!data.id_raza) throw new Error("debes asignar una raza");
  if (data.fecha_nacimiento && (!isValidDateOnly(data.fecha_nacimiento) || data.fecha_nacimiento > localToday())) throw new Error("la fecha de nacimiento no es válida o está en el futuro");

  // Consulto la especie de la raza para aplicar reglas de parentesco antes de insertar.
  const [[breedInfo]] = await pool.query<RowDataPacket[]>(
    "SELECT id_especie FROM razas WHERE id_raza = ? LIMIT 1",
    [data.id_raza],
  );
  if (!breedInfo) throw new Error("la raza seleccionada no existe");
  await validateLineage(Number(breedInfo.id_especie), data.sexo ?? "indeterminado", data.id_madre, data.id_padre, undefined, data.fecha_nacimiento);

  // chequeo capacidad del corral
  const [[corralInfo]] = await pool.query<RowDataPacket[]>(
    `SELECT c.capacidad,
            (SELECT COUNT(*) FROM animales a WHERE a.id_corral = c.id_corral AND a.activo = 1) AS ocupados
     FROM corrales c WHERE c.id_corral = ? AND c.activo = 1`,
    [data.id_corral],
  );

  if (!corralInfo)
    throw new Error("el corral seleccionado no existe o está inactivo");
  if (Number(corralInfo.ocupados) >= Number(corralInfo.capacidad)) {
    throw new Error("el corral seleccionado ha alcanzado su capacidad máxima");
  }

  const nombre = data.nombre?.trim() || null;
  const fechaNac = data.fecha_nacimiento || null;
  const peso =
    data.peso_kg !== undefined &&
    data.peso_kg !== null &&
    !isNaN(Number(data.peso_kg))
      ? Number(data.peso_kg)
      : null;
  const estadoSalud = data.estado_salud || "sano";

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO animales (identificador, nombre, sexo, id_madre, id_padre, id_corral, id_raza, fecha_nacimiento, peso_kg, estado_salud, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        identificador,
        nombre,
        data.sexo ?? "indeterminado",
        data.id_madre || null,
        data.id_padre || null,
        data.id_corral,
        data.id_raza,
        fechaNac,
        peso,
        estadoSalud,
      ],
    );

    // Inicio el historial de corrales en el primer destino asignado al animal.
    await pool.query(
      `INSERT INTO historial_movimientos_animales (id_animal, id_corral_origen, id_corral_destino, motivo, id_usuario_registro)
       VALUES (?, NULL, ?, 'alta_inicial', ?)`,
      [result.insertId, data.id_corral, userId ?? null],
    );

    const animales = await listAnimales();
    const creado = animales.find((a) => a.id_animal === result.insertId);
    if (!creado) throw new Error("error al recuperar el animal creado");
    return creado;
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "ER_DUP_ENTRY"
    ) {
      throw new Error("ya existe un animal con ese identificador");
    }
    throw err;
  }
}

// Contrato de datos UpdateAnimalRequest: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
export interface UpdateAnimalRequest {
  identificador?: string;
  nombre?: string | null;
  sexo?: SexoAnimal;
  id_madre?: number | null;
  id_padre?: number | null;
  id_corral?: number;
  id_raza?: number;
  fecha_nacimiento?: string | null;
  peso_kg?: number | null;
  estado_salud?: EstadoSalud;
  activo?: boolean;
}

// ejecuto updateanimal
export async function updateAnimal(
  id: number,
  data: UpdateAnimalRequest,
  userId?: number,
): Promise<AnimalItem> {
  const [[actual]] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM animales WHERE id_animal = ? AND activo = 1",
    [id],
  );
  if (!actual) throw new Error("animal no encontrado");
  if (data.fecha_nacimiento && (!isValidDateOnly(data.fecha_nacimiento) || data.fecha_nacimiento > localToday())) throw new Error("la fecha de nacimiento no es válida o está en el futuro");

  // Revalido el linaje completo si se modifica sexo, raza o alguno de los progenitores.
  if (data.sexo !== undefined || data.id_raza !== undefined || data.id_madre !== undefined || data.id_padre !== undefined) {
    const [[breedInfo]] = await pool.query<RowDataPacket[]>(
      "SELECT id_especie FROM razas WHERE id_raza = ? LIMIT 1",
      [data.id_raza ?? actual.id_raza],
    );
    if (!breedInfo) throw new Error("la raza seleccionada no existe");
    const [[lineage]] = await pool.query<RowDataPacket[]>("SELECT sexo, id_madre, id_padre FROM animales WHERE id_animal = ?", [id]);
    await validateLineage(Number(breedInfo.id_especie), data.sexo ?? lineage.sexo, data.id_madre !== undefined ? data.id_madre : lineage.id_madre, data.id_padre !== undefined ? data.id_padre : lineage.id_padre, id, data.fecha_nacimiento ?? actual.fecha_nacimiento);

    // Evito que una edición vuelva incoherente el sexo o la especie de crías ya relacionadas.
    if (data.sexo !== undefined && data.sexo !== actual.sexo) {
      const [[references]] = await pool.query<RowDataPacket[]>("SELECT SUM(id_madre = ?) AS madres, SUM(id_padre = ?) AS padres FROM animales WHERE activo = 1", [id, id]);
      if (Number(references?.madres ?? 0) > 0 && data.sexo !== "hembra") throw new Error("no se puede cambiar el sexo: este animal figura como madre de otras fichas");
      if (Number(references?.padres ?? 0) > 0 && data.sexo !== "macho") throw new Error("no se puede cambiar el sexo: este animal figura como padre de otras fichas");
    }
    if (data.id_raza !== undefined) {
      const [[offspring]] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total FROM animales child
         JOIN razas child_breed ON child_breed.id_raza = child.id_raza
         WHERE (child.id_madre = ? OR child.id_padre = ?) AND child.activo = 1 AND child_breed.id_especie <> ?`,
        [id, id, Number(breedInfo.id_especie)],
      );
      if (Number(offspring?.total ?? 0) > 0) throw new Error("no se puede cambiar la especie mientras existan crías vinculadas de otra especie");
    }
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.identificador !== undefined) {
    const idf = data.identificador.trim();
    if (!idf) throw new Error("el identificador no puede estar vacío");
    fields.push("identificador = ?");
    values.push(idf);
  }
  if (data.nombre !== undefined) {
    fields.push("nombre = ?");
    values.push(data.nombre ? data.nombre.trim() : null);
  }
  if (data.sexo !== undefined) { fields.push("sexo = ?"); values.push(data.sexo); }
  if (data.id_madre !== undefined) { fields.push("id_madre = ?"); values.push(data.id_madre || null); }
  if (data.id_padre !== undefined) { fields.push("id_padre = ?"); values.push(data.id_padre || null); }
  if (data.id_raza !== undefined) {
    fields.push("id_raza = ?");
    values.push(data.id_raza);
  }
  if (data.fecha_nacimiento !== undefined) {
    fields.push("fecha_nacimiento = ?");
    values.push(data.fecha_nacimiento || null);
  }
  if (data.peso_kg !== undefined) {
    fields.push("peso_kg = ?");
    values.push(
      data.peso_kg !== null && !isNaN(Number(data.peso_kg))
        ? Number(data.peso_kg)
        : null,
    );
  }
  if (data.estado_salud !== undefined) {
    fields.push("estado_salud = ?");
    values.push(data.estado_salud);
  }
  if (data.activo !== undefined) {
    fields.push("activo = ?");
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

    if (!destInfo)
      throw new Error("el corral destino no existe o está inactivo");
    if (Number(destInfo.ocupados) >= Number(destInfo.capacidad)) {
      throw new Error("el corral destino ha alcanzado su capacidad máxima");
    }

    fields.push("id_corral = ?");
    values.push(data.id_corral);

    // si se traslada a enfermer�a, guardo el corral de origen
    if (destInfo.es_enfermeria === 1) {
      fields.push("id_corral_origen = ?");
      values.push(actual.id_corral);
    }
  }

  if (fields.length === 0) throw new Error("no hay datos para actualizar");

  values.push(id);

  try {
    await pool.query(
      `UPDATE animales SET ${fields.join(", ")} WHERE id_animal = ?`,
      values,
    );

    // Registro el cambio de corral para que el historial mantenga origen, destino y responsable del movimiento.
    if (data.id_corral !== undefined && data.id_corral !== actual.id_corral) {
      await pool.query(
        `INSERT INTO historial_movimientos_animales (id_animal, id_corral_origen, id_corral_destino, motivo, id_usuario_registro)
         VALUES (?, ?, ?, 'traslado', ?)`,
        [id, actual.id_corral, data.id_corral, userId ?? null],
      );
    }

    // si cambi� el estado de salud se registra la notificaci�n correspondiente
    if (data.estado_salud && data.estado_salud !== actual.estado_salud) {
      if (
        data.estado_salud === "enfermo" ||
        data.estado_salud === "en_tratamiento"
      ) {
        await createNotificacion(
          data.estado_salud === "enfermo"
            ? "Alerta sanitaria"
            : "Inicio de tratamiento",
          `Estado del animal ${actual.identificador} actualizado a ${data.estado_salud}`,
          data.estado_salud === "enfermo"
            ? "alerta_sanitaria"
            : "en_tratamiento",
          id,
        );
      } else if (
        data.estado_salud === "sano" &&
        actual.estado_salud !== "sano"
      ) {
        await createNotificacion(
          "Recuperación registrada",
          `El animal ${actual.identificador} ha sido marcado como sano`,
          "alta",
          id,
        );
      }
    }

    const animales = await listAnimales();
    const actualizado = animales.find((a) => a.id_animal === id);
    if (!actualizado)
      throw new Error("error al recuperar el animal actualizado");
    return actualizado;
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "ER_DUP_ENTRY"
    ) {
      throw new Error("ya existe un animal con ese identificador");
    }
    throw err;
  }
}

// reporta un animal enfermo, lo traslada autom�ticamente a enfermer�a y registra s�ntomas
export async function reportarEnfermedad(
  idAnimal: number,
  comentarios: string,
  idUsuarioReporta: number,
): Promise<AnimalItem> {
  const [[animal]] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM animales WHERE id_animal = ? AND activo = 1",
    [idAnimal],
  );
  if (!animal) throw new Error("animal no encontrado");

  // busco el corral designado como enfermer�a
  const [[enfermeria]] = await pool.query<RowDataPacket[]>(
    "SELECT id_corral, capacidad FROM corrales WHERE es_enfermeria = 1 AND activo = 1 LIMIT 1",
  );
  if (!enfermeria)
    throw new Error("no se encontró un corral de enfermería configurado");

  // si ya est� en enfermer�a no se vuelve a trasladar
  if (animal.id_corral === enfermeria.id_corral) {
    throw new Error("el animal ya se encuentra en el corral de enfermería");
  }

  // actualizo animal: guardo corral previo, mudo a enfermer�a y marco como enfermo
  await pool.query(
    `UPDATE animales
     SET id_corral_origen = ?, id_corral = ?, estado_salud = 'enfermo'
     WHERE id_animal = ?`,
    [animal.id_corral, enfermeria.id_corral, idAnimal],
  );

  // Registro el movimiento sanitario para que la derivación y el corral de origen queden auditables.
  await pool.query(
    `INSERT INTO historial_movimientos_animales (id_animal, id_corral_origen, id_corral_destino, motivo, observaciones, id_usuario_registro)
     VALUES (?, ?, ?, 'derivacion_enfermeria', ?, ?)`,
    [idAnimal, animal.id_corral, enfermeria.id_corral, comentarios?.trim() || null, idUsuarioReporta],
  );

  // registro reporte inicial en tabla tratamientos si se enviaron comentarios
  const descripcionReporte = comentarios?.trim()
    ? `reporte de ingreso a enfermería: ${comentarios.trim()}`
    : "reporte de ingreso a enfermería por síntomas observados en campo";

  await pool.query(
    `INSERT INTO tratamientos (id_animal, id_veterinario, descripcion, fecha_inicio)
     VALUES (?, ?, ?, CURDATE())`,
    [idAnimal, idUsuarioReporta, descripcionReporte],
  );

  // registro la alerta sanitaria persistente para la campanita
  await createNotificacion(
    "Animal derivado a Enfermería",
    `Animal ${animal.identificador} trasladado a enfermería. Síntomas: ${comentarios?.trim() || "observados en campo"}`,
    "alerta_sanitaria",
    idAnimal,
  );

  const animales = await listAnimales();
  const actualizado = animales.find((a) => a.id_animal === idAnimal);
  if (!actualizado) throw new Error("error al recuperar animal trasladado");
  return actualizado;
}

// da de alta a un animal en enfermer�a y lo devuelve a su corral original
export async function darDeAlta(
  idAnimal: number,
  idVeterinario: number,
  notasAlta?: string,
): Promise<AnimalItem> {
  const [[animal]] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM animales WHERE id_animal = ? AND activo = 1",
    [idAnimal],
  );
  if (!animal) throw new Error("animal no encontrado");

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
    if (!altCorral)
      throw new Error(
        "no hay corrales generales con capacidad disponible para el alta",
      );
    destCorralId = altCorral.id_corral;
  }

  // actualizo animal a sano, nuevo corral y remuevo corral de origen
  await pool.query(
    `UPDATE animales
     SET id_corral = ?, estado_salud = 'sano', id_corral_origen = NULL
     WHERE id_animal = ?`,
    [destCorralId, idAnimal],
  );

  // Registro la salida de enfermería y el corral general al que vuelve el animal.
  await pool.query(
    `INSERT INTO historial_movimientos_animales (id_animal, id_corral_origen, id_corral_destino, motivo, observaciones, id_usuario_registro)
     VALUES (?, ?, ?, 'alta_enfermeria', ?, ?)`,
    [idAnimal, animal.id_corral, destCorralId, notasAlta?.trim() || null, idVeterinario],
  );

  // registro nota de alta m�dica
  const detalleAlta = notasAlta?.trim()
    ? `alta médica: ${notasAlta.trim()}`
    : "alta médica emitida por veterinario � animal recuperado";

  await pool.query(
    `INSERT INTO tratamientos (id_animal, id_veterinario, descripcion, fecha_inicio, fecha_fin)
     VALUES (?, ?, ?, CURDATE(), CURDATE())`,
    [idAnimal, idVeterinario, detalleAlta],
  );

  // registro notificaci�n de alta m�dica persistente
  await createNotificacion(
    "Alta médica emitida",
    `Animal ${animal.identificador} declarado sano y reintegrado a corral`,
    "alta",
    idAnimal,
  );

  const animales = await listAnimales();
  const actualizado = animales.find((a) => a.id_animal === idAnimal);
  if (!actualizado) throw new Error("error al recuperar animal dado de alta");
  return actualizado;
}

// ejecuto deleteanimal
export async function deleteAnimal(id: number): Promise<void> {
  const [result] = await pool.query<ResultSetHeader>(
    "UPDATE animales SET activo = 0 WHERE id_animal = ?",
    [id],
  );
  if (result.affectedRows === 0) throw new Error("animal no encontrado");
}

