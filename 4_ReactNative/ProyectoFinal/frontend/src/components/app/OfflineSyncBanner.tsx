// informo cuántos cambios locales esperan la confirmación del servidor.
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { getPendingOperations, removePendingOperation } from '../../services/offlineDatabase';
import { synchronizePendingOperations } from '../../services/offlineSync';

export function OfflineSyncBanner() {
  const { session } = useSession();
  const { colors } = useTheme();
  const [count, setCount] = useState(0);
  const [error, setError] = useState('');
  const [rejectedCount, setRejectedCount] = useState(0);
  const [discarding, setDiscarding] = useState(false);

  useEffect(() => {
    if (!session) return;
    let active = true;
    const refresh = async () => {
      const operations = await getPendingOperations(session.usuario.id_usuario).catch(() => []);
      if (!active) return;
      setCount(operations.length);
      const rejected = operations.filter((operation) => operation.ultimo_error);
      setRejectedCount(rejected.length);
      setError(rejected[0]?.ultimo_error ?? '');
    };
    void refresh();
    const timer = setInterval(() => { void refresh(); }, 3000);
    return () => { active = false; clearInterval(timer); };
  }, [session]);

  async function retry(): Promise<void> {
    if (!session) return;
    const message = await synchronizePendingOperations(session).catch((cause: unknown) => cause instanceof Error ? cause.message : 'No se pudo sincronizar.');
    setError(message ?? '');
    const operations = await getPendingOperations(session.usuario.id_usuario).catch(() => []);
    setCount(operations.length);
    const rejected = operations.filter((operation) => operation.ultimo_error);
    setRejectedCount(rejected.length);
    if (rejected.length) setError(rejected[0].ultimo_error ?? '');
  }

  async function discardRejected(): Promise<void> {
    if (!session || discarding) return;
    setDiscarding(true);
    try {
      const operations = await getPendingOperations(session.usuario.id_usuario);
      const rejected = operations.filter((operation) => operation.ultimo_error);
      for (const operation of rejected) await removePendingOperation(operation.id_operacion);
      const remaining = await getPendingOperations(session.usuario.id_usuario);
      setCount(remaining.length);
      const stillRejected = remaining.filter((operation) => operation.ultimo_error);
      setRejectedCount(stillRejected.length);
      setError(stillRejected[0]?.ultimo_error ?? '');
    } catch {
      setError('No se pudieron borrar los cambios rechazados.');
    } finally {
      setDiscarding(false);
    }
  }

  if (!count) return null;
  return (
    <View accessibilityLiveRegion="polite" style={[styles.wrap, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: colors.textMain }]}>{count} cambio{count === 1 ? '' : 's'} esperando sincronización</Text>
        <Text style={[styles.copy, { color: error ? colors.accentRed : colors.textMuted }]}>{error || 'Guardados en este dispositivo; se enviarán al recuperar conexión.'}</Text>
      </View>
      <View style={styles.actions}>
        {rejectedCount > 0 ? <Pressable accessibilityRole="button" accessibilityLabel="Descartar cambios rechazados" disabled={discarding} onPress={() => void discardRejected()} style={[styles.discardButton, { borderColor: colors.border }]}>
          <Text style={[styles.discardText, { color: colors.accentRed }]}>{discarding ? 'Borrando…' : 'Descartar'}</Text>
        </Pressable> : null}
        <Pressable accessibilityRole="button" onPress={() => void retry()} style={[styles.button, { backgroundColor: colors.primary }]}>
          <Text style={styles.buttonText}>Reintentar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 12, margin: 12, padding: 12 },
  title: { fontSize: 12, fontWeight: '800' },
  copy: { fontSize: 11, marginTop: 3 },
  button: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9 },
  buttonText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
  actions: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  discardButton: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 },
  discardText: { fontSize: 10, fontWeight: '700' },
});
