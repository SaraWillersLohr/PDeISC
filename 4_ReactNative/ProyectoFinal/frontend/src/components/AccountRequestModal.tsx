// solicito una cuenta de equipo desde una ventana compacta sobre el ingreso.
import { friendlyErrorMessage } from '../services/apiErrors';
import { useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { requestAccount } from '../services/authApi';
import { PasswordInput } from './PasswordInput';

type Props = { visible: boolean; onClose: () => void };

const dialogMaxWidth = 560;
const gutter = 14;
const mobileBreakpoint = 600;

export function AccountRequestModal({ visible, onClose }: Props) {
  const { width, fontScale } = useWindowDimensions();
  const mobile = width < mobileBreakpoint;
  const dialogWidth = Math.min(width - 2 * gutter, dialogMaxWidth);
  const stacked = mobile || dialogWidth < 492 * Math.max(1, fontScale);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (!nombre.trim() || !apellido.trim() || !/^\S+@\S+\.\S+$/.test(cleanEmail) || password.length < 10) {
      setError('Completá nombre, apellido y correo válido. La contraseña debe tener al menos 10 caracteres.');
      return;
    }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
    setBusy(true); setError('');
    try {
      await requestAccount({ nombre: nombre.trim(), apellido: apellido.trim(), email: cleanEmail, password });
      onClose();
      router.push({ pathname: '/verify', params: { email: cleanEmail } });
    } catch (cause) { setError(friendlyErrorMessage(cause, 'No se pudo enviar la solicitud.')); }
    finally { setBusy(false); }
  }

  return <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
    <SafeAreaView style={[s.backdrop, mobile && s.mobileBackdrop]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[s.keyboard, mobile && s.mobileKeyboard]}>
        <View accessibilityViewIsModal style={[s.dialog, mobile && s.mobileDialog]}>
          <ScrollView style={[s.scroll, mobile && s.mobileScroll]} contentContainerStyle={[s.content, stacked && s.compactContent]} keyboardShouldPersistTaps="handled">
            <View style={s.header}>
              <View style={s.heading}><Text style={s.eyebrow}>ACCESO AL EQUIPO</Text><Text style={s.title}>Solicitar cuenta</Text></View>
              <Pressable accessibilityLabel="Cerrar solicitud de cuenta" accessibilityRole="button" onPress={onClose} style={s.close}><Text style={s.closeText}>×</Text></Pressable>
            </View>
            <Text style={s.copy}>Completá tus datos y verificá tu correo. Te avisaremos cuando se resuelva tu solicitud.</Text>
            <View style={!stacked && s.row}>
              <View style={!stacked && s.half}><Text style={s.label}>NOMBRE</Text><TextInput accessibilityLabel="Nombre" autoCapitalize="words" onChangeText={setNombre} placeholder="Tu nombre" style={s.input} value={nombre} /></View>
              <View style={!stacked && s.half}><Text style={s.label}>APELLIDO</Text><TextInput accessibilityLabel="Apellido" autoCapitalize="words" onChangeText={setApellido} placeholder="Tu apellido" style={s.input} value={apellido} /></View>
            </View>
            <Text style={s.label}>CORREO ELECTRÓNICO</Text>
            <TextInput accessibilityLabel="Correo electrónico" autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="nombre@correo.com" style={s.input} value={email} />
            <View style={!stacked && s.row}>
              <View style={!stacked && s.half}><Text style={s.label}>CONTRASEÑA</Text><PasswordInput accessibilityLabel="Contraseña nueva" autoComplete="new-password" onChangeText={setPassword} placeholder="10 caracteres mínimo" containerStyle={s.input} inputStyle={s.passwordText} value={password} /></View>
              <View style={!stacked && s.half}><Text style={s.label}>REPETIR CONTRASEÑA</Text><PasswordInput accessibilityLabel="Repetir contraseña" autoComplete="new-password" onChangeText={setConfirm} placeholder="Repetir" containerStyle={s.input} inputStyle={s.passwordText} value={confirm} /></View>
            </View>
            {error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}
            <Pressable accessibilityRole="button" disabled={busy} onPress={() => void submit()} style={[s.primary, busy && s.disabled]}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryText}>Enviar solicitud</Text>}</Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </Modal>;
}

const s = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(14,27,18,0.62)', flex: 1 },
  mobileBackdrop: { backgroundColor: '#f4f6f1' },
  keyboard: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: gutter },
  mobileKeyboard: { alignItems: 'stretch', padding: 0 },
  dialog: { backgroundColor: '#f4f6f1', borderColor: '#e3e8e1', borderRadius: 18, borderWidth: 1, flexShrink: 1, maxWidth: dialogMaxWidth, overflow: 'hidden', width: '100%' },
  mobileDialog: { borderRadius: 0, borderWidth: 0, flex: 1, maxWidth: '100%', minHeight: 0 },
  scroll: { flexGrow: 0, flexShrink: 1 },
  mobileScroll: { flex: 1, minHeight: 0 },
  content: { padding: 20 },
  compactContent: { padding: 14 },
  header: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  heading: { flex: 1 },
  eyebrow: { color: '#748076', fontSize: 9, fontWeight: '800', letterSpacing: 1.3 },
  title: { color: '#202c23', fontSize: 23, fontWeight: '800', marginTop: 4 },
  close: { alignItems: 'center', height: 44, justifyContent: 'center', marginLeft: 8, width: 44 },
  closeText: { color: '#526257', fontSize: 28, lineHeight: 30 },
  copy: { color: '#748076', fontSize: 13, lineHeight: 19, marginBottom: 9, marginTop: 5 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1, minWidth: 0 },
  label: { color: '#626e63', fontSize: 10, fontWeight: '800', letterSpacing: 0.7, marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: '#fff', borderColor: '#e3e8e1', borderRadius: 9, borderWidth: 1, color: '#202c23', fontSize: 16, minHeight: 44, paddingHorizontal: 10, width: '100%' },
  passwordText: { color: '#202c23', fontSize: 16, minHeight: 44 },
  error: { backgroundColor: '#fff0ed', borderRadius: 8, color: '#9b3d36', fontSize: 12, lineHeight: 17, marginTop: 8, padding: 8 },
  primary: { alignItems: 'center', backgroundColor: '#214d35', borderRadius: 10, minHeight: 44, justifyContent: 'center', marginTop: 14, padding: 8 },
  disabled: { opacity: 0.7 },
  primaryText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
