// recupero una cuenta con código temporal y establezco una contraseña nueva.
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../context/SessionContext';
import { completePasswordRecovery, redeemPasswordRecoveryCode, requestPasswordRecovery } from '../services/authApi';
import { saveSession } from '../services/sessionStorage';
import { BrandWordmark } from '../components/BrandWordmark';

export default function RecoverScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const { setSession } = useSession();
  const [email, setEmail] = useState(typeof params.email === 'string' ? params.email : '');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [requested, setRequested] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function requestCode(): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) { setError('Ingresá un correo válido.'); return; }
    setBusy(true); setError(''); setNotice('');
    try { setNotice(await requestPasswordRecovery(cleanEmail)); setEmail(cleanEmail); setRequested(true); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo solicitar el código.'); }
    finally { setBusy(false); }
  }

  async function redeemCode(): Promise<void> {
    if (!/^\d{6}$/.test(code)) { setError('Ingresá el código de seis dígitos.'); return; }
    setBusy(true); setError('');
    try { setResetToken(await redeemPasswordRecoveryCode(email.trim().toLowerCase(), code)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'El código no es válido o venció.'); }
    finally { setBusy(false); }
  }

  async function saveNewPassword(): Promise<void> {
    if (password.length < 10) { setError('La contraseña nueva debe tener al menos 10 caracteres.'); return; }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
    setBusy(true); setError('');
    try {
      const session = await completePasswordRecovery(resetToken, password);
      await saveSession(session);
      setSession(session);
      router.replace('/(app)/home');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo cambiar la contraseña.'); }
    finally { setBusy(false); }
  }

  function changeEmail(): void {
    setRequested(false); setResetToken(''); setCode(''); setPassword(''); setConfirm(''); setError(''); setNotice('');
  }

  return <SafeAreaView style={s.safe}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.flex}><ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
    <View style={s.brand}><BrandWordmark /></View>
    <Text style={s.eyebrow}>RECUPERACIÓN SEGURA</Text>
    <Text style={s.title}>{resetToken ? 'Creá una contraseña nueva' : requested ? 'Revisá tu correo' : 'Recuperá tu cuenta'}</Text>
    <Text style={s.copy}>{resetToken ? 'Elegí una contraseña de al menos 10 caracteres para volver a ingresar.' : requested ? `Ingresá el código de seis dígitos que enviamos a ${email}.` : 'Te enviaremos un código temporal al correo asociado a tu cuenta.'}</Text>
    {!requested ? <><Text style={s.label}>CORREO ELECTRÓNICO</Text><TextInput accessibilityLabel="Correo electrónico" autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="nombre@estancia.com" style={s.input} value={email} /></> : null}
    {requested && !resetToken ? <><Text style={s.label}>CÓDIGO DE RECUPERACIÓN</Text><TextInput accessibilityLabel="Código de recuperación de seis dígitos" autoComplete="one-time-code" keyboardType="number-pad" maxLength={6} onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" style={[s.input, s.code]} value={code} /><Pressable disabled={busy} onPress={changeEmail} style={s.link}><Text style={s.linkText}>Cambiar correo</Text></Pressable></> : null}
    {resetToken ? <><Text style={s.label}>CONTRASEÑA NUEVA</Text><TextInput accessibilityLabel="Contraseña nueva" autoCapitalize="none" autoComplete="new-password" onChangeText={setPassword} placeholder="Al menos 10 caracteres" secureTextEntry style={s.input} value={password} /><Text style={s.label}>REPETÍ LA CONTRASEÑA</Text><TextInput accessibilityLabel="Repetir contraseña nueva" autoCapitalize="none" autoComplete="new-password" onChangeText={setConfirm} onSubmitEditing={() => void saveNewPassword()} placeholder="Volvé a escribirla" secureTextEntry style={s.input} value={confirm} /></> : null}
    {notice ? <Text style={s.notice}>{notice}</Text> : null}{error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}
    <Pressable accessibilityRole="button" disabled={busy} onPress={() => void (resetToken ? saveNewPassword() : requested ? redeemCode() : requestCode())} style={[s.primary, busy && s.disabled]}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryText}>{resetToken ? 'Cambiar contraseña y entrar' : requested ? 'Validar código' : 'Enviar código'}</Text>}</Pressable>
    {requested && !resetToken ? <Pressable accessibilityRole="button" disabled={busy} onPress={() => void requestCode()} style={s.link}><Text style={s.linkText}>Reenviar código</Text></Pressable> : null}
    <Pressable accessibilityRole="button" onPress={() => router.replace('/')} style={s.link}><Text style={s.linkText}>Volver al ingreso</Text></Pressable>
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}

const s = StyleSheet.create({ safe: { backgroundColor: '#f4f6f1', flex: 1 }, flex: { flex: 1 }, page: { alignSelf: 'center', flexGrow: 1, justifyContent: 'center', maxWidth: 520, padding: 24, paddingBottom: 36, width: '100%' }, brand: { alignItems: 'center', flexDirection: 'row', marginBottom: 26 }, eyebrow: { color: '#748076', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 }, title: { color: '#202c23', fontSize: 27, fontWeight: '800', marginTop: 8 }, copy: { color: '#748076', fontSize: 13, lineHeight: 20, marginBottom: 16, marginTop: 7 }, label: { color: '#626e63', fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 6, marginTop: 16 }, input: { backgroundColor: '#fff', borderColor: '#e3e8e1', borderRadius: 11, borderWidth: 1, color: '#202c23', fontSize: 15, height: 49, paddingHorizontal: 13 }, code: { fontSize: 23, letterSpacing: 8, textAlign: 'center' }, notice: { backgroundColor: '#e8efe5', borderRadius: 10, color: '#214d35', fontSize: 12, lineHeight: 18, marginTop: 14, padding: 11 }, error: { backgroundColor: '#fff0ed', borderRadius: 10, color: '#9b3d36', fontSize: 12, lineHeight: 18, marginTop: 13, padding: 11 }, primary: { alignItems: 'center', backgroundColor: '#214d35', borderRadius: 12, height: 49, justifyContent: 'center', marginTop: 18 }, disabled: { opacity: 0.7 }, primaryText: { color: '#fff', fontSize: 14, fontWeight: '700' }, link: { alignItems: 'center', padding: 14 }, linkText: { color: '#214d35', fontSize: 12, fontWeight: '700' } });
