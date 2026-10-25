// presento los resúmenes y accesos principales según el perfil activo.
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
import { AnimalsInventoryScreen, CorralsInventoryScreen, NotificationsScreen, NursingScreen } from './LivestockScreens';
import { EventsScreen, MapAreasScreen, ReproductionScreen, TasksManagerScreen } from './FieldModuleScreens';
import { CatalogScreen, TeamScreen } from './OrganizationScreens';
import { getDashboard, listPendingDeaths, reportAnimal, reviewDeath, type DashboardMetrics, type DeathReport } from '../../services/productionApi';

type ModuleKey = 'inicio' | 'animales' | 'corrales' | 'tareas' | 'sanidad' | 'reproduccion' | 'mapa' | 'eventos' | 'avisos' | 'equipo' | 'catalogo' | 'perfil';

type ModuleItem = {
  key: ModuleKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  badgeColor: string;
  badgeBg: string;
  roles: string[];
};

const modules: ModuleItem[] = [
  { key: 'animales', label: 'Animales', icon: 'paw', description: 'Fichas, pesajes, movimientos e historial', badgeColor: '#2d6a4f', badgeBg: '#e8f5ed', roles: ['administrador', 'dueno', 'peon'] },
  { key: 'corrales', label: 'Corrales', icon: 'grid', description: 'Ocupación, capacidad y traslados', badgeColor: '#b06d2c', badgeBg: '#fef3e7', roles: ['administrador', 'dueno', 'peon'] },
  { key: 'tareas', label: 'Tareas', icon: 'checkbox', description: 'Pendientes y trabajo del equipo', badgeColor: '#366aa1', badgeBg: '#edf4fb', roles: ['administrador', 'peon'] },
  { key: 'sanidad', label: 'Corral de enfermería', icon: 'medkit', description: 'Animales enfermos, controles y tratamientos', badgeColor: '#a8473d', badgeBg: '#faecea', roles: ['administrador', 'peon', 'veterinario'] },
  { key: 'reproduccion', label: 'Reproducción', icon: 'git-branch', description: 'Servicios, diagnósticos y nacimientos', badgeColor: '#6a4d95', badgeBg: '#f2effa', roles: ['administrador', 'dueno', 'peon'] },
  { key: 'mapa', label: 'Mi campo', icon: 'map', description: 'Potreros y corrales sobre el terreno', badgeColor: '#2d6a4f', badgeBg: '#e8f5ed', roles: ['administrador', 'dueno', 'peon'] },
  { key: 'eventos', label: 'Eventos y Remates', icon: 'calendar', description: 'Remates y exposiciones nacionales', badgeColor: '#c28b34', badgeBg: '#fbf4e8', roles: ['administrador', 'dueno'] },
  { key: 'avisos', label: 'Avisos y Alertas', icon: 'notifications', description: 'Alertas y novedades de la estancia', badgeColor: '#d97706', badgeBg: '#fef3c7', roles: ['administrador', 'dueno', 'peon'] },
  { key: 'equipo', label: 'Equipo de campo', icon: 'people', description: 'Personas, roles y accesos', badgeColor: '#4f46e5', badgeBg: '#eef2ff', roles: ['administrador', 'dueno'] },
  { key: 'catalogo', label: 'Especies y razas', icon: 'list', description: 'Catálogo productivo de la organización', badgeColor: '#059669', badgeBg: '#ecfdf5', roles: ['administrador', 'dueno', 'peon'] },
  { key: 'perfil', label: 'Mi perfil', icon: 'person-circle', description: 'Datos personales y sesión', badgeColor: '#475569', badgeBg: '#f1f5f9', roles: ['administrador', 'dueno', 'peon', 'veterinario'] },
];

const roleLabel: Record<string, string> = { administrador: 'Administrador', dueno: 'Dueño', copropietario: 'Administrador', peon: 'Peón', veterinario: 'Veterinario' };
function normalizeRole(role: string): string { return role === 'copropietario' ? 'administrador' : role; }

function goTo(key: ModuleKey): void {
  if (key === 'inicio') { router.navigate('/(app)/home'); return; }
  if (key === 'animales' || key === 'tareas') { router.navigate(`/(app)/${key}`); return; }
  if (key === 'corrales') { router.navigate('/(app)/corrals'); return; }
  if (key === 'eventos') { router.navigate('/(app)/events'); return; }
  if (key === 'equipo') { router.navigate('/(app)/team'); return; }
  if (key === 'perfil') { router.navigate('/(app)/more'); return; }
  if (key === 'sanidad') { router.navigate('/(app)/health'); return; }
  router.push({ pathname: '/(app)/[module]', params: { module: key } });
}

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
  const [metricsError, setMetricsError] = useState('');
  const role = normalizeRole(session?.usuario.rol.toLowerCase() ?? 'dueno');
  const name = session?.usuario.nombre?.trim() || 'equipo';
  const isVet = role === 'veterinario';
  const isField = role === 'peon';
  const roleModules = modules.filter((item) => item.roles.includes(role));
  const isManager = role === 'administrador' || role === 'dueno';
  const isDesktop = Platform.OS === 'web' && width >= 860;
  const dashboardCopy = isVet ? 'Controles y seguimiento de animales en enfermería.' : isField ? 'Lo importante para las tareas y ganado de hoy.' : 'Monitoreo productivo y sanitario de la estancia.';
  const today = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  useEffect(() => {
    if (!session || isField || isVet) return;
    let active = true;
    getDashboard(session).then((data) => { if (active) setMetrics(data); }).catch((cause: unknown) => { if (active) setMetricsError(cause instanceof Error ? cause.message : 'No se pudieron cargar las métricas.'); });
    return () => { active = false; };
  }, [session, isField, isVet]);

  if (isVet) return <HealthScreen />;

  const managerActions: { key: ModuleKey; title: string; description: string; icon: keyof typeof Ionicons.glyphMap; color: string; soft: string }[] = role === 'administrador' ? [
    { key: 'tareas', title: 'Organizar tareas', description: 'Pendientes y asignación al equipo', icon: 'checkbox-outline', color: '#2d6a3f', soft: isDark ? 'rgba(45, 106, 63, 0.25)' : '#e7f2e8' },
    { key: 'sanidad', title: 'Revisar bajas', description: 'Reportes de muerte pendientes de revisión', icon: 'shield-checkmark-outline', color: '#b04c43', soft: isDark ? 'rgba(176, 76, 67, 0.25)' : '#faeae8' },
    { key: 'reproduccion', title: 'Reproducción', description: 'Servicios, preñeces y nacimientos', icon: 'git-branch-outline', color: '#436fae', soft: isDark ? 'rgba(67, 111, 174, 0.25)' : '#eaf0fa' },
    { key: 'avisos', title: 'Ver avisos', description: 'Alertas y novedades generales de la estancia', icon: 'notifications-outline', color: '#b57a26', soft: isDark ? 'rgba(181, 122, 38, 0.25)' : '#fdf3e7' },
  ] : [
    { key: 'reproduccion', title: 'Reproducción', description: 'Servicios, preñeces y nacimientos', icon: 'git-branch-outline', color: '#2d6a3f', soft: isDark ? 'rgba(45, 106, 63, 0.25)' : '#e7f2e8' },
    { key: 'mapa', title: 'Mi campo', description: 'Potreros y corrales sobre el terreno', icon: 'map-outline', color: '#436fae', soft: isDark ? 'rgba(67, 111, 174, 0.25)' : '#eaf0fa' },
    { key: 'avisos', title: 'Ver avisos', description: 'Alertas y novedades generales de la estancia', icon: 'notifications-outline', color: '#b57a26', soft: isDark ? 'rgba(181, 122, 38, 0.25)' : '#fdf3e7' },
    { key: 'equipo', title: 'Consultar equipo', description: 'Personal activo y roles asignados', icon: 'people-outline', color: '#7659a8', soft: isDark ? 'rgba(118, 89, 168, 0.25)' : '#f0ebf8' },
  ];

  const statistics = metrics ? [
    { label: 'Crías del año', value: metrics.crias_ano, color: '#3d9458', icon: 'leaf-outline' as const, note: 'Nacimientos registrados' },
    { label: 'Hembras preñadas', value: metrics.hembras_prenadas, color: '#d9822b', icon: 'heart-circle-outline' as const, note: 'Diagnóstico confirmado' },
    { label: 'Servicios · 90 días', value: metrics.servicios_90_dias, color: '#3f78b8', icon: 'git-network-outline' as const, note: 'Actividad de monta' },
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

      {/* Management Statistics Section */}
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

      {/* Quick Actions / Modules Section */}
      <View style={s.sectionHead}>
        <View>
          <Text style={[s.sectionTitle, { color: colors.textMain }]}>
            {isManager ? 'Accesos directos del campo' : 'Módulos operativos'}
          </Text>
          <Text style={[s.sectionCopy, { color: colors.textMuted }]}>
            {isManager ? 'Operaciones principales para tu día a día' : 'Entrá a la sección que necesitás'}
          </Text>
        </View>
      </View>

      {isManager ? (
        <View style={[s.actionGrid, isDesktop && s.actionGridDesktop]}>
          {managerActions.map(({ key, ...action }) => (
            <QuickAction key={key} {...action} wide={isDesktop} onPress={() => goTo(key)} />
          ))}
        </View>
      ) : (
        <View style={[s.moduleGrid, isDesktop && s.moduleGridDesktop]}>
          {roleModules.map((item) => (
            <ModuleRow key={item.key} isDesktop={isDesktop} item={item} onPress={() => goTo(item.key)} />
          ))}
        </View>
      )}
    </Page>
  );
}

function QuickAction({ title, description, icon, color, soft, wide, onPress }: { title: string; description: string; icon: keyof typeof Ionicons.glyphMap; color: string; soft: string; wide: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.actionCard,
        { backgroundColor: colors.bgCard, borderColor: colors.border },
        wide && s.actionCardWide,
        pressed && s.actionCardPressed,
      ]}
    >
      <View style={[s.actionIcon, { backgroundColor: soft }]}>
        <Ionicons color={color} name={icon} size={22} />
      </View>
      <Text style={[s.actionTitle, { color: colors.textMain }]}>{title}</Text>
      <Text style={[s.actionDescription, { color: colors.textMuted }]}>{description}</Text>
      <Ionicons color={colors.textMuted} name="arrow-forward-outline" size={16} style={s.actionArrow} />
    </Pressable>
  );
}

function ModuleRow({ item, isDesktop, onPress }: { item: ModuleItem; isDesktop: boolean; onPress: () => void }) {
  const { colors, isDark } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.moduleCard,
        { backgroundColor: colors.bgCard, borderColor: colors.border },
        isDesktop && s.moduleCardDesktop,
        pressed && s.moduleCardPressed,
      ]}
    >
      <View style={[s.moduleIconBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : item.badgeBg }]}>
        <Ionicons color={isDark ? '#86efac' : item.badgeColor} name={item.icon} size={20} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.moduleTitle, { color: colors.textMain }]}>{item.label}</Text>
        <Text numberOfLines={1} style={[s.moduleDescription, { color: colors.textMuted }]}>{item.description}</Text>
      </View>
      <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
    </Pressable>
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
  if (role === 'peon') return <FieldReportScreen />;
  if (role === 'administrador') return <DeathReviewScreen />;
  return <AnimalsInventoryScreen />;
}

// registro reportes sanitarios y muertes desde el trabajo de campo.
function FieldReportScreen() {
  const { session } = useSession();
  const { colors, isDark } = useTheme();
  const [animalId, setAnimalId] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [kind, setKind] = useState<'sanitario' | 'muerte'>('sanitario');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [message, setMessage] = useState('');

  async function submit(): Promise<void> {
    const lat = latitude.trim() ? Number(latitude) : undefined;
    const lon = longitude.trim() ? Number(longitude) : undefined;
    if (!session || !Number(animalId) || !reason.trim()) {
      setMessage('Indicá el número del animal y el motivo.');
      return;
    }
    if (kind === 'muerte' && ((lat === undefined) !== (lon === undefined) || (lat !== undefined && (!Number.isFinite(lat) || Math.abs(lat) > 90 || lon === undefined || !Number.isFinite(lon) || Math.abs(lon) > 180)))) {
      setMessage('Si informás ubicación, completá latitud y longitud GPS válidas.');
      return;
    }
    try {
      await reportAnimal(session, kind, {
        id_animal: Number(animalId),
        fecha: date,
        motivo: reason.trim(),
        ...(kind === 'muerte' && lat !== undefined && lon !== undefined ? { latitud: lat, longitud: lon } : {}),
      });
      setMessage(kind === 'muerte' ? 'Baja operativa registrada. Falta revisión administrativa.' : 'Reporte sanitario registrado; trasladá físicamente el animal a enfermería.');
      setAnimalId('');
      setReason('');
      setLatitude('');
      setLongitude('');
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'No se pudo guardar el reporte.');
    }
  }

  return (
    <Page>
      <Header title="Reportes del campo" subtitle="ENFERMEDAD Y MUERTE" />
      <View style={[s.requestCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <Text style={[s.sectionTitle, { color: colors.textMain }]}>Nuevo reporte de campo</Text>
        <View style={s.roleOptions}>
          {(['sanitario', 'muerte'] as const).map((value) => (
            <Pressable
              key={value}
              onPress={() => setKind(value)}
              style={[
                s.roleOption,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#eef1eb' },
                kind === value && { backgroundColor: colors.primary },
              ]}
            >
              <Text style={[s.roleOptionText, { color: colors.textSecondary }, kind === value && { color: '#ffffff', fontWeight: '800' }]}>
                {value === 'muerte' ? 'Baja / Muerte' : 'Sanidad / Enfermedad'}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[s.roleLabel, { color: colors.textMuted }]}>ID DEL ANIMAL</Text>
        <TextInput
          keyboardType="number-pad"
          onChangeText={setAnimalId}
          placeholder="Ej. 120"
          placeholderTextColor={colors.textMuted}
          style={[s.formInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
          value={animalId}
        />

        <Text style={[s.roleLabel, { color: colors.textMuted }]}>FECHA</Text>
        <TextInput
          onChangeText={setDate}
          placeholder="AAAA-MM-DD"
          placeholderTextColor={colors.textMuted}
          style={[s.formInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
          value={date}
        />

        <Text style={[s.roleLabel, { color: colors.textMuted }]}>MOTIVO / OBSERVACIONES</Text>
        <TextInput
          multiline
          onChangeText={setReason}
          placeholder="Describí los síntomas o lo observado en el lote"
          placeholderTextColor={colors.textMuted}
          style={[s.formInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText, minHeight: 74 }]}
          value={reason}
        />

        {kind === 'muerte' ? (
          <>
            <Text style={[s.roleLabel, { color: colors.textMuted }]}>UBICACIÓN GPS (OPCIONAL)</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput
                keyboardType="decimal-pad"
                onChangeText={setLatitude}
                placeholder="Latitud"
                placeholderTextColor={colors.textMuted}
                style={[s.formInput, { flex: 1, backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
                value={latitude}
              />
              <TextInput
                keyboardType="decimal-pad"
                onChangeText={setLongitude}
                placeholder="Longitud"
                placeholderTextColor={colors.textMuted}
                style={[s.formInput, { flex: 1, backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
                value={longitude}
              />
            </View>
          </>
        ) : null}

        <Pressable onPress={() => void submit()} style={[s.primaryBtn, { backgroundColor: colors.primary }]}>
          <Text style={s.primaryBtnText}>Guardar reporte</Text>
        </Pressable>
        {message ? <Text style={s.requestNotice}>{message}</Text> : null}
      </View>
    </Page>
  );
}

// permito al administrador confirmar o rechazar bajas pendientes.
function DeathReviewScreen() {
  const { session } = useSession();
  const { colors } = useTheme();
  const [rows, setRows] = useState<DeathReport[]>([]);
  const [message, setMessage] = useState('');

  async function load(): Promise<void> {
    if (!session) return;
    try { setRows(await listPendingDeaths(session)); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : 'No se pudieron cargar los reportes.'); }
  }

  useEffect(() => {
    if (!session) return;
    let active = true;
    listPendingDeaths(session).then((data) => { if (active) setRows(data); }).catch((cause: unknown) => { if (active) setMessage(cause instanceof Error ? cause.message : 'No se pudieron cargar los reportes.'); });
    return () => { active = false; };
  }, [session]);

  async function decide(row: DeathReport, decision: 'confirmar' | 'rechazar'): Promise<void> {
    if (!session) return;
    try {
      await reviewDeath(session, row.id_reporte, decision, decision === 'rechazar' ? 'Reporte rechazado por el administrador' : undefined);
      setMessage(decision === 'confirmar' ? 'Muerte confirmada.' : 'Animal reactivado; reporte conservado.');
      await load();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'No se pudo revisar el reporte.');
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
      setError(cause instanceof Error ? cause.message : 'No se pudo actualizar el perfil.');
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
      setError(cause instanceof Error ? cause.message : 'No se pudo cambiar la contraseña.');
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
  const item = modules.find((entry) => entry.key === module && entry.roles.includes(role));
  if (!item) return <Redirect href="/(app)/more" />;
  if (role === 'administrador' && item.key === 'equipo') return <AdminRequestsScreen />;
  if (item.key === 'equipo') return <TeamScreen />;
  if (item.key === 'catalogo') return <CatalogScreen />;
  if (item.key === 'perfil') return <MoreScreen />;
  if (item.key === 'corrales') return <CorralsInventoryScreen />;
  if (item.key === 'animales') return <AnimalsInventoryScreen />;
  if (item.key === 'tareas') return <TasksManagerScreen />;
  if (item.key === 'sanidad') return <NursingScreen />;
  if (item.key === 'avisos') return <NotificationsScreen />;
  if (item.key === 'reproduccion') return <ReproductionScreen />;
  if (item.key === 'eventos') return <EventsScreen />;
  if (item.key === 'mapa') return <MapAreasScreen />;
  return <Redirect href="/(app)/more" />;
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
      if (active) setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las solicitudes.');
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
      setError(cause instanceof Error ? cause.message : 'No se pudo resolver la solicitud.');
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

  // Stats Card
  statsCard: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 24,
    padding: 18,
  },
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
    maxWidth: 460,
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
