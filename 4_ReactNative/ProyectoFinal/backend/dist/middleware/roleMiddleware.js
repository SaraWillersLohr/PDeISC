import { database } from '../config/database.js';
// verifico que la cuenta activa tenga uno de los roles permitidos.
export function requireRoles(...allowedRoles) {
    return async (req, res, next) => {
        const userId = req.usuario?.id_usuario;
        if (!userId) {
            res.status(401).json({ message: 'se requiere autenticación' });
            return;
        }
        try {
            const [rows] = await database.execute(`SELECT r.nombre AS rol FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol
         WHERE u.id_usuario = ? AND u.activo = 1 AND u.estado_cuenta = 'activo' LIMIT 1`, [userId]);
            const storedRole = String(rows[0]?.rol ?? '');
            const role = storedRole === 'copropietario' ? 'administrador' : storedRole;
            if (!allowedRoles.includes(role)) {
                res.status(403).json({ message: 'tu perfil no puede consultar este módulo' });
                return;
            }
            req.rolVigente = role;
            next();
        }
        catch {
            res.status(503).json({ message: 'no se pudieron verificar los permisos porque la base de datos no está disponible' });
        }
    };
}
