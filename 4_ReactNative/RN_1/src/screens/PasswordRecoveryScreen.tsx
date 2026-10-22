// Archivo src/screens/PasswordRecoveryScreen.tsx: solicitud de código, validación de identidad y cambio obligatorio de contraseña.
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { AuthPage } from '../components/AuthPage';
import { PrimaryButton } from '../components/PrimaryButton';

// Contrato de datos PasswordRecoveryScreenProps: define las acciones para pedir el código, validarlo y guardar la contraseña nueva.
interface PasswordRecoveryScreenProps {
  initialEmail: string;
  busy: boolean;
  error: string | null;
  notice?: string | null;
  onBack: () => void;
  onRequestCode: (email: string) => Promise<void>;
  onRedeemCode: (email: string, code: string) => Promise<string | null>;
  onResetPassword: (resetToken: string, password: string) => Promise<boolean>;
}

// Esta función representa el flujo seguro de recuperación: correo, código, contraseña nueva y acceso al portal.
export function PasswordRecoveryScreen({ initialEmail, busy, error, notice, onBack, onRequestCode, onRedeemCode, onResetPassword }: PasswordRecoveryScreenProps) {
  const { width } = useWindowDimensions();
  const gutter = Math.max(18, Math.min(36, width * 0.07));
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [codeRequested, setCodeRequested] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [validation, setValidation] = useState<string | null>(null);
  // Usa el acuse de la API como respaldo para conservar el paso del código si Expo vuelve a montar la pantalla.
  const showCodeStep = !changingEmail && (codeRequested || Boolean(notice));

  // Valida el correo localmente y solicita un código; la respuesta del servidor no confirma si ese correo está registrado.
  const requestCode = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setValidation('Ingresá un correo válido.');
      return;
    }
    setValidation(null);
    // Muestra el paso del código inmediatamente; el servidor mantiene genérica su respuesta aunque el correo no esté registrado.
    setChangingEmail(false);
    setCodeRequested(true);
    await onRequestCode(cleanEmail);
  };

  // Esta función permite corregir el correo solicitado y descarta los datos del código anterior para evitar mezclar cuentas.
  const changeEmail = () => {
    setChangingEmail(true);
    setCodeRequested(false);
    setCode('');
    setResetToken(null);
    setPassword('');
    setConfirmPassword('');
    setValidation(null);
  };

  // Valida el código de seis dígitos y pide al backend habilitar el paso de cambio obligatorio de contraseña.
  const redeemCode = async () => {
    if (!/^\d{6}$/.test(code)) {
      setValidation('Ingresá el código de seis dígitos.');
      return;
    }
    setValidation(null);
    const temporaryResetToken = await onRedeemCode(email.trim().toLowerCase(), code);
    if (temporaryResetToken) setResetToken(temporaryResetToken);
  };

  // Valida la nueva contraseña y la confirmación antes de completar el cambio e iniciar la sesión.
  const saveNewPassword = async () => {
    if (password.length < 10) {
      setValidation('La contraseña nueva debe tener al menos 10 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setValidation('Las contraseñas no coinciden.');
      return;
    }
    if (!resetToken) return;
    setValidation(null);
    await onResetPassword(resetToken, password);
  };

  return <AuthPage>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={[styles.page, { paddingHorizontal: gutter }]} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>ESTANCIA APP</Text>
        <Text style={styles.title}>Olvidé mi contraseña</Text>
        <Text style={styles.subtitle}>Ingresá tu correo. Si pertenece a una cuenta activa, te enviaremos un código para verificar tu identidad y establecer una contraseña nueva.</Text>
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput accessibilityLabel="Correo electrónico" autoCapitalize="none" autoComplete="email" keyboardType="email-address" value={email} onChangeText={setEmail} editable={!showCodeStep && !busy} style={[styles.input, showCodeStep && styles.readOnlyInput]} placeholder="nombre@correo.com" />
        {!showCodeStep ? <PrimaryButton label="Enviar código" onPress={() => void requestCode()} loading={busy} /> : null}
        {showCodeStep && !resetToken ? <>
          <Text style={styles.notice}>{notice ?? 'Si el correo corresponde a una cuenta activa, te enviamos un código. Revisá también la carpeta de spam.'}</Text>
          <Pressable disabled={busy} accessibilityRole="button" onPress={changeEmail} style={styles.changeEmailButton}><Text style={styles.link}>Cambiar correo</Text></Pressable>
          <Text style={styles.label}>Código de recuperación</Text>
          <TextInput accessibilityLabel="Código de recuperación de seis dígitos" keyboardType="number-pad" maxLength={6} autoComplete="one-time-code" textContentType="oneTimeCode" autoFocus value={code} onChangeText={setCode} style={[styles.input, styles.codeInput]} placeholder="000000" />
          <PrimaryButton label="Validar código" onPress={() => void redeemCode()} loading={busy} />
          <Pressable disabled={busy} accessibilityRole="button" onPress={() => void requestCode()} style={styles.linkButton}><Text style={styles.link}>Reenviar código</Text></Pressable>
        </> : null}
        {resetToken ? <>
          <Text style={styles.notice}>Código verificado. Para continuar, creá una contraseña nueva.</Text>
          <Text style={styles.label}>Contraseña nueva</Text>
          <TextInput accessibilityLabel="Contraseña nueva" autoCapitalize="none" autoComplete="new-password" autoCorrect={false} secureTextEntry value={password} onChangeText={setPassword} style={styles.input} placeholder="Al menos 10 caracteres" />
          <Text style={styles.label}>Confirmar contraseña nueva</Text>
          <TextInput accessibilityLabel="Confirmar contraseña nueva" autoCapitalize="none" autoComplete="new-password" autoCorrect={false} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} style={styles.input} placeholder="Repetí la contraseña" />
          <PrimaryButton label="Cambiar contraseña y entrar" onPress={() => void saveNewPassword()} loading={busy} />
        </> : null}
        {validation || error ? <Text accessibilityRole="alert" style={styles.error}>{validation ?? error}</Text> : null}
        {!showCodeStep && notice ? <Text style={styles.notice}>{notice}</Text> : null}
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.linkButton}><Text style={styles.link}>Cancelar y volver</Text></Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  </AuthPage>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { flexGrow: 1, justifyContent: 'center', paddingVertical: 28, gap: 12, width: '100%', maxWidth: 520, alignSelf: 'center' },
  eyebrow: { color: '#52765a', fontWeight: '800', letterSpacing: 2 },
  title: { color: '#1a3020', fontSize: 30, fontWeight: '800' },
  subtitle: { color: '#6b756b', fontSize: 15, lineHeight: 22, marginBottom: 6 },
  label: { color: '#2f3931', fontSize: 14, fontWeight: '700', marginTop: 5 },
  input: { minHeight: 52, borderWidth: 1, borderColor: '#e1e7e1', borderRadius: 12, backgroundColor: '#f9faf8', paddingHorizontal: 15, color: '#1a3020', fontSize: 16 },
  readOnlyInput: { backgroundColor: '#eef1ec', color: '#667067' },
  codeInput: { fontSize: 26, letterSpacing: 10, textAlign: 'center' },
  error: { color: '#a33232', backgroundColor: '#fff0ed', padding: 11, borderRadius: 10, lineHeight: 20 },
  notice: { color: '#315a3c', backgroundColor: '#eef5ed', padding: 11, borderRadius: 10, lineHeight: 20 },
  linkButton: { alignItems: 'center', padding: 10 },
  changeEmailButton: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 2 },
  link: { color: '#2d5a27', fontWeight: '700' },
});
