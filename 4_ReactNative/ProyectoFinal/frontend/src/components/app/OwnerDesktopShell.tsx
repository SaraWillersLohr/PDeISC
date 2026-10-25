// presento las secciones de cada rol en una navegación lateral inspirada en R5.
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../../context/SessionContext';

const sections = [
  { key: 'inicio', label: 'Inicio', icon: 'home-outline', roles: ['administrador','dueno','peon','veterinario'] },
  { key: 'animales', label: 'Animales', icon: 'paw-outline', roles: ['administrador','dueno','peon'] },
  { key: 'corrales', label: 'Corrales', icon: 'grid-outline', roles: ['administrador','dueno','peon'] },
  { key: 'tareas', label: 'Tareas', icon: 'checkbox-outline', roles: ['administrador','peon'] },
  { key: 'sanidad', label: 'Sanidad', icon: 'medkit-outline', roles: ['administrador','peon'] },
  { key: 'reproduccion', label: 'Reproducción', icon: 'git-branch-outline', roles: ['administrador','dueno','peon'] },
  { key: 'mapa', label: 'Mi campo', icon: 'map-outline', roles: ['administrador','dueno','peon'] },
  { key: 'eventos', label: 'Eventos', icon: 'calendar-outline', roles: ['administrador','dueno'] },
  { key: 'avisos', label: 'Avisos', icon: 'notifications-outline', roles: ['administrador','dueno','peon'] },
  { key: 'equipo', label: 'Equipo', icon: 'people-outline', roles: ['administrador','dueno'] },
  { key: 'catalogo', label: 'Especies y razas', icon: 'list-outline', roles: ['administrador','peon'] },
  { key: 'perfil', label: 'Mi perfil', icon: 'person-circle-outline', roles: ['administrador','dueno','peon','veterinario'] },
];

export function OwnerDesktopShell({ children }: React.PropsWithChildren) {
  const { width } = useWindowDimensions();
  const { session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const role = session?.usuario.rol.toLowerCase() === 'copropietario' ? 'administrador' : session?.usuario.rol.toLowerCase() ?? '';
  const visible = Platform.OS === 'web' && width >= 1050;
  const visibleSections = sections.filter((item) => item.roles.includes(role));
  const initials = useMemo(() => `${session?.usuario.nombre?.[0] ?? ''}${session?.usuario.apellido?.[0] ?? ''}`.toUpperCase(), [session]);
  function navigate(key: string): void {
    setMenuOpen(false);
    if (key === 'inicio') router.navigate('/(app)/home');
    else if (key === 'animales') router.navigate('/(app)/animals');
    else if (key === 'corrales') router.navigate('/(app)/corrals');
    else if (key === 'eventos') router.navigate('/(app)/events');
    else if (key === 'equipo') router.navigate('/(app)/team');
    else if (key === 'perfil') router.navigate('/(app)/more');
    else if (key === 'tareas') router.navigate('/(app)/tasks');
    else if (key === 'sanidad') router.navigate('/(app)/health');
    else router.navigate({ pathname: '/(app)/[module]', params: { module: key } });
  }
  if (!visible) return <SafeAreaView edges={['top']} style={style.mobileRoot}>
    <View style={style.mobileHeader}><Pressable accessibilityLabel="Abrir menú de secciones" onPress={() => setMenuOpen(true)} style={style.menuButton}><Ionicons color="#f0fdf4" name="menu" size={25} /></Pressable><Text style={style.mobileBrand}>Estancia<Text style={style.brandAccent}>App</Text></Text></View>
    <View style={style.mobileContent}>{children}</View>
    <Modal animationType="fade" onRequestClose={() => setMenuOpen(false)} transparent visible={menuOpen}><View style={style.overlay}><SafeAreaView edges={['top','bottom']} style={style.drawer}><View style={style.drawerHead}><Text style={style.mobileBrand}>Secciones</Text><Pressable accessibilityLabel="Cerrar menú" onPress={() => setMenuOpen(false)} style={style.menuButton}><Ionicons color="#f0fdf4" name="close" size={24} /></Pressable></View><ScrollView contentContainerStyle={style.mobileNav}>{visibleSections.map((item) => <Pressable key={item.key} onPress={() => navigate(item.key)} style={style.mobileLink}><Ionicons color="#d1dfd4" name={item.icon as keyof typeof Ionicons.glyphMap} size={20} /><Text style={style.mobileLinkText}>{item.label}</Text><Ionicons color="#78907e" name="chevron-forward" size={17} /></Pressable>)}</ScrollView><View style={style.mobileProfile}>{session?.usuario.foto_perfil ? <Image source={{ uri: session.usuario.foto_perfil }} style={style.profileImage} /> : <View style={style.avatar}><Text style={style.avatarText}>{initials}</Text></View>}<View style={{ flex: 1 }}><Text style={style.name}>{session?.usuario.nombre} {session?.usuario.apellido}</Text><Text style={style.role}>{role === 'dueno' ? 'Dueño' : role === 'peon' ? 'Peón' : role === 'veterinario' ? 'Veterinario' : 'Administrador'}</Text></View></View></SafeAreaView><Pressable accessibilityLabel="Cerrar menú" onPress={() => setMenuOpen(false)} style={style.overlayClose} /></View></Modal>
  </SafeAreaView>;
  return <View style={style.root}>
    <View style={style.sidebar}>
      <Text style={style.brand}>Estancia<Text style={style.brandAccent}>App</Text></Text>
      <Text style={style.caption}>GESTIÓN DE CAMPO</Text>
      <ScrollView style={style.navScroll} contentContainerStyle={style.nav}>{visibleSections.map((item) => {
        const routeKey = item.key === 'animales' ? 'animals' : item.key === 'corrales' ? 'corrals' : item.key === 'eventos' ? 'events' : item.key === 'equipo' ? 'team' : item.key === 'perfil' ? 'more' : item.key;
        const active = item.key === 'inicio' ? pathname === '/home' || pathname === '/(app)/home' : pathname.includes(routeKey);
        return <Pressable key={item.key} accessibilityRole="button" onPress={() => navigate(item.key)} style={[style.link, active && style.linkActive]}>
          <Ionicons color={active ? '#86efac' : '#d1dfd4'} name={item.icon as keyof typeof Ionicons.glyphMap} size={19} />
          <Text style={[style.linkText, active && style.linkTextActive]}>{item.label}</Text>
        </Pressable>;
      })}</ScrollView>
      <View style={style.profile}>{session?.usuario.foto_perfil ? <Image source={{ uri: session.usuario.foto_perfil }} style={style.profileImage} /> : <View style={style.avatar}><Text style={style.avatarText}>{initials}</Text></View>}<View style={{ flex: 1 }}><Text numberOfLines={1} style={style.name}>{session?.usuario.nombre} {session?.usuario.apellido}</Text><Text style={style.role}>{role === 'dueno' ? 'Dueño' : role === 'peon' ? 'Peón' : role === 'veterinario' ? 'Veterinario' : 'Administrador'}</Text></View><Ionicons color="#9eb1a2" name="ellipsis-horizontal" size={18} /></View>
    </View>
    <View style={style.content}>{children}</View>
  </View>;
}

const style = StyleSheet.create({
  root: { backgroundColor: '#f4f7f6', flex: 1, flexDirection: 'row', minHeight: '100%' },
  sidebar: { backgroundColor: '#1a3020', paddingHorizontal: 16, paddingTop: 27, width: 232 },
  brand: { color: '#f0fdf4', fontSize: 20, fontWeight: '900', letterSpacing: -0.8, paddingHorizontal: 10 }, brandAccent: { color: '#86efac' },
  caption: { color: '#9eb1a2', fontSize: 9, fontWeight: '800', letterSpacing: 1.4, marginBottom: 27, marginTop: 6, paddingHorizontal: 10 },
  navScroll: { flex: 1 }, nav: { gap: 7, paddingBottom: 14 }, link: { alignItems: 'center', borderRadius: 8, flexDirection: 'row', gap: 11, minHeight: 44, paddingHorizontal: 12 }, linkActive: { backgroundColor: 'rgba(74, 222, 128, 0.15)' }, linkText: { color: '#d1dfd4', fontSize: 12, fontWeight: '600' }, linkTextActive: { color: '#f0fdf4', fontWeight: '800' },
  profile: { alignItems: 'center', borderTopColor: 'rgba(255,255,255,0.10)', borderTopWidth: 1, flexDirection: 'row', gap: 10, marginTop: 'auto', paddingBottom: 20, paddingHorizontal: 7, paddingTop: 17 }, avatar: { alignItems: 'center', backgroundColor: 'rgba(134,239,172,0.16)', borderRadius: 18, height: 36, justifyContent: 'center', width: 36 }, avatarText: { color: '#86efac', fontSize: 10, fontWeight: '800' }, name: { color: '#f0fdf4', fontSize: 11, fontWeight: '700' }, role: { color: '#9eb1a2', fontSize: 10, marginTop: 2 },
  content: { flex: 1, maxWidth: 1600, paddingHorizontal: 28, paddingTop: 14, width: '100%' },
  mobileRoot: { backgroundColor: '#f4f7f6', flex: 1 }, mobileHeader: { alignItems: 'center', backgroundColor: '#1a3020', flexDirection: 'row', height: 58, justifyContent: 'space-between', paddingHorizontal: 16 }, mobileBrand: { color: '#f0fdf4', fontSize: 18, fontWeight: '900' }, menuButton: { alignItems: 'center', borderColor: 'rgba(255,255,255,0.14)', borderRadius: 9, borderWidth: 1, height: 39, justifyContent: 'center', width: 42 }, mobileContent: { flex: 1 },
  overlay: { backgroundColor: 'rgba(8,17,11,0.55)', flex: 1, flexDirection: 'row' }, overlayClose: { flex: 1 }, drawer: { backgroundColor: '#1a3020', maxWidth: 340, paddingHorizontal: 15, width: '86%' }, drawerHead: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 17, paddingHorizontal: 6, paddingTop: 10 }, mobileNav: { gap: 5, paddingBottom: 16 }, mobileLink: { alignItems: 'center', borderBottomColor: 'rgba(255,255,255,0.08)', borderBottomWidth: 1, flexDirection: 'row', gap: 12, minHeight: 50, paddingHorizontal: 10 }, mobileLinkText: { color: '#f0fdf4', flex: 1, fontSize: 13, fontWeight: '600' }, mobileProfile: { alignItems: 'center', borderTopColor: 'rgba(255,255,255,0.10)', borderTopWidth: 1, flexDirection: 'row', gap: 10, marginTop: 'auto', padding: 12 }, profileImage: { borderRadius: 20, height: 40, width: 40 },
});
