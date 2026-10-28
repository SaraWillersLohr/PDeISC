// adjunto una imagen comprimida opcional a formularios ganaderos.
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const MAX_BASE64_LENGTH = 1_350_000;

export function PhotoAttachment({ value, onChange, compact = false }: { value: string | null; onChange: (photo: string | null) => void; compact?: boolean }) {
  const { colors } = useTheme();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function choosePhoto(): Promise<void> {
    setBusy(true); setError('');
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) { setError('Permití el acceso a las fotos para adjuntar una imagen.'); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.35, base64: true });
      if (result.canceled) return;
      const base64 = result.assets[0]?.base64;
      if (!base64) { setError('No se pudo leer la imagen seleccionada.'); return; }
      if (base64.length > MAX_BASE64_LENGTH) { setError('La foto es muy pesada. Elegí una imagen más chica.'); return; }
      onChange(`data:image/jpeg;base64,${base64}`);
    } catch { setError('No se pudo abrir la galería de fotos.'); }
    finally { setBusy(false); }
  }

  return <View style={styles.wrap}>
    <View style={styles.row}>
      {value ? <Image source={{ uri: value }} style={[styles.preview, compact && styles.previewCompact, { borderColor: colors.border }]} /> : null}
      <Pressable accessibilityRole="button" disabled={busy} onPress={() => void choosePhoto()} style={[styles.button, { borderColor: colors.border, backgroundColor: colors.bgCardMuted }]}>
        {busy ? <ActivityIndicator color={colors.primary} size="small" /> : <Ionicons color={colors.primary} name="image-outline" size={16} />}
        <Text style={[styles.buttonText, { color: colors.primary }]}>{value ? 'Cambiar foto' : 'Agregar foto (opcional)'}</Text>
      </Pressable>
      {value ? <Pressable accessibilityLabel="Quitar foto" accessibilityRole="button" onPress={() => { onChange(null); setError(''); }} style={styles.remove}><Ionicons color={colors.textMuted} name="close-circle" size={20} /></Pressable> : null}
    </View>
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </View>;
}

const styles = StyleSheet.create({
  wrap: { marginTop: 8 }, row: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  preview: { borderRadius: 9, borderWidth: 1, height: 56, width: 74 }, previewCompact: { height: 48, width: 64 },
  button: { alignItems: 'center', borderRadius: 9, borderWidth: 1, flexDirection: 'row', gap: 7, minHeight: 40, paddingHorizontal: 11 }, buttonText: { fontSize: 11, fontWeight: '700' }, remove: { padding: 4 }, error: { color: '#b42318', fontSize: 10, marginTop: 5 },
});
