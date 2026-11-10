import { FieldError, useFieldErrors } from './FieldError';
// presento el flujo de recuperación como una ventana sobre el ingreso.
import { FormDialog } from './FormDialog';
import { friendlyErrorMessage } from '../services/apiErrors';
import { useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSession } from '../context/SessionContext';
import { completePasswordRecovery, redeemPasswordRecoveryCode, requestPasswordRecovery } from '../services/authApi';
import { saveSession } from '../services/sessionStorage';
import { PasswordInput } from './PasswordInput';

type Props = { initialEmail: string; onClose: () => void };

export function PasswordRecoveryModal({ initialEmail, onClose }: Props) {
  const { setSession } = useSession();
  const form = useFieldErrors();
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [requested, setRequested] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  async function requestCode(): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (!form.validate({ email: !/^\S+@\S+\.\S+$/.test(cleanEmail) && 'Ingresá un correo electrónico válido.' })) return;
    setBusy(true); form.clear(); setNotice('');
    try { setNotice(await requestPasswordRecovery(cleanEmail)); setEmail(cleanEmail); setRequested(true); }
    catch (cause) { form.serverError(friendlyErrorMessage(cause, 'No se pudo solicitar el código.'), [['email', /correo|email/i]]); }
    finally { setBusy(false); }
  }

  async function redeemCode(): Promise<void> {
    if (!form.validate({ code: !/^\d{6}$/.test(code) && 'Ingresá los seis dígitos del código recibido.' })) return;
    setBusy(true); form.clear();
    try { setResetToken(await redeemPasswordRecoveryCode(email.trim().toLowerCase(), code)); }
    catch (cause) { form.serverError(friendlyErrorMessage(cause, 'El código no es válido o venció.'), [['code', /código|codigo|venci|intentos/i]]); }
    finally { setBusy(false); }
  }

  async function saveNewPassword(): Promise<void> {
    if (!form.validate({
      password: password.length < 10 && 'La contraseña nueva debe tener al menos 10 caracteres.',
      confirm: !confirm ? 'Repetí la contraseña nueva.' : password !== confirm && 'Las contraseñas no coinciden.',
    })) return;
    setBusy(true); form.clear();
    try {
      const session = await completePasswordRecovery(resetToken, password);
      await saveSession(session);
      setSession(session);
      router.replace('/(app)/home');
    } catch (cause) { form.serverError(friendlyErrorMessage(cause, 'No se pudo cambiar la contraseña.'), [['password', /contraseña|caracteres/i]]); }
    finally { setBusy(false); }
  }

  function changeEmail(): void {
    setRequested(false); setResetToken(''); setCode(''); setPassword(''); setConfirm(''); form.clear(); setNotice('');
  }

  return (
    <Modal animationType="fade" onRequestClose={onClose} statusBarTranslucent transparent visible>
      <View style={s.backdrop}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.keyboard}>
          <FormDialog style={s.dialog} contentContainerStyle={s.content}>
            <View style={s.header}>
              <View style={s.heading}>
              <Text style={s.eyebrow}>RECUPERACIÓN SEGURA</Text>
              <Text style={s.title}>{resetToken ? 'Creá una contraseña nueva' : requested ? 'Revisá tu correo' : 'Recuperá tu cuenta'}</Text>
              </View>
              <Pressable accessibilityLabel="Cerrar recuperación" accessibilityRole="button" onPress={onClose} style={s.close}><Text style={s.closeText}>×</Text></Pressable>
            </View>
            <Text style={s.copy}>{resetToken ? 'Elegí una contraseña de al menos 10 caracteres para volver a ingresar.' : requested ? `Ingresá el código de seis dígitos que enviamos a ${email}.` : 'Te enviaremos un código temporal al correo asociado a tu cuenta.'}</Text>
            {!requested ? <><Text style={s.label}>CORREO ELECTRÓNICO</Text><TextInput accessibilityLabel="Correo electrónico" autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={form.change('email', setEmail)} placeholder="nombre@estancia.com" style={s.input} value={email} /><FieldError message={form.fields.email} /></> : null}
            {requested && !resetToken ? <><Text style={s.label}>CÓDIGO DE RECUPERACIÓN</Text><TextInput accessibilityLabel="Código de recuperación de seis dígitos" autoComplete="one-time-code" keyboardType="number-pad" maxLength={6} onChangeText={(value) => { form.clear('code'); setCode(value.replace(/\D/g, '').slice(0, 6)); }} placeholder="000000" style={[s.input, s.code]} value={code} /><FieldError message={form.fields.code} /><Pressable disabled={busy} onPress={changeEmail} style={s.link}><Text style={s.linkText}>Cambiar correo</Text></Pressable></> : null}
            {resetToken ? <><Text style={s.label}>CONTRASEÑA NUEVA</Text><PasswordInput accessibilityLabel="Contraseña nueva" autoCapitalize="none" autoComplete="new-password" onChangeText={form.change('password', setPassword)} placeholder="Al menos 10 caracteres" containerStyle={s.input} inputStyle={s.passwordText} value={password} /><FieldError message={form.fields.password} /><Text style={s.label}>REPETÍ LA CONTRASEÑA</Text><PasswordInput accessibilityLabel="Repetir contraseña nueva" autoCapitalize="none" autoComplete="new-password" onChangeText={form.change('confirm', setConfirm)} onSubmitEditing={() => void saveNewPassword()} placeholder="Volvé a escribirla" containerStyle={s.input} inputStyle={s.passwordText} value={confirm} /><FieldError message={form.fields.confirm} /></> : null}
            {notice ? <Text style={s.notice}>{notice}</Text> : null}<FieldError message={form.fields.submit} />
            <Pressable accessibilityRole="button" disabled={busy} onPress={() => void (resetToken ? saveNewPassword() : requested ? redeemCode() : requestCode())} style={[s.primary, busy && s.disabled]}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryText}>{resetToken ? 'Cambiar contraseña y entrar' : requested ? 'Validar código' : 'Enviar código'}</Text>}</Pressable>
            {requested && !resetToken ? <Pressable accessibilityRole="button" disabled={busy} onPress={() => void requestCode()} style={s.link}><Text style={s.linkText}>Reenviar código</Text></Pressable> : null}
            <Pressable accessibilityRole="button" onPress={onClose} style={s.link}><Text style={s.linkText}>Volver al ingreso</Text></Pressable>
          </FormDialog>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { alignItems: 'center', backgroundColor: 'rgba(14, 27, 18, 0.62)', flex: 1, justifyContent: 'center', padding: 16 },
  keyboard: { alignItems: 'center', flex: 1, minHeight: 0, justifyContent: 'center', width: '100%' },
  dialog: { backgroundColor: '#f4f6f1', borderColor: '#e3e8e1', borderRadius: 20, borderWidth: 1, maxWidth: 480, width: '100%' },
  content: { padding: 24, paddingBottom: 18 },
  header: { alignItems: 'flex-start', flexDirection: 'row', gap: 8 },
  heading: { flex: 1, minWidth: 0 },
  close: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  closeText: { color: '#526257', fontSize: 28, lineHeight: 30 },
  eyebrow: { color: '#748076', fontSize: 13, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: '#202c23', fontSize: 27, fontWeight: '800', marginTop: 8 },
  copy: { color: '#748076', fontSize: 13, lineHeight: 20, marginBottom: 6, marginTop: 8 },
  label: { color: '#626e63', fontSize: 13, fontWeight: '800', letterSpacing: 1, marginBottom: 6, marginTop: 16 },
  input: { backgroundColor: '#fff', borderColor: '#e3e8e1', borderRadius: 11, borderWidth: 1, color: '#202c23', fontSize: 15, height: 49, paddingHorizontal: 13 },
  passwordText: { color: '#202c23', fontSize: 15, height: 49, paddingLeft: 13 },
  code: { fontSize: 23, letterSpacing: 8, textAlign: 'center' },
  notice: { backgroundColor: '#e8efe5', borderRadius: 10, color: '#214d35', fontSize: 13, lineHeight: 18, marginTop: 14, padding: 11 },
  error: { backgroundColor: '#fff0ed', borderRadius: 10, color: '#9b3d36', fontSize: 13, lineHeight: 18, marginTop: 13, padding: 11 },
  primary: { alignItems: 'center', backgroundColor: '#214d35', borderRadius: 12, height: 49, justifyContent: 'center', marginTop: 18 },
  disabled: { opacity: 0.7 },
  primaryText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  link: { alignItems: 'center', padding: 14 },
  linkText: { color: '#214d35', fontSize: 13, fontWeight: '700' },
});
