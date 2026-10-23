// confirmo el correo de una solicitud y explico el paso de aprobación.
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { resendAccountCode, verifyAccountEmail } from '../services/authApi';

// valido el código enviado al correo y dejo visible el estado de la solicitud.
export default function VerifyScreen() {
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const email = typeof emailParam === 'string' ? emailParam : '';
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // verifico el código y muestro el siguiente paso sin activar la cuenta todavía.
  async function submit(): Promise<void> {
    if (!/^\d{6}$/.test(code)) { setError('Ingresá el código de seis dígitos.'); return; }
    setBusy(true); setError(''); setMessage('');
    try { setMessage(await verifyAccountEmail(email, code)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo verificar el correo.'); }
    finally { setBusy(false); }
  }

  // vuelvo a pedir un código de verificación para la solicitud actual.
  async function resend(): Promise<void> {
    setBusy(true); setError(''); setMessage('');
    try { setMessage(await resendAccountCode(email)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo reenviar el código.'); }
    finally { setBusy(false); }
  }

  return <SafeAreaView style={s.safe}><View style={s.page}><Text style={s.icon}>✉</Text><Text style={s.title}>Verificá tu correo</Text><Text style={s.copy}>Enviamos un código a {email || 'tu correo'}. Tiene seis dígitos y vence en 10 minutos.</Text>
    <Text style={s.label}>CÓDIGO DE VERIFICACIÓN</Text><TextInput autoComplete="one-time-code" keyboardType="number-pad" maxLength={6} onChangeText={(value) => setCode(value.replace(/\D/g, ''))} placeholder="000000" style={s.input} value={code} />
    {message ? <Text style={s.notice}>{message}</Text> : null}{error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}
    {!message.toLowerCase().includes('espera aprobación') ? <Pressable disabled={busy} onPress={() => void submit()} style={s.primary}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryText}>Verificar correo</Text>}</Pressable> : <Pressable onPress={() => router.replace('/')} style={s.primary}><Text style={s.primaryText}>Volver al ingreso</Text></Pressable>}
    <Pressable disabled={busy} onPress={() => void resend()} style={s.link}><Text style={s.linkText}>Reenviar código</Text></Pressable>
  </View></SafeAreaView>;
}

const s = StyleSheet.create({ safe: { backgroundColor: '#f4f6f1', flex: 1 }, page: { alignSelf: 'center', justifyContent: 'center', maxWidth: 480, padding: 24, width: '100%' }, icon: { color: '#214d35', fontSize: 29 }, title: { color: '#202c23', fontSize: 26, fontWeight: '800', marginTop: 14 }, copy: { color: '#748076', fontSize: 13, lineHeight: 20, marginTop: 8 }, label: { color: '#626e63', fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 7, marginTop: 25 }, input: { backgroundColor: '#fff', borderColor: '#e3e8e1', borderRadius: 12, borderWidth: 1, color: '#202c23', fontSize: 23, height: 55, letterSpacing: 8, textAlign: 'center' }, notice: { backgroundColor: '#e8efe5', borderRadius: 10, color: '#214d35', fontSize: 12, lineHeight: 18, marginTop: 14, padding: 12 }, error: { backgroundColor: '#fff0ed', borderRadius: 10, color: '#9b3d36', fontSize: 12, marginTop: 14, padding: 11 }, primary: { alignItems: 'center', backgroundColor: '#214d35', borderRadius: 12, height: 49, justifyContent: 'center', marginTop: 18 }, primaryText: { color: '#fff', fontSize: 14, fontWeight: '700' }, link: { alignItems: 'center', padding: 15 }, linkText: { color: '#214d35', fontSize: 12, fontWeight: '700' } });
