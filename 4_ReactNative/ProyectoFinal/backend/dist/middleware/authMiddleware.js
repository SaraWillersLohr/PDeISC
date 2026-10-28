import { database } from '../config/database.js';
import { verifyAccessToken } from '../utils/jwt.js';
// protejo una ruta y agrego el usuario autenticado a la petición.
export async function requireAuthentication(req, res, next) {
    const authorization = req.header('authorization');
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
    if (!token) {
        res.status(401).json({ message: 'se requiere autenticación' });
        return;
    }
    let user;
    try {
        user = verifyAccessToken(token);
    }
    catch {
        res.status(401).json({ message: 'la sesión no es válida o expiró' });
        return;
    }
    try {
        const [rows] = await database.execute(`SELECT u.token_version FROM usuarios u
       WHERE u.id_usuario=? AND u.activo=1 AND u.estado_cuenta='activo' LIMIT 1`, [user.id_usuario]);
        if (!rows.length || Number(rows[0].token_version) !== Number(user.token_version ?? 0)) {
            res.status(401).json({ message: 'la sesión fue cerrada o ya no es válida' });
            return;
        }
        req.usuario = user;
        next();
    }
    catch {
        res.status(503).json({ message: 'no se pudo verificar la sesión porque la base de datos no está disponible' });
    }
}
