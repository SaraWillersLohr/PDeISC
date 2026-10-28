// activo una cuenta aprobada desde una ventana compacta sobre el ingreso.
import { friendlyErrorMessage } from '../services/apiErrors';
import { useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSession } from '../context/SessionContext';
import { redeemAccountCode, resendAccessCode } from '../services/authApi';
import { saveSession } from '../services/sessionStorage';

type Props = { visible: boolean; onClose: () => void };

export function AccountActivationModal({ visible, onClose }: Props) {
  const { setSession } = useSession();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail) || !/^\d{6}$/.test(code)) { setError('Ingresá el correo y el código de seis dígitos.'); return; }
    setBusy(true); setError('');
    try {
      const session = await redeemAccountCode(cleanEmail, code);
      await saveSession(session);
      setSession(session);
      router.replace('/(app)/home');
    } catch (cause) { setError(friendlyErrorMessage(cause, 'No se pudo activar el acceso.')); }
    finally { setBusy(false); }
  }

  async function resend(): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) { setError('Ingresá primero el correo asociado a la solicitud.'); return; }
    setBusy(true); setError(''); setNotice('');
    try { setNotice(await resendAccessCode(cleanEmail)); }
    catch (cause) { setError(friendlyErrorMessage(cause, 'No se pudo reenviar el código.')); }
    finally { setBusy(false); }
  }

  return <Modal animationType="fade" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
    <View style={s.backdrop}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.keyboard}>
        <View accessibilityViewIsModal style={s.dialog}>
          <View style={s.header}>
            <View style={s.heading}><Text style={s.eyebrow}>ESTANCIAAPP</Text><Text style={s.title}>Activá tu acceso</Text></View>
            <Pressable accessibilityLabel="Cerrar activación de cuenta" accessibilityRole="button" onPress={onClose} style={s.close}><Text style={s.closeText}>×</Text></Pressable>
          </View>
          <Text style={s.copy}>Ingresá el correo y el código de seis dígitos que te envió el administrador.</Text>
          <Text style={s.label}>CORREO ELECTRÓNICO</Text>
          <TextInput accessibilityLabel="Correo electrónico" autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="nombre@correo.com" style={s.input} value={email} />
          <Text style={s.label}>CÓDIGO DE ACCESO</Text>
          <TextInput accessibilityLabel="Código de acceso de seis dígitos" autoComplete="one-time-code" keyboardType="number-pad" maxLength={6} onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))} onSubmitEditing={() => void submit()} placeholder="000000" style={[s.input, s.code]} value={code} />
          {notice ? <Text style={s.notice}>{notice}</Text> : null}{error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}
          <Pressable accessibilityRole="button" disabled={busy} onPress={() => void submit()} style={[s.primary, busy && s.disabled]}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryText}>Activar e ingresar</Text>}</Pressable>
          <Pressable accessibilityRole="button" disabled={busy} onPress={() => void resend()} style={s.link}><Text style={s.linkText}>Reenviar código de acceso</Text></Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  </Modal>;
}

const s = StyleSheet.create({
  backdrop: { alignItems: 'center', backgroundColor: 'rgba(14,27,18,0.62)', flex: 1, justifyContent: 'center', padding: 16 },
  keyboard: { alignItems: 'center', justifyContent: 'center', width: '100%' },
  dialog: { backgroundColor: '#f4f6f1', borderColor: '#e3e8e1', borderRadius: 18, borderWidth: 1, maxWidth: 480, padding: 22, width: '100%' },
  header: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  heading: { flex: 1 },
  eyebrow: { color: '#748076', fontSize: 9, fontWeight: '800', letterSpacing: 1.3 },
  title: { color: '#202c23', fontSize: 24, fontWeight: '800', marginTop: 4 },
  close: { alignItems: 'center', height: 34, justifyContent: 'center', marginLeft: 8, width: 34 },
  closeText: { color: '#526257', fontSize: 28, lineHeight: 30 },
  copy: { color: '#748076', fontSize: 11, lineHeight: 16, marginTop: 5 },
  label: { color: '#626e63', fontSize: 8, fontWeight: '800', letterSpacing: 0.7, marginBottom: 4, marginTop: 12 },
  input: { backgroundColor: '#fff', borderColor: '#e3e8e1', borderRadius: 9, borderWidth: 1, color: '#202c23', fontSize: 13, height: 42, paddingHorizontal: 10 },
  code: { fontSize: 20, letterSpacing: 7, textAlign: 'center' },
  notice: { backgroundColor: '#e8efe5', borderRadius: 8, color: '#214d35', fontSize: 10, lineHeight: 14, marginTop: 9, padding: 8 },
  error: { backgroundColor: '#fff0ed', borderRadius: 8, color: '#9b3d36', fontSize: 10, lineHeight: 14, marginTop: 9, padding: 8 },
  primary: { alignItems: 'center', backgroundColor: '#214d35', borderRadius: 10, height: 44, justifyContent: 'center', marginTop: 14 },
  disabled: { opacity: 0.7 },
  primaryText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  link: { alignItems: 'center', padding: 10 },
  linkText: { color: '#214d35', fontSize: 11, fontWeight: '700' },
});
