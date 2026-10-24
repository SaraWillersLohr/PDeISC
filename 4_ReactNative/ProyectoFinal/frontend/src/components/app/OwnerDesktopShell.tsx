// presento las secciones del dueño en una navegación lateral solo para escritorio.
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSession } from '../../context/SessionContext';

const sections = [
  { key: 'inicio', label: 'Resumen', icon: 'home-outline' },
  { key: 'animales', label: 'Animales', icon: 'paw-outline' },
  { key: 'corrales', label: 'Corrales', icon: 'grid-outline' },
  { key: 'reproduccion', label: 'Reproducción', icon: 'git-branch-outline' },
  { key: 'mapa', label: 'Mapa del campo', icon: 'map-outline' },
  { key: 'eventos', label: 'Eventos', icon: 'calendar-outline' },
  { key: 'avisos', label: 'Avisos', icon: 'notifications-outline' },
];

export function OwnerDesktopShell({ children }: React.PropsWithChildren) {
  const { width } = useWindowDimensions();
  const { session } = useSession();
  const pathname = usePathname();
  const visible = Platform.OS === 'web' && width >= 1050 && session?.usuario.rol.toLowerCase() === 'dueno';
  const initials = useMemo(() => `${session?.usuario.nombre?.[0] ?? ''}${session?.usuario.apellido?.[0] ?? ''}`.toUpperCase(), [session]);
  if (!visible) return <>{children}</>;
  return <View style={style.root}>
    <View style={style.sidebar}>
      <Text style={style.brand}>Estancia<Text style={style.brandAccent}>App</Text></Text>
      <Text style={style.caption}>GESTIÓN DE CAMPO</Text>
      <View style={style.nav}>{sections.map((item) => {
        const active = item.key === 'inicio' ? pathname === '/' || pathname === '/(app)' : pathname.includes(item.key === 'animales' ? 'animals' : item.key);
        const navigate = () => item.key === 'inicio' ? router.navigate('/(app)') : item.key === 'animales' ? router.navigate('/(app)/animals') : router.navigate({ pathname: '/(app)/[module]', params: { module: item.key } });
        return <Pressable key={item.key} accessibilityRole="button" onPress={navigate} style={[style.link, active && style.linkActive]}>
          <Ionicons color={active ? '#214d35' : '#748076'} name={item.icon as keyof typeof Ionicons.glyphMap} size={19} />
          <Text style={[style.linkText, active && style.linkTextActive]}>{item.label}</Text>
        </Pressable>;
      })}</View>
      <View style={style.profile}><View style={style.avatar}><Text style={style.avatarText}>{initials}</Text></View><View style={{ flex: 1 }}><Text numberOfLines={1} style={style.name}>{session?.usuario.nombre} {session?.usuario.apellido}</Text><Text style={style.role}>Dueño</Text></View><Ionicons color="#748076" name="ellipsis-horizontal" size={18} /></View>
    </View>
    <View style={style.content}>{children}</View>
  </View>;
}

const style = StyleSheet.create({
  root: { backgroundColor: '#f4f6f1', flex: 1, flexDirection: 'row', minHeight: '100%' },
  sidebar: { backgroundColor: '#fff', borderRightColor: '#e5eae3', borderRightWidth: 1, paddingHorizontal: 22, paddingTop: 28, width: 250 },
  brand: { color: '#214d35', fontSize: 21, fontWeight: '900', letterSpacing: -1 }, brandAccent: { color: '#829755' },
  caption: { color: '#89938a', fontSize: 9, fontWeight: '800', letterSpacing: 1.4, marginBottom: 25, marginTop: 5 },
  nav: { gap: 5 }, link: { alignItems: 'center', borderRadius: 10, flexDirection: 'row', gap: 12, minHeight: 44, paddingHorizontal: 12 }, linkActive: { backgroundColor: '#e8efe5' }, linkText: { color: '#647067', fontSize: 12, fontWeight: '600' }, linkTextActive: { color: '#214d35', fontWeight: '800' },
  profile: { alignItems: 'center', borderTopColor: '#edf0eb', borderTopWidth: 1, flexDirection: 'row', gap: 10, marginTop: 'auto', paddingBottom: 20, paddingTop: 17 }, avatar: { alignItems: 'center', backgroundColor: '#e1e9dd', borderRadius: 18, height: 36, justifyContent: 'center', width: 36 }, avatarText: { color: '#214d35', fontSize: 10, fontWeight: '800' }, name: { color: '#202c23', fontSize: 11, fontWeight: '700' }, role: { color: '#748076', fontSize: 10, marginTop: 2 },
  content: { flex: 1, maxWidth: 1600, paddingHorizontal: 24, paddingTop: 14, width: '100%' },
});
