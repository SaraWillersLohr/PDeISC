import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import type { PublicUser } from '../types/auth';

interface WelcomeScreenProps {
  /** La pantalla recibe explícitamente el perfil público mediante Props. */
  user: PublicUser;
  onLogout: () => void;
  onContinue: () => void;
}

export function WelcomeScreen({ user, onLogout, onContinue }: WelcomeScreenProps) {
  return (
    <View style={styles.page}>
      <View style={styles.avatar}><Text style={styles.avatarText}>{user.nombre.charAt(0).toUpperCase()}</Text></View>
      <Text style={styles.eyebrow}>ESTANCIA APP</Text>
      <Text style={styles.title}>¡Hola, {user.nombre}!</Text>
      <Text style={styles.subtitle}>Iniciaste sesión correctamente.</Text>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>CUENTA</Text>
        <Text style={styles.value}>{user.nombre} {user.apellido}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.divider} />
        <Text style={styles.cardLabel}>ROL ASIGNADO</Text>
        <Text style={styles.role}>{user.rolLabel || user.rol}</Text>
      </View>
      {user.debe_cambiar_password ? <Text style={styles.notice}>Tu cuenta requiere actualizar la contraseña inicial.</Text> : null}
      <PrimaryButton label="Continuar al sistema" onPress={onContinue} />
      <View style={styles.logoutButton}><PrimaryButton label="Cerrar sesión" onPress={onLogout} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, justifyContent: 'center', backgroundColor: '#f4f5ef', padding: 26 },
  avatar: { width: 64, height: 64, borderRadius: 22, backgroundColor: '#dce8da', alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  avatarText: { color: '#315a3c', fontSize: 28, fontWeight: '800' },
  eyebrow: { color: '#52765a', fontWeight: '800', fontSize: 12, letterSpacing: 2 },
  title: { color: '#1f2a21', fontSize: 32, fontWeight: '800', marginTop: 8 },
  subtitle: { color: '#606960', fontSize: 16, marginTop: 7, marginBottom: 26 },
  card: { padding: 20, borderRadius: 18, backgroundColor: '#fff', borderColor: '#e0e5dc', borderWidth: 1, marginBottom: 20 },
  cardLabel: { color: '#758075', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  value: { color: '#263329', fontSize: 18, fontWeight: '700', marginTop: 8 },
  email: { color: '#697269', fontSize: 14, marginTop: 4 },
  divider: { height: 1, backgroundColor: '#edf0eb', marginVertical: 17 },
  role: { color: '#315a3c', fontSize: 17, fontWeight: '700', marginTop: 7 },
  notice: { color: '#765d18', backgroundColor: '#fff4cf', padding: 12, borderRadius: 10, marginBottom: 16, lineHeight: 19 },
  logoutButton: { marginTop: 10 },
});
