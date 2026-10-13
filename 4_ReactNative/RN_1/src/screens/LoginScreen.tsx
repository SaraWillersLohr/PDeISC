// Archivo src/screens/LoginScreen.tsx: el formulario de ingreso y las alternativas de autenticación disponibles. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PrimaryButton } from '../components/PrimaryButton';
import { AuthPage } from '../components/AuthPage';
import { SocialLoginButtons } from '../components/SocialLoginButtons';
import type { SocialProviderId } from '../services/authApi';

// Contrato de datos LoginScreenProps: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
interface LoginScreenProps {
  onLogin: (email: string, password: string, remember: boolean) => Promise<void>;
  onAccessTokenPress: (email: string) => void;
  onRecoveryPress: (email: string) => void;
  onRegisterPress: () => void;
  socialProviders: SocialProviderId[];
  onSocialLogin: (provider: SocialProviderId, remember: boolean) => void;
  busy: boolean;
  error: string | null;
  notice?: string | null;
}
// Esta función renderiza el bloque de interfaz LoginScreen dentro de la pantalla y conecta sus props con las acciones disponibles. Recibe onLogin, onAccessTokenPress, onRegisterPress, socialProviders, onSocialLogin, busy, error, notice como entrada.
export function LoginScreen({ onLogin, onAccessTokenPress, onRecoveryPress, onRegisterPress, socialProviders, onSocialLogin, busy, error, notice }: LoginScreenProps) {
  const { width } = useWindowDimensions();
  const gutter = Math.max(18, Math.min(36, width * 0.07));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validation, setValidation] = useState<string | null>(null);
  // Esta función comprueba los valores del formulario y llama a la acción recibida por props solo si las validaciones locales pasan.
  const submit = () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail) || !password) {
      setValidation('Ingresá un correo válido y tu contraseña.');
      return;
    }
    setValidation(null);
    void onLogin(cleanEmail, password, remember);
  };

  return <AuthPage>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={[styles.page, { paddingHorizontal: gutter }]} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Bienvenida</Text>
        <Text style={styles.subtitle}>Ingresá con tu cuenta para continuar.</Text>
        <View style={styles.form}>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            accessibilityLabel="Correo electrónico"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="nombre@correo.com"
            placeholderTextColor="#8a9188"
            style={styles.input}
            value={email}
          />
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passwordRow}>
            <TextInput
              accessibilityLabel="Contraseña"
              autoCapitalize="none"
              autoComplete="current-password"
              autoCorrect={false}
              onChangeText={setPassword}
              onSubmitEditing={submit}
              placeholder="Tu contraseña"
              placeholderTextColor="#8a9188"
              secureTextEntry={!showPassword}
              spellCheck={false}
              style={[styles.input, styles.passwordInput]}
              textContentType="password"
              value={password}
            />
            <Pressable accessibilityRole="button" accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} onPress={() => setShowPassword((visible) => !visible)} style={styles.passwordVisibility}>
              <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={21} color="#315a3c" />
            </Pressable>
          </View>
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: remember }} onPress={() => setRemember(!remember)} style={styles.rememberRow}>
            <View style={[styles.checkbox, remember && styles.checked]}>{remember ? <Text style={styles.checkmark}>✓</Text> : null}</View>
            <Text style={styles.rememberText}>Recordar sesión en este dispositivo</Text>
          </Pressable>
          {validation || error ? <Text accessibilityRole="alert" style={styles.error}>{validation ?? error}</Text> : null}
          {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          <PrimaryButton label="Ingresar" onPress={submit} loading={busy} />
          <Pressable accessibilityRole="button" onPress={onRegisterPress} style={styles.linkButton}>
            <Text style={styles.link}>¿No tenés cuenta? Crear una cuenta</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => onAccessTokenPress(email.trim().toLowerCase())} style={styles.linkButton}>
            <Text style={styles.link}>¿Aprobaron tu solicitud? Ingresar con token</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => onRecoveryPress(email.trim().toLowerCase())} style={styles.linkButton}>
            <Text style={styles.link}>Olvidé mi contraseña</Text>
          </Pressable>
          <SocialLoginButtons providers={socialProviders} rememberMe={remember} onSelect={onSocialLogin} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </AuthPage>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { flexGrow: 1, justifyContent: 'center', paddingVertical: 28, width: '100%', maxWidth: 520, alignSelf: 'center' },
  title: { color: '#1a3020', fontSize: 34, fontWeight: '800', marginTop: 9 },
  subtitle: { color: '#6b756b', fontSize: 16, marginTop: 8, marginBottom: 24 },
  form: { gap: 11 },
  label: { color: '#2f3931', fontSize: 14, fontWeight: '700', marginTop: 7 },
  input: { minHeight: 52, borderWidth: 1, borderColor: '#e1e7e1', borderRadius: 13, backgroundColor: '#f9faf8', paddingHorizontal: 15, color: '#1a3020', fontSize: 16 },
  passwordRow: { position: 'relative', justifyContent: 'center' },
  passwordInput: { paddingRight: 52 },
  passwordVisibility: { position: 'absolute', right: 8, height: 44, minWidth: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  checkbox: { width: 21, height: 21, borderWidth: 1.5, borderColor: '#9ca69a', borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: '#2d5a27', borderColor: '#2d5a27' },
  checkmark: { color: '#fff', fontWeight: '800', fontSize: 14, lineHeight: 17 },
  rememberText: { color: '#4d574e', fontSize: 14 },
  error: { color: '#a33232', backgroundColor: '#fff0ed', borderRadius: 11, padding: 12, fontSize: 14, lineHeight: 20 },
  notice: { color: '#315a3c', backgroundColor: '#eef5ed', borderRadius: 11, padding: 12, fontSize: 14, lineHeight: 20 },
  linkButton: { alignItems: 'center', paddingVertical: 8 },
  link: { color: '#2d5a27', fontSize: 14, fontWeight: '700' },
});
