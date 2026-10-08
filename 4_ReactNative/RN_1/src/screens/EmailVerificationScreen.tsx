import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';

interface Props { email: string; busy: boolean; error: string | null; notice: string | null; onBack: () => void; onVerify: (code: string) => void; onResend: () => void }
export function EmailVerificationScreen({ email, busy, error, notice, onBack, onVerify, onResend }: Props) {
  const [code, setCode] = useState(''); const [validation, setValidation] = useState<string | null>(null);
  const verify = () => { if (!/^\d{6}$/.test(code)) { setValidation('Ingresá el código de 6 dígitos.'); return; } setValidation(null); onVerify(code); };
  return <View style={styles.page}><Text style={styles.eyebrow}>ESTANCIA APP</Text><Text style={styles.title}>Verificá tu correo</Text><Text style={styles.subtitle}>Enviamos un código a {email}. Tiene una vigencia de 10 minutos.</Text>
    <TextInput accessibilityLabel="Código de verificación" keyboardType="number-pad" maxLength={6} onChangeText={setCode} value={code} placeholder="000000" style={styles.input} />
    {validation || error ? <Text accessibilityRole="alert" style={styles.error}>{validation ?? error}</Text> : null}{notice ? <Text style={styles.notice}>{notice}</Text> : null}
    <PrimaryButton label="Verificar correo" onPress={verify} loading={busy} />
    <Pressable disabled={busy} onPress={onResend} style={styles.button}><Text style={styles.link}>Reenviar código</Text></Pressable>
    <Pressable onPress={onBack} style={styles.button}><Text style={styles.link}>Volver al ingreso</Text></Pressable>
  </View>;
}
const styles = StyleSheet.create({ page: { flex: 1, justifyContent: 'center', padding: 26, backgroundColor: '#f4f5ef', gap: 14 }, eyebrow: { color: '#52765a', fontWeight: '800', letterSpacing: 2 }, title: { color: '#1f2a21', fontSize: 32, fontWeight: '800' }, subtitle: { color: '#606960', fontSize: 15, lineHeight: 22 }, input: { minHeight: 58, borderWidth: 1, borderColor: '#d8ddd3', borderRadius: 13, backgroundColor: '#fff', paddingHorizontal: 15, color: '#1f2a21', fontSize: 26, letterSpacing: 8, textAlign: 'center' }, error: { color: '#a33232' }, notice: { color: '#315a3c', textAlign: 'center' }, button: { alignItems: 'center', padding: 7 }, link: { color: '#315a3c', fontWeight: '700' } });
