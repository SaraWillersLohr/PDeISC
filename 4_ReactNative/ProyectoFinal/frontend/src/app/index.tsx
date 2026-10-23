// restauro la sesión y presento el acceso conectado al backend.
import NetInfo from '@react-native-community/netinfo';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ImageBackground, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { login } from '../services/authApi';
import { initializeOfflineDatabase } from '../services/offlineDatabase';
import { removeSession, saveSession } from '../services/sessionStorage';
import type { Session } from '../types/auth';
import { useSession } from '../context/SessionContext';
import { BrandWordmark } from '../components/BrandWordmark';
import { BrandLoadingScreen } from '../components/BrandLoadingScreen';

const colors = { green: '#214d35', greenSoft: '#e7eee5', ink: '#1d2b21', muted: '#748076', line: '#e3e8e1', canvas: '#f4f6f1', white: '#fff', red: '#9b3d36' };

export default function AccessScreen() {
  const { setSession, session: activeSession, restoring } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [online, setOnline] = useState(true);

  useEffect(() => {
    void initializeOfflineDatabase().catch(() => undefined);
    const unsubscribe = NetInfo.addEventListener((state) => setOnline(Boolean(state.isConnected)));
    return unsubscribe;
  }, []);

  useEffect(() => { if (activeSession) router.replace('/(app)'); }, [activeSession]);

  async function submit(): Promise<void> {
    if (!email.trim() || !password) { setMessage('Completá tu correo y contraseña para continuar.'); return; }
    setBusy(true);
    try {
      const session: Session = await login({ email: email.trim(), password });
      if (remember) await saveSession(session);
      else await removeSession();
      setSession(session);
      setPassword('');
      router.replace('/(app)');
    } catch (error) {
      const detail = error instanceof Error ? error.message : '';
      const connectionFailure = /fetch failed|network request failed|connectexception|failed to connect/i.test(detail);
      setMessage(connectionFailure
        ? 'No pudimos conectar con el servidor. Revisá que el teléfono y la computadora estén en la misma Wi‑Fi y que la API esté activa.'
        : detail || 'No se pudo iniciar sesión. Revisá la conexión e intentá de nuevo.');
    } finally { setBusy(false); }
  }

  if (restoring || activeSession) return <BrandLoadingScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.accessPage}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.brandRow}><BrandWordmark /></View>
        <ImageBackground imageStyle={styles.heroImage} resizeMode="cover" source={require('../../assets/login-field.png')} style={styles.hero}>
          <View style={styles.heroOverlay}><View style={styles.heroContent}><Text style={styles.heroKicker}>GESTIÓN DE CAMPO</Text><Text style={styles.heroTitle}>Tu estancia,{ '\n' }siempre cerca.</Text><Text style={styles.heroCopy}>La información de tu equipo y tus animales, en un solo lugar.</Text></View></View>
        </ImageBackground>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Ingresá a tu cuenta</Text><Text style={styles.formCopy}>Usá el correo asociado a tu estancia.</Text>
          <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
          <TextInput autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="nombre@estancia.com" placeholderTextColor="#9aa39b" style={styles.input} value={email} />
          <Text style={styles.label}>CONTRASEÑA</Text>
          <TextInput autoComplete="password" onChangeText={setPassword} onSubmitEditing={() => void submit()} placeholder="Tu contraseña" placeholderTextColor="#9aa39b" secureTextEntry style={styles.input} value={password} />
          <View style={styles.rememberRow}><View style={styles.rememberLabel}><Switch onValueChange={setRemember} thumbColor={colors.white} trackColor={{ false: '#cbd2ca', true: colors.green }} value={remember} /><Text style={styles.rememberText}>Mantener sesión iniciada</Text></View><Pressable accessibilityRole="button" onPress={() => setMessage('La recuperación de contraseña todavía no está configurada. Contactá al administrador de la estancia.')}><Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text></Pressable></View>
          <Pressable accessibilityRole="button" disabled={busy} onPress={() => void submit()} style={[styles.primaryButton, busy && { opacity: 0.7 }]}>{busy ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryButtonText}>Ingresar <Text style={styles.arrow}>→</Text></Text>}</Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push('/register')} style={styles.authLink}><Text style={styles.authLinkText}>¿No tenés cuenta? Solicitá acceso</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push('/access')} style={styles.authLink}><Text style={styles.authLinkText}>¿Aprobaron tu solicitud? Ingresá el código</Text></Pressable>
          <Text style={styles.footerNote}>Acceso protegido · Los permisos dependen de tu perfil</Text>
        </View>
        <Text style={styles.version}>ESTANCIAAPP · GESTIÓN GANADERA</Text>
      </ScrollView>
      </KeyboardAvoidingView>
      {!online && <View style={styles.offlineBanner}><Text style={styles.offlineText}>Sin conexión · Iniciá sesión cuando recuperes señal</Text></View>}
      <Modal animationType="fade" onRequestClose={() => setMessage('')} transparent visible={Boolean(message)}><View style={styles.backdrop}><View style={styles.modal}><View style={styles.modalIcon}><Text style={{ color: colors.red, fontSize: 20 }}>!</Text></View><Text style={styles.modalTitle}>No pudimos ingresar</Text><Text style={styles.modalCopy}>{message}</Text><Pressable onPress={() => setMessage('')} style={styles.modalButton}><Text style={styles.primaryButtonText}>Entendido</Text></Pressable></View></View></Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.canvas, flex: 1 }, accessPage: { flex: 1 }, scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  brandRow: { alignItems: 'center', flexDirection: 'row', gap: 9, marginBottom: 20 }, brandMark: { alignItems: 'center', backgroundColor: colors.green, borderRadius: 10, height: 32, justifyContent: 'center', width: 32 }, brandIcon: { color: '#dbe7c8', fontSize: 20 }, brand: { color: colors.green, fontSize: 21, fontWeight: '800', letterSpacing: -0.7 }, brandLight: { color: '#8c9a7e', fontWeight: '500' },
  hero: { backgroundColor: '#dce8d5', borderRadius: 22, height: 196, marginBottom: 17, overflow: 'hidden' }, heroImage: { borderRadius: 22, opacity: 0.88 }, heroOverlay: { backgroundColor: 'rgba(23, 61, 42, 0.38)', flex: 1, justifyContent: 'center', paddingHorizontal: 20 }, heroContent: { maxWidth: 245 }, heroKicker: { color: '#e0edcf', fontSize: 9, fontWeight: '800', letterSpacing: 1.7 }, heroTitle: { color: '#fff', fontSize: 27, fontWeight: '700', letterSpacing: -0.6, lineHeight: 31, marginTop: 8 }, heroCopy: { color: '#edf4e9', fontSize: 11, lineHeight: 16, marginTop: 6, width: 210 },
  formCard: { backgroundColor: colors.white, borderColor: '#e9ede7', borderRadius: 20, borderWidth: 1, padding: 20 }, formTitle: { color: colors.ink, fontSize: 21, fontWeight: '700', letterSpacing: -0.4 }, formCopy: { color: colors.muted, fontSize: 12, marginBottom: 18, marginTop: 4 }, label: { color: '#626e63', fontSize: 9, fontWeight: '800', letterSpacing: 1.1, marginBottom: 7, marginTop: 8 }, input: { backgroundColor: '#fbfcfa', borderColor: colors.line, borderRadius: 11, borderWidth: 1, color: colors.ink, fontSize: 14, height: 47, paddingHorizontal: 13 }, rememberRow: { alignItems: 'flex-start', marginBottom: 17, marginTop: 13 }, rememberLabel: { alignItems: 'center', flexDirection: 'row', gap: 8 }, rememberText: { color: '#657166', fontSize: 12 }, forgot: { color: colors.green, fontSize: 12, fontWeight: '600', marginLeft: 12, marginTop: 10 }, primaryButton: { alignItems: 'center', backgroundColor: colors.green, borderRadius: 12, height: 49, justifyContent: 'center' }, primaryButtonText: { color: colors.white, fontSize: 14, fontWeight: '700' }, arrow: { fontSize: 18 }, footerNote: { color: '#89938a', fontSize: 10, marginTop: 14, textAlign: 'center' }, version: { color: '#a1aaa1', fontSize: 8, fontWeight: '700', letterSpacing: 1.5, marginTop: 16, textAlign: 'center' },
  offlineBanner: { backgroundColor: '#fff1d5', bottom: 12, left: 20, padding: 10, position: 'absolute', right: 20, borderRadius: 10 }, offlineText: { color: '#725524', fontSize: 11, textAlign: 'center' }, authLink: { alignItems: 'center', paddingTop: 12 }, authLinkText: { color: colors.green, fontSize: 11, fontWeight: '700' }, backdrop: { alignItems: 'center', backgroundColor: 'rgba(19, 31, 22, 0.48)', flex: 1, justifyContent: 'center', padding: 24 }, modal: { alignItems: 'center', backgroundColor: colors.white, borderRadius: 20, padding: 24, width: '100%' }, modalIcon: { alignItems: 'center', backgroundColor: '#f8e9e7', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 }, modalTitle: { color: colors.ink, fontSize: 18, fontWeight: '700', marginTop: 12 }, modalCopy: { color: colors.muted, fontSize: 13, lineHeight: 19, marginBottom: 18, marginTop: 7, textAlign: 'center' }, modalButton: { alignItems: 'center', backgroundColor: colors.green, borderRadius: 11, height: 46, justifyContent: 'center', width: '100%' },
});
