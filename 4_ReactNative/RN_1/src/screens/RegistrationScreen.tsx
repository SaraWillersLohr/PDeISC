import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';

interface Props { busy: boolean; error: string | null; onBack: () => void; onSubmit: (data: { nombre: string; apellido: string; email: string; password: string }) => void }

export function RegistrationScreen({ busy, error, onBack, onSubmit }: Props) {
  const [nombre, setNombre] = useState(''); const [apellido, setApellido] = useState(''); const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [validation, setValidation] = useState<string | null>(null);
  const submit = () => {
    if (!nombre.trim() || !apellido.trim() || !/^\S+@\S+\.\S+$/.test(email.trim()) || password.length < 10) { setValidation('Completá tus datos y usá una contraseña de al menos 10 caracteres.'); return; }
    if (password !== confirm) { setValidation('Las contraseñas no coinciden.'); return; }
    setValidation(null); onSubmit({ nombre: nombre.trim(), apellido: apellido.trim(), email: email.trim().toLowerCase(), password });
  };
  return <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
    <Text style={styles.eyebrow}>ESTANCIA APP</Text><Text style={styles.title}>Crear cuenta</Text>
    <Text style={styles.subtitle}>Verificaremos tu correo. Luego un administrador deberá aprobar el acceso.</Text>
    <View style={styles.form}>{[["Nombre", nombre, setNombre], ["Apellido", apellido, setApellido], ["Correo electrónico", email, setEmail], ["Contraseña", password, setPassword], ["Repetí la contraseña", confirm, setConfirm]].map(([label, value, setter]: any) => <View key={label}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} autoCapitalize={label === 'Correo electrónico' ? 'none' : 'words'} keyboardType={label === 'Correo electrónico' ? 'email-address' : 'default'} secureTextEntry={label.includes('contraseña')} onChangeText={setter} style={styles.input} value={value} /></View>)}
      {validation || error ? <Text accessibilityRole="alert" style={styles.error}>{validation ?? error}</Text> : null}
      <PrimaryButton label="Registrarme y enviar código" onPress={submit} loading={busy} />
      <Pressable onPress={onBack} style={styles.linkButton}><Text style={styles.link}>Volver al ingreso</Text></Pressable>
    </View>
  </ScrollView></KeyboardAvoidingView>;
}

const styles = StyleSheet.create({ flex: { flex: 1, backgroundColor: '#f4f5ef' }, page: { flexGrow: 1, justifyContent: 'center', padding: 26 }, eyebrow: { color: '#52765a', fontWeight: '800', letterSpacing: 2 }, title: { color: '#1f2a21', fontSize: 32, fontWeight: '800', marginTop: 10 }, subtitle: { color: '#606960', fontSize: 15, lineHeight: 22, marginVertical: 12 }, form: { gap: 12 }, label: { color: '#2f3931', fontSize: 14, fontWeight: '700', marginBottom: 6 }, input: { minHeight: 50, borderWidth: 1, borderColor: '#d8ddd3', borderRadius: 13, backgroundColor: '#fff', paddingHorizontal: 15, color: '#1f2a21', fontSize: 16 }, error: { color: '#a33232', lineHeight: 20 }, linkButton: { alignItems: 'center', padding: 10 }, link: { color: '#315a3c', fontWeight: '700' } });
