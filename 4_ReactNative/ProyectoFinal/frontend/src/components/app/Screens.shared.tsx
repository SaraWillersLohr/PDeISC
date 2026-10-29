// reúno tipos y elementos visuales compartidos entre las pantallas principales.
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Image, NativeScrollEvent, NativeSyntheticEvent, Platform, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { s } from './ScreensStyles';
import { ScrollToTop } from './ScrollToTop';

export type ModuleKey = 'inicio' | 'animales' | 'estancia' | 'tareas' | 'sanidad' | 'reproduccion' | 'eventos' | 'equipo' | 'catalogo' | 'perfil';

export type ModuleItem = { key: ModuleKey; label: string; icon: keyof typeof Ionicons.glyphMap; description: string; badgeColor: string; badgeBg: string; roles: string[] };

export const modules: ModuleItem[] = [
  { key: 'estancia', label: 'Mi estancia', icon: 'home', description: 'Corrales de la estancia', badgeColor: '#b06d2c', badgeBg: '#fef3e7', roles: ['administrador', 'dueno', 'peon'] },
  { key: 'animales', label: 'Mis animales', icon: 'paw', description: 'Fichas, pesajes, movimientos e historial', badgeColor: '#2d6a4f', badgeBg: '#e8f5ed', roles: ['administrador', 'dueno', 'peon'] },
  { key: 'tareas', label: 'Tareas', icon: 'checkbox', description: 'Pendientes y trabajo del equipo', badgeColor: '#366aa1', badgeBg: '#edf4fb', roles: ['administrador', 'peon'] },
  { key: 'sanidad', label: 'Corral de enfermería', icon: 'medkit', description: 'Animales enfermos y tratamientos', badgeColor: '#a8473d', badgeBg: '#faecea', roles: ['administrador', 'dueno', 'veterinario'] },
  { key: 'reproduccion', label: 'Reproducción', icon: 'git-branch', description: 'Servicios, diagnósticos y nacimientos', badgeColor: '#6a4d95', badgeBg: '#f2effa', roles: ['administrador', 'dueno', 'peon'] },
  { key: 'eventos', label: 'Eventos y Remates', icon: 'calendar', description: 'Remates y exposiciones nacionales', badgeColor: '#c28b34', badgeBg: '#fbf4e8', roles: ['administrador', 'dueno'] },
  { key: 'equipo', label: 'Equipo de campo', icon: 'people', description: 'Personas, roles y accesos', badgeColor: '#4f46e5', badgeBg: '#eef2ff', roles: ['administrador', 'dueno'] },
  { key: 'catalogo', label: 'Especies y razas', icon: 'list', description: 'Catálogo productivo de la organización', badgeColor: '#059669', badgeBg: '#ecfdf5', roles: ['administrador', 'dueno', 'peon'] },
  { key: 'perfil', label: 'Mi perfil', icon: 'person-circle', description: 'Datos personales y sesión', badgeColor: '#475569', badgeBg: '#f1f5f9', roles: ['administrador', 'dueno', 'peon', 'veterinario'] },
];

export const roleLabel: Record<string, string> = { administrador: 'Administrador', dueno: 'Dueño', copropietario: 'Administrador', peon: 'Peón', veterinario: 'Veterinario' };

export function normalizeRole(role: string): string { return role === 'copropietario' ? 'administrador' : role; }

export function Header({ title, subtitle }: { title: string; subtitle: string }) {
  const { session } = useSession();
  const { isDark, colors } = useTheme();
  const [online, setOnline] = useState(true);
  useEffect(() => { const unsubscribe = NetInfo.addEventListener((state) => setOnline(Boolean(state.isConnected))); return unsubscribe; }, []);
  const initials = `${session?.usuario.nombre?.[0] ?? 'E'}${session?.usuario.apellido?.[0] ?? ''}`.toUpperCase();
  return (
    <View style={s.header}>
      <View style={s.brandLine}>
        <View style={[s.connection, !online && s.connectionOff, isDark && s.connectionDark]}>
          <View style={[s.connectionDot, !online && s.connectionDotOff]} />
          <Text style={[s.connectionText, isDark && { color: colors.textSecondary }]}>{online ? 'En línea' : 'Sin señal'}</Text>
        </View>
      </View>
      <View style={s.titleRow}>
        <View style={{ flex: 1 }}>
          <Text style={[s.pageTitle, { color: colors.textMain }]}>{title}</Text>
          <Text style={[s.pageSubtitle, { color: colors.textMuted }]}>{subtitle}</Text>
        </View>
        {session?.usuario.foto_perfil ? (
          <Image source={{ uri: session.usuario.foto_perfil }} style={s.avatarImg} />
        ) : (
          <View style={[s.avatar, isDark && { backgroundColor: 'rgba(134,239,172,0.15)', borderColor: '#23392b' }]}>
            <Text style={[s.avatarText, isDark && { color: '#86efac' }]}>{initials}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export function Page({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;
  const scrollToTop = useRef<() => void>(() => {});
  const [showScrollTop, setShowScrollTop] = useState(false);
  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) { setShowScrollTop(event.nativeEvent.contentOffset.y > 320); }
  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[s.safe, { backgroundColor: colors.bgCanvas }]}>
      <ScrollView ref={(instance) => { scrollToTop.current = () => instance?.scrollTo({ y: 0, animated: true }); }} onScroll={handleScroll} scrollEventThrottle={16} contentContainerStyle={[s.page, isDesktop && s.pageDesktop]} showsVerticalScrollIndicator={false}>
        <View style={[s.contentContainer, isDesktop && s.contentContainerDesktop]}>
          {children}
        </View>
      </ScrollView>
      <ScrollToTop visible={showScrollTop} onPress={() => scrollToTop.current()} />
    </SafeAreaView>
  );
}

export function SpeciesBarChart({ data, isDark, textColor }: { data: { species: string; count: number }[]; isDark: boolean; textColor: string }) {
  const colors = ['#1a6b3b', '#3f78b8', '#d9822b', '#7659a8', '#c74c3e', '#0f9d9a', '#a16207', '#db2777'];
  const step = Math.max(1, Math.ceil(Math.max(...data.map((item) => item.count)) / 4));
  const max = step * 4;
  const ticks = [max, step * 3, step * 2, step, 0];
  const gridColor = isDark ? 'rgba(255,255,255,0.12)' : '#e7ece6';
  return (
    <View style={s.verticalChart}>
      <View style={s.verticalChartRow}>
        <View style={s.yAxis}>
          {ticks.map((tick, index) => <Text key={`${tick}-${index}`} style={[s.axisTick, { color: textColor }]}>{tick}</Text>)}
        </View>
        <View style={s.plotArea}>
          {[0, 25, 50, 75, 100].map((position) => <View key={position} style={[s.gridLine, { top: `${position}%`, backgroundColor: gridColor }]} />)}
          <View style={s.columns}>
            {data.map((item, index) => <View key={item.species} style={s.chartColumn}>
              <View style={s.barSlot}>
                <Text style={[s.barValue, { color: textColor, bottom: `${(item.count / max) * 100}%` }]}>{item.count}</Text>
                <View style={[s.verticalBar, { backgroundColor: colors[index % colors.length], height: `${(item.count / max) * 100}%` }]} />
              </View>
              <Text numberOfLines={2} style={[s.xAxisLabel, { color: textColor }]}>{item.species}</Text>
            </View>)}
          </View>
        </View>
      </View>
      <Text style={[s.axisTitle, { color: textColor }]}>Especie</Text>
    </View>
  );
}

export function useMyRole(): string {
  const { session } = useSession();
  return normalizeRole(session?.usuario.rol.toLowerCase() ?? 'dueno');
}
