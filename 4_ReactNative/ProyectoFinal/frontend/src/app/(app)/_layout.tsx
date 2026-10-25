// protejo las secciones y ordeno la navegación móvil por perfil.
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { StyleSheet, View, type ColorValue } from 'react-native';
import { useSession } from '../../context/SessionContext';
import { OwnerDesktopShell } from '../../components/app/OwnerDesktopShell';
import { BrandLoadingScreen } from '../../components/BrandLoadingScreen';

type IconName = keyof typeof Ionicons.glyphMap;

export default function AppTabs() {
  const { session, restoring } = useSession();
  if (restoring) return <BrandLoadingScreen />;
  if (!session) return <Redirect href="/" />;

  const role = session.usuario.rol.toLowerCase() === 'copropietario' ? 'administrador' : session.usuario.rol.toLowerCase();
  const isVet = role === 'veterinario';
  const isOwner = role === 'dueno';
  const isField = role === 'peon';

  return <OwnerDesktopShell><Tabs screenOptions={{
    headerShown: false,
    tabBarStyle: styles.hiddenTabBar,
    tabBarItemStyle: styles.tabItem,
    tabBarLabelStyle: styles.tabLabel,
  }}>
    <Tabs.Screen name="home" options={{ title: isVet ? 'Enfermería' : 'Inicio', tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name={isVet ? 'medkit-outline' : 'home-outline'} activeName={isVet ? 'medkit' : 'home'} /> }} />
    <Tabs.Screen name="animals" options={{ title: 'Animales', href: isVet ? null : undefined, tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name="paw-outline" activeName="paw" /> }} />
    <Tabs.Screen name="corrals" options={{ title: 'Corrales', href: isOwner || role === 'administrador' ? undefined : null, tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name="grid-outline" activeName="grid" /> }} />
    <Tabs.Screen name="events" options={{ title: 'Eventos', href: isOwner ? undefined : null, tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name="calendar-outline" activeName="calendar" /> }} />
    <Tabs.Screen name="team" options={{ title: 'Equipo', href: role === 'administrador' ? undefined : null, tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name="people-outline" activeName="people" /> }} />
    <Tabs.Screen name="tasks" options={{ title: 'Tareas', href: isField ? undefined : null, tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name="checkbox-outline" activeName="checkbox" /> }} />
    <Tabs.Screen name="health" options={{ title: 'Reportes', href: isField ? undefined : null, tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name="medkit-outline" activeName="medkit" /> }} />
    <Tabs.Screen name="more" options={{ title: 'Mi perfil', tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name="person-circle-outline" activeName="person-circle" /> }} />
    <Tabs.Screen name="[module]" options={{ href: null }} />
  </Tabs></OwnerDesktopShell>;
}

function TabIcon({ color, focused, name, activeName }: { color: ColorValue; focused: boolean; name: IconName; activeName: IconName }) {
  return <View style={[styles.iconBadge, focused && styles.iconBadgeActive]}>
    <Ionicons color={color} name={focused ? activeName : name} size={20} />
  </View>;
}

const styles = StyleSheet.create({
  hiddenTabBar: { display: 'none' },
  tabItem: { paddingTop: 2 },
  tabLabel: { fontSize: 9, fontWeight: '600', marginTop: 1 },
  iconBadge: { alignItems: 'center', borderRadius: 14, height: 28, justifyContent: 'center', width: 44 },
  iconBadgeActive: { backgroundColor: '#e8efe5' },
});
