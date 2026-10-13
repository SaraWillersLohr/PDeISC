// Archivo src/screens/PasswordChangeScreen.tsx: el cambio de contraseña inicial solicitado al ingresar. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { AuthPage } from '../components/AuthPage';

// Contrato de datos Props: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
interface Props { busy: boolean; error: string | null; onSubmit: (password: string) => void }
// Esta función renderiza el bloque de interfaz PasswordChangeScreen dentro de la pantalla y conecta sus props con las acciones disponibles. Recibe busy, error, onSubmit como entrada.
export function PasswordChangeScreen({ busy, error, onSubmit }: Props) {
  const { width } = useWindowDimensions();
  const gutter = Math.max(18, Math.min(36, width * 0.07));
  const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [validation, setValidation] = useState<string | null>(null);
  // Esta función comprueba los valores del formulario y llama a la acción recibida por props solo si las validaciones locales pasan.
  const submit = () => {
    if (password.length < 10) { setValidation('Usá al menos 10 caracteres.'); return; }
    if (password !== confirm) { setValidation('Las contraseñas no coinciden.'); return; }
    setValidation(null); onSubmit(password);
  };
  return <AuthPage><KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}><ScrollView contentContainerStyle={[styles.page, { paddingHorizontal: gutter }]} keyboardShouldPersistTaps="handled">
    <Text style={styles.eyebrow}>ESTANCIA APP</Text><Text style={styles.title}>Actualizá tu contraseña</Text><Text style={styles.subtitle}>Por seguridad, elegí una contraseña personal antes de continuar.</Text>
    <TextInput accessibilityLabel="Nueva contraseña" placeholder="Nueva contraseña" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
    <TextInput accessibilityLabel="Confirmar contraseña" placeholder="Repetí la contraseña" secureTextEntry value={confirm} onChangeText={setConfirm} onSubmitEditing={submit} style={styles.input} />
    {validation || error ? <Text accessibilityRole="alert" style={styles.error}>{validation ?? error}</Text> : null}
    <PrimaryButton label="Guardar y continuar" onPress={submit} loading={busy} />
  </ScrollView></KeyboardAvoidingView></AuthPage>;
}
const styles = StyleSheet.create({ flex: { flex: 1, backgroundColor: 'transparent' }, page: { flexGrow: 1, justifyContent: 'center', paddingVertical: 28, gap: 14, width: '100%', maxWidth: 520, alignSelf: 'center' }, eyebrow: { color: '#52765a', fontWeight: '800', letterSpacing: 2 }, title: { color: '#1a3020', fontSize: 30, fontWeight: '800' }, subtitle: { color: '#6b756b', fontSize: 15, lineHeight: 22 }, input: { minHeight: 52, borderWidth: 1, borderColor: '#e1e7e1', borderRadius: 12, backgroundColor: '#f9faf8', paddingHorizontal: 15, color: '#1a3020', fontSize: 16 }, error: { color: '#a33232', lineHeight: 20, backgroundColor: '#fff0ed', padding: 11, borderRadius: 10 } });
