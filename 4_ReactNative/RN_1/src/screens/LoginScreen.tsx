import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';

interface LoginScreenProps {
  onLogin: (email: string, password: string, remember: boolean) => Promise<void>;
  onRegisterPress: () => void;
  busy: boolean;
  error: string | null;
  notice?: string | null;
}

export function LoginScreen({ onLogin, onRegisterPress, busy, error, notice }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [validation, setValidation] = useState<string | null>(null);

  const submit = () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail) || !password) {
      setValidation('Ingresá un correo válido y tu contraseña.');
      return;
    }
    setValidation(null);
    void onLogin(cleanEmail, password, remember);
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.brandMark}><Text style={styles.brandMarkText}>E</Text></View>
        <Text style={styles.eyebrow}>ESTANCIA APP</Text>
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
          <TextInput
            accessibilityLabel="Contraseña"
            autoComplete="password"
            onChangeText={setPassword}
            onSubmitEditing={submit}
            placeholder="Tu contraseña"
            placeholderTextColor="#8a9188"
            secureTextEntry
            style={styles.input}
            value={password}
          />
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
          <Pressable accessibilityRole="button" onPress={() => Alert.alert('Recuperar contraseña', 'La API todavía no ofrece recuperación de contraseña.')} style={styles.linkButton}>
            <Text style={styles.link}>Olvidé mi contraseña</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => Alert.alert('Acceso con Google', 'Google requiere completar primero la incorporación y configurar OAuth para la app móvil.')} style={styles.googleButton}>
            <Text style={styles.googleLabel}>Continuar con Google (próximamente)</Text>
          </Pressable>
          <Text style={styles.futureOption}>Google y recuperación de contraseña se habilitarán al completar esos servicios en la API.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f4f5ef' },
  page: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 26, paddingVertical: 34 },
  brandMark: { width: 58, height: 58, borderRadius: 18, backgroundColor: '#315a3c', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  brandMarkText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  eyebrow: { color: '#52765a', fontWeight: '800', fontSize: 12, letterSpacing: 2 },
  title: { color: '#1f2a21', fontSize: 34, fontWeight: '800', marginTop: 9 },
  subtitle: { color: '#606960', fontSize: 16, marginTop: 8, marginBottom: 30 },
  form: { gap: 11 },
  label: { color: '#2f3931', fontSize: 14, fontWeight: '700', marginTop: 7 },
  input: { minHeight: 52, borderWidth: 1, borderColor: '#d8ddd3', borderRadius: 13, backgroundColor: '#fff', paddingHorizontal: 15, color: '#1f2a21', fontSize: 16 },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  checkbox: { width: 21, height: 21, borderWidth: 1.5, borderColor: '#9ca69a', borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: '#315a3c', borderColor: '#315a3c' },
  checkmark: { color: '#fff', fontWeight: '800', fontSize: 14, lineHeight: 17 },
  rememberText: { color: '#4d574e', fontSize: 14 },
  error: { color: '#a33232', fontSize: 14, lineHeight: 20 },
  notice: { color: '#315a3c', fontSize: 14, lineHeight: 20 },
  linkButton: { alignItems: 'center', paddingVertical: 8 },
  link: { color: '#315a3c', fontSize: 14, fontWeight: '700' },
  googleButton: { minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: '#d8ddd3', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  googleLabel: { color: '#384239', fontSize: 14, fontWeight: '600' },
  futureOption: { color: '#737c72', fontSize: 12, lineHeight: 17, textAlign: 'center', marginTop: 4 },
});
