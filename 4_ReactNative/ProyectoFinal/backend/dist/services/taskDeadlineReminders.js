import { database } from '../config/database.js';
import { publishLiveChange } from './liveChanges.js';
const estanciaDate = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' });
export function todayAtEstancia() {
    return estanciaDate.format(new Date());
}
export async function publishTaskDeadlineReminders() {
    const connection = await database.getConnection();
    try {
        await connection.beginTransaction();
        const [tasks] = await connection.execute(`SELECT id_tarea, titulo, id_responsable, DATE_FORMAT(fecha_vencimiento, '%d/%m/%Y') AS vencimiento
       FROM tareas
       WHERE fecha_vencimiento < ? AND estado IN ('pendiente', 'en_progreso')
         AND vencimiento_notificado_en IS NULL
       ORDER BY id_tarea FOR UPDATE`, [todayAtEstancia()]);
        for (const task of tasks) {
            const message = `La tarea «${task.titulo}» venció el ${task.vencimiento} y sigue sin completar.`;
            await connection.execute(`INSERT INTO notificaciones (titulo, mensaje, tipo, rol_destino, id_usuario_destino)
         VALUES ('Tarea vencida', ?, 'tarea_vencida', 'dueno', NULL),
                ('Tarea vencida', ?, 'tarea_vencida', 'peon', ?)`, [message, message, task.id_responsable]);
            await connection.execute('UPDATE tareas SET vencimiento_notificado_en = NOW() WHERE id_tarea = ?', [task.id_tarea]);
        }
        await connection.commit();
        if (tasks.length)
            publishLiveChange();
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
}
