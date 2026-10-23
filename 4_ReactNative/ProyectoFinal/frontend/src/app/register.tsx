// permito solicitar acceso a la estancia instalada y verificar el correo.
import { useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { requestAccount } from '../services/authApi';
import { BrandWordmark } from '../components/BrandWordmark';

// reuno y valido los datos antes de crear una solicitud de acceso.
export default function RegisterScreen() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // valido los datos localmente y solicito el código de confirmación al backend.
  async function submit(): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (!nombre.trim() || !apellido.trim() || !/^\S+@\S+\.\S+$/.test(cleanEmail) || password.length < 10) {
      setError('Completá nombre y apellido, ingresá un correo válido y usá una contraseña de al menos 10 caracteres.');
      return;
    }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
    setBusy(true);
    setError('');
    try {
      await requestAccount({ nombre: nombre.trim(), apellido: apellido.trim(), email: cleanEmail, password });
      router.push({ pathname: '/verify', params: { email: cleanEmail } });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo enviar la solicitud.');
    } finally { setBusy(false); }
  }

  return <SafeAreaView style={s.safe}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.flex}><ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
    <View style={s.brand}><BrandWordmark /></View>
    <Text style={s.eyebrow}>ACCESO AL EQUIPO</Text><Text style={s.title}>Solicitar cuenta</Text>
    <Text style={s.copy}>Esta solicitud es para la estancia conectada a esta app. Completá tus datos, verificá el correo y el administrador revisará la solicitud y asignará tu rol.</Text>
    <Text style={s.label}>NOMBRE</Text><TextInput autoCapitalize="words" onChangeText={setNombre} placeholder="Tu nombre" style={s.input} value={nombre} />
    <Text style={s.label}>APELLIDO</Text><TextInput autoCapitalize="words" onChangeText={setApellido} placeholder="Tu apellido" style={s.input} value={apellido} />
    <Text style={s.label}>CORREO ELECTRÓNICO</Text><TextInput autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="nombre@correo.com" style={s.input} value={email} />
    <Text style={s.label}>CONTRASEÑA</Text><TextInput autoComplete="new-password" onChangeText={setPassword} placeholder="Mínimo 10 caracteres" secureTextEntry style={s.input} value={password} />
    <Text style={s.label}>REPETÍ LA CONTRASEÑA</Text><TextInput autoComplete="new-password" onChangeText={setConfirm} placeholder="Volvé a escribirla" secureTextEntry style={s.input} value={confirm} />
    {error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}
    <Pressable disabled={busy} onPress={() => void submit()} style={[s.primary, busy && s.disabled]}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryText}>Enviar solicitud</Text>}</Pressable>
    <Pressable onPress={() => router.back()} style={s.back}><Text style={s.backText}>Volver al ingreso</Text></Pressable>
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}

const s = StyleSheet.create({ safe: { backgroundColor: '#f4f6f1', flex: 1 }, flex: { flex: 1 }, page: { alignSelf: 'center', maxWidth: 520, padding: 22, paddingBottom: 36, width: '100%' }, brand: { alignItems: 'center', flexDirection: 'row', gap: 9, marginBottom: 26 }, brandIcon: { backgroundColor: '#214d35', borderRadius: 9, color: '#e2eccf', fontSize: 18, overflow: 'hidden', padding: 7 }, brandName: { color: '#214d35', fontSize: 19, fontWeight: '800' }, eyebrow: { color: '#748076', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 }, title: { color: '#202c23', fontSize: 27, fontWeight: '800', marginTop: 8 }, copy: { color: '#748076', fontSize: 13, lineHeight: 20, marginBottom: 16, marginTop: 7 }, label: { color: '#626e63', fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 6, marginTop: 10 }, input: { backgroundColor: '#fff', borderColor: '#e3e8e1', borderRadius: 11, borderWidth: 1, color: '#202c23', fontSize: 14, height: 47, paddingHorizontal: 13 }, error: { backgroundColor: '#fff0ed', borderRadius: 10, color: '#9b3d36', fontSize: 12, lineHeight: 18, marginTop: 13, padding: 11 }, primary: { alignItems: 'center', backgroundColor: '#214d35', borderRadius: 12, height: 49, justifyContent: 'center', marginTop: 18 }, disabled: { opacity: 0.7 }, primaryText: { color: '#fff', fontSize: 14, fontWeight: '700' }, back: { alignItems: 'center', padding: 14 }, backText: { color: '#214d35', fontSize: 12, fontWeight: '700' } });
