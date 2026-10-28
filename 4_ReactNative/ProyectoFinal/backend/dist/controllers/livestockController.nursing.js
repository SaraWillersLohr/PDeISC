import { database } from '../config/database.js';
import { readPhoto } from './livestockController.shared.js';
import { validBirthDate } from './livestockController.shared.js';
// listo para veterinaria los animales que siguen asignados a enfermería.
export async function listNursingAnimals(_req, res) {
    try {
        const [rows] = await database.execute(`SELECT a.id_animal, a.identificador, a.nombre, a.foto, a.estado_salud, a.peso_kg,
              c.nombre AS corral, r.nombre AS raza, e.nombre AS especie,
              EXISTS (SELECT 1 FROM altas_enfermeria h WHERE h.id_animal = a.id_animal AND h.id_movimiento IS NULL) AS alta_pendiente_traslado,
              (SELECT rs.motivo FROM reportes_sanitarios rs WHERE rs.id_animal=a.id_animal AND rs.estado='pendiente' ORDER BY rs.created_at DESC LIMIT 1) AS reporte_sanitario
       FROM animales a JOIN corrales c ON c.id_corral = a.id_corral
       JOIN razas r ON r.id_raza = a.id_raza JOIN especies e ON e.id_especie = r.id_especie
       WHERE a.activo = 1 AND c.es_enfermeria = 1 ORDER BY a.updated_at DESC`);
        res.status(200).json({ data: rows });
    }
    catch {
        res.status(500).json({ message: 'no se pudo cargar enfermería' });
    }
}
// consulto la evolución veterinaria de un animal que permanece en enfermería.
export async function listVeterinaryRecords(req, res) {
    const animalId = Number(req.params.id);
    if (!Number.isInteger(animalId) || animalId < 1) {
        res.status(400).json({ message: 'el animal indicado no es válido' });
        return;
    }
    try {
        const [animals] = await database.execute(`SELECT a.id_animal FROM animales a JOIN corrales c ON c.id_corral=a.id_corral
       WHERE a.id_animal=? AND a.activo=1 AND c.es_enfermeria=1`, [animalId]);
        if (!animals.length) {
            res.status(404).json({ message: 'el animal ya no está en enfermería' });
            return;
        }
        const [rows] = await database.execute(`SELECT timeline.* FROM (
         SELECT CONCAT('tratamiento-', t.id_tratamiento) AS id_registro, t.id_animal, t.fecha_inicio AS fecha,
                t.tipo, t.descripcion AS detalle, t.foto, t.created_at, u.nombre AS nombre_autor, u.apellido AS apellido_autor
         FROM tratamientos t JOIN usuarios u ON u.id_usuario=t.id_veterinario WHERE t.id_animal=?
         UNION ALL
         SELECT CONCAT('alta-', h.id_alta), h.id_animal, DATE(h.fecha_alta), 'alta',
                COALESCE(h.observaciones, 'Alta médica registrada'), NULL, h.created_at, u.nombre, u.apellido
         FROM altas_enfermeria h JOIN usuarios u ON u.id_usuario=h.id_veterinario WHERE h.id_animal=?
         UNION ALL
         SELECT CONCAT('reporte-', r.id_reporte_sanitario), r.id_animal, r.fecha, 'reporte_sanitario',
                r.motivo, NULL, r.created_at, u.nombre, u.apellido
         FROM reportes_sanitarios r JOIN usuarios u ON u.id_usuario=r.id_usuario WHERE r.id_animal=?
         UNION ALL
         SELECT CONCAT('estado-', h.id_historial), h.id_animal, DATE(h.created_at), 'estado_salud',
                CONCAT('Estado sanitario: ', h.estado_anterior, ' → ', h.estado_nuevo, IF(h.observaciones IS NULL, '', CONCAT('. ', h.observaciones))),
                NULL, h.created_at, u.nombre, u.apellido
         FROM historial_estado_salud h JOIN usuarios u ON u.id_usuario=h.id_usuario WHERE h.id_animal=?
         UNION ALL
         SELECT CONCAT('movimiento-', m.id_movimiento), m.id_animal, DATE(m.fecha_hora),
                IF(cd.es_enfermeria = 1, 'ingreso_enfermeria', 'movimiento'),
                CONCAT('Traslado de ', co.nombre, ' a ', cd.nombre, IF(m.observaciones IS NULL, '', CONCAT('. ', m.observaciones))),
                NULL, m.created_at, u.nombre, u.apellido
         FROM movimientos_animales m JOIN corrales co ON co.id_corral=m.id_corral_origen
         JOIN corrales cd ON cd.id_corral=m.id_corral_destino JOIN usuarios u ON u.id_usuario=m.id_usuario
         WHERE m.id_animal=?
       ) timeline ORDER BY timeline.fecha DESC, timeline.id_registro DESC`, [animalId, animalId, animalId, animalId, animalId]);
        res.status(200).json({ data: rows });
    }
    catch {
        res.status(500).json({ message: 'no se pudo cargar la evolución veterinaria' });
    }
}
// guardo una evolución fechada, con foto opcional, solo desde el rol veterinario.
export async function createVeterinaryRecord(req, res) {
    const animalId = Number(req.params.id);
    const userId = req.usuario?.id_usuario;
    const date = String(req.body.fecha ?? '');
    const type = String(req.body.tipo ?? 'nota');
    const detail = String(req.body.detalle ?? '').trim();
    const photo = readPhoto(req.body.foto);
    if (!Number.isInteger(animalId) || animalId < 1 || !userId || !validBirthDate(date) || !['tratamiento', 'nota'].includes(type) || !detail || detail.length > 5000 || photo === false) {
        res.status(400).json({ message: 'completá una fecha válida y una nota de hasta 5.000 caracteres; la foto debe ser válida y no superar 1,5 MB' });
        return;
    }
    try {
        const [animals] = await database.execute(`SELECT a.id_animal FROM animales a JOIN corrales c ON c.id_corral=a.id_corral
       WHERE a.id_animal=? AND a.activo=1 AND c.es_enfermeria=1`, [animalId]);
        if (!animals.length) {
            res.status(409).json({ message: 'solo se puede registrar la evolución de un animal activo en enfermería' });
            return;
        }
        const [result] = await database.execute('INSERT INTO tratamientos (id_animal,id_veterinario,fecha_inicio,tipo,descripcion,foto) VALUES (?,?,?,?,?,?)', [animalId, userId, date, type, detail, photo]);
        res.status(201).json({ data: { id_registro: result.insertId } });
    }
    catch {
        res.status(500).json({ message: 'no se pudo guardar la evolución veterinaria' });
    }
}
// actualizo el diagnóstico veterinario y dejo constancia visible en la evolución.
export async function updateNursingHealthStatus(req, res) {
    const animalId = Number(req.params.id);
    const veterinarianId = req.usuario?.id_usuario;
    const status = String(req.body.estado_salud ?? '');
    const notes = typeof req.body.observaciones === 'string' ? req.body.observaciones.trim().slice(0, 450) : '';
    if (!Number.isInteger(animalId) || animalId < 1 || !veterinarianId || !['enfermo', 'herido'].includes(status)) {
        res.status(400).json({ message: 'seleccioná enfermo o herido para un animal válido' });
        return;
    }
    let connection;
    try {
        const transaction = await database.getConnection();
        connection = transaction;
        await transaction.beginTransaction();
        const [animals] = await transaction.execute(`SELECT a.identificador, a.estado_salud FROM animales a JOIN corrales c ON c.id_corral=a.id_corral
       WHERE a.id_animal=? AND a.activo=1 AND c.es_enfermeria=1 FOR UPDATE`, [animalId]);
        if (!animals.length)
            throw new Error('el animal ya no está en enfermería');
        const previous = String(animals[0].estado_salud);
        if (previous !== status) {
            await transaction.execute('UPDATE animales SET estado_salud=?, version_dato=version_dato+1 WHERE id_animal=?', [status, animalId]);
            await transaction.execute('INSERT INTO historial_estado_salud (id_animal, id_usuario, estado_anterior, estado_nuevo, observaciones) VALUES (?, ?, ?, ?, ?)', [animalId, veterinarianId, previous, status, notes || 'Diagnóstico veterinario']);
            const message = `${animals[0].identificador}: el veterinario actualizó el estado sanitario de ${previous} a ${status}.${notes ? ` ${notes}` : ''}`;
            for (const role of ['dueno', 'administrador']) {
                await transaction.execute('INSERT INTO notificaciones (id_animal, titulo, mensaje, tipo, rol_destino) VALUES (?, ?, ?, \'estado_salud\', ?)', [animalId, 'Actualización veterinaria', message, role]);
            }
        }
        await transaction.commit();
        res.status(200).json({ message: previous === status ? 'el estado sanitario ya estaba actualizado' : 'diagnóstico actualizado y notificado' });
    }
    catch (error) {
        if (connection)
            await connection.rollback();
        const message = error instanceof Error ? error.message : 'no se pudo actualizar el diagnóstico';
        res.status(message.startsWith('el animal') ? 409 : 500).json({ message });
    }
    finally {
        connection?.release();
    }
}
// registro el alta médica, mantengo la ubicación y aviso al equipo de campo.
export async function dischargeNursingAnimal(req, res) {
    const animalId = Number(req.params.id);
    const veterinarianId = req.usuario?.id_usuario;
    const notes = typeof req.body.observaciones === 'string' ? req.body.observaciones.trim().slice(0, 500) : null;
    if (!Number.isInteger(animalId) || animalId < 1 || !veterinarianId) {
        res.status(400).json({ message: 'el animal indicado no es válido' });
        return;
    }
    let connection;
    try {
        const transaction = await database.getConnection();
        connection = transaction;
        await transaction.beginTransaction();
        const [animals] = await transaction.execute(`SELECT a.id_animal, a.id_corral, a.activo, a.estado_salud, a.identificador, c.es_enfermeria AS origen_enfermeria
       FROM animales a JOIN corrales c ON c.id_corral = a.id_corral WHERE a.id_animal = ? FOR UPDATE`, [animalId]);
        const animal = animals[0];
        if (!animal || !animal.activo || !animal.origen_enfermeria)
            throw new Error('el animal no está activo en enfermería');
        const [pending] = await transaction.execute('SELECT id_alta FROM altas_enfermeria WHERE id_animal = ? AND id_movimiento IS NULL LIMIT 1 FOR UPDATE', [animalId]);
        if (pending.length)
            throw new Error('el animal ya tiene un alta pendiente de traslado');
        if (animal.estado_salud !== 'sano') {
            await transaction.execute('UPDATE animales SET estado_salud = \'sano\', version_dato = version_dato + 1 WHERE id_animal = ?', [animalId]);
            await transaction.execute('INSERT INTO historial_estado_salud (id_animal, id_usuario, estado_anterior, estado_nuevo, observaciones) VALUES (?, ?, ?, \'sano\', ?)', [animalId, veterinarianId, animal.estado_salud, notes || 'Alta médica veterinaria']);
            for (const role of ['dueno', 'administrador']) {
                await transaction.execute('INSERT INTO notificaciones (id_animal, titulo, mensaje, tipo, rol_destino) VALUES (?, ?, ?, \'estado_salud\', ?)', [animalId, 'Alta médica registrada', `${animal.identificador}: alta veterinaria confirmada; estado sanitario actualizado a sano. El peón realizará el traslado físico desde enfermería.`, role]);
            }
        }
        await transaction.execute("UPDATE reportes_sanitarios SET estado='atendido' WHERE id_animal=? AND estado='pendiente'", [animalId]);
        await transaction.execute('INSERT INTO altas_enfermeria (id_animal, id_veterinario, observaciones) VALUES (?, ?, ?)', [animalId, veterinarianId, notes]);
        await transaction.execute(`INSERT INTO notificaciones (id_animal, titulo, mensaje, tipo, rol_destino)
       VALUES (?, ?, ?, 'alta_enfermeria', 'peon')`, [animalId, 'Animal listo para traslado', `${animal.identificador}: el veterinario registró el alta. El animal sigue en enfermería y espera el traslado físico del peón.`]);
        await transaction.commit();
        res.status(201).json({ message: 'alta registrada; enfermería queda pendiente del traslado del peón' });
    }
    catch (error) {
        if (connection)
            await connection.rollback();
        const message = error instanceof Error ? error.message : 'no se pudo registrar el alta';
        res.status(message.startsWith('el animal') || message.startsWith('el alta') ? 409 : 500).json({ message });
    }
    finally {
        connection?.release();
    }
}
