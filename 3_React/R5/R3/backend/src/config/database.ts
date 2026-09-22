// pool de conexion mariadb
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// pool de conexiones reutilizable para mariadb (puerto 3307)
const pool = mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3307),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'estancia_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// verifica que la base responda � �til para health check
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('[db] error de conexión:', error);
    return false;
  }
}

export default pool;

