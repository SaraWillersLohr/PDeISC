// canjeo el código de acceso que envía el administrador tras aprobar una solicitud.
import { useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../context/SessionContext';
import { redeemAccountCode, resendAccessCode } from '../services/authApi';
import { saveSession } from '../services/sessionStorage';

// activo la cuenta con el código de seis dígitos y guardo la sesión resultante.
export default function AccessScreen() {
  const { setSession } = useSession();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  // canjeo el código aprobado e ingreso con la sesión devuelta por el backend.
  async function submit(): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail) || !/^\d{6}$/.test(code)) { setError('Ingresá el correo y el código de seis dígitos.'); return; }
    setBusy(true); setError('');
    try {
      const session = await redeemAccountCode(cleanEmail, code);
      await saveSession(session);
      setSession(session);
      router.replace('/(app)');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo activar el acceso.'); }
    finally { setBusy(false); }
  }

  // pido que el backend reenvíe el código vigente o emita uno nuevo si corresponde.
  async function resend(): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) { setError('Ingresá primero el correo asociado a la solicitud.'); return; }
    setBusy(true); setError(''); setNotice('');
    try { setNotice(await resendAccessCode(cleanEmail)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo reenviar el código.'); }
    finally { setBusy(false); }
  }

  return <SafeAreaView style={s.safe}><View style={s.page}><Text style={s.eyebrow}>ESTANCIAAPP</Text><Text style={s.title}>Activá tu acceso</Text><Text style={s.copy}>Usá el código que te envió el administrador cuando aprobó tu solicitud.</Text>
    <Text style={s.label}>CORREO ELECTRÓNICO</Text><TextInput autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="nombre@correo.com" style={s.input} value={email} />
    <Text style={s.label}>CÓDIGO DE ACCESO</Text><TextInput autoComplete="one-time-code" keyboardType="number-pad" maxLength={6} onChangeText={(value) => setCode(value.replace(/\D/g, ''))} placeholder="000000" style={s.input} value={code} />
    {notice ? <Text style={s.notice}>{notice}</Text> : null}{error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}
    <Pressable disabled={busy} onPress={() => void submit()} style={s.primary}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryText}>Activar e ingresar</Text>}</Pressable>
    <Pressable disabled={busy} onPress={() => void resend()} style={s.link}><Text style={s.linkText}>Reenviar código de acceso</Text></Pressable>
    <Pressable onPress={() => router.back()} style={s.link}><Text style={s.linkText}>Volver al ingreso</Text></Pressable>
  </View></SafeAreaView>;
}

const s = StyleSheet.create({ safe: { backgroundColor: '#f4f6f1', flex: 1 }, page: { alignSelf: 'center', justifyContent: 'center', maxWidth: 480, padding: 24, width: '100%' }, eyebrow: { color: '#748076', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 }, title: { color: '#202c23', fontSize: 27, fontWeight: '800', marginTop: 8 }, copy: { color: '#748076', fontSize: 13, lineHeight: 20, marginTop: 8 }, label: { color: '#626e63', fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 7, marginTop: 18 }, input: { backgroundColor: '#fff', borderColor: '#e3e8e1', borderRadius: 11, borderWidth: 1, color: '#202c23', fontSize: 15, height: 49, paddingHorizontal: 13 }, notice: { backgroundColor: '#e8efe5', borderRadius: 10, color: '#214d35', fontSize: 12, lineHeight: 18, marginTop: 14, padding: 11 }, error: { backgroundColor: '#fff0ed', borderRadius: 10, color: '#9b3d36', fontSize: 12, marginTop: 14, padding: 11 }, primary: { alignItems: 'center', backgroundColor: '#214d35', borderRadius: 12, height: 49, justifyContent: 'center', marginTop: 20 }, primaryText: { color: '#fff', fontSize: 14, fontWeight: '700' }, link: { alignItems: 'center', padding: 14 }, linkText: { color: '#214d35', fontSize: 12, fontWeight: '700' } });
