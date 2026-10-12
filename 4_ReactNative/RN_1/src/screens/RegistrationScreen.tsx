import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { AuthPage } from '../components/AuthPage';
import { SocialLoginButtons } from '../components/SocialLoginButtons';
import type { SocialProviderId } from '../services/authApi';

interface Props { busy: boolean; error: string | null; socialProviders: SocialProviderId[]; onSocialRegister: (provider: SocialProviderId) => void; onBack: () => void; onSubmit: (data: { nombre: string; apellido: string; email: string; password: string }) => void }

export function RegistrationScreen({ busy, error, socialProviders, onSocialRegister, onBack, onSubmit }: Props) {
  const { width } = useWindowDimensions();
  const gutter = Math.max(18, Math.min(36, width * 0.07));
  const [nombre, setNombre] = useState(''); const [apellido, setApellido] = useState(''); const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [validation, setValidation] = useState<string | null>(null);
  const submit = () => {
    if (!nombre.trim() || !apellido.trim() || !/^\S+@\S+\.\S+$/.test(email.trim()) || password.length < 10) { setValidation('Completá tus datos y usá una contraseña de al menos 10 caracteres.'); return; }
    if (password !== confirm) { setValidation('Las contraseñas no coinciden.'); return; }
    setValidation(null); onSubmit({ nombre: nombre.trim(), apellido: apellido.trim(), email: email.trim().toLowerCase(), password });
  };
  return <AuthPage><KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}><ScrollView contentContainerStyle={[styles.page, { paddingHorizontal: gutter }]} keyboardShouldPersistTaps="handled">
    <Text style={styles.eyebrow}>ESTANCIA APP</Text><Text style={styles.title}>Crear cuenta</Text>
    <Text style={styles.subtitle}>Podés crear una solicitud con tu correo o con una cuenta social. En ambos casos el administrador debe aprobarla; después te enviamos el token de acceso.</Text>
    <SocialLoginButtons providers={socialProviders} rememberMe={false} intent="register" onSelect={(provider) => onSocialRegister(provider)} />
    {socialProviders.length ? <Text style={styles.orEmail}>O registrate con correo electrónico</Text> : null}
    <View style={styles.form}>{[["Nombre", nombre, setNombre], ["Apellido", apellido, setApellido], ["Correo electrónico", email, setEmail], ["Contraseña", password, setPassword], ["Repetí la contraseña", confirm, setConfirm]].map(([label, value, setter]: any) => <View key={label}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} autoCapitalize={label === 'Correo electrónico' ? 'none' : 'words'} keyboardType={label === 'Correo electrónico' ? 'email-address' : 'default'} secureTextEntry={label.includes('contraseña')} onChangeText={setter} style={styles.input} value={value} /></View>)}
      {validation || error ? <Text accessibilityRole="alert" style={styles.error}>{validation ?? error}</Text> : null}
      <PrimaryButton label="Registrarme y enviar código" onPress={submit} loading={busy} />
      <Pressable onPress={onBack} style={styles.linkButton}><Text style={styles.link}>Volver al ingreso</Text></Pressable>
    </View>
  </ScrollView></KeyboardAvoidingView></AuthPage>;
}

const styles = StyleSheet.create({ flex: { flex: 1, backgroundColor: 'transparent' }, page: { flexGrow: 1, justifyContent: 'center', paddingVertical: 28, width: '100%', maxWidth: 520, alignSelf: 'center' }, eyebrow: { color: '#52765a', fontWeight: '800', letterSpacing: 2 }, title: { color: '#1a3020', fontSize: 32, fontWeight: '800', marginTop: 10 }, subtitle: { color: '#6b756b', fontSize: 15, lineHeight: 22, marginVertical: 12 }, orEmail: { textAlign: 'center', color: '#69746b', marginTop: 14, marginBottom: 4, fontSize: 13 }, form: { gap: 12 }, label: { color: '#2f3931', fontSize: 14, fontWeight: '700', marginTop: 7 }, input: { minHeight: 50, borderWidth: 1, borderColor: '#e1e7e1', borderRadius: 12, backgroundColor: '#f9faf8', paddingHorizontal: 15, color: '#1a3020', fontSize: 16 }, error: { color: '#a33232', lineHeight: 20, backgroundColor: '#fff0ed', padding: 11, borderRadius: 10 }, linkButton: { alignItems: 'center', padding: 10 }, link: { color: '#2d5a27', fontWeight: '700' } });
