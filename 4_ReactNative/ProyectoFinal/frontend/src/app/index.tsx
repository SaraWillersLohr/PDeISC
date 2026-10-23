// ingreso principal; el fondo verde ocupa toda la pantalla y la tarjeta mantiene el formulario legible.
import NetInfo from '@react-native-community/netinfo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandWordmark } from '../components/BrandWordmark';
import { BrandLoadingScreen } from '../components/BrandLoadingScreen';
import { useSession } from '../context/SessionContext';
import { initializeOfflineDatabase } from '../services/offlineDatabase';
import { login } from '../services/authApi';
import { removeSession, saveSession } from '../services/sessionStorage';

const forest = '#123824';

export default function LoginScreen() {
  const { session, setSession, restoring } = useSession();
  const { width, height } = useWindowDimensions();
  const desktop = Platform.OS === 'web' && width >= 900;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void initializeOfflineDatabase().catch(() => undefined);
    const unsubscribe = NetInfo.addEventListener((state) => setOnline(Boolean(state.isConnected)));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!restoring && session) router.replace('/(app)');
  }, [restoring, session]);

  async function submit(): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) { setError('Ingresá un correo electrónico válido.'); return; }
    if (!password) { setError('Ingresá tu contraseña.'); return; }
    setBusy(true); setError('');
    try {
      const nextSession = await login({ email: cleanEmail, password });
      if (remember) await saveSession(nextSession); else await removeSession();
      setSession(nextSession);
      setPassword('');
      router.replace('/(app)');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo iniciar sesión. Revisá tus datos e intentá de nuevo.');
    } finally { setBusy(false); }
  }

  if (restoring || session) return <BrandLoadingScreen />;

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.flex}>
        <ScrollView contentContainerStyle={[s.page, desktop ? s.desktopPage : s.mobilePage]} keyboardShouldPersistTaps="handled">
          {desktop ? (
            <View style={s.intro}>
              <BrandWordmark mode="dark" style={s.desktopLogo} />
              <Text style={s.introEyebrow}>GESTIÓN DE CAMPO</Text>
              <Text style={s.introTitle}>Tu estancia,{"\n"}siempre cerca.</Text>
              <Text style={s.introCopy}>La información de tu equipo y tus animales, en un solo lugar.</Text>
            </View>
          ) : null}

          <View style={[s.card, desktop ? [s.desktopCard, { minHeight: Math.max(height - 40, 640) }] : s.mobileCard]}>
            {!desktop ? <View style={s.mobileBrand}><BrandWordmark mode="light" /></View> : null}
            <View style={s.form}>
              <Text style={s.title}>Ingresá a tu cuenta</Text>
              <Text style={s.subtitle}>Usá el correo asociado a tu estancia.</Text>

              {!online ? <Text style={s.offline}>Sin conexión. Para iniciar sesión necesitás conectarte a internet.</Text> : null}
              <Text style={s.label}>CORREO ELECTRÓNICO</Text>
              <TextInput accessibilityLabel="Correo electrónico" autoCapitalize="none" autoComplete="email" autoCorrect={false} keyboardType="email-address" onChangeText={(value) => { setEmail(value); setError(''); }} onSubmitEditing={() => void submit()} placeholder="nombre@estancia.com" placeholderTextColor="#9aa49b" returnKeyType="next" style={s.input} textContentType="emailAddress" value={email} />

              <Text style={s.label}>CONTRASEÑA</Text>
              <View style={s.passwordWrap}>
                <TextInput accessibilityLabel="Contraseña" autoCapitalize="none" autoComplete="current-password" onChangeText={(value) => { setPassword(value); setError(''); }} onSubmitEditing={() => void submit()} placeholder="Tu contraseña" placeholderTextColor="#9aa49b" returnKeyType="go" secureTextEntry={!showPassword} style={s.passwordInput} textContentType="password" value={password} />
                <Pressable accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} accessibilityRole="button" onPress={() => setShowPassword(!showPassword)} style={s.eye}>
                  <MaterialCommunityIcons color="#758278" name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} />
                </Pressable>
              </View>

              <View style={s.options}>
                <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: remember }} onPress={() => setRemember(!remember)} style={s.rememberRow}>
                  <View style={[s.checkbox, remember && s.checkboxChecked]}>{remember ? <MaterialCommunityIcons color="#fff" name="check" size={13} /> : null}</View>
                  <Text style={s.rememberText}>Mantener sesión iniciada</Text>
                </Pressable>
                <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: '/recover', params: { email: email.trim() } })}>
                  <Text style={s.forgot}>¿Olvidaste tu contraseña?</Text>
                </Pressable>
              </View>

              {error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}
              <Pressable accessibilityRole="button" disabled={busy} onPress={() => void submit()} style={[s.primary, busy && s.disabled]}>
                {busy ? <ActivityIndicator color={forest} /> : <Text style={s.primaryText}>Ingresar <Text style={s.arrow}>→</Text></Text>}
              </Pressable>

              <View style={s.links}>
                <Text style={s.joinText}>¿Todavía no tenés cuenta?</Text>
                <Pressable accessibilityRole="link" onPress={() => router.push('/register')}><Text style={s.link}>Solicitar acceso</Text></Pressable>
              </View>
              <Pressable accessibilityRole="link" onPress={() => router.push('/access')} style={s.accessLink}><Text style={s.accessText}>¿Ya aprobaron tu solicitud? Activá tu acceso</Text></Pressable>
            </View>
            {desktop ? <Text style={s.footer}>Acceso protegido · Los permisos dependen de tu perfil</Text> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { backgroundColor: forest, flex: 1 }, flex: { flex: 1 },
  page: { backgroundColor: forest, flexGrow: 1, minHeight: '100%' },
  desktopPage: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: '6%', paddingVertical: 20 },
  mobilePage: { alignItems: 'center', justifyContent: 'center', padding: 18, paddingVertical: 26 },
  intro: { flex: 1, maxWidth: 430, paddingHorizontal: 16, paddingRight: 40 }, desktopLogo: { height: 54, marginBottom: 70, width: 190 },
  introEyebrow: { color: '#dcebc6', fontSize: 11, fontWeight: '800', letterSpacing: 1.8, marginBottom: 12 },
  introTitle: { color: '#fff', fontSize: 42, fontWeight: '800', lineHeight: 49 }, introCopy: { color: '#d3dfd4', fontSize: 15, lineHeight: 23, marginTop: 14, maxWidth: 340 },
  card: { backgroundColor: '#fff', overflow: 'hidden' },
  desktopCard: { borderBottomLeftRadius: 100, borderBottomRightRadius: 32, borderTopLeftRadius: 100, borderTopRightRadius: 32, justifyContent: 'center', maxWidth: 760, paddingHorizontal: 72, paddingVertical: 48, width: '56%' },
  mobileCard: { borderRadius: 28, maxWidth: 520, paddingHorizontal: 24, paddingBottom: 25, paddingTop: 25, width: '100%' },
  mobileBrand: { alignItems: 'center', marginBottom: 28 }, form: { alignSelf: 'center', maxWidth: 520, width: '100%' },
  title: { color: '#1e2b22', fontSize: 30, fontWeight: '800', letterSpacing: -0.7 }, subtitle: { color: '#788279', fontSize: 14, marginTop: 8 },
  label: { color: '#58665c', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 8, marginTop: 26 },
  input: { backgroundColor: '#fff', borderColor: '#dce3db', borderRadius: 15, borderWidth: 1, color: '#223027', fontSize: 15, height: 56, paddingHorizontal: 17, width: '100%' },
  passwordWrap: { alignItems: 'center', borderColor: '#dce3db', borderRadius: 15, borderWidth: 1, flexDirection: 'row', height: 56, paddingRight: 14 },
  passwordInput: { color: '#223027', flex: 1, fontSize: 15, height: '100%', paddingHorizontal: 17 }, eye: { alignItems: 'center', justifyContent: 'center', minHeight: 44, width: 36 },
  options: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 17 }, rememberRow: { alignItems: 'center', flexDirection: 'row', gap: 9, minHeight: 40 },
  checkbox: { alignItems: 'center', borderColor: '#9baa9d', borderRadius: 5, borderWidth: 1, height: 19, justifyContent: 'center', width: 19 }, checkboxChecked: { backgroundColor: '#214d35', borderColor: '#214d35' },
  rememberText: { color: '#59665d', fontSize: 12 }, forgot: { color: '#214d35', fontSize: 12, fontWeight: '700' },
  offline: { backgroundColor: '#fff3d9', borderRadius: 10, color: '#765918', fontSize: 12, lineHeight: 17, marginTop: 18, padding: 11 },
  error: { backgroundColor: '#fff0ed', borderRadius: 10, color: '#9b3d36', fontSize: 12, lineHeight: 18, marginTop: 15, padding: 11 },
  primary: { alignItems: 'center', backgroundColor: '#dcefc2', borderRadius: 999, height: 58, justifyContent: 'center', marginTop: 27, maxWidth: 270, width: '100%' }, disabled: { opacity: 0.7 },
  primaryText: { color: '#214d35', fontSize: 15, fontWeight: '800' }, arrow: { fontSize: 18 },
  links: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 5, justifyContent: 'center', marginTop: 27 }, joinText: { color: '#778179', fontSize: 12 }, link: { color: '#214d35', fontSize: 12, fontWeight: '800' },
  accessLink: { alignSelf: 'center', paddingHorizontal: 8, paddingVertical: 14 }, accessText: { color: '#627068', fontSize: 11, textAlign: 'center' },
  footer: { color: '#839087', fontSize: 11, marginTop: 43, textAlign: 'center' },
});
