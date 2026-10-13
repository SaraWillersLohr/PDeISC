// Archivo src/screens/PasswordRecoveryScreen.tsx: solicitud y uso del código de recuperación de contraseña mediante la API.
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { AuthPage } from '../components/AuthPage';
import { PrimaryButton } from '../components/PrimaryButton';

// Contrato de datos PasswordRecoveryScreenProps: define el estado y las acciones que App inyecta para completar la recuperación.
interface PasswordRecoveryScreenProps {
  initialEmail: string;
  busy: boolean;
  error: string | null;
  onBack: () => void;
  onRequestCode: (email: string) => Promise<boolean>;
  onResetPassword: (email: string, code: string, password: string) => Promise<boolean>;
}

// Esta función representa la recuperación de acceso y guía por los pasos de solicitud de código y cambio de contraseña.
export function PasswordRecoveryScreen({ initialEmail, busy, error, onBack, onRequestCode, onResetPassword }: PasswordRecoveryScreenProps) {
  const { width } = useWindowDimensions();
  const gutter = Math.max(18, Math.min(36, width * 0.07));
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [codeRequested, setCodeRequested] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [validation, setValidation] = useState<string | null>(null);

  // Valida el correo localmente y solicita un código; la respuesta del servidor no confirma si ese correo está registrado.
  const requestCode = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setValidation('Ingresá un correo válido.');
      return;
    }
    setValidation(null);
    if (await onRequestCode(cleanEmail)) setCodeRequested(true);
  };

  // Valida formato del código y contraseña antes de solicitar el cambio definitivo a la API.
  const resetPassword = async () => {
    if (!/^\d{6}$/.test(code)) {
      setValidation('Ingresá el código de seis dígitos.');
      return;
    }
    if (password.length < 10) {
      setValidation('La contraseña nueva debe tener al menos 10 caracteres.');
      return;
    }
    setValidation(null);
    if (await onResetPassword(email.trim().toLowerCase(), code, password)) setCompleted(true);
  };

  return <AuthPage>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={[styles.page, { paddingHorizontal: gutter }]} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>ESTANCIA APP</Text>
        <Text style={styles.title}>Recuperar acceso</Text>
        <Text style={styles.subtitle}>Te enviaremos un código de seis dígitos si la cuenta puede recuperar el acceso. El código vence en 10 minutos y permite hasta cinco intentos.</Text>
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput accessibilityLabel="Correo electrónico" autoCapitalize="none" autoComplete="email" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} placeholder="nombre@correo.com" />
        {!codeRequested ? <PrimaryButton label="Enviar código" onPress={() => void requestCode()} loading={busy} /> : null}
        {codeRequested && !completed ? <>
          <Text style={styles.label}>Código de recuperación</Text>
          <TextInput accessibilityLabel="Código de recuperación de seis dígitos" keyboardType="number-pad" maxLength={6} autoComplete="one-time-code" textContentType="oneTimeCode" value={code} onChangeText={setCode} style={[styles.input, styles.codeInput]} placeholder="000000" />
          <Text style={styles.label}>Contraseña nueva</Text>
          <TextInput accessibilityLabel="Contraseña nueva" autoCapitalize="none" autoComplete="new-password" autoCorrect={false} secureTextEntry value={password} onChangeText={setPassword} style={styles.input} placeholder="Al menos 10 caracteres" />
          <PrimaryButton label="Cambiar contraseña" onPress={() => void resetPassword()} loading={busy} />
          <Pressable disabled={busy} accessibilityRole="button" onPress={() => void requestCode()} style={styles.linkButton}><Text style={styles.link}>Reenviar código</Text></Pressable>
        </> : null}
        {validation || error ? <Text accessibilityRole="alert" style={styles.error}>{validation ?? error}</Text> : null}
        {completed ? <Text style={styles.notice}>Contraseña actualizada. Ya podés ingresar con tu nueva contraseña.</Text> : null}
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.linkButton}><Text style={styles.link}>{completed ? 'Volver al ingreso' : 'Cancelar y volver'}</Text></Pressable>
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
  codeInput: { fontSize: 26, letterSpacing: 10, textAlign: 'center' },
  error: { color: '#a33232', backgroundColor: '#fff0ed', padding: 11, borderRadius: 10, lineHeight: 20 },
  notice: { color: '#315a3c', backgroundColor: '#eef5ed', padding: 11, borderRadius: 10, lineHeight: 20 },
  linkButton: { alignItems: 'center', padding: 10 },
  link: { color: '#2d5a27', fontWeight: '700' },
});
