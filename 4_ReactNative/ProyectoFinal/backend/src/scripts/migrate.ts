import { readFile } from 'node:fs/promises';
import type { RowDataPacket } from 'mysql2';
import type { PoolConnection } from 'mysql2/promise';
import { database } from '../config/database.js';

// Solo migraciones aditivas; excluye los scripts que limpian datos operativos.
const migrations = [
  '2026-10-22-animal-movements.sql',
  '2026-10-22-nursing-discharge.sql',
  '2026-10-24-production-modules.sql',
];

async function applyStatement(connection: PoolConnection, statement: string): Promise<void> {
  const column = /^ALTER TABLE\s+`?(\w+)`?\s+ADD COLUMN\s+(?:IF NOT EXISTS\s+)?`?(\w+)`?/i.exec(statement);
  if (column) {
    const [existing] = await connection.execute<RowDataPacket[]>(
      'SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
      [column[1], column[2]],
    );
    if (existing.length) return;
    // MySQL no admite ADD COLUMN IF NOT EXISTS; MariaDB sí.
    await connection.query(statement.replace(/ADD COLUMN\s+IF NOT EXISTS\s+/i, 'ADD COLUMN '));
    return;
  }
  if (!/^CREATE TABLE IF NOT EXISTS\s/i.test(statement)) {
    throw new Error('la migración contiene una operación no aditiva');
  }
  await connection.query(statement);
}

async function migrate(): Promise<void> {
  let connection: PoolConnection | undefined;
  let locked = false;
  try {
    connection = await database.getConnection();
    const [lock] = await connection.query<RowDataPacket[]>(
      "SELECT GET_LOCK('estancia_app:operational_migrations', 15) AS acquired",
    );
    locked = Number(lock[0]?.acquired) === 1;
    if (!locked) throw new Error('otra actualización de la base está en curso');

    for (const file of migrations) {
      const source = await readFile(new URL(`../../migrations/${file}`, import.meta.url), 'utf8');
      // Estos archivos contienen sentencias simples, sin procedimientos ni delimitadores especiales.
      const statements = source.replace(/^\s*--.*$/gm, '').split(';').map((sql) => sql.trim()).filter(Boolean);
      for (const statement of statements) await applyStatement(connection, statement);
      console.info(`Migración lista: ${file}`);
    }
    console.info('Base operativa actualizada. Los registros existentes se conservaron.');
  } finally {
    try {
      if (locked && connection) await connection.query("SELECT RELEASE_LOCK('estancia_app:operational_migrations')");
    } finally {
      connection?.release();
      await database.end();
    }
  }
}

void migrate().catch((error: unknown) => {
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'MIGRATION_FAILED';
  console.error(`No se pudo actualizar la base (${code}). Revisá la conexión y los permisos de la base configurada.`);
  process.exitCode = 1;
});
