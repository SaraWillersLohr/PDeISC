import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';

interface Props { busy: boolean; error: string | null; onSubmit: (password: string) => void }
export function PasswordChangeScreen({ busy, error, onSubmit }: Props) {
  const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [validation, setValidation] = useState<string | null>(null);
  const submit = () => {
    if (password.length < 10) { setValidation('Usá al menos 10 caracteres.'); return; }
    if (password !== confirm) { setValidation('Las contraseñas no coinciden.'); return; }
    setValidation(null); onSubmit(password);
  };
  return <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
    <Text style={styles.eyebrow}>ESTANCIA APP</Text><Text style={styles.title}>Actualizá tu contraseña</Text><Text style={styles.subtitle}>Por seguridad, elegí una contraseña personal antes de continuar.</Text>
    <TextInput accessibilityLabel="Nueva contraseña" placeholder="Nueva contraseña" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
    <TextInput accessibilityLabel="Confirmar contraseña" placeholder="Repetí la contraseña" secureTextEntry value={confirm} onChangeText={setConfirm} onSubmitEditing={submit} style={styles.input} />
    {validation || error ? <Text accessibilityRole="alert" style={styles.error}>{validation ?? error}</Text> : null}
    <PrimaryButton label="Guardar y continuar" onPress={submit} loading={busy} />
  </ScrollView></KeyboardAvoidingView>;
}
const styles = StyleSheet.create({ flex: { flex: 1, backgroundColor: '#f4f5ef' }, page: { flexGrow: 1, justifyContent: 'center', padding: 26, gap: 14 }, eyebrow: { color: '#52765a', fontWeight: '800', letterSpacing: 2 }, title: { color: '#1f2a21', fontSize: 30, fontWeight: '800' }, subtitle: { color: '#606960', fontSize: 15, lineHeight: 22 }, input: { minHeight: 52, borderWidth: 1, borderColor: '#d8ddd3', borderRadius: 13, backgroundColor: '#fff', paddingHorizontal: 15, color: '#1f2a21', fontSize: 16 }, error: { color: '#a33232', lineHeight: 20 } });
