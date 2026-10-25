import '../backend/node_modules/dotenv/config.js';
import mysql from '../backend/node_modules/mysql2/promise.js';

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? {} : undefined,
});
const [tables] = await connection.query(
  "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('codigos_recuperacion_password', 'usuarios') ORDER BY TABLE_NAME",
  [process.env.DB_NAME],
);
const [columns] = await connection.query(
  "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'usuarios' AND COLUMN_NAME IN ('foto_perfil', 'token_version', 'password_hash', 'estado_cuenta') ORDER BY COLUMN_NAME",
  [process.env.DB_NAME],
);
const [active] = await connection.query("SELECT COUNT(*) AS total FROM usuarios WHERE activo = 1 AND estado_cuenta = 'activo'");
console.log(JSON.stringify({
  tables: tables.map((row) => row.TABLE_NAME),
  userColumns: columns.map((row) => row.COLUMN_NAME),
  activeUsers: Number(active[0].total),
}));
await connection.end();
