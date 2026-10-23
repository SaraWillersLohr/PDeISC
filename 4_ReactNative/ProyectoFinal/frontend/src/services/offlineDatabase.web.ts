// la web trabaja conectada al backend y no abre la cola SQLite móvil.
export async function initializeOfflineDatabase(): Promise<void> {
  return Promise.resolve();
}
