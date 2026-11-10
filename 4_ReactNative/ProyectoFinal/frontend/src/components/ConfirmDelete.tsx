// Confirmación compartida para acciones destructivas en cualquier rol y plataforma.
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { FormDialog } from './FormDialog';
import { useTheme } from '../context/ThemeContext';
export function ConfirmDelete({ visible, detail, busy = false, error, onConfirm, onCancel }: {
  visible: boolean; detail: string; busy?: boolean; error?: string; onConfirm: () => void; onCancel: () => void;
}) {
  const { colors } = useTheme();
  return <Modal transparent visible={visible} animationType="fade" onRequestClose={() => { if (!busy) onCancel(); }}>
    <View style={styles.backdrop}><FormDialog style={[styles.dialog, { backgroundColor: colors.bgCard }]}>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.textMain }]}>¿Estás seguro de que deseás borrar?</Text>
      <Text style={{ color: colors.textSecondary }}>{detail}</Text>
      {error ? <Text accessibilityRole="alert" style={{ color: colors.accentRed }}>{error}</Text> : null}
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" disabled={busy} onPress={onConfirm} style={[styles.button, { backgroundColor: '#b83232' }]}><Text style={[styles.buttonText, { color: '#fff' }]}>{busy ? 'Borrando…' : 'Sí, borrar'}</Text></Pressable>
        <Pressable accessibilityRole="button" disabled={busy} onPress={onCancel} style={[styles.button, { backgroundColor: colors.bgCardMuted }]}><Text style={[styles.buttonText, { color: colors.textMain }]}>Cancelar</Text></Pressable>
      </View>
    </FormDialog></View>
  </Modal>;
}
const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: 'rgba(0,0,0,0.45)' },
  dialog: { width: '100%', maxWidth: 520, borderRadius: 16, padding: 20, gap: 14 },
  title: { fontSize: 18, fontWeight: '700' }, actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', gap: 12, marginTop: 6 },
  // La misma base evita desniveles; se apilan cuando no caben dos botones.
  button: { flexGrow: 1, flexBasis: 150, minHeight: 48, maxWidth: '100%', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 15, fontWeight: '700', textAlign: 'center', flexShrink: 1 },
});
