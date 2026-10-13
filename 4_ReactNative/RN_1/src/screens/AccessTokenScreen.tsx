// Archivo src/screens/AccessTokenScreen.tsx: el canje o reenvío del token recibido tras la aprobación. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { AuthPage } from '../components/AuthPage';

// Contrato de datos Props: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
interface Props {
  initialEmail: string;
  busy: boolean;
  error: string | null;
  notice: string | null;
  onBack: () => void;
  onRedeem: (email: string, token: string, remember: boolean) => void;
  onResend: (email: string) => void;
}
// Esta función renderiza el bloque de interfaz AccessTokenScreen dentro de la pantalla y conecta sus props con las acciones disponibles. Recibe initialEmail, busy, error, notice, onBack, onRedeem, onResend como entrada.
export function AccessTokenScreen({ initialEmail, busy, error, notice, onBack, onRedeem, onResend }: Props) {
  const { width } = useWindowDimensions();
  const gutter = Math.max(18, Math.min(36, width * 0.07));
  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState('');
  const [remember, setRemember] = useState(false);
  const [validation, setValidation] = useState<string | null>(null);
  // Esta función comprueba los valores del formulario y llama a la acción recibida por props solo si las validaciones locales pasan.
  const submit = () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.trim();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail) || !/^\d{6}$/.test(cleanToken)) {
      setValidation('Ingresá tu correo y el código de seis dígitos que recibiste después de la aprobación.');
      return;
    }
    setValidation(null);
    onRedeem(cleanEmail, cleanToken, remember);
  };
  // Esta función solicita el reenvío del token de acceso y presenta el resultado mediante el mensaje recibido por props.
  const resend = () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setValidation('Ingresá un correo válido para solicitar el reenvío.');
      return;
    }
    setValidation(null);
    onResend(cleanEmail);
  };

  return <AuthPage><KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView contentContainerStyle={[styles.page, { paddingHorizontal: gutter }]} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        <Text style={styles.eyebrow}>ESTANCIA APP</Text>
        <Text style={styles.title}>Código de acceso</Text>
        <Text style={styles.subtitle}>Después de aprobar tu solicitud, el administrador te envía un código de seis dígitos. Vence en 10 minutos y se puede usar una sola vez.</Text>
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput accessibilityLabel="Correo electrónico" autoCapitalize="none" autoComplete="email" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} placeholder="nombre@correo.com" />
        <Text style={styles.label}>Código recibido</Text>
        <TextInput accessibilityLabel="Código de acceso de seis dígitos" keyboardType="number-pad" maxLength={6} autoCapitalize="none" autoCorrect={false} autoComplete="one-time-code" textContentType="oneTimeCode" value={token} onChangeText={setToken} style={[styles.input, styles.codeInput]} placeholder="000000" />
        <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: remember }} onPress={() => setRemember(!remember)} style={styles.rememberRow}>
          <View style={[styles.checkbox, remember && styles.checked]}>{remember ? <Text style={styles.checkmark}>✓</Text> : null}</View>
          <Text style={styles.rememberText}>Recordar sesión en este dispositivo</Text>
        </Pressable>
        {validation || error ? <Text accessibilityRole="alert" style={styles.error}>{validation ?? error}</Text> : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        <PrimaryButton label="Canjear código e ingresar" onPress={submit} loading={busy} />
        <Pressable disabled={busy} accessibilityRole="button" onPress={resend} style={styles.linkButton}><Text style={styles.link}>Reenviar código de acceso</Text></Pressable>
        <Pressable disabled={busy} accessibilityRole="button" onPress={onBack} style={styles.linkButton}><Text style={styles.link}>Volver al ingreso</Text></Pressable>
      </View>
    </ScrollView>
  </KeyboardAvoidingView></AuthPage>;
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: 'transparent' },
  page: { flexGrow: 1, justifyContent: 'center', paddingVertical: 28, width: '100%' },
  content: { width: '100%', maxWidth: 620, alignSelf: 'center' },
  eyebrow: { color: '#52765a', fontWeight: '800', letterSpacing: 2 },
  title: { color: '#1a3020', fontSize: 32, fontWeight: '800', marginTop: 10 },
  subtitle: { color: '#6b756b', fontSize: 15, lineHeight: 22, marginVertical: 14 },
  label: { color: '#2f3931', fontSize: 14, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  input: { minHeight: 50, borderWidth: 1, borderColor: '#e1e7e1', borderRadius: 12, backgroundColor: '#f9faf8', paddingHorizontal: 15, color: '#1a3020', fontSize: 16 },
  codeInput: { fontSize: 26, letterSpacing: 10, textAlign: 'center' },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14 },
  checkbox: { width: 21, height: 21, borderWidth: 1.5, borderColor: '#9ca69a', borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: '#2d5a27', borderColor: '#2d5a27' },
  checkmark: { color: '#fff', fontWeight: '800', fontSize: 14, lineHeight: 17 },
  rememberText: { color: '#4d574e', fontSize: 14 },
  error: { color: '#a33232', backgroundColor: '#fff0ed', borderRadius: 10, padding: 11, fontSize: 14, lineHeight: 20, marginBottom: 8 },
  notice: { color: '#315a3c', backgroundColor: '#eef5ed', borderRadius: 10, padding: 11, fontSize: 14, lineHeight: 20, marginBottom: 8 },
  linkButton: { alignItems: 'center', paddingVertical: 10 },
  link: { color: '#2d5a27', fontWeight: '700' },
});
