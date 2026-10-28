// aplico de forma ordenada las migraciones aditivas y registro cuáles ya se ejecutaron.
import { readFile } from 'node:fs/promises';
import type { RowDataPacket } from 'mysql2';
import type { PoolConnection } from 'mysql2/promise';
import { database } from '../config/database.js';

// Solo migraciones aditivas; excluye los scripts que limpian datos operativos.
const migrations = [
  '2026-10-22-registration-flow.sql',
  '2026-10-22-animal-movements.sql',
  '2026-10-22-nursing-discharge.sql',
  '2026-10-24-user-profile.sql',
  '2026-10-24-production-modules.sql',
  '002_password_recovery.sql',
  '2026-10-26-pregnancy-estimates.sql',
  '2026-10-26-animal-gender.sql',
  '2026-10-26-notification-center.sql',
  '2026-10-26-animal-photos-veterinary-records.sql',
  '2026-10-26-health-status-history.sql',
  '2026-10-26-animal-deactivations.sql',
  '2026-10-26-offline-sync.sql',
  '2026-10-26-events-calendar.sql',
  '2026-10-26-event-source-expansion.sql',
];

async function applyStatement(connection: PoolConnection, statement: string): Promise<void> {
  // Extiende el enum existente sin quitar ninguno de sus valores actuales.
  if (/^ALTER TABLE\s+`?servicios_monta`?\s+MODIFY COLUMN\s+`?estado`?\s+ENUM\('programado','realizado','anulado','preñada'\) NOT NULL DEFAULT 'realizado'$/i.test(statement)) {
    await connection.query(statement);
    return;
  }
  const normalizedStatement = statement.replace(/ADD COLUMN\s+IF NOT EXISTS\s+/i, 'ADD COLUMN ');
  const column = /^ALTER TABLE\s+`?(\w+)`?\s+ADD COLUMN\s+`?(\w+)`?/i.exec(normalizedStatement);
  if (column) {
    const [existing] = await connection.execute<RowDataPacket[]>(
      'SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND BINARY TABLE_NAME = BINARY ? AND BINARY COLUMN_NAME = BINARY ?',
      [column[1], column[2]],
    );
    if (existing.length) return;
    // MySQL no admite ADD COLUMN IF NOT EXISTS; MariaDB sí.
    await connection.query(normalizedStatement);
    return;
  }
  // Las dos migraciones de agenda cargan fuentes por clave y pueden repetirse.
  if (/^INSERT INTO\s+fuentes_eventos\s*\(/i.test(statement) && /\bON DUPLICATE KEY UPDATE\b/i.test(statement)) {
    await connection.query(statement);
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

    await connection.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      nombre VARCHAR(160) NOT NULL PRIMARY KEY,
      aplicado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    for (const file of migrations) {
      const [applied] = await connection.execute<RowDataPacket[]>('SELECT nombre FROM schema_migrations WHERE nombre=?', [file]);
      if (applied.length) { console.info(`Migración ya registrada: ${file}`); continue; }
      const source = await readFile(new URL(`../../migrations/${file}`, import.meta.url), 'utf8');
      // Estos archivos contienen sentencias simples, sin procedimientos ni delimitadores especiales.
      const statements = source.replace(/^\s*--.*$/gm, '').split(';').map((sql) => sql.trim()).filter(Boolean);
      for (const statement of statements) {
        try { await applyStatement(connection, statement); }
        catch (error) {
          console.error(`Falló ${file}: ${statement.replace(/\s+/g, ' ').slice(0, 180)}`);
          throw error;
        }
      }
      await connection.execute('INSERT INTO schema_migrations (nombre) VALUES (?)', [file]);
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
