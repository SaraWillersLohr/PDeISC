import '../backend/node_modules/dotenv/config.js';
import mysql from '../backend/node_modules/mysql2/promise.js';
import { readFile } from 'node:fs/promises';

const sql = await readFile(new URL('../backend/migrations/002_password_recovery.sql', import.meta.url), 'utf8');
const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? {} : undefined,
  multipleStatements: true,
});
await connection.query(sql);
await connection.end();
console.log('PASSWORD_RECOVERY_MIGRATION_OK');
