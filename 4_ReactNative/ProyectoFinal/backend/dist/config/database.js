// creo un pool de mariadb reutilizable para las consultas del backend.
import mysql from 'mysql2/promise';
import { env } from './env.js';
// configuro conexiones seguras según el entorno declarado.
export const database = mysql.createPool({
    host: env.database.host,
    port: env.database.port,
    user: env.database.user,
    password: env.database.password,
    database: env.database.name,
    waitForConnections: true,
    connectionLimit: 10,
    ssl: env.database.ssl ? { rejectUnauthorized: true } : undefined,
    connectTimeout: 10_000,
    queueLimit: 20,
});
