// presento los resúmenes y accesos principales según el perfil activo.
import { friendlyErrorMessage } from '../../services/apiErrors';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { removeSession, saveSession } from '../../services/sessionStorage';
import { changeMyPassword, updateMyProfile } from '../../services/authApi';
import { approveRegistrationRequest, listRegistrationRequests, rejectRegistrationRequest, type RegistrationRequest, type RequestedRole } from '../../services/adminApi';
import { AnimalsInventoryScreen, NursingScreen } from './LivestockScreens';
import { ReproductionScreen, TasksManagerScreen } from './FieldModuleScreens';
import { EventsScreen } from './EventsScreen';
import { EstateScreen } from './EstateScreen';
import { CatalogScreen, TeamScreen } from './OrganizationScreens';
import { getDashboard, listPendingDeaths, reviewDeath, type DashboardMetrics, type DeathReport } from '../../services/productionApi';
import { listAnimals } from '../../services/livestockApi';

type ModuleKey = 'inicio' | 'animales' | 'estancia' | 'tareas' | 'sanidad' | 'reproduccion' | 'eventos' | 'equipo' | 'catalogo' | 'perfil';
type ModuleItem = { key: ModuleKey; label: string; icon: keyof typeof Ionicons.glyphMap; description: string; badgeColor: string; badgeBg: string; roles: string[] };
const modules: ModuleItem[] = [
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

const roleLabel: Record<string, string> = { administrador: 'Administrador', dueno: 'Dueño', copropietario: 'Administrador', peon: 'Peón', veterinario: 'Veterinario' };
function normalizeRole(role: string): string { return role === 'copropietario' ? 'administrador' : role; }

function Header({ title, subtitle }: { title: string; subtitle: string }) {
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

function Page({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;
  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[s.safe, { backgroundColor: colors.bgCanvas }]}>
      <ScrollView contentContainerStyle={[s.page, isDesktop && s.pageDesktop]} showsVerticalScrollIndicator={false}>
        <View style={[s.contentContainer, isDesktop && s.contentContainerDesktop]}>
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function HomeScreen() {
  const { session } = useSession();
  const { width } = useWindowDimensions();
  const { colors, isDark } = useTheme();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [speciesCounts, setSpeciesCounts] = useState<{ species: string; count: number }[]>([]);
  const [breedCountsLoaded, setBreedCountsLoaded] = useState(false);
  const [metricsError, setMetricsError] = useState('');
  const role = normalizeRole(session?.usuario.rol.toLowerCase() ?? 'dueno');
  const name = session?.usuario.nombre?.trim() || 'equipo';
  const isVet = role === 'veterinario';
  const isField = role === 'peon';
  const isManager = role === 'administrador' || role === 'dueno';
  const isDesktop = Platform.OS === 'web' && width >= 860;
  const dashboardCopy = isVet ? 'Controles y seguimiento de animales en enfermería.' : isField ? 'Lo importante para las tareas y ganado de hoy.' : 'Monitoreo productivo y sanitario de la estancia.';
  const today = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  useEffect(() => {
    if (!session || isField || isVet) return;
    let active = true;
    getDashboard(session).then((data) => { if (active) setMetrics(data); }).catch((cause: unknown) => { if (active) setMetricsError(friendlyErrorMessage(cause, 'No se pudieron cargar las estadísticas.')); });
    listAnimals(session).then((animals) => {
      if (!active) return;
      const counts = new Map<string, number>();
      animals.filter((animal) => animal.activo === 1).forEach((animal) => {
        counts.set(animal.especie, (counts.get(animal.especie) ?? 0) + 1);
      });
      setSpeciesCounts([...counts.entries()].map(([species, count]) => ({ species, count })).sort((a, b) => b.count - a.count || a.species.localeCompare(b.species, 'es')));
      setBreedCountsLoaded(true);
    }).catch((cause: unknown) => { if (active) { setBreedCountsLoaded(true); setMetricsError(friendlyErrorMessage(cause, 'No se pudieron cargar los animales por raza.')); } });
    return () => { active = false; };
  }, [session, isField, isVet]);

  if (isVet) return <HealthScreen />;

  const statistics = metrics ? [
    { label: 'Crías del año', value: metrics.crias_ano, color: '#3d9458', icon: 'leaf-outline' as const, note: 'Nacimientos registrados' },
    { label: 'Hembras preñadas', value: metrics.hembras_prenadas, color: '#d9822b', icon: 'heart-circle-outline' as const, note: 'Diagnóstico confirmado' },
    { label: 'Servicios · 90 días', value: metrics.servicios_90_dias, color: '#3f78b8', icon: 'git-network-outline' as const, note: 'Actividad de monta' },
    { label: 'Ventas · año', value: metrics.ventas_ano, color: '#8a5c32', icon: 'pricetag-outline' as const, note: 'Animales dados de baja por venta' },
    { label: 'Muertes · año', value: metrics.muertes_ano, color: '#9d3b3b', icon: 'heart-dislike-outline' as const, note: 'Muertes confirmadas' },
    { label: role === 'administrador' ? 'Muertes pendientes' : 'Alertas sanitarias', value: role === 'administrador' ? metrics.muertes_pendientes : metrics.alertas_sanitarias, color: '#c74c3e', icon: 'alert-circle-outline' as const, note: 'Requieren atención' },
  ] : [];

  return (
    <Page>
      <Header title={isManager ? `¡Hola, ${name}!` : 'Panel de Campo'} subtitle={`${roleLabel[role] ?? 'EQUIPO'} · ${today.toUpperCase()}`} />

      {/* Agro Welcome Banner */}
      <View style={[s.welcome, isDark && s.welcomeDark]}>
        <View style={{ flex: 1 }}>
          <View style={s.welcomeTag}>
            <Text style={s.welcomeEyebrow}>{roleLabel[role] ?? 'Equipo de estancia'}</Text>
          </View>
          <Text style={s.welcomeTitle}>Buen día, {name}</Text>
          <Text style={s.welcomeCopy}>{dashboardCopy}</Text>
        </View>
        <View style={s.welcomeIconWrap}>
          <Ionicons color="#fde047" name="sunny" size={36} />
        </View>
      </View>

      {isField ? (
        <View style={s.fieldShortcuts}>
          <View style={s.sectionHead}>
            <View>
              <Text style={[s.sectionTitle, { color: colors.textMain }]}>Accesos rápidos</Text>
              <Text style={[s.sectionCopy, { color: colors.textMuted }]}>Lo que necesitás para el trabajo de campo</Text>
            </View>
            <Ionicons color={colors.primary} name="flash-outline" size={20} />
          </View>
          <View style={[s.actionGrid, isDesktop && s.actionGridDesktop]}>
            {[
              { title: 'Ver animales', description: 'Consultá fichas, registrá pesajes y movimientos.', icon: 'paw-outline' as const, color: '#2d6a4f', route: '/(app)/animals' },
              { title: 'Mis tareas', description: 'Revisá pendientes y actualizá su estado.', icon: 'checkbox-outline' as const, color: '#366aa1', route: '/(app)/tasks' },
              { title: 'Mi estancia', description: 'Ubicá corrales y consultá el establecimiento.', icon: 'home-outline' as const, color: '#b06d2c', route: '/(app)/estate' },
              { title: 'Reproducción', description: 'Accedé a servicios, diagnósticos y nacimientos.', icon: 'git-branch-outline' as const, color: '#6a4d95', route: '/(app)/reproduccion' },
            ].map((item) => (
              <Pressable
                accessibilityRole="button"
                key={item.title}
                onPress={() => router.push(item.route as never)}
                style={({ pressed }) => [s.actionCard, isDesktop && s.actionCardWide, { backgroundColor: colors.bgCard, borderColor: colors.border }, pressed && s.actionCardPressed]}
              >
                <View style={[s.actionIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : `${item.color}16` }]}>
                  <Ionicons color={item.color} name={item.icon} size={21} />
                </View>
                <Text style={[s.actionTitle, { color: colors.textMain }]}>{item.title}</Text>
                <Text style={[s.actionDescription, { color: colors.textMuted }]}>{item.description}</Text>
                <Ionicons color={colors.textMuted} name="arrow-forward" size={16} style={s.actionArrow} />
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {/* Animal counts by species */}
      {isManager ? (
        <View style={[s.statsCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={s.sectionHead}>
            <View>
              <Text style={[s.sectionTitle, { color: colors.textMain }]}>Animales por especie</Text>
              <Text style={[s.sectionCopy, { color: colors.textMuted }]}>Cantidad de animales activos</Text>
            </View>
            <View style={s.dateChip}><Text style={s.dateChipText}>{speciesCounts.reduce((sum, item) => sum + item.count, 0)} ANIMALES</Text></View>
          </View>
          {speciesCounts.length ? <SpeciesBarChart data={speciesCounts} isDark={isDark} textColor={colors.textMuted} /> : <Text style={[s.sectionCopy, { color: colors.textMuted }]}>{breedCountsLoaded ? 'Todavía no hay animales activos para mostrar.' : 'Cargando animales por especie…'}</Text>}
        </View>
      ) : null}

      {/* Productive statistics below the breed chart */}
      {isManager ? (
        <View style={[s.statsCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={s.sectionHead}>
            <View>
              <Text style={[s.sectionTitle, { color: colors.textMain }]}>Estadísticas Productivas</Text>
              <Text style={[s.sectionCopy, { color: colors.textMuted }]}>Resumen actual del establecimiento</Text>
            </View>
            <View style={s.dateChip}>
              <Text style={s.dateChipText}>HOY</Text>
            </View>
          </View>

          {statistics.length ? (
            <View style={[s.statsGrid, isDesktop && s.statsGridDesktop]}>
              {statistics.map((item) => {
                const max = Math.max(1, ...statistics.map((entry) => entry.value));
                return (
                  <View key={item.label} style={[s.statBox, isDesktop && s.statBoxDesktop, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8faf7', borderColor: colors.borderLight }]}>
                    <View style={s.statBoxTop}>
                      <View style={[s.statIconWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#edf4ec' }]}>
                        <Ionicons color={item.color} name={item.icon} size={18} />
                      </View>
                      <Text style={[s.statBoxValue, { color: colors.textMain }]}>{item.value}</Text>
                    </View>
                    <Text style={[s.statBoxLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                    <View style={s.statTrack}>
                      <View style={[s.statBar, { backgroundColor: item.color, width: `${Math.max(item.value > 0 ? 10 : 0, (item.value / max) * 100)}%` }]} />
                    </View>
                    <Text style={[s.statBoxNote, { color: colors.textMuted }]}>{item.note}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={[s.sectionCopy, { color: colors.textMuted }]}>Cargando estadísticas productivas…</Text>
          )}
        </View>
      ) : null}

      {metricsError ? <Text style={s.requestError}>{metricsError}</Text> : null}

    </Page>
  );
}

function SpeciesBarChart({ data, isDark, textColor }: { data: { species: string; count: number }[]; isDark: boolean; textColor: string }) {
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

function useMyRole(): string {
  const { session } = useSession();
  return normalizeRole(session?.usuario.rol.toLowerCase() ?? 'dueno');
}

export function AnimalsScreen() {
  const role = useMyRole();
  if (role === 'veterinario') return <HealthScreen />;
  return <AnimalsInventoryScreen />;
}

export function TasksScreen() {
  const role = useMyRole();
  if (role === 'veterinario') return <HealthScreen />;
  return <TasksManagerScreen />;
}

export function HealthScreen() {
  const role = useMyRole();
  if (role === 'veterinario') return <NursingScreen />;
  if (role === 'peon') return <Redirect href="/(app)/animals" />;
  if (role === 'administrador') return <AdministratorHealthScreen />;
  if (role === 'dueno') return <NursingScreen />;
  return <AnimalsInventoryScreen />;
}

function AdministratorHealthScreen() {
  const { colors } = useTheme();
  const [section, setSection] = useState<'muertes' | 'enfermeria'>('muertes');
  return <>
    <Page>
      <Header title="Sanidad y enfermería" subtitle="REPORTES DE MUERTE Y SEGUIMIENTO VETERINARIO" />
      <View style={[s.requestActions, { marginBottom: 12 }]}>
        {(['muertes', 'enfermeria'] as const).map((item) => (
          <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: section === item }} onPress={() => setSection(item)} style={[s.healthTab, { backgroundColor: section === item ? colors.primary : colors.bgCard, borderColor: colors.border }]}>
            <Text style={[s.healthTabText, { color: section === item ? '#ffffff' : colors.textMain }]}>{item === 'muertes' ? 'Muertes pendientes' : 'Enfermería'}</Text>
          </Pressable>
        ))}
      </View>
    </Page>
    {section === 'muertes' ? <DeathReviewScreen /> : <NursingScreen />}
  </>;
}

// permito al administrador confirmar o rechazar bajas pendientes.
function DeathReviewScreen() {
  const { session } = useSession();
  const { colors } = useTheme();
  const [rows, setRows] = useState<DeathReport[]>([]);
  const [rejectionReasons, setRejectionReasons] = useState<Record<number, string>>({});
  const [message, setMessage] = useState('');

  async function load(): Promise<void> {
    if (!session) return;
    try { setRows(await listPendingDeaths(session)); }
    catch (cause) { setMessage(friendlyErrorMessage(cause, 'No se pudieron cargar los reportes.')); }
  }

  useEffect(() => {
    if (!session) return;
    let active = true;
    listPendingDeaths(session).then((data) => { if (active) setRows(data); }).catch((cause: unknown) => { if (active) setMessage(friendlyErrorMessage(cause, 'No se pudieron cargar los reportes.')); });
    return () => { active = false; };
  }, [session]);

  async function decide(row: DeathReport, decision: 'confirmar' | 'rechazar'): Promise<void> {
    if (!session) return;
    try {
      const reason = rejectionReasons[row.id_reporte]?.trim();
      if (decision === 'rechazar' && !reason) { setMessage('Escribí el motivo para rechazar el reporte.'); return; }
      await reviewDeath(session, row.id_reporte, decision, reason);
      setRejectionReasons((current) => { const next = { ...current }; delete next[row.id_reporte]; return next; });
      setMessage(decision === 'confirmar' ? 'Muerte confirmada.' : 'Animal reactivado; reporte conservado.');
      await load();
    } catch (cause) {
      setMessage(friendlyErrorMessage(cause, 'No se pudo revisar el reporte.'));
    }
  }

  return (
    <Page>
      <Header title="Revisión de muertes" subtitle="BAJAS PENDIENTES DE CONFIRMACIÓN" />
      {message ? <Text style={s.requestNotice}>{message}</Text> : null}
      {rows.length ? (
        rows.map((row) => (
          <View key={row.id_reporte} style={[s.requestCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[s.requestName, { color: colors.textMain }]}>{row.nombre || row.identificador} · {row.corral}</Text>
            <Text style={[s.requestEmail, { color: colors.textSecondary }]}>{row.fecha} · {row.motivo}</Text>
            {row.latitud != null && row.longitud != null ? <Text style={[s.requestEmail, { color: colors.textMuted }]}>Ubicación GPS · {row.latitud}, {row.longitud}</Text> : null}
            {row.foto ? <Image accessibilityLabel="Foto adjunta al reporte de muerte" source={{ uri: row.foto }} style={{ borderRadius: 10, height: 150, marginTop: 10, width: '100%' }} /> : null}
            <TextInput
              accessibilityLabel="Motivo de rechazo del reporte de muerte"
              onChangeText={(value) => setRejectionReasons((current) => ({ ...current, [row.id_reporte]: value }))}
              placeholder="Motivo obligatorio si rechazás"
              placeholderTextColor={colors.textMuted}
              style={[s.requestInput, { borderColor: colors.border, color: colors.textMain }]}
              value={rejectionReasons[row.id_reporte] ?? ''}
            />
            <View style={s.requestActions}>
              <Pressable onPress={() => void decide(row, 'rechazar')} style={s.rejectButton}>
                <Text style={s.rejectText}>Rechazar y reactivar</Text>
              </Pressable>
              <Pressable onPress={() => void decide(row, 'confirmar')} style={[s.approveButton, { backgroundColor: colors.primary }]}>
                <Text style={s.approveText}>Confirmar muerte</Text>
              </Pressable>
            </View>
          </View>
        ))
      ) : (
        <View style={[s.emptyCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={[s.emptyIcon, { backgroundColor: colors.bgCardMuted }]}>
            <Ionicons color={colors.primary} name="shield-checkmark" size={26} />
          </View>
          <Text style={[s.emptyTitle, { color: colors.textMain }]}>Sin reportes pendientes</Text>
          <Text style={[s.emptyCopy, { color: colors.textMuted }]}>Las bajas operativas informadas por el peón aparecerán acá para su aprobación.</Text>
        </View>
      )}
    </Page>
  );
}

export function MoreScreen() {
  const { session, setSession } = useSession();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;
  const role = normalizeRole(session?.usuario.rol.toLowerCase() ?? '');

  const [name, setName] = useState(session?.usuario.nombre ?? '');
  const [surname, setSurname] = useState(session?.usuario.apellido ?? '');
  const [photo, setPhoto] = useState<string | null>(session?.usuario.foto_perfil ?? null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function logout(): Promise<void> {
    await removeSession();
    setSession(null);
    router.replace('/');
  }

  async function pickPhoto(): Promise<void> {
    setError('');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { setError('Necesitamos permiso para abrir tus fotos.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.45, base64: true });
    if (!result.canceled && result.assets[0]?.base64) setPhoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
  }

  async function saveProfile(): Promise<void> {
    if (!session) return;
    setBusy(true); setError(''); setMessage('');
    try {
      const usuario = await updateMyProfile(session, { nombre: name, apellido: surname, foto_perfil: photo });
      const updated = { ...session, usuario };
      await saveSession(updated);
      setSession(updated);
      setMessage('Perfil actualizado correctamente.');
    } catch (cause) {
      setError(friendlyErrorMessage(cause, 'No se pudo actualizar el perfil.'));
    } finally {
      setBusy(false);
    }
  }

  async function savePassword(): Promise<void> {
    if (!session) return;
    if (!currentPassword) { setError('Ingresá tu contraseña actual.'); return; }
    if (newPassword.length < 10) { setError('La contraseña nueva debe tener al menos 10 caracteres.'); return; }
    if (newPassword !== confirmPassword) { setError('Las contraseñas nuevas no coinciden.'); return; }
    setBusy(true); setError(''); setMessage('');
    try {
      setMessage(await changeMyPassword(session, currentPassword, newPassword));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (cause) {
      setError(friendlyErrorMessage(cause, 'No se pudo cambiar la contraseña.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page>
      <Header title="Mi perfil" subtitle="DATOS PERSONALES, SEGURIDAD Y SESIÓN" />

      <View style={[isDesktop && s.profileGridDesktop]}>
        {/* Personal Details Card */}
        <View style={[s.profileCard, isDesktop && s.profileColumn, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[s.sectionTitle, { color: colors.textMain }]}>Datos personales</Text>
          <View style={s.photoRow}>
            {photo ? (
              <Image source={{ uri: photo }} style={s.photo} />
            ) : (
              <View style={[s.photoFallback, { backgroundColor: isDark ? 'rgba(134, 239, 172, 0.15)' : '#e8efe5' }]}>
                <Text style={[s.photoInitials, { color: isDark ? '#86efac' : '#1c4630' }]}>
                  {`${name[0] ?? 'E'}${surname[0] ?? ''}`.toUpperCase()}
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={[s.profileFullName, { color: colors.textMain }]}>{name || session?.usuario.nombre} {surname || session?.usuario.apellido}</Text>
              <Text style={[s.profileMetaText, { color: colors.textMuted }]}>{roleLabel[role] ?? role} · {session?.usuario.email}</Text>
              <View style={s.photoActions}>
                <Pressable onPress={() => void pickPhoto()} style={[s.smallBtn, { backgroundColor: isDark ? 'rgba(134,239,172,0.15)' : '#e8efe5' }]}>
                  <Text style={[s.smallBtnText, { color: isDark ? '#86efac' : '#1c4630' }]}>Elegir foto</Text>
                </Pressable>
                {photo ? (
                  <Pressable onPress={() => setPhoto(null)}>
                    <Text style={s.removePhoto}>Quitar foto</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </View>

          <Text style={[s.formLabel, { color: colors.textMuted }]}>NOMBRE</Text>
          <TextInput
            autoCapitalize="words"
            onChangeText={setName}
            style={[s.formInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
            value={name}
          />

          <Text style={[s.formLabel, { color: colors.textMuted }]}>APELLIDO</Text>
          <TextInput
            autoCapitalize="words"
            onChangeText={setSurname}
            style={[s.formInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
            value={surname}
          />

          <Pressable disabled={busy} onPress={() => void saveProfile()} style={[s.primaryBtn, { backgroundColor: colors.primary }, busy && s.disabled]}>
            <Text style={s.primaryBtnText}>Guardar datos personales</Text>
          </Pressable>
        </View>

        {/* Password / Security Card */}
        <View style={[s.profileCard, isDesktop && s.profileColumn, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[s.sectionTitle, { color: colors.textMain }]}>Cambiar contraseña</Text>
          <Text style={[s.formHelp, { color: colors.textMuted }]}>Para proteger tu acceso, primero ingresá tu contraseña actual.</Text>

          <Text style={[s.formLabel, { color: colors.textMuted }]}>CONTRASEÑA ACTUAL</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={setCurrentPassword}
            secureTextEntry
            style={[s.formInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
            value={currentPassword}
          />

          <Text style={[s.formLabel, { color: colors.textMuted }]}>CONTRASEÑA NUEVA</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={setNewPassword}
            placeholder="Al menos 10 caracteres"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            style={[s.formInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
            value={newPassword}
          />

          <Text style={[s.formLabel, { color: colors.textMuted }]}>REPETIR CONTRASEÑA</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={[s.formInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
            value={confirmPassword}
          />

          <Pressable disabled={busy} onPress={() => void savePassword()} style={[s.primaryBtn, { backgroundColor: colors.primary }, busy && s.disabled]}>
            <Text style={s.primaryBtnText}>Cambiar contraseña</Text>
          </Pressable>

          <Pressable onPress={() => router.push({ pathname: '/recover', params: { email: session?.usuario.email ?? '' } })} style={s.recoveryLink}>
            <Text style={[s.recoveryText, { color: colors.accentLime }]}>¿No recordás tu contraseña? Usar código de recuperación</Text>
          </Pressable>
        </View>
      </View>

      {message ? <Text style={s.requestNotice}>{message}</Text> : null}
      {error ? <Text style={s.requestError}>{error}</Text> : null}

      <Pressable onPress={() => void logout()} style={[s.logoutBtn, { borderColor: isDark ? '#4b2e2b' : '#e7d9d7' }]}>
        <Ionicons color="#dc2626" name="log-out-outline" size={17} style={{ marginRight: 6 }} />
        <Text style={s.logoutText}>Cerrar sesión</Text>
      </Pressable>

      <Text style={[s.appVersion, { color: colors.textMuted }]}>ESTANCIAAPP · GESTIÓN AGROPECUARIA INTELIGENTE</Text>
    </Page>
  );
}

export function GenericModuleScreen() {
  const { module } = useLocalSearchParams<{ module: string }>();
  const role = useMyRole();
  const item = modules.find((entry) => entry.key === module);
  if (!item || !item.roles.includes(role)) {
    return <ModuleInDevelopmentScreen moduleKey={module ?? ''} item={item} />;
  }
  if (role === 'administrador' && item.key === 'equipo') return <AdminRequestsScreen />;
  if (item.key === 'equipo') return <TeamScreen />;
  if (item.key === 'catalogo') return <CatalogScreen />;
  if (item.key === 'perfil') return <MoreScreen />;
  if (item.key === 'estancia') return <EstateScreen />;
  if (item.key === 'animales') return <AnimalsInventoryScreen />;
  if (item.key === 'tareas') return <TasksManagerScreen />;
  if (item.key === 'sanidad') return <NursingScreen />;
  if (item.key === 'reproduccion') return <ReproductionScreen />;
  if (item.key === 'eventos') return <EventsScreen />;
  return <ModuleInDevelopmentScreen moduleKey={module ?? ''} item={item} />;
}

function ModuleInDevelopmentScreen({ moduleKey, item }: { moduleKey: string; item?: ModuleItem }) {
  const { colors, isDark } = useTheme();
  const routeTitle = moduleKey
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  const title = item?.label || routeTitle || 'Nueva sección';

  return (
    <Page>
      <Header title={title} subtitle="MÓDULO DE ESTANCIAAPP" />
      <View style={[s.developmentCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <View style={[s.developmentIcon, { backgroundColor: isDark ? 'rgba(134,239,172,0.12)' : '#e8f5ed' }]}>
          <Ionicons color={isDark ? '#86efac' : '#2d6a4f'} name={item?.icon ?? 'construct-outline'} size={30} />
        </View>
        <Text style={[s.developmentTitle, { color: colors.textMain }]}>Sección en desarrollo</Text>
        <Text style={[s.developmentCopy, { color: colors.textMuted }]}>
          {item
            ? `Estamos preparando ${item.label.toLowerCase()} para este perfil. Podés seguir usando las demás secciones desde el menú.`
            : 'Estamos preparando esta sección. Podés seguir usando las demás secciones desde el menú.'}
        </Text>
        <View style={[s.developmentBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f2' }]}>
          <Ionicons color={colors.textMuted} name="time-outline" size={15} />
          <Text style={[s.developmentBadgeText, { color: colors.textMuted }]}>Próximamente</Text>
        </View>
      </View>
    </Page>
  );
}

export function TeamModuleScreen() {
  return useMyRole() === 'administrador' ? <AdminRequestsScreen /> : <TeamScreen />;
}

// muestro solicitudes verificadas y permito al administrador asignar un rol antes de aprobar.
function AdminRequestsScreen() {
  const { session } = useSession();
  const { colors, isDark } = useTheme();
  const token = session?.accessToken;
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Record<number, RequestedRole>>({});
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [decision, setDecision] = useState<{ request: RegistrationRequest; action: 'approve' | 'reject' } | null>(null);
  const [showTeam, setShowTeam] = useState(false);

  useEffect(() => {
    let active = true;
    if (!token) return () => { active = false; };
    void listRegistrationRequests(token).then((items) => { if (active) setRequests(items); }).catch((cause: unknown) => {
      if (active) setError(friendlyErrorMessage(cause, 'No se pudieron cargar las solicitudes.'));
    });
    return () => { active = false; };
  }, [token]);

  async function resolveRequest(): Promise<void> {
    if (!decision || !token) return;
    setBusyId(decision.request.id_solicitud); setError(''); setNotice('');
    try {
      if (decision.action === 'approve') await approveRegistrationRequest(token, decision.request.id_solicitud, selectedRoles[decision.request.id_solicitud] ?? 'peon');
      else await rejectRegistrationRequest(token, decision.request.id_solicitud);
      setRequests((current) => current.filter((request) => request.id_solicitud !== decision.request.id_solicitud));
      setNotice(decision.action === 'approve' ? 'Solicitud aprobada. Se envió el código de acceso al correo.' : 'Solicitud rechazada.');
      setDecision(null);
    } catch (cause) {
      setError(friendlyErrorMessage(cause, 'No se pudo resolver la solicitud.'));
    } finally {
      setBusyId(null);
    }
  }

  const roleOptions: { role: RequestedRole; label: string }[] = [{ role: 'dueno', label: 'Dueño' }, { role: 'peon', label: 'Peón' }, { role: 'veterinario', label: 'Veterinario' }];
  if (showTeam) return (
    <View style={{ flex: 1 }}>
      <Pressable onPress={() => setShowTeam(false)} style={[s.backBtn, { backgroundColor: colors.bgCardMuted }]}>
        <Text style={[s.backBtnText, { color: colors.primary }]}>‹ Volver a solicitudes</Text>
      </Pressable>
      <TeamScreen />
    </View>
  );

  return (
    <Page>
      <Header title="Solicitudes" subtitle="ALTAS DE LA ORGANIZACIÓN" />
      <Pressable onPress={() => setShowTeam(true)} style={[s.approveButton, { alignSelf: 'flex-start', backgroundColor: colors.primary, marginBottom: 16 }]}>
        <Text style={s.approveText}>Administrar usuarios activos</Text>
      </Pressable>

      {notice ? <Text style={s.requestNotice}>{notice}</Text> : null}
      {error ? <Text style={s.requestError}>{error}</Text> : null}

      {requests.length ? (
        requests.map((request) => (
          <View key={request.id_solicitud} style={[s.requestCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[s.requestName, { color: colors.textMain }]}>{request.nombre} {request.apellido}</Text>
            <Text style={[s.requestEmail, { color: colors.textSecondary }]}>{request.email}</Text>
            <Text style={[s.roleLabel, { color: colors.textMuted }]}>ASIGNAR ROL AL APROBAR</Text>
            <View style={s.roleOptions}>
              {roleOptions.map((option) => (
                <Pressable
                  key={option.role}
                  onPress={() => setSelectedRoles((current) => ({ ...current, [request.id_solicitud]: option.role }))}
                  style={[
                    s.roleOption,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#eef1eb' },
                    (selectedRoles[request.id_solicitud] ?? 'peon') === option.role && { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={[s.roleOptionText, { color: colors.textSecondary }, (selectedRoles[request.id_solicitud] ?? 'peon') === option.role && { color: '#ffffff', fontWeight: '800' }]}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={s.requestActions}>
              <Pressable disabled={busyId === request.id_solicitud} onPress={() => setDecision({ request, action: 'reject' })} style={s.rejectButton}>
                <Text style={s.rejectText}>Rechazar</Text>
              </Pressable>
              <Pressable disabled={busyId === request.id_solicitud} onPress={() => setDecision({ request, action: 'approve' })} style={[s.approveButton, { backgroundColor: colors.primary }]}>
                <Text style={s.approveText}>{busyId === request.id_solicitud ? 'Procesando…' : 'Aprobar y enviar código'}</Text>
              </Pressable>
            </View>
          </View>
        ))
      ) : (
        <View style={[s.emptyCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={[s.emptyIcon, { backgroundColor: colors.bgCardMuted }]}>
            <Ionicons color={colors.primary} name="people" size={26} />
          </View>
          <Text style={[s.emptyTitle, { color: colors.textMain }]}>No hay solicitudes pendientes</Text>
          <Text style={[s.emptyCopy, { color: colors.textMuted }]}>Las solicitudes aparecen cuando la persona confirma su correo.</Text>
        </View>
      )}

      <Modal animationType="fade" onRequestClose={() => setDecision(null)} transparent visible={Boolean(decision)}>
        <View style={s.modalBackdrop}>
          <View style={[s.modalCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[s.modalTitle, { color: colors.textMain }]}>
              {decision?.action === 'approve' ? 'Aprobar solicitud' : 'Rechazar solicitud'}
            </Text>
            <Text style={[s.modalCopy, { color: colors.textSecondary }]}>
              {decision ? `${decision.request.nombre} ${decision.request.apellido} · ${decision.request.email}` : ''}
              {decision?.action === 'approve'
                ? `\nRol asignado: ${roleOptions.find((option) => option.role === (selectedRoles[decision.request.id_solicitud] ?? 'peon'))?.label}. Se enviará un código de acceso.`
                : '\nNo se creará una cuenta activa.'}
            </Text>
            <View style={s.requestActions}>
              <Pressable onPress={() => setDecision(null)} style={s.rejectButton}>
                <Text style={s.rejectText}>Cancelar</Text>
              </Pressable>
              <Pressable onPress={() => void resolveRequest()} style={[s.approveButton, { backgroundColor: colors.primary }]}>
                <Text style={s.approveText}>Confirmar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Page>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  page: { paddingBottom: 36, paddingHorizontal: 18, paddingTop: 14 },
  pageDesktop: { paddingHorizontal: 40, paddingTop: 24 },
  contentContainer: { width: '100%' },
  contentContainerDesktop: { alignSelf: 'center', maxWidth: 1200, width: '100%' },

  // Header
  header: { marginBottom: 20 },
  brandLine: { alignItems: 'center', flexDirection: 'row', gap: 8, marginBottom: 14 },
  connection: { alignItems: 'center', backgroundColor: '#eaf4ec', borderRadius: 20, flexDirection: 'row', gap: 6, marginLeft: 'auto', paddingHorizontal: 10, paddingVertical: 5 },
  connectionDark: { backgroundColor: 'rgba(64, 145, 108, 0.2)' },
  connectionOff: { backgroundColor: '#fff1d5' },
  connectionDot: { backgroundColor: '#34d399', borderRadius: 4, height: 7, width: 7 },
  connectionDotOff: { backgroundColor: '#d97706' },
  connectionText: { color: '#1f4e38', fontSize: 10, fontWeight: '700' },
  titleRow: { alignItems: 'center', flexDirection: 'row' },
  pageTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.6 },
  pageSubtitle: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginTop: 4 },
  avatar: { alignItems: 'center', backgroundColor: '#e2ece4', borderColor: '#ffffff', borderRadius: 22, borderWidth: 2, height: 44, justifyContent: 'center', width: 44 },
  avatarImg: { borderRadius: 22, height: 44, width: 44 },
  avatarText: { color: '#1f4e38', fontSize: 13, fontWeight: '800' },

  // Welcome Banner
  welcome: {
    backgroundColor: '#122e1e',
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
    overflow: 'hidden',
    padding: 20,
  },
  welcomeDark: {
    backgroundColor: '#0a1a10',
    borderColor: 'rgba(134, 239, 172, 0.15)',
    borderWidth: 1,
  },
  welcomeTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(134, 239, 172, 0.15)',
    borderRadius: 12,
    marginBottom: 8,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  welcomeEyebrow: {
    color: '#86efac',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  welcomeTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  welcomeCopy: {
    color: '#cad9cc',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    maxWidth: 540,
  },
  welcomeIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 12,
  },
  fieldShortcuts: { marginBottom: 8 },

  // Stats Card
  statsCard: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 24,
    padding: 18,
  },
  verticalChart: { marginTop: 12 },
  verticalChartRow: { flexDirection: 'row', height: 228 },
  yAxis: { justifyContent: 'space-between', paddingBottom: 32, paddingRight: 8, width: 32 },
  axisTick: { fontSize: 9, textAlign: 'right' },
  plotArea: { flex: 1, height: 228, position: 'relative' },
  gridLine: { height: 1, left: 0, position: 'absolute', right: 0 },
  columns: { flexDirection: 'row', height: '100%' },
  chartColumn: { alignItems: 'center', flex: 1, minWidth: 32 },
  barSlot: { alignItems: 'center', flex: 1, justifyContent: 'flex-end', position: 'relative', width: '100%' },
  verticalBar: { borderTopLeftRadius: 4, borderTopRightRadius: 4, maxWidth: 42, minHeight: 2, width: '58%' },
  barValue: { fontSize: 9, fontWeight: '800', position: 'absolute', transform: [{ translateY: -3 }] },
  xAxisLabel: { fontSize: 9, height: 32, marginTop: 5, textAlign: 'center' },
  axisTitle: { fontSize: 9, marginTop: 2, textAlign: 'center' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
  },
  statsGridDesktop: {
    gap: 16,
  },
  statBox: {
    borderRadius: 14,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    padding: 14,
  },
  statBoxDesktop: {
    flexBasis: '22%',
  },
  statBoxTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statIconWrap: {
    alignItems: 'center',
    borderRadius: 10,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  statBoxValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  statBoxLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
  },
  statTrack: {
    backgroundColor: 'rgba(128, 128, 128, 0.15)',
    borderRadius: 4,
    height: 6,
    marginVertical: 8,
    overflow: 'hidden',
  },
  statBar: {
    borderRadius: 4,
    height: 6,
  },
  statBoxNote: {
    fontSize: 9.5,
  },

  // Section heads
  sectionHead: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionCopy: {
    fontSize: 11,
    marginTop: 3,
  },
  dateChip: {
    backgroundColor: 'rgba(134, 239, 172, 0.16)',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  dateChipText: {
    color: '#2d6a4f',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  // Quick Action cards
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  actionGridDesktop: {
    gap: 14,
  },
  actionCard: {
    borderRadius: 16,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 140,
    padding: 16,
    position: 'relative',
  },
  actionCardWide: {
    flexBasis: '22%',
  },
  actionCardPressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }],
  },
  actionIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 42,
    justifyContent: 'center',
    marginBottom: 14,
    width: 42,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '800',
    paddingRight: 20,
  },
  actionDescription: {
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 5,
    paddingRight: 12,
  },
  actionArrow: {
    position: 'absolute',
    right: 14,
    top: 16,
  },

  // Modules List
  moduleGrid: {
    gap: 10,
    marginBottom: 24,
  },
  moduleGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moduleCard: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  moduleCardDesktop: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  moduleCardPressed: {
    opacity: 0.82,
  },
  moduleIconBadge: {
    alignItems: 'center',
    borderRadius: 12,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  moduleTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  moduleDescription: {
    fontSize: 10.5,
    marginTop: 2,
  },
  developmentCard: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 18,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  developmentIcon: {
    alignItems: 'center',
    borderRadius: 18,
    height: 64,
    justifyContent: 'center',
    marginBottom: 18,
    width: 64,
  },
  developmentTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  developmentCopy: { fontSize: 13, lineHeight: 20, marginTop: 9, maxWidth: 380, textAlign: 'center' },
  developmentBadge: { alignItems: 'center', borderRadius: 20, flexDirection: 'row', gap: 6, marginTop: 20, paddingHorizontal: 12, paddingVertical: 8 },
  developmentBadgeText: { fontSize: 11, fontWeight: '700' },

  // Profile
  profileGridDesktop: {
    flexDirection: 'row',
    gap: 20,
  },
  profileColumn: {
    flex: 1,
  },
  profileCard: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 18,
    padding: 18,
  },
  photoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    marginVertical: 14,
  },
  photo: {
    borderRadius: 36,
    height: 72,
    width: 72,
  },
  photoFallback: {
    alignItems: 'center',
    borderRadius: 36,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  photoInitials: {
    fontSize: 22,
    fontWeight: '900',
  },
  profileFullName: {
    fontSize: 17,
    fontWeight: '800',
  },
  profileMetaText: {
    fontSize: 11,
    marginTop: 2,
  },
  photoActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  smallBtn: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  smallBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  removePhoto: {
    color: '#dc2626',
    fontSize: 11,
    fontWeight: '700',
  },
  formLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 14,
  },
  formHelp: {
    fontSize: 11,
    marginTop: 4,
  },
  formInput: {
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 13,
    height: 46,
    paddingHorizontal: 12,
  },
  primaryBtn: {
    alignItems: 'center',
    borderRadius: 11,
    height: 46,
    justifyContent: 'center',
    marginTop: 18,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  disabled: {
    opacity: 0.65,
  },
  recoveryLink: {
    alignItems: 'center',
    paddingTop: 16,
  },
  recoveryText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  logoutBtn: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    height: 48,
    justifyContent: 'center',
    marginTop: 10,
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '700',
  },
  appVersion: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 20,
    textAlign: 'center',
  },

  // Request & Action Cards
  requestCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
  },
  requestName: {
    fontSize: 15,
    fontWeight: '800',
  },
  requestEmail: {
    fontSize: 12,
    marginTop: 4,
  },
  requestInput: {
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  healthTab: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 10,
  },
  healthTabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  roleLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 14,
  },
  roleOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  roleOption: {
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  roleOptionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    marginTop: 14,
  },
  approveButton: {
    alignItems: 'center',
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 14,
  },
  approveText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  rejectButton: {
    alignItems: 'center',
    borderColor: '#fca5a5',
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 14,
  },
  rejectText: {
    color: '#dc2626',
    fontSize: 11,
    fontWeight: '700',
  },
  requestNotice: {
    backgroundColor: '#e8efe5',
    borderRadius: 10,
    color: '#1f4e38',
    fontSize: 12,
    marginBottom: 12,
    padding: 12,
  },
  requestError: {
    backgroundColor: '#fff0ed',
    borderRadius: 10,
    color: '#9b3d36',
    fontSize: 12,
    marginBottom: 12,
    padding: 12,
  },

  // Empty state
  emptyCard: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  emptyIcon: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginBottom: 12,
    width: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyCopy: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    maxWidth: 380,
    textAlign: 'center',
  },

  // Modal
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(10,20,12,0.6)',
    flex: 1,
    justifyContent: 'center',
    padding: 22,
  },
  modalCard: {
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: 440,
    padding: 22,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalCopy: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
  backBtn: {
    alignSelf: 'flex-start',
    borderRadius: 9,
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
