// protejo las secciones y organizo los accesos móviles.
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { useSession } from '../../context/SessionContext';

const green = '#214d35';

export default function AppTabs() {
  const { session, restoring } = useSession();
  if (restoring) return <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}><ActivityIndicator color={green} /></View>;
  if (!session) return <Redirect href="/" />;
  const role = session.usuario.rol.toLowerCase() === 'copropietario' ? 'administrador' : session.usuario.rol.toLowerCase();
  const isVet = role === 'veterinario';
  const isOwner = role === 'dueno';
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: green, tabBarInactiveTintColor: '#89938a', tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#e5eae3', height: 63, paddingBottom: 7, paddingTop: 5 }, tabBarLabelStyle: { fontSize: 10, fontWeight: '600' } }}>
    <Tabs.Screen name="index" options={{ title: isVet ? 'Enfermería' : 'Inicio', tabBarIcon: () => <TabIcon label={isVet ? '✚' : '⌂'} /> }} />
    <Tabs.Screen name="animals" options={{ title: 'Animales', href: isVet ? null : undefined, tabBarIcon: () => <TabIcon label="◉" /> }} />
    <Tabs.Screen name="tasks" options={{ title: 'Tareas', href: isVet || isOwner ? null : undefined, tabBarIcon: () => <TabIcon label="✓" /> }} />
    <Tabs.Screen name="health" options={{ title: role === 'peon' ? 'Reportes' : 'Sanidad', href: isVet || isOwner ? null : undefined, tabBarIcon: () => <TabIcon label="✚" /> }} />
    <Tabs.Screen name="more" options={{ title: isVet ? 'Perfil' : 'Más', tabBarIcon: () => <TabIcon label={isVet ? '◎' : '•••'} /> }} />
  </Tabs>;
}

function TabIcon({ label }: { label: string }) { return <Text style={{ color: green, fontSize: 19, fontWeight: '700', height: 22, textAlign: 'center' }}>{label}</Text>; }
