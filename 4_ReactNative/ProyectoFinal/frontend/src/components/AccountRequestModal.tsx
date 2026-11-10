import { FieldError, useFieldErrors } from './FieldError';
import { personNameError } from '../services/formValidation';
// solicito una cuenta de equipo desde una ventana compacta sobre el ingreso.
import { FormDialog } from './FormDialog';
import { friendlyErrorMessage } from '../services/apiErrors';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { requestAccount } from '../services/authApi';
import { PasswordInput } from './PasswordInput';

type Props = { visible: boolean; onClose: () => void; onVerification: (email: string) => void };

const dialogMaxWidth = 560;
const gutter = 14;

export function AccountRequestModal({ visible, onClose, onVerification }: Props) {
  const { width, fontScale } = useWindowDimensions();
  const form = useFieldErrors();
  const dialogWidth = Math.min(width - 2 * gutter, dialogMaxWidth);
  const stacked = dialogWidth < 492 * Math.max(1, fontScale);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (!form.validate({
      name: personNameError(nombre, 'tu nombre'),
      surname: personNameError(apellido, 'tu apellido'),
      email: !/^\S+@\S+\.\S+$/.test(cleanEmail) && 'Ingresá un correo electrónico válido.',
      password: password.length < 10 && 'La contraseña debe tener al menos 10 caracteres.',
      confirm: !confirm ? 'Repetí la contraseña.' : password !== confirm && 'Las contraseñas no coinciden.',
    })) return;
    setBusy(true);
    try {
      await requestAccount({ nombre: nombre.trim(), apellido: apellido.trim(), email: cleanEmail, password });
      onClose();
      onVerification(cleanEmail);
    } catch (cause) { form.serverError(friendlyErrorMessage(cause, 'No se pudo enviar la solicitud.'), [['email', /correo|email|solicitud existente/i], ['name', /nombre/i], ['surname', /apellido/i], ['password', /contraseña/i]]); }
    finally { setBusy(false); }
  }

  return <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
    <SafeAreaView style={s.backdrop}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.keyboard}>
        <FormDialog style={s.dialog} contentContainerStyle={[s.content, stacked && s.compactContent]}>
          <View style={s.header}>
            <View style={s.heading}><Text style={s.eyebrow}>ACCESO AL EQUIPO</Text><Text style={s.title}>Solicitar cuenta</Text></View>
            <Pressable accessibilityLabel="Cerrar solicitud de cuenta" accessibilityRole="button" onPress={onClose} style={s.close}><Text style={s.closeText}>×</Text></Pressable>
          </View>
          <Text style={s.copy}>Completá tus datos y verificá tu correo. Te avisaremos cuando se resuelva tu solicitud.</Text>
          <View style={!stacked && s.row}>
            <View style={!stacked && s.half}><Text style={s.label}>NOMBRE</Text><TextInput accessibilityLabel="Nombre" autoCapitalize="words" onChangeText={form.change('name', setNombre)} placeholder="Tu nombre" style={s.input} value={nombre} /><FieldError message={form.fields.name} /></View>
            <View style={!stacked && s.half}><Text style={s.label}>APELLIDO</Text><TextInput accessibilityLabel="Apellido" autoCapitalize="words" onChangeText={form.change('surname', setApellido)} placeholder="Tu apellido" style={s.input} value={apellido} /><FieldError message={form.fields.surname} /></View>
          </View>
          <Text style={s.label}>CORREO ELECTRÓNICO</Text>
          <TextInput accessibilityLabel="Correo electrónico" autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={form.change('email', setEmail)} placeholder="nombre@correo.com" style={s.input} value={email} /><FieldError message={form.fields.email} />
          <View style={!stacked && s.row}>
            <View style={!stacked && s.half}><Text style={s.label}>CONTRASEÑA</Text><PasswordInput accessibilityLabel="Contraseña nueva" autoComplete="new-password" onChangeText={form.change('password', setPassword)} placeholder="10 caracteres mínimo" containerStyle={s.input} inputStyle={s.passwordText} value={password} /><FieldError message={form.fields.password} /></View>
            <View style={!stacked && s.half}><Text style={s.label}>REPETIR CONTRASEÑA</Text><PasswordInput accessibilityLabel="Repetir contraseña" autoComplete="new-password" onChangeText={form.change('confirm', setConfirm)} placeholder="Repetir" containerStyle={s.input} inputStyle={s.passwordText} value={confirm} /><FieldError message={form.fields.confirm} /></View>
          </View>
          <FieldError message={form.fields.submit} />
          <Pressable accessibilityRole="button" disabled={busy} onPress={() => void submit()} style={[s.primary, busy && s.disabled]}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryText}>Enviar solicitud</Text>}</Pressable>
        </FormDialog>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </Modal>;
}

const s = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(14,27,18,0.62)', flex: 1 },
  keyboard: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: gutter },
  dialog: { backgroundColor: '#f4f6f1', borderColor: '#e3e8e1', borderRadius: 18, borderWidth: 1, maxWidth: dialogMaxWidth, width: '100%' },
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
