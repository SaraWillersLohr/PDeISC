// confirmo el correo de una solicitud y explico el paso de aprobación.
import { friendlyErrorMessage } from '../services/apiErrors';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { resendAccountCode, verifyAccountEmail } from '../services/authApi';

// valido el código enviado al correo y dejo visible el estado de la solicitud.
export default function VerifyScreen() {
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const email = typeof emailParam === 'string' ? emailParam : '';
  const [code, setCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function close(): void {
    router.dismissTo('/');
  }

  // verifico el código y muestro el siguiente paso sin activar la cuenta todavía.
  async function submit(): Promise<void> {
    if (!/^\d{6}$/.test(code)) { setError('Ingresá el código de seis dígitos.'); return; }
    setBusy(true); setError(''); setMessage('');
    try {
      await verifyAccountEmail(email, code);
      setVerified(true);
    }
    catch (cause) { setError(friendlyErrorMessage(cause, 'No se pudo verificar el correo.')); }
    finally { setBusy(false); }
  }

  // vuelvo a pedir un código de verificación para la solicitud actual.
  async function resend(): Promise<void> {
    setBusy(true); setError(''); setMessage('');
    try { setMessage(await resendAccountCode(email)); }
    catch (cause) { setError(friendlyErrorMessage(cause, 'No se pudo reenviar el código.')); }
    finally { setBusy(false); }
  }

  return (
    <SafeAreaView style={s.backdrop}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.keyboard}>
        <ScrollView accessibilityViewIsModal style={s.dialog} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <View style={s.header}>
            <View style={s.heading}>
              <Text style={s.eyebrow}>ACCESO AL EQUIPO</Text>
              <Text accessibilityRole="header" style={s.title}>{verified ? 'Solicitud pendiente de aprobación' : 'Verificá tu correo'}</Text>
            </View>
            <Pressable accessibilityLabel="Cerrar verificación de correo" accessibilityRole="button" onPress={close} style={s.close}>
              <Text style={s.closeText}>×</Text>
            </Pressable>
          </View>
          {verified ? (
            <>
              <Text style={s.copy}>Tu correo ya está verificado. Te avisaremos por correo cuando se resuelva tu solicitud.</Text>
              <Pressable accessibilityRole="button" onPress={close} style={s.primary}>
                <Text style={s.primaryText}>Volver al ingreso</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={s.copy}>Enviamos un código a {email || 'tu correo'}. Tiene seis dígitos y vence en 10 minutos.</Text>
              <Text style={s.label}>CÓDIGO DE VERIFICACIÓN</Text>
              <TextInput accessibilityLabel="Código de verificación" autoComplete="one-time-code" keyboardType="number-pad" maxLength={6} onChangeText={(value) => setCode(value.replace(/\D/g, ''))} placeholder="000000" style={s.input} value={code} />
              {message ? <Text style={s.notice}>{message}</Text> : null}
              {error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}
              <Pressable accessibilityRole="button" disabled={busy} onPress={() => void submit()} style={s.primary}>
                {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryText}>Verificar correo</Text>}
              </Pressable>
              <Pressable accessibilityRole="button" disabled={busy} onPress={() => void resend()} style={s.link}>
                <Text style={s.linkText}>Reenviar código</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(14,27,18,0.62)', flex: 1 },
  keyboard: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 14 },
  dialog: { backgroundColor: '#f4f6f1', borderColor: '#e3e8e1', borderRadius: 18, borderWidth: 1, flexGrow: 0, flexShrink: 1, maxWidth: 480, width: '100%' },
  content: { padding: 20 },
  header: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  heading: { flex: 1 },
  eyebrow: { color: '#748076', fontSize: 9, fontWeight: '800', letterSpacing: 1.3 },
  close: { alignItems: 'center', height: 44, justifyContent: 'center', marginLeft: 8, width: 44 },
  closeText: { color: '#526257', fontSize: 28, lineHeight: 30 },
  title: { color: '#202c23', fontSize: 23, fontWeight: '800', marginTop: 4 },
  copy: { color: '#748076', fontSize: 13, lineHeight: 20, marginTop: 8 },
  label: { color: '#626e63', fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 7, marginTop: 25 },
  input: { backgroundColor: '#fff', borderColor: '#e3e8e1', borderRadius: 12, borderWidth: 1, color: '#202c23', fontSize: 23, height: 55, letterSpacing: 8, textAlign: 'center' },
  notice: { backgroundColor: '#e8efe5', borderRadius: 10, color: '#214d35', fontSize: 12, lineHeight: 18, marginTop: 14, padding: 12 },
  error: { backgroundColor: '#fff0ed', borderRadius: 10, color: '#9b3d36', fontSize: 12, marginTop: 14, padding: 11 },
  primary: { alignItems: 'center', backgroundColor: '#214d35', borderRadius: 12, height: 49, justifyContent: 'center', marginTop: 18 },
  primaryText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  link: { alignItems: 'center', padding: 15 },
  linkText: { color: '#214d35', fontSize: 12, fontWeight: '700' },
});
