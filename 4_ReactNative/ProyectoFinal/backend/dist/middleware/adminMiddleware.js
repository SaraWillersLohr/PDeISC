import { database } from '../config/database.js';
// impido que un rol antiguo guardado en el jwt conserve privilegios administrativos.
export async function requireAdministrator(req, res, next) {
    const userId = req.usuario?.id_usuario;
    if (!userId) {
        res.status(401).json({ message: 'se requiere autenticación' });
        return;
    }
    try {
        const [rows] = await database.execute(`SELECT 1 AS permitido FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol
       WHERE u.id_usuario = ? AND u.activo = 1 AND u.estado_cuenta = 'activo' AND r.nombre = 'administrador' LIMIT 1`, [userId]);
        if (!rows.length) {
            res.status(403).json({ message: 'solo el administrador puede revisar solicitudes' });
            return;
        }
        next();
    }
    catch {
        res.status(503).json({ message: 'no se pudieron verificar los permisos porque la base de datos no está disponible' });
    }
}
