import { database } from '../config/database.js';
// traslado un animal activo y guardo su origen, destino, usuario y fecha.
export async function moveAnimal(req, res) {
    const animalId = Number(req.params.id);
    const destinationId = Number(req.body.id_corral_destino);
    const userId = req.usuario?.id_usuario;
    const notes = typeof req.body.observaciones === 'string' ? req.body.observaciones.trim().slice(0, 500) : null;
    if (!Number.isInteger(animalId) || animalId < 1 || !Number.isInteger(destinationId) || destinationId < 1 || !userId) {
        res.status(400).json({ message: 'indicá un animal y un corral de destino válidos' });
        return;
    }
    let connection;
    try {
        const transaction = await database.getConnection();
        connection = transaction;
        await transaction.beginTransaction();
        const [corrals] = await transaction.execute('SELECT capacidad, nombre, activo, es_enfermeria FROM corrales WHERE id_corral = ? FOR UPDATE', [destinationId]);
        const destination = corrals[0];
        if (!destination || !destination.activo)
            throw new Error('el corral de destino no está activo');
        const [animals] = await transaction.execute(`SELECT a.id_animal, a.id_corral, a.activo, a.estado_salud, c.es_enfermeria AS origen_enfermeria
       FROM animales a JOIN corrales c ON c.id_corral = a.id_corral WHERE a.id_animal = ? FOR UPDATE`, [animalId]);
        const animal = animals[0];
        if (!animal || !animal.activo)
            throw new Error('el animal no está activo y no se puede trasladar');
        if (animal.id_corral === destinationId)
            throw new Error('el animal ya está asignado a ese corral');
        // conservo el alta veterinaria como requisito para sacar un animal de enfermería.
        let pendingDischargeId = null;
        if (animal.origen_enfermeria && !destination.es_enfermeria) {
            const [discharges] = await transaction.execute('SELECT id_alta FROM altas_enfermeria WHERE id_animal = ? AND id_movimiento IS NULL ORDER BY fecha_alta DESC LIMIT 1 FOR UPDATE', [animalId]);
            if (req.rolVigente === 'peon' && !discharges.length) {
                throw new Error('el veterinario debe registrar el alta antes del traslado');
            }
            if (discharges.length) {
                pendingDischargeId = Number(discharges[0].id_alta);
            }
        }
        const [counts] = await transaction.execute('SELECT COUNT(*) AS ocupacion FROM animales WHERE id_corral = ? AND activo = 1', [destinationId]);
        if (Number(counts[0]?.ocupacion ?? 0) >= destination.capacidad)
            throw new Error('el corral de destino alcanzó su capacidad');
        const [movement] = await transaction.execute(`INSERT INTO movimientos_animales (id_animal, id_corral_origen, id_corral_destino, id_usuario, observaciones)
       VALUES (?, ?, ?, ?, ?)`, [animalId, animal.id_corral, destinationId, userId, notes]);
        if (pendingDischargeId) {
            await transaction.execute('UPDATE altas_enfermeria SET id_movimiento = ?, fecha_traslado = CURRENT_TIMESTAMP WHERE id_alta = ?', [movement.insertId, pendingDischargeId]);
        }
        const newHealthStatus = destination.es_enfermeria
            ? animal.estado_salud === 'sano' ? 'enfermo' : animal.estado_salud
            : animal.origen_enfermeria && pendingDischargeId ? 'sano' : animal.estado_salud;
        await transaction.execute('UPDATE animales SET id_corral = ?, estado_salud = ?, version_dato = version_dato + 1 WHERE id_animal = ?', [destinationId, newHealthStatus, animalId]);
        if (newHealthStatus !== animal.estado_salud) {
            await transaction.execute('INSERT INTO historial_estado_salud (id_animal, id_usuario, estado_anterior, estado_nuevo, observaciones) VALUES (?, ?, ?, ?, ?)', [animalId, userId, animal.estado_salud, newHealthStatus, destination.es_enfermeria ? `Ingreso a enfermería: ${notes || 'sin observaciones'}` : 'Traslado físico posterior al alta médica']);
        }
        if (req.rolVigente === 'peon') {
            const nursingEntry = Boolean(destination.es_enfermeria);
            const recipients = nursingEntry ? ['dueno', 'administrador', 'veterinario'] : ['dueno', 'administrador'];
            const title = nursingEntry ? 'Animal ingresó a enfermería' : 'Traslado de animal realizado';
            const message = nursingEntry
                ? `${animal.identificador}: ingresó a ${destination.nombre} con estado ${newHealthStatus}. ${notes ? `Observación del peón: ${notes}` : 'El veterinario puede revisar el caso en enfermería.'}`
                : `${animal.identificador}: fue trasladado desde su corral anterior a ${destination.nombre}.`;
            for (const role of recipients) {
                await transaction.execute('INSERT INTO notificaciones (id_animal, titulo, mensaje, tipo, rol_destino) VALUES (?, ?, ?, ?, ?)', [animalId, title, message, nursingEntry ? 'ingreso_enfermeria' : 'movimiento_animal', role]);
            }
        }
        await transaction.commit();
        res.status(201).json({ message: 'traslado registrado', data: { id_animal: animalId, id_corral_destino: destinationId, corral_destino: destination.nombre } });
    }
    catch (error) {
        if (connection)
            await connection.rollback();
        const message = error instanceof Error ? error.message : 'no se pudo registrar el traslado';
        res.status(message.includes('no está') || message.includes('ya está') || message.includes('alcanzó') || message.includes('el veterinario debe') ? 409 : 500).json({ message });
    }
    finally {
        connection?.release();
    }
}
