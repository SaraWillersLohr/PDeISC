// conecto tareas y operaciones de reproducción con las tablas de la estancia.
import type { Request, Response } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { database } from '../config/database.js';

const animalGenders = ['hembra', 'macho', 'no_especificado'] as const;
function isAnimalGender(value: string): boolean { return (animalGenders as readonly string[]).includes(value); }

export async function listTasks(req: Request, res: Response): Promise<void> {
  const userId = req.usuario?.id_usuario ?? 0; const role = req.rolVigente ?? '';
  try {
    const [rows] = await database.execute<RowDataPacket[]>(
      `SELECT t.id_tarea,t.titulo,t.descripcion,t.id_responsable,t.fecha_vencimiento,t.estado,
              u.nombre AS responsable,u.apellido AS apellido_responsable
       FROM tareas t LEFT JOIN usuarios u ON u.id_usuario=t.id_responsable
       WHERE t.id_responsable=? OR ?='administrador' ORDER BY t.fecha_vencimiento IS NULL,t.fecha_vencimiento,t.created_at DESC`,
      [userId, role],
    );
    res.json({ data: rows });
  } catch { res.status(500).json({ message: 'No se pudieron cargar las tareas. Intentá de nuevo más tarde.' }); }
}

export async function createTask(req: Request, res: Response): Promise<void> {
  const userId = req.usuario?.id_usuario;
  const title = String(req.body.titulo ?? '').trim();
  const description = String(req.body.descripcion ?? '').trim();
  const responsible = Number(req.body.id_responsable ?? userId);
  const dueDate = req.body.fecha_vencimiento || null;
  if (!userId || !title || title.length > 150 || !Number.isInteger(responsible) || (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(String(dueDate)))) {
    res.status(400).json({ message: 'indicá título y fecha válida para la tarea' }); return;
  }
  try {
    const [assignees] = await database.execute<RowDataPacket[]>(`SELECT u.id_usuario FROM usuarios u JOIN roles r ON r.id_rol=u.id_rol WHERE u.id_usuario=? AND u.activo=1 AND r.nombre='peon'`, [responsible]);
    if (!assignees.length) { res.status(400).json({ message: 'asigná la tarea a un peón activo' }); return; }
    const [result] = await database.execute<ResultSetHeader>(
      'INSERT INTO tareas (titulo,descripcion,id_responsable,fecha_vencimiento,id_creador) VALUES (?,?,?,?,?)',
      [title, description || null, responsible, dueDate, userId],
    );
    res.status(201).json({ data: { id_tarea: result.insertId } });
  } catch { res.status(409).json({ message: 'no se pudo crear la tarea; revisá el responsable' }); }
}

export async function updateTask(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id); const state = String(req.body.estado ?? '');
  const userId = req.usuario?.id_usuario ?? 0; const role = req.rolVigente ?? '';
  if (!Number.isInteger(id) || !['pendiente','en_progreso','completada','cancelada'].includes(state)) {
    res.status(400).json({ message: 'estado de tarea inválido' }); return;
  }
  try {
    const [result] = await database.execute<ResultSetHeader>(
      `UPDATE tareas SET estado=? WHERE id_tarea=? AND (id_responsable=? OR ?='administrador')`,
      [state, id, userId, role],
    );
    if (!result.affectedRows) { res.status(404).json({ message: 'tarea no encontrada o no asignada a tu usuario' }); return; }
    res.json({ message: 'tarea actualizada' });
  } catch { res.status(500).json({ message: 'no se pudo actualizar la tarea' }); }
}

export async function listReproduction(req: Request, res: Response): Promise<void> {
  try {
    const [services] = await database.execute<RowDataPacket[]>(
      `SELECT s.id_servicio,s.fecha,s.metodo,s.estado,s.observaciones,s.fecha_estimada_nacimiento,s.prenez_confirmada_en,
              m.identificador AS madre,m.nombre AS nombre_madre,e.nombre AS especie,p.identificador AS padre,s.padre_texto
       FROM servicios_monta s JOIN animales m ON m.id_animal=s.id_madre
       JOIN razas r ON r.id_raza=m.id_raza JOIN especies e ON e.id_especie=r.id_especie
       LEFT JOIN animales p ON p.id_animal=s.id_padre ORDER BY s.fecha DESC LIMIT 200`,
    );
    const [births] = await database.execute<RowDataPacket[]>(
      `SELECT n.id_nacimiento,n.fecha,n.observaciones,c.identificador AS cria,c.nombre AS nombre_cria,
              m.identificador AS madre,n.madre_texto,p.identificador AS padre,n.padre_texto
       FROM nacimientos n JOIN animales c ON c.id_animal=n.id_cria
       LEFT JOIN animales m ON m.id_animal=n.id_madre LEFT JOIN animales p ON p.id_animal=n.id_padre
       ORDER BY n.fecha DESC LIMIT 200`,
    );
    res.json({ data: { servicios: services, nacimientos: births, usuario: req.usuario?.id_usuario } });
  } catch { res.status(500).json({ message: 'No se pudo cargar reproducción. Intentá de nuevo más tarde.' }); }
}

// borro de forma permanente un registro reproductivo a pedido del dueño y dejo auditoría.
async function deleteReproductionRecord(table: 'servicios_monta' | 'nacimientos', idColumn: 'id_servicio' | 'id_nacimiento', id: number, userId: number): Promise<boolean> {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<RowDataPacket[]>(`SELECT ${idColumn} FROM ${table} WHERE ${idColumn}=? FOR UPDATE`, [id]);
    if (!rows.length) { await connection.rollback(); return false; }
    await connection.execute(`DELETE FROM ${table} WHERE ${idColumn}=?`, [id]);
    await connection.execute('INSERT INTO auditoria_cambios (entidad,id_entidad,accion,id_usuario,detalle) VALUES (?,?,?,?,?)', [table, id, 'borrado_permanente', userId, JSON.stringify({ tabla: table })]);
    await connection.commit(); return true;
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}

export async function deleteMatingService(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id); const userId = req.usuario?.id_usuario;
  if (!Number.isInteger(id) || id < 1 || !userId) { res.status(400).json({ message: 'registro inválido' }); return; }
  try {
    if (!await deleteReproductionRecord('servicios_monta', 'id_servicio', id, userId)) { res.status(404).json({ message: 'el servicio reproductivo no existe' }); return; }
    res.json({ message: 'servicio reproductivo borrado' });
  } catch { res.status(500).json({ message: 'no se pudo borrar el servicio reproductivo' }); }
}

export async function deleteBirthRecord(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id); const userId = req.usuario?.id_usuario;
  if (!Number.isInteger(id) || id < 1 || !userId) { res.status(400).json({ message: 'registro inválido' }); return; }
  try {
    if (!await deleteReproductionRecord('nacimientos', 'id_nacimiento', id, userId)) { res.status(404).json({ message: 'el nacimiento no existe' }); return; }
    res.json({ message: 'registro de nacimiento borrado; la ficha de la cría se conservó' });
  } catch { res.status(500).json({ message: 'no se pudo borrar el registro de nacimiento' }); }
}

export async function createMatingService(req: Request, res: Response): Promise<void> {
  const userId = req.usuario?.id_usuario;
  const mother = Number(req.body.id_madre); const father = req.body.id_padre ? Number(req.body.id_padre) : null;
  const date = String(req.body.fecha ?? ''); const method = String(req.body.metodo ?? '').trim();
  const fatherText = String(req.body.padre_texto ?? '').trim(); const notes = String(req.body.observaciones ?? '').trim();
  if (!userId || !Number.isInteger(mother) || mother < 1 || (father !== null && (!Number.isInteger(father) || father < 1)) || father === mother || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !method || method.length > 60 || (!father && !fatherText)) {
    res.status(400).json({ message: 'indicá madre, fecha, método y padre o su nombre informado' }); return;
  }
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [parents] = await connection.execute<RowDataPacket[]>(
      `SELECT a.id_animal,a.genero,a.activo,r.id_especie
       FROM animales a JOIN razas r ON r.id_raza=a.id_raza
       WHERE a.id_animal IN (?,?) FOR UPDATE`, [mother, father ?? mother],
    );
    const dam = parents.find((parent) => Number(parent.id_animal) === mother);
    const sire = father === null ? undefined : parents.find((parent) => Number(parent.id_animal) === father);
    if (!dam || !dam.activo || dam.genero !== 'hembra') { await connection.rollback(); res.status(409).json({ message: 'la madre debe ser una hembra activa registrada' }); return; }
    if (father !== null && (!sire || !sire.activo || sire.genero !== 'macho' || Number(sire.id_especie) !== Number(dam.id_especie))) {
      await connection.rollback();
      res.status(409).json({ message: 'el padre debe ser un macho activo de la misma especie' }); return;
    }
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO servicios_monta (id_madre,id_padre,padre_texto,fecha,metodo,estado,observaciones,id_usuario)
       VALUES (?,?,?,?,?,'realizado',?,?)`,
      [mother, father, fatherText || null, date, method, notes || null, userId],
    );
    await connection.commit();
    res.status(201).json({ data: { id_servicio: result.insertId } });
  } catch { await connection.rollback(); res.status(409).json({ message: 'no se pudo guardar el servicio; verificá los animales' }); }
  finally { connection.release(); }
}

export async function confirmPregnancy(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) { res.status(400).json({ message: 'servicio inválido' }); return; }
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT s.id_servicio,s.id_madre,s.fecha_estimada_nacimiento,e.nombre AS especie,s.prenez_confirmada_en,
              COALESCE(a.nombre,a.identificador) AS madre
       FROM servicios_monta s JOIN animales a ON a.id_animal=s.id_madre
       JOIN razas r ON r.id_raza=a.id_raza JOIN especies e ON e.id_especie=r.id_especie
       WHERE s.id_servicio=? FOR UPDATE`, [id],
    );
    if (!rows.length) { await connection.rollback(); res.status(404).json({ message: 'servicio no encontrado' }); return; }
    if (rows[0].prenez_confirmada_en) {
      await connection.commit();
      res.json({ data: { fecha_estimada_nacimiento: toDateOnly(rows[0].fecha_estimada_nacimiento), ya_confirmada: true } });
      return;
    }
    const days = gestationDays(String(rows[0].especie));
    if (!days) { await connection.rollback(); res.status(400).json({ message: `No hay una duración de gestación configurada para ${rows[0].especie}; no se puede estimar la fecha.` }); return; }
    await connection.execute<ResultSetHeader>(
      `UPDATE servicios_monta SET estado='preñada', prenez_confirmada_en=NOW(), fecha_estimada_nacimiento=DATE_ADD(fecha, INTERVAL ? DAY) WHERE id_servicio=? AND prenez_confirmada_en IS NULL`, [days, id],
    );
    const [updated] = await connection.execute<RowDataPacket[]>('SELECT fecha_estimada_nacimiento FROM servicios_monta WHERE id_servicio=?', [id]);
    const estimatedBirth = toDateOnly(updated[0].fecha_estimada_nacimiento);
    await connection.execute(`INSERT INTO notificaciones (id_animal,titulo,mensaje,tipo,rol_destino) VALUES (?,?,?,'reproduccion',NULL)`, [rows[0].id_madre, 'Preñez confirmada', `${rows[0].madre}: fecha estimada de nacimiento ${estimatedBirth}. Se avisará al equipo un mes antes.`]);
    await connection.commit();
    res.json({ data: { fecha_estimada_nacimiento: estimatedBirth } });
  } catch { await connection.rollback(); res.status(500).json({ message: 'no se pudo confirmar la preñez' }); }
  finally { connection.release(); }
}

const gestationBySpecies: Record<string, number> = { bovino: 283, vacuno: 283, vaca: 283, cattle: 283, porcino: 114, cerdo: 114, chancho: 114, pig: 114, equino: 340, caballo: 340, horse: 340, ovino: 150, oveja: 150, sheep: 150, caprino: 150, cabra: 150, goat: 150, gato: 65, felino: 65, cat: 65, perro: 63, canino: 63, dog: 63, conejo: 31, rabbit: 31, burro: 365, donkey: 365, llama: 350, alpaca: 350 };
function gestationDays(species: string): number | undefined { return gestationBySpecies[species.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()]; }
function toDateOnly(value: unknown): string { return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10); }

// publico una sola notificación general cuando faltan treinta días para el parto estimado.
export async function publishBirthReminders(): Promise<void> {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [due] = await connection.execute<RowDataPacket[]>(
      `SELECT s.id_servicio,s.id_madre,s.fecha_estimada_nacimiento,COALESCE(m.nombre,m.identificador) AS madre
       FROM servicios_monta s JOIN animales m ON m.id_animal=s.id_madre
       WHERE s.prenez_confirmada_en IS NOT NULL AND s.recordatorio_nacimiento_en IS NULL
       AND DATE_SUB(s.fecha_estimada_nacimiento, INTERVAL 1 MONTH)=CURRENT_DATE() FOR UPDATE`,
    );
    for (const row of due) {
      await connection.execute(`INSERT INTO notificaciones (id_animal,titulo,mensaje,tipo,rol_destino) VALUES (?,?,?,'reproduccion',NULL)`, [row.id_madre, 'Nacimiento próximo', `Falta un mes para el nacimiento estimado de ${row.madre} (${String(row.fecha_estimada_nacimiento).slice(0, 10)}).`]);
      await connection.execute('UPDATE servicios_monta SET recordatorio_nacimiento_en=NOW() WHERE id_servicio=? AND recordatorio_nacimiento_en IS NULL', [row.id_servicio]);
    }
    await connection.commit();
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}

// registro una cría y sus dos progenitores en una sola operación transaccional.
export async function createBirth(req: Request, res: Response): Promise<void> {
  const userId = req.usuario?.id_usuario; const identifier = String(req.body.identificador ?? '').trim();
  const breedId = Number(req.body.id_raza); const corralId = Number(req.body.id_corral); const date = String(req.body.fecha ?? '');
  const motherId = req.body.id_madre ? Number(req.body.id_madre) : null; const fatherId = req.body.id_padre ? Number(req.body.id_padre) : null;
  const motherText = String(req.body.madre_texto ?? '').trim(); const fatherText = String(req.body.padre_texto ?? '').trim();
  const name = String(req.body.nombre ?? '').trim(); const notes = String(req.body.observaciones ?? '').trim();
  const gender = req.body.genero == null ? 'no_especificado' : String(req.body.genero);
  const photoValue = req.body.foto;
  const photo = photoValue == null || photoValue === '' ? null : typeof photoValue === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(photoValue) && Buffer.byteLength(photoValue, 'utf8') <= 1_500_000 ? photoValue : false;
  if (photo === false) { res.status(400).json({ message: 'la foto debe ser JPG, PNG o WebP y no superar 1,5 MB' }); return; }
  if (!isAnimalGender(gender)) { res.status(400).json({ message: 'elegí un género válido para la cría' }); return; }
  if (!userId || !identifier || identifier.length > 50 || !Number.isInteger(breedId) || !Number.isInteger(corralId) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || (!motherId && !motherText) || (!fatherId && !fatherText) || (motherId && !Number.isInteger(motherId)) || (fatherId && !Number.isInteger(fatherId))) {
    res.status(400).json({ message: 'completá identificador, raza, corral, fecha y ambos progenitores (animal o nombre)' }); return;
  }
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [corralRows] = await connection.execute<RowDataPacket[]>('SELECT capacidad, activo FROM corrales WHERE id_corral=? FOR UPDATE', [corralId]);
    if (!corralRows[0]?.activo) throw new Error('el corral seleccionado no está activo');
    const [counts] = await connection.execute<RowDataPacket[]>('SELECT COUNT(*) AS ocupacion FROM animales WHERE id_corral=? AND activo=1', [corralId]);
    if (Number(counts[0]?.ocupacion ?? 0) >= Number(corralRows[0].capacidad)) throw new Error('el corral alcanzó su capacidad');
    const [breedRows] = await connection.execute<RowDataPacket[]>('SELECT id_especie FROM razas WHERE id_raza=?', [breedId]);
    if (!breedRows.length) throw new Error('la raza seleccionada no existe');
    if (motherId !== null && fatherId !== null && motherId === fatherId) throw new Error('la madre y el padre no pueden ser el mismo animal');
    const [parents] = await connection.execute<RowDataPacket[]>(
      `SELECT a.id_animal,a.genero,r.id_especie
       FROM animales a JOIN razas r ON r.id_raza=a.id_raza
       WHERE a.id_animal IN (?,?)`, [motherId ?? 0, fatherId ?? 0],
    );
    const dam = motherId === null ? undefined : parents.find((parent) => Number(parent.id_animal) === motherId);
    const sire = fatherId === null ? undefined : parents.find((parent) => Number(parent.id_animal) === fatherId);
    if (motherId !== null && (!dam || dam.genero !== 'hembra' || Number(dam.id_especie) !== Number(breedRows[0].id_especie))) {
      throw new Error('la madre registrada debe ser hembra y de la misma especie que la cría');
    }
    if (fatherId !== null && (!sire || sire.genero !== 'macho' || Number(sire.id_especie) !== Number(breedRows[0].id_especie))) {
      throw new Error('el padre registrado debe ser macho y de la misma especie que la cría');
    }
    const [created] = await connection.execute<ResultSetHeader>("INSERT INTO animales (id_corral,id_raza,identificador,nombre,foto,genero,fecha_nacimiento,estado_salud,activo) VALUES (?,?,?,?,?,?,?,'sano',1)", [corralId, breedId, identifier, name || null, photo, gender, date]);
    await connection.execute('INSERT INTO nacimientos (id_cria,id_madre,madre_texto,id_padre,padre_texto,fecha,id_usuario,observaciones) VALUES (?,?,?,?,?,?,?,?)', [created.insertId, motherId, motherText || null, fatherId, fatherText || null, date, userId, notes || null]);
    await connection.execute('INSERT INTO auditoria_cambios (entidad,id_entidad,accion,id_usuario,detalle) VALUES (?,?,?,?,?)', ['animal', created.insertId, 'nacimiento', userId, JSON.stringify({ madre: motherId ?? motherText, padre: fatherId ?? fatherText, fecha: date })]);
    await connection.commit(); res.status(201).json({ data: { id_animal: created.insertId } });
  } catch (error) {
    await connection.rollback(); const message = error instanceof Error ? error.message : 'no se pudo registrar el nacimiento';
    res.status(409).json({ message });
  } finally { connection.release(); }
}

// normalizo nombres para comparar etiquetas de eventos y del catálogo local.
function normalizeEventTag(value: unknown): string {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('es');
}

// acepto nombres de razas equivalentes cuando la asociación usa un nombre más largo.
function eventTagMatches(left: string, right: string): boolean {
  const stopWords = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'caballo', 'caballos', 'bovina', 'raza', 'criador', 'criadores']);
  const singularize = (word: string) => word.length > 4 && word.endsWith('s') ? word.slice(0, -1) : word;
  const leftWords = left.split(/\s+/).filter((word) => word && !stopWords.has(word)).map(singularize);
  const rightWords = right.split(/\s+/).filter((word) => word && !stopWords.has(word)).map(singularize);
  return Boolean(leftWords.length && rightWords.length && (leftWords.every((word) => rightWords.includes(word)) || rightWords.every((word) => leftWords.includes(word))));
}

// devuelvo eventos oficiales y priorizo las especies y razas activas de la estancia.
export async function listEvents(req: Request, res: Response): Promise<void> {
  try {
    const [legacyRows] = await database.execute<RowDataPacket[]>(
      `SELECT CONCAT('local-',id_evento) AS id_evento,titulo,descripcion,fecha_inicio,fecha_fin,
              ubicacion,fuente,url,tipo_evento,provincia,localidad,organizador,especie,raza
       FROM eventos_campo WHERE fecha_inicio >= DATE_SUB(CURRENT_DATE, INTERVAL 180 DAY)
       ORDER BY fecha_inicio LIMIT 800`,
    );
    const [importedRows] = await database.execute<RowDataPacket[]>(
      `SELECT CONCAT('fuente-',i.id_evento_importado) AS id_evento,i.titulo,i.descripcion,
              i.fecha_inicio,i.fecha_fin,i.ubicacion,f.nombre AS fuente,COALESCE(i.url,f.url) AS url,i.tipo_evento,
              i.provincia,i.localidad,i.organizador,i.especie,i.raza
       FROM eventos_importados i JOIN fuentes_eventos f ON f.codigo_fuente=i.codigo_fuente
       WHERE f.habilitada=1 AND i.fecha_inicio >= DATE_SUB(CURRENT_DATE, INTERVAL 180 DAY)
       ORDER BY i.fecha_inicio LIMIT 1600`,
    );
    const [catalogRows] = await database.execute<RowDataPacket[]>(
      `SELECT DISTINCT e.nombre AS especie,r.nombre AS raza
       FROM animales a JOIN razas r ON r.id_raza=a.id_raza JOIN especies e ON e.id_especie=r.id_especie
       WHERE a.activo=1 ORDER BY e.nombre,r.nombre`,
    );
    const [sourceRows] = await database.execute<RowDataPacket[]>(
      `SELECT f.nombre,f.url,f.especie,f.raza,f.consultada_en,f.ultimo_error,s.estado,s.eventos_leidos
       FROM fuentes_eventos f
       LEFT JOIN sincronizaciones_eventos s ON s.id_sincronizacion=(
         SELECT MAX(s2.id_sincronizacion) FROM sincronizaciones_eventos s2 WHERE s2.codigo_fuente=f.codigo_fuente
       )
       WHERE f.habilitada=1 ORDER BY f.nombre`,
    );
    const allEvents = [...legacyRows, ...importedRows];
    const relevantOnly = req.query.todos !== '1';
    const activeSpecies = new Set(catalogRows.map((item) => normalizeEventTag(item.especie)));
    const activeBreeds = new Set(catalogRows.map((item) => normalizeEventTag(item.raza)));
    const events = allEvents.filter((event) => {
      const species = normalizeEventTag(event.especie);
      const breed = normalizeEventTag(event.raza);
      if (!species && !breed) return true;
      const speciesMatches = species ? [...activeSpecies].some((tag) => eventTagMatches(species, tag)) : true;
      if (!speciesMatches) return false;
      if (!relevantOnly || !breed) return true;
      return [...activeBreeds].some((tag) => eventTagMatches(breed, tag));
    });
    res.json({ data: {
      eventos: events,
      especies: [...new Set(catalogRows.map((item) => String(item.especie)))],
      razas: [...new Set(catalogRows.map((item) => String(item.raza)))],
      provincias: [...new Set(events.map((item) => String(item.provincia ?? '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es')),
      total_nacional: allEvents.length,
      fuentes: sourceRows,
    } });
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
    if (code === 'ER_BAD_FIELD_ERROR' || code === 'ER_NO_SUCH_TABLE') {
      try {
        const [rows] = await database.execute<RowDataPacket[]>(
          `SELECT CONCAT('local-',id_evento) AS id_evento,titulo,descripcion,fecha_inicio,fecha_fin,ubicacion,fuente,url
           FROM eventos_campo WHERE fecha_inicio >= DATE_SUB(CURRENT_DATE, INTERVAL 180 DAY)
           ORDER BY fecha_inicio LIMIT 800`,
        );
        res.json({ data: { eventos: rows.map((row) => ({ ...row, tipo_evento: null, provincia: null, localidad: null, organizador: null, especie: null, raza: null })), especies: [], razas: [], provincias: [], total_nacional: rows.length, fuentes: [] } });
        return;
      } catch { /* informo abajo si tampoco está disponible la tabla base de eventos. */ }
    }
    res.status(500).json({ message: 'No se pudieron cargar los eventos. Intentá de nuevo más tarde.' });
  }
}
