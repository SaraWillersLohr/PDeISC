// solicito una cuenta de equipo desde una ventana compacta sobre el ingreso.
import { friendlyErrorMessage } from '../services/apiErrors';
import { useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { requestAccount } from '../services/authApi';

type Props = { visible: boolean; onClose: () => void };

export function AccountRequestModal({ visible, onClose }: Props) {
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

  return <Modal animationType="fade" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
    <View style={s.backdrop}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.keyboard}>
        <View accessibilityViewIsModal style={s.dialog}>
          <View style={s.header}>
            <View style={s.heading}><Text style={s.eyebrow}>ACCESO AL EQUIPO</Text><Text style={s.title}>Solicitar cuenta</Text></View>
            <Pressable accessibilityLabel="Cerrar solicitud de cuenta" accessibilityRole="button" onPress={onClose} style={s.close}><Text style={s.closeText}>×</Text></Pressable>
          </View>
          <Text style={s.copy}>Completá tus datos; el administrador revisará la solicitud y asignará tu rol.</Text>
          <View style={s.row}>
            <View style={s.half}><Text style={s.label}>NOMBRE</Text><TextInput accessibilityLabel="Nombre" autoCapitalize="words" onChangeText={setNombre} placeholder="Tu nombre" style={s.input} value={nombre} /></View>
            <View style={s.half}><Text style={s.label}>APELLIDO</Text><TextInput accessibilityLabel="Apellido" autoCapitalize="words" onChangeText={setApellido} placeholder="Tu apellido" style={s.input} value={apellido} /></View>
          </View>
          <Text style={s.label}>CORREO ELECTRÓNICO</Text>
          <TextInput accessibilityLabel="Correo electrónico" autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="nombre@correo.com" style={s.input} value={email} />
          <View style={s.row}>
            <View style={s.half}><Text style={s.label}>CONTRASEÑA</Text><TextInput accessibilityLabel="Contraseña nueva" autoComplete="new-password" onChangeText={setPassword} placeholder="10 caracteres mínimo" secureTextEntry style={s.input} value={password} /></View>
            <View style={s.half}><Text style={s.label}>REPETIR CONTRASEÑA</Text><TextInput accessibilityLabel="Repetir contraseña" autoComplete="new-password" onChangeText={setConfirm} placeholder="Repetir" secureTextEntry style={s.input} value={confirm} /></View>
          </View>
          {error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}
          <Pressable accessibilityRole="button" disabled={busy} onPress={() => void submit()} style={[s.primary, busy && s.disabled]}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryText}>Enviar solicitud</Text>}</Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  </Modal>;
}

const s = StyleSheet.create({
  backdrop: { alignItems: 'center', backgroundColor: 'rgba(14,27,18,0.62)', flex: 1, justifyContent: 'center', padding: 14 },
  keyboard: { alignItems: 'center', justifyContent: 'center', width: '100%' },
  dialog: { backgroundColor: '#f4f6f1', borderColor: '#e3e8e1', borderRadius: 18, borderWidth: 1, maxWidth: 560, padding: 20, width: '100%' },
  header: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  heading: { flex: 1 },
  eyebrow: { color: '#748076', fontSize: 9, fontWeight: '800', letterSpacing: 1.3 },
  title: { color: '#202c23', fontSize: 23, fontWeight: '800', marginTop: 4 },
  close: { alignItems: 'center', height: 34, justifyContent: 'center', marginLeft: 8, width: 34 },
  closeText: { color: '#526257', fontSize: 28, lineHeight: 30 },
  copy: { color: '#748076', fontSize: 11, lineHeight: 16, marginBottom: 9, marginTop: 5 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1, minWidth: 0 },
  label: { color: '#626e63', fontSize: 8, fontWeight: '800', letterSpacing: 0.7, marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: '#fff', borderColor: '#e3e8e1', borderRadius: 9, borderWidth: 1, color: '#202c23', fontSize: 13, height: 42, paddingHorizontal: 10, width: '100%' },
  error: { backgroundColor: '#fff0ed', borderRadius: 8, color: '#9b3d36', fontSize: 10, lineHeight: 14, marginTop: 8, padding: 8 },
  primary: { alignItems: 'center', backgroundColor: '#214d35', borderRadius: 10, height: 44, justifyContent: 'center', marginTop: 14 },
  disabled: { opacity: 0.7 },
  primaryText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
