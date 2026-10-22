// presento el acceso y la sesión inicial de estanciaapp en dispositivos móviles.
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { login } from './src/services/authApi';
import { initializeOfflineDatabase } from './src/services/offlineDatabase';
import { getSession, removeSession, saveSession } from './src/services/sessionStorage';
import type { Session } from './src/types/auth';

const palette = {
  background: '#f2f6f0',
  surface: '#ffffff',
  primary: '#1c5d3a',
  text: '#183126',
  muted: '#63736a',
  danger: '#a93737',
  border: '#d6e0d8',
};

// muestro el flujo de sesión persistente y el acceso al panel según el usuario.
export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // restauro la sesión cifrada cuando la aplicación se monta.
  useEffect(() => {
    // cargo la sesión sin bloquear la interfaz.
    async function restoreSession(): Promise<void> {
      try {
        setSession(await getSession());
      } finally {
        setIsRestoring(false);
      }
    }

    void restoreSession();
  }, []);

  // preparo sqlite y observo la red para informar el estado de sincronización.
  useEffect(() => {
    // inicializo las tablas locales antes de usar la cola offline.
    void initializeOfflineDatabase().catch(() => setMessage('no se pudo preparar el almacenamiento local'));
    // actualizo la interfaz cada vez que cambia la conectividad del dispositivo.
    const unsubscribe = NetInfo.addEventListener((state) => setIsOnline(Boolean(state.isConnected)));

    return unsubscribe;
  }, []);

  // valido el formulario e inicio una sesión real contra el backend.
  async function handleLogin(): Promise<void> {
    if (!email.trim() || !password) {
      setMessage('completá el correo y la contraseña para continuar');
      return;
    }

    setIsSubmitting(true);

    try {
      const nextSession = await login({ email, password });
      await saveSession(nextSession);
      setSession(nextSession);
      setPassword('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'no se pudo iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  }

  // cierro sesión y elimino los tokens almacenados en el dispositivo.
  async function handleLogout(): Promise<void> {
    await removeSession();
    setSession(null);
  }

  if (isRestoring) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={palette.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {!isOnline ? <View style={styles.offlineBanner}><Text style={styles.offlineText}>sin conexión: tus cambios de campo se guardarán para sincronizarse después</Text></View> : null}
      {session ? (
        <View style={styles.card}>
          <Text style={styles.eyebrow}>estanciaapp</Text>
          <Text style={styles.title}>hola, {session.usuario.nombre}</Text>
          <Text style={styles.subtitle}>
            Ingresaste como {session.usuario.rol}. El panel de gestión estará adaptado a tus permisos.
          </Text>
          <Pressable style={styles.secondaryButton} onPress={() => void handleLogout()}>
            <Text style={styles.secondaryButtonText}>cerrar sesión</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.eyebrow}>gestión de campo</Text>
          <Text style={styles.title}>bienvenida</Text>
          <Text style={styles.subtitle}>Ingresá para administrar tu estancia desde cualquier lugar.</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="correo electrónico"
            placeholderTextColor={palette.muted}
            style={styles.input}
            value={email}
          />
          <TextInput
            autoComplete="password"
            onChangeText={setPassword}
            placeholder="contraseña"
            placeholderTextColor={palette.muted}
            secureTextEntry
            style={styles.input}
            value={password}
          />
          <Pressable
            disabled={isSubmitting}
            onPress={() => void handleLogin()}
            style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
          >
            {isSubmitting ? <ActivityIndicator color={palette.surface} /> : <Text style={styles.primaryButtonText}>iniciar sesión</Text>}
          </Pressable>
        </View>
      )}
      <Modal animationType="fade" onRequestClose={() => setMessage(null)} transparent visible={Boolean(message)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>revisá la información</Text>
            <Text style={styles.modalMessage}>{message}</Text>
            <Pressable onPress={() => setMessage(null)} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>entendido</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    justifyContent: 'center',
    padding: 24,
  },
  offlineBanner: { backgroundColor: '#fff4df', borderRadius: 10, marginBottom: 12, padding: 12 },
  offlineText: { color: palette.text, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  loading: { alignItems: 'center', backgroundColor: palette.background, flex: 1, justifyContent: 'center' },
  card: { backgroundColor: palette.surface, borderRadius: 24, gap: 16, padding: 24 },
  eyebrow: { color: palette.primary, fontSize: 14, fontWeight: '700', textTransform: 'uppercase' },
  title: { color: palette.text, fontSize: 32, fontWeight: '700' },
  subtitle: { color: palette.muted, fontSize: 16, lineHeight: 23 },
  input: { borderColor: palette.border, borderRadius: 12, borderWidth: 1, color: palette.text, fontSize: 16, padding: 15 },
  primaryButton: { alignItems: 'center', backgroundColor: palette.primary, borderRadius: 12, minHeight: 52, justifyContent: 'center', paddingHorizontal: 16 },
  primaryButtonText: { color: palette.surface, fontSize: 16, fontWeight: '700' },
  secondaryButton: { alignItems: 'center', borderColor: palette.primary, borderRadius: 12, borderWidth: 1, minHeight: 52, justifyContent: 'center' },
  secondaryButtonText: { color: palette.primary, fontSize: 16, fontWeight: '700' },
  disabledButton: { opacity: 0.65 },
  modalBackdrop: { alignItems: 'center', backgroundColor: 'rgba(10, 28, 17, 0.55)', flex: 1, justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: palette.surface, borderRadius: 20, gap: 16, padding: 24, width: '100%' },
  modalTitle: { color: palette.text, fontSize: 20, fontWeight: '700' },
  modalMessage: { color: palette.danger, fontSize: 16, lineHeight: 22 },
});
