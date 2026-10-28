import { database } from '../config/database.js';
// obtengo las métricas de cría sin atribuir resultados a quien cargó los datos.
export async function dashboard(_req, res) {
    try {
        const [rows] = await database.execute(`SELECT (SELECT COUNT(*) FROM nacimientos WHERE YEAR(fecha) = YEAR(CURRENT_DATE())) AS crias_ano,
       (SELECT COUNT(*) FROM servicios_monta WHERE estado = 'realizado' AND fecha >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)) AS servicios_90_dias,
       (SELECT COUNT(*) FROM reportes_muerte WHERE estado = 'pendiente') AS muertes_pendientes,
       (SELECT COUNT(*) FROM reportes_muerte WHERE estado = 'confirmado' AND YEAR(fecha) = YEAR(CURRENT_DATE())) AS muertes_ano,
       (SELECT COUNT(*) FROM bajas_animales WHERE motivo = 'venta' AND YEAR(fecha) = YEAR(CURRENT_DATE())) AS ventas_ano,
       (SELECT COUNT(*) FROM animales WHERE activo = 1 AND estado_salud <> 'sano') AS alertas_sanitarias,
       (SELECT COUNT(DISTINCT s.id_madre)
        FROM servicios_monta s JOIN animales a ON a.id_animal = s.id_madre
        WHERE a.activo = 1 AND a.genero = 'hembra' AND s.prenez_confirmada_en IS NOT NULL
          AND s.fecha_estimada_nacimiento >= CURRENT_DATE()) AS hembras_prenadas`);
        res.json({ data: rows[0] });
    }
    catch {
        res.status(500).json({ message: 'No se pudieron cargar las estadísticas. Intentá de nuevo más tarde.' });
    }
}
// guardo un pesaje y actualizo el peso actual dentro de una transacción.
export async function createWeight(req, res) {
    const animalId = Number(req.params.id);
    const peso = Number(req.body.peso_kg);
    const fecha = String(req.body.fecha ?? '');
    const userId = req.usuario?.id_usuario;
    if (!Number.isInteger(animalId) || !userId || !Number.isFinite(peso) || peso <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        res.status(400).json({ message: 'indicá animal, peso válido y fecha' });
        return;
    }
    const connection = await database.getConnection();
    try {
        await connection.beginTransaction();
        const [animal] = await connection.execute('SELECT id_animal FROM animales WHERE id_animal = ? AND activo = 1 FOR UPDATE', [animalId]);
        if (!animal.length)
            throw new Error('animal no activo');
        const [result] = await connection.execute('INSERT INTO pesajes (id_animal, id_usuario, peso_kg, fecha) VALUES (?, ?, ?, ?)', [animalId, userId, peso, fecha]);
        await connection.execute('UPDATE animales SET peso_kg = ?, version_dato = version_dato + 1 WHERE id_animal = ?', [peso, animalId]);
        await connection.execute('INSERT INTO auditoria_cambios (entidad, id_entidad, accion, id_usuario, detalle) VALUES (?, ?, ?, ?, ?)', ['animal', animalId, 'pesaje', userId, JSON.stringify({ peso_kg: peso, fecha })]);
        await connection.commit();
        res.status(201).json({ data: { id_pesaje: result.insertId } });
    }
    catch (error) {
        await connection.rollback();
        res.status(409).json({ message: error instanceof Error ? error.message : 'no se pudo guardar el pesaje' });
    }
    finally {
        connection.release();
    }
}
// registro un reporte desde la ficha; la enfermedad y el ingreso a enfermería son una sola operación.
export async function createReport(req, res) {
    const kind = String(req.params.kind);
    const animalId = Number(req.body.id_animal);
    const userId = req.usuario?.id_usuario;
    const fecha = String(req.body.fecha ?? '');
    const motivo = String(req.body.motivo ?? '').trim().slice(0, 500);
    const destinationId = Number(req.body.id_corral_destino);
    const photoValue = req.body.foto;
    const photo = photoValue == null || photoValue === '' ? null : typeof photoValue === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(photoValue) && Buffer.byteLength(photoValue, 'utf8') <= 1_500_000 ? photoValue : false;
    if (!['sanitario', 'muerte'].includes(kind) || !Number.isInteger(animalId) || !userId || !/^\d{4}-\d{2}-\d{2}$/.test(fecha) || photo === false || (kind === 'sanitario' && (!Number.isInteger(destinationId) || destinationId < 1))) {
        res.status(400).json({ message: 'completá los datos del reporte y elegí enfermería como destino' });
        return;
    }
    const connection = await database.getConnection();
    try {
        await connection.beginTransaction();
        const [animals] = await connection.execute('SELECT a.id_animal,a.id_corral,a.estado_salud,a.identificador,c.es_enfermeria AS origen_enfermeria FROM animales a JOIN corrales c ON c.id_corral=a.id_corral WHERE a.id_animal = ? AND a.activo = 1 FOR UPDATE', [animalId]);
        if (!animals.length)
            throw new Error('el animal ya no está activo');
        if (kind === 'muerte') {
            const lat = req.body.latitud == null ? null : Number(req.body.latitud);
            const lon = req.body.longitud == null ? null : Number(req.body.longitud);
            if (lat === null || lon === null || !Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lon) || lon < -180 || lon > 180)
                throw new Error('la ubicación GPS es obligatoria y debe ser válida');
            await connection.execute('INSERT INTO reportes_muerte (id_animal, id_usuario, fecha, motivo, latitud, longitud, foto) VALUES (?, ?, ?, ?, ?, ?, ?)', [animalId, userId, fecha, motivo || 'Muerte notificada desde la ficha', lat, lon, photo]);
            await connection.execute('UPDATE animales SET activo = 0, version_dato = version_dato + 1 WHERE id_animal = ?', [animalId]);
        }
        else {
            const [destinations] = await connection.execute('SELECT id_corral,nombre,capacidad,activo,es_enfermeria FROM corrales WHERE id_corral=? FOR UPDATE', [destinationId]);
            const destination = destinations[0];
            if (!destination?.activo || !destination.es_enfermeria)
                throw new Error('elegí un corral de enfermería activo');
            if (Number(animals[0].id_corral) !== destinationId) {
                const [counts] = await connection.execute('SELECT COUNT(*) AS ocupacion FROM animales WHERE id_corral=? AND activo=1', [destinationId]);
                if (Number(counts[0]?.ocupacion ?? 0) >= Number(destination.capacidad))
                    throw new Error('enfermería alcanzó su capacidad');
                await connection.execute('INSERT INTO movimientos_animales (id_animal,id_corral_origen,id_corral_destino,id_usuario,observaciones) VALUES (?,?,?,?,?)', [animalId, animals[0].id_corral, destinationId, userId, motivo || 'Ingreso a enfermería por reporte sanitario']);
            }
            await connection.execute('INSERT INTO reportes_sanitarios (id_animal, id_usuario, fecha, motivo) VALUES (?, ?, ?, ?)', [animalId, userId, fecha, motivo || 'Reporte de enfermedad desde la ficha']);
            await connection.execute("UPDATE animales SET id_corral=?,estado_salud='enfermo',version_dato=version_dato+1 WHERE id_animal = ?", [destinationId, animalId]);
            if (animals[0].estado_salud !== 'enfermo')
                await connection.execute('INSERT INTO historial_estado_salud (id_animal,id_usuario,estado_anterior,estado_nuevo,observaciones) VALUES (?,?,?,?,?)', [animalId, userId, animals[0].estado_salud, 'enfermo', motivo || 'Ingreso a enfermería por reporte sanitario']);
            for (const role of ['veterinario', 'dueno', 'administrador']) {
                await connection.execute('INSERT INTO notificaciones (id_animal,titulo,mensaje,tipo,rol_destino) VALUES (?,?,?,\'reporte_sanitario\',?)', [animalId, 'Animal ingresó a enfermería', `${animals[0].identificador}: ingreso por enfermedad a ${destination.nombre}.${motivo ? ` ${motivo}` : ''}`, role]);
            }
        }
        await connection.execute('INSERT INTO auditoria_cambios (entidad, id_entidad, accion, id_usuario, detalle) VALUES (?, ?, ?, ?, ?)', ['animal', animalId, `reporte_${kind}`, userId, JSON.stringify({ fecha, motivo })]);
        await connection.commit();
        res.status(201).json({ message: kind === 'muerte' ? 'muerte notificada; baja operativa registrada y revisión pendiente' : 'enfermedad registrada y animal trasladado a enfermería' });
    }
    catch (error) {
        await connection.rollback();
        res.status(409).json({ message: error instanceof Error ? error.message : 'no se pudo guardar el reporte' });
    }
    finally {
        connection.release();
    }
}
// listo reportes de muerte y reviso confirmando la baja o reactivando el animal.
export async function reviewDeaths(req, res) {
    const userId = req.usuario?.id_usuario;
    const id = Number(req.params.id);
    const decision = String(req.body.decision);
    const notes = typeof req.body.motivo_revision === 'string' ? req.body.motivo_revision.trim().slice(0, 500) : '';
    if (req.method === 'GET') {
        try {
            const [rows] = await database.execute(`SELECT m.*, a.identificador, a.nombre, c.nombre AS corral, u.nombre AS reportado_por FROM reportes_muerte m JOIN animales a ON a.id_animal=m.id_animal JOIN corrales c ON c.id_corral=a.id_corral JOIN usuarios u ON u.id_usuario=m.id_usuario WHERE m.estado='pendiente' ORDER BY m.created_at`);
            res.json({ data: rows });
        }
        catch {
            res.status(500).json({ message: 'no se pudieron cargar las muertes pendientes' });
        }
        return;
    }
    if (!userId || !Number.isInteger(id) || !['confirmar', 'rechazar'].includes(decision) || (decision === 'rechazar' && !notes)) {
        res.status(400).json({ message: 'decisión o motivo de rechazo inválido' });
        return;
    }
    const connection = await database.getConnection();
    try {
        await connection.beginTransaction();
        const [rows] = await connection.execute('SELECT id_animal FROM reportes_muerte WHERE id_reporte = ? AND estado = \'pendiente\' FOR UPDATE', [id]);
        if (!rows.length)
            throw new Error('el reporte ya fue revisado');
        const state = decision === 'confirmar' ? 'confirmado' : 'rechazado';
        await connection.execute('UPDATE reportes_muerte SET estado = ?, id_revisor = ?, motivo_revision = ?, revisado_en = CURRENT_TIMESTAMP WHERE id_reporte = ?', [state, userId, notes || null, id]);
        if (decision === 'rechazar')
            await connection.execute('UPDATE animales SET activo = 1, version_dato = version_dato + 1 WHERE id_animal = ?', [rows[0].id_animal]);
        await connection.commit();
        res.json({ message: decision === 'confirmar' ? 'muerte confirmada' : 'animal reactivado; reporte conservado' });
    }
    catch (error) {
        await connection.rollback();
        res.status(409).json({ message: error instanceof Error ? error.message : 'no se pudo revisar el reporte' });
    }
    finally {
        connection.release();
    }
}
