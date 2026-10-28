// mantengo los datos de campo y la cola de cambios en sqlite para operar sin conexión.
import * as SQLite from 'expo-sqlite';
import type { CachedResource, PendingOperation } from '../types/offline';

const databaseName = 'estancia_app_local.db';

// abro la base local utilizada por la aplicación móvil.
async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  return SQLite.openDatabaseAsync(databaseName);
}

// creo las tablas locales necesarias sin reemplazar los datos ya almacenados.
export async function initializeOfflineDatabase(): Promise<void> {
  const database = await getDatabase();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS recursos_cache (
      clave TEXT PRIMARY KEY NOT NULL,
      contenido TEXT NOT NULL,
      actualizado_en TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS operaciones_pendientes (
      id_operacion TEXT PRIMARY KEY NOT NULL,
      tipo_operacion TEXT NOT NULL,
      entidad TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL,
      id_usuario INTEGER,
      ultimo_error TEXT
    );
  `);
  const columns = await database.getAllAsync<{ name: string }>('PRAGMA table_info(operaciones_pendientes)');
  if (!columns.some((column) => column.name === 'id_usuario')) await database.execAsync('ALTER TABLE operaciones_pendientes ADD COLUMN id_usuario INTEGER');
  if (!columns.some((column) => column.name === 'ultimo_error')) await database.execAsync('ALTER TABLE operaciones_pendientes ADD COLUMN ultimo_error TEXT');
}

// guardo una respuesta del servidor para mostrarla durante una conexión ausente.
export async function saveCachedResource(resource: CachedResource): Promise<void> {
  const database = await getDatabase();

  await database.runAsync(
    `INSERT INTO recursos_cache (clave, contenido, actualizado_en)
     VALUES (?, ?, ?)
     ON CONFLICT(clave) DO UPDATE SET contenido = excluded.contenido, actualizado_en = excluded.actualizado_en`,
    resource.clave,
    resource.contenido,
    resource.actualizado_en,
  );
}

// recupero un recurso local para que la pantalla continúe disponible offline.
export async function getCachedResource(clave: string): Promise<CachedResource | null> {
  const database = await getDatabase();

  return database.getFirstAsync<CachedResource>(
    'SELECT clave, contenido, actualizado_en FROM recursos_cache WHERE clave = ?',
    clave,
  );
}

// invalido una vista local después de una escritura confirmada por el servidor.
export async function removeCachedResource(clave: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM recursos_cache WHERE clave = ?', clave);
}

// agrego una acción local a la cola sin ejecutar una llamada de red.
export async function enqueueOperation(operation: PendingOperation): Promise<void> {
  const database = await getDatabase();

  await database.runAsync(
    `INSERT OR IGNORE INTO operaciones_pendientes
      (id_operacion, tipo_operacion, entidad, payload, created_at, id_usuario, ultimo_error)
     VALUES (?, ?, ?, ?, ?, ?, NULL)`,
    operation.id_operacion,
    operation.tipo_operacion,
    operation.entidad,
    operation.payload,
    operation.created_at,
    operation.id_usuario ?? null,
  );
}

// devuelvo las acciones pendientes en el mismo orden en el que fueron registradas.
export async function getPendingOperations(userId?: number): Promise<PendingOperation[]> {
  const database = await getDatabase();
  return userId == null
    ? database.getAllAsync<PendingOperation>('SELECT id_operacion,tipo_operacion,entidad,payload,created_at,id_usuario,ultimo_error FROM operaciones_pendientes ORDER BY created_at ASC')
    : database.getAllAsync<PendingOperation>('SELECT id_operacion,tipo_operacion,entidad,payload,created_at,id_usuario,ultimo_error FROM operaciones_pendientes WHERE id_usuario=? ORDER BY created_at ASC', userId);
}

export async function markPendingOperationError(id: string, message: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('UPDATE operaciones_pendientes SET ultimo_error=? WHERE id_operacion=?', message.slice(0,500), id);
}

// elimino únicamente una acción que el servidor confirmó como aplicada.
export async function removePendingOperation(idOperacion: string): Promise<void> {
  const database = await getDatabase();

  await database.runAsync('DELETE FROM operaciones_pendientes WHERE id_operacion = ?', idOperacion);
}
