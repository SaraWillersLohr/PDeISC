// Archivo src/screens/WelcomeScreen.tsx: la bienvenida posterior al inicio de sesión y los datos recibidos por props. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { AuthPage } from '../components/AuthPage';
import type { PublicUser } from '../types/auth';

// Contrato de datos WelcomeScreenProps: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
interface WelcomeScreenProps {
  // La pantalla recibe explícitamente el perfil público mediante Props.
  user: PublicUser;
  onLogout: () => void;
  onContinue: () => void;
}
// Esta función renderiza el bloque de interfaz WelcomeScreen dentro de la pantalla y conecta sus props con las acciones disponibles. Recibe user, onLogout, onContinue como entrada.
export function WelcomeScreen({ user, onLogout, onContinue }: WelcomeScreenProps) {
  const { width } = useWindowDimensions();
  const gutter = Math.max(18, Math.min(36, width * 0.07));
  return (
    <AuthPage><ScrollView contentContainerStyle={[styles.page, { paddingHorizontal: gutter }]}>
      <View style={styles.content}>
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
    </ScrollView></AuthPage>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, justifyContent: 'center', backgroundColor: 'transparent', paddingVertical: 28, width: '100%' },
  content: { width: '100%', maxWidth: 620, alignSelf: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 22, backgroundColor: '#e4eee0', alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  avatarText: { color: '#2d5a27', fontSize: 28, fontWeight: '800' },
  eyebrow: { color: '#52765a', fontWeight: '800', fontSize: 12, letterSpacing: 2 },
  title: { color: '#1a3020', fontSize: 32, fontWeight: '800', marginTop: 8 },
  subtitle: { color: '#606960', fontSize: 16, marginTop: 7, marginBottom: 26 },
  card: { padding: 20, borderRadius: 16, backgroundColor: '#fff', borderColor: '#e5e9e4', borderWidth: 1, marginBottom: 20, shadowColor: '#1a3020', shadowOpacity: 0.05, shadowRadius: 14, shadowOffset: { width: 0, height: 5 } },
  cardLabel: { color: '#758075', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  value: { color: '#263329', fontSize: 18, fontWeight: '700', marginTop: 8 },
  email: { color: '#697269', fontSize: 14, marginTop: 4 },
  divider: { height: 1, backgroundColor: '#edf0eb', marginVertical: 17 },
  role: { color: '#2d5a27', fontSize: 17, fontWeight: '700', marginTop: 7 },
  notice: { color: '#765d18', backgroundColor: '#fff4cf', padding: 12, borderRadius: 10, marginBottom: 16, lineHeight: 19 },
  logoutButton: { marginTop: 10 },
});
