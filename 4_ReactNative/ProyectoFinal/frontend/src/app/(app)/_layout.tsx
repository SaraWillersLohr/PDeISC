// protejo las secciones y ordeno la navegación móvil por perfil.
import { Ionicons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet, useWindowDimensions, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSession } from '../../context/SessionContext';
import { OwnerDesktopShell } from '../../components/app/OwnerDesktopShell';

const green = '#214d35';
const muted = '#89938a';
const paleGreen = '#e8efe5';
type IconName = keyof typeof Ionicons.glyphMap;

export default function AppTabs() {
  const { session, restoring } = useSession();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  useEffect(() => {
    if (!restoring && !session) router.replace('/');
  }, [restoring, session]);
  if (restoring) return <View style={styles.loading}><ActivityIndicator color={green} /></View>;
  if (!session) return <View style={styles.loading}><ActivityIndicator color={green} /></View>;

  const role = session.usuario.rol.toLowerCase() === 'copropietario' ? 'administrador' : session.usuario.rol.toLowerCase();
  const isVet = role === 'veterinario';
  const isOwner = role === 'dueno';
  const isField = role === 'peon';
  const desktopOwner = Platform.OS === 'web' && width >= 1050 && isOwner;
  const tabBarStyle = [styles.tabBar, { height: 66 + insets.bottom, paddingBottom: Math.max(insets.bottom, 7) }, desktopOwner && { display: 'none' as const }];

  return <OwnerDesktopShell><Tabs screenOptions={{
    headerShown: false,
    tabBarActiveTintColor: green,
    tabBarInactiveTintColor: muted,
    tabBarStyle,
    tabBarItemStyle: styles.tabItem,
    tabBarLabelStyle: styles.tabLabel,
  }}>
    <Tabs.Screen name="index" options={{ title: isVet ? 'Enfermería' : 'Inicio', tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name={isVet ? 'medkit-outline' : 'home-outline'} activeName={isVet ? 'medkit' : 'home'} /> }} />
    <Tabs.Screen name="animals" options={{ title: 'Animales', href: isVet ? null : isOwner ? null : undefined, tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name="paw-outline" activeName="paw" /> }} />
    <Tabs.Screen name="tasks" options={{ title: 'Tareas', href: isVet || isOwner ? null : undefined, tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name="checkbox-outline" activeName="checkbox" /> }} />
    <Tabs.Screen name="health" options={{ title: isField ? 'Reportes' : 'Sanidad', href: isVet || isOwner ? null : undefined, tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name="medkit-outline" activeName="medkit" /> }} />
    <Tabs.Screen name="more" options={{ title: isVet ? 'Perfil' : 'Más', tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name={isVet ? 'person-circle-outline' : 'grid-outline'} activeName={isVet ? 'person-circle' : 'grid'} /> }} />
  <Tabs.Screen name="[module]" options={{ href: null }} />
  </Tabs></OwnerDesktopShell>;
}

function TabIcon({ color, focused, name, activeName }: { color: ColorValue; focused: boolean; name: IconName; activeName: IconName }) {
  return <View style={[styles.iconBadge, focused && styles.iconBadgeActive]}>
    <Ionicons color={color} name={focused ? activeName : name} size={20} />
  </View>;
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  tabBar: { backgroundColor: '#fff', borderTopColor: '#e8ede6', borderTopWidth: StyleSheet.hairlineWidth, elevation: 12, paddingTop: 5, shadowColor: '#193724', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.07, shadowRadius: 8 },
  tabItem: { paddingTop: 2 },
  tabLabel: { fontSize: 9, fontWeight: '600', marginTop: 1 },
  iconBadge: { alignItems: 'center', borderRadius: 14, height: 28, justifyContent: 'center', width: 44 },
  iconBadgeActive: { backgroundColor: paleGreen },
});
