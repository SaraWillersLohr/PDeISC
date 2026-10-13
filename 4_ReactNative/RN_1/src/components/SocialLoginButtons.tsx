// Archivo src/components/SocialLoginButtons.tsx: los botones para iniciar o registrar una cuenta con un proveedor social. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SocialProviderId } from '../services/authApi';

const PROVIDERS: Record<SocialProviderId, { label: string; mark: string; color: string; ink: string }> = {
  google: { label: 'Google', mark: 'G', color: '#fff', ink: '#4285f4' },
  facebook: { label: 'Facebook', mark: 'f', color: '#1877f2', ink: '#fff' },
  github: { label: 'GitHub', mark: '⌘', color: '#24292f', ink: '#fff' },
  discord: { label: 'Discord', mark: '◉', color: '#5865f2', ink: '#fff' },
  twitch: { label: 'Twitch', mark: '▣', color: '#9146ff', ink: '#fff' },
  twitter: { label: 'X', mark: '𝕏', color: '#111', ink: '#fff' },
};
// Esta función renderiza el componente reutilizable SocialLoginButtons, usando sus props para mostrar estado y comunicar acciones al componente padre. Recibe providers, rememberMe, onSelect, intent = 'login' como entrada.
export function SocialLoginButtons({ providers, rememberMe, onSelect, intent = 'login' }: {
  providers: SocialProviderId[];
  rememberMe: boolean;
  onSelect: (provider: SocialProviderId, remember: boolean) => void;
  intent?: 'login' | 'register';
}) {
  if (!providers.length) return null;
  return <View style={styles.section}>
    <View style={styles.divider}><View style={styles.rule} /><Text style={styles.dividerText}>{intent === 'register' ? 'O REGISTRATE CON' : 'O CONTINUÁ CON'}</Text><View style={styles.rule} /></View>
    <View style={styles.grid}>{providers.map((id) => {
      const item = PROVIDERS[id];
      return <Pressable key={id} accessibilityRole="button" accessibilityLabel={`${intent === 'register' ? 'Registrarme' : 'Continuar'} con ${item.label}`} onPress={() => onSelect(id, rememberMe)} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <View style={[styles.mark, { backgroundColor: item.color }]}><Text style={[styles.markText, { color: item.ink }]}>{item.mark}</Text></View>
        <Text style={styles.label}>{intent === 'register' ? 'Registrarme' : 'Continuar'} con {item.label}</Text>
      </Pressable>;
    })}</View>
  </View>;
}

const styles = StyleSheet.create({
  section: { marginTop: 8 }, divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 18 }, rule: { flex: 1, height: 1, backgroundColor: '#e7ebe5' }, dividerText: { color: '#89918a', fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 }, button: { flexDirection: 'row', alignItems: 'center', gap: 9, flexGrow: 1, flexBasis: '45%', minWidth: 140, minHeight: 48, paddingHorizontal: 10, borderWidth: 1, borderColor: '#e4e9e3', backgroundColor: '#fff', borderRadius: 12 }, pressed: { backgroundColor: '#f3f6f2', borderColor: '#b6c8b8' }, mark: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, markText: { fontWeight: '900', fontSize: 15 }, label: { color: '#344239', fontSize: 12, fontWeight: '700', flexShrink: 1 },
});
