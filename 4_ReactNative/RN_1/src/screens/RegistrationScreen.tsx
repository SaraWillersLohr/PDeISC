// Archivo src/screens/RegistrationScreen.tsx: el formulario para crear una solicitud de registro. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { AuthPage } from '../components/AuthPage';

// Contrato de datos Props: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
interface Props { busy: boolean; error: string | null; onBack: () => void; onSubmit: (data: { nombre: string; apellido: string; email: string; password: string }) => void }
// Esta función renderiza el formulario de registro y conecta sus props con las acciones disponibles. Recibe busy, error, onBack y onSubmit como entrada.
export function RegistrationScreen({ busy, error, onBack, onSubmit }: Props) {
  const { width } = useWindowDimensions();
  const gutter = Math.max(18, Math.min(36, width * 0.07));
  const [nombre, setNombre] = useState(''); const [apellido, setApellido] = useState(''); const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [validation, setValidation] = useState<string | null>(null);
  // Esta función comprueba los valores del formulario y llama a la acción recibida por props solo si las validaciones locales pasan.
  const submit = () => {
    if (!nombre.trim() || !apellido.trim() || !/^\S+@\S+\.\S+$/.test(email.trim()) || password.length < 10) { setValidation('Completá tus datos y usá una contraseña de al menos 10 caracteres.'); return; }
    if (password !== confirm) { setValidation('Las contraseñas no coinciden.'); return; }
    setValidation(null); onSubmit({ nombre: nombre.trim(), apellido: apellido.trim(), email: email.trim().toLowerCase(), password });
  };
  return <AuthPage><KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}><ScrollView contentContainerStyle={[styles.page, { paddingHorizontal: gutter }]} keyboardShouldPersistTaps="handled">
    <Text style={styles.eyebrow}>ESTANCIA APP</Text><Text style={styles.title}>Crear cuenta</Text>
    <Text style={styles.subtitle}>Registrate con tu correo. El administrador debe aprobar la solicitud; después te enviamos el token de acceso.</Text>
    <View style={styles.form}>{[["Nombre", nombre, setNombre], ["Apellido", apellido, setApellido], ["Correo electrónico", email, setEmail], ["Contraseña", password, setPassword], ["Repetí la contraseña", confirm, setConfirm]].map(([label, value, setter]: any) => <View key={label}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} autoCapitalize={label === 'Correo electrónico' ? 'none' : 'words'} keyboardType={label === 'Correo electrónico' ? 'email-address' : 'default'} secureTextEntry={label.includes('contraseña')} onChangeText={setter} style={styles.input} value={value} /></View>)}
      {validation || error ? <Text accessibilityRole="alert" style={styles.error}>{validation ?? error}</Text> : null}
      <PrimaryButton label="Registrarme y enviar código" onPress={submit} loading={busy} />
      <Pressable onPress={onBack} style={styles.linkButton}><Text style={styles.link}>Volver al ingreso</Text></Pressable>
    </View>
  </ScrollView></KeyboardAvoidingView></AuthPage>;
}

const styles = StyleSheet.create({ flex: { flex: 1, backgroundColor: 'transparent' }, page: { flexGrow: 1, justifyContent: 'center', paddingVertical: 28, width: '100%', maxWidth: 520, alignSelf: 'center' }, eyebrow: { color: '#52765a', fontWeight: '800', letterSpacing: 2 }, title: { color: '#1a3020', fontSize: 32, fontWeight: '800', marginTop: 10 }, subtitle: { color: '#6b756b', fontSize: 15, lineHeight: 22, marginVertical: 12 }, form: { gap: 12 }, label: { color: '#2f3931', fontSize: 14, fontWeight: '700', marginTop: 7 }, input: { minHeight: 50, borderWidth: 1, borderColor: '#e1e7e1', borderRadius: 12, backgroundColor: '#f9faf8', paddingHorizontal: 15, color: '#1a3020', fontSize: 16 }, error: { color: '#a33232', lineHeight: 20, backgroundColor: '#fff0ed', padding: 11, borderRadius: 10 }, linkButton: { alignItems: 'center', padding: 10 }, link: { color: '#2d5a27', fontWeight: '700' } });
