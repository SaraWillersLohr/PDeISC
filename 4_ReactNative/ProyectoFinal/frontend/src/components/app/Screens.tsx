// presento los resúmenes y accesos principales según el perfil activo.
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../../context/SessionContext';
import { removeSession, saveSession } from '../../services/sessionStorage';
import { changeMyPassword, updateMyProfile } from '../../services/authApi';
import { approveRegistrationRequest, listRegistrationRequests, rejectRegistrationRequest, type RegistrationRequest, type RequestedRole } from '../../services/adminApi';
import { AnimalsInventoryScreen, CorralsInventoryScreen, NotificationsScreen, NursingScreen } from './LivestockScreens';
import { EventsScreen, MapAreasScreen, ReproductionScreen, TasksManagerScreen } from './FieldModuleScreens';
import { CatalogScreen, TeamScreen } from './OrganizationScreens';
import { getDashboard, listPendingDeaths, reportAnimal, reviewDeath, type DashboardMetrics, type DeathReport } from '../../services/productionApi';

const c = { green: '#214d35', greenDark: '#173d2a', ink: '#202c23', muted: '#748076', line: '#e5eae3', canvas: '#f4f6f1', white: '#fff', pale: '#e8efe5', gold: '#c29343', red: '#a34b43' };
type ModuleKey = 'inicio' | 'animales' | 'corrales' | 'tareas' | 'sanidad' | 'reproduccion' | 'mapa' | 'eventos' | 'avisos' | 'equipo' | 'catalogo' | 'perfil';
const modules: { key: ModuleKey; label: string; icon: string; description: string; roles: string[] }[] = [
  { key: 'animales', label: 'Animales', icon: '◉', description: 'Fichas, pesajes, movimientos e historial', roles: ['administrador', 'dueno', 'peon'] },
  { key: 'corrales', label: 'Corrales', icon: '▦', description: 'Ocupación, capacidad y traslados', roles: ['administrador', 'dueno', 'peon'] },
  { key: 'tareas', label: 'Tareas', icon: '✓', description: 'Pendientes y trabajo del equipo', roles: ['administrador', 'peon'] },
  { key: 'sanidad', label: 'Corral de enfermería', icon: '✚', description: 'Animales enfermos, controles y tratamientos', roles: ['administrador', 'peon', 'veterinario'] },
  { key: 'reproduccion', label: 'Reproducción', icon: '⌁', description: 'Servicios, diagnósticos y nacimientos', roles: ['administrador', 'dueno', 'peon'] },
  { key: 'mapa', label: 'Mi campo', icon: '⌖', description: 'Potreros y corrales sobre el terreno', roles: ['administrador', 'dueno', 'peon'] },
  { key: 'eventos', label: 'Eventos', icon: '▤', description: 'Remates y exposiciones nacionales', roles: ['administrador', 'dueno'] },
  { key: 'avisos', label: 'Avisos', icon: '◌', description: 'Alertas y novedades de la estancia', roles: ['administrador', 'dueno', 'peon'] },
  { key: 'equipo', label: 'Equipo', icon: '♙', description: 'Personas, roles y acceso', roles: ['administrador', 'dueno'] },
  { key: 'catalogo', label: 'Especies y razas', icon: '⌘', description: 'Catálogo productivo de la organización', roles: ['administrador', 'peon'] },
  { key: 'perfil', label: 'Mi perfil', icon: '◎', description: 'Datos personales y sesión', roles: ['administrador', 'dueno', 'peon', 'veterinario'] },
];
const roleLabel: Record<string, string> = { administrador: 'Administrador', dueno: 'Dueño', copropietario: 'Administrador', peon: 'Peón', veterinario: 'Veterinario' };
function normalizeRole(role: string): string { return role === 'copropietario' ? 'administrador' : role; }

function goTo(key: ModuleKey): void {
  if (key === 'inicio') { router.navigate('/(app)'); return; }
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
  const [online, setOnline] = useState(true);
  useEffect(() => { const unsubscribe = NetInfo.addEventListener((state) => setOnline(Boolean(state.isConnected))); return unsubscribe; }, []);
  const initials = `${session?.usuario.nombre?.[0] ?? 'E'}${session?.usuario.apellido?.[0] ?? ''}`.toUpperCase();
  return <View style={s.header}>
    <View style={s.brandLine}><View style={[s.connection, !online && s.connectionOff]}><View style={[s.connectionDot, !online && s.connectionDotOff]} /><Text style={s.connectionText}>{online ? 'En línea' : 'Sin señal'}</Text></View></View>
    <View style={s.titleRow}><View style={{ flex: 1 }}><Text style={s.pageTitle}>{title}</Text><Text style={s.pageSubtitle}>{subtitle}</Text></View>{session?.usuario.foto_perfil ? <Image source={{ uri: session.usuario.foto_perfil }} style={{ borderRadius: 21, height: 42, width: 42 }} /> : <View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View>}</View>
  </View>;
}

function Page({ children }: { children: React.ReactNode }) { return <SafeAreaView edges={['bottom','left','right']} style={s.safe}><ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>{children}</ScrollView></SafeAreaView>; }

export function HomeScreen() {
  const { session } = useSession();
  const { width } = useWindowDimensions();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [metricsError, setMetricsError] = useState('');
  const role = normalizeRole(session?.usuario.rol.toLowerCase() ?? 'dueno');
  const name = session?.usuario.nombre?.trim() || 'equipo';
  const isVet = role === 'veterinario';
  const isField = role === 'peon';
  const roleModules = modules.filter((item) => item.roles.includes(role));
  const isManager = role === 'administrador' || role === 'dueno';
  const dashboardCopy = isVet ? 'Controles y seguimiento de animales.' : isField ? 'Lo importante para el trabajo de hoy.' : 'Una mirada rápida a la actividad del campo.';
  const today = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  useEffect(() => {
    if (!session || isField || isVet) return;
    let active = true;
    getDashboard(session).then((data) => { if (active) setMetrics(data); }).catch((cause: unknown) => { if (active) setMetricsError(cause instanceof Error ? cause.message : 'No se pudieron cargar las métricas.'); });
    return () => { active = false; };
  }, [session, isField, isVet]);
  if (isVet) return <HealthScreen />;
  const managerActions: { key: ModuleKey; title: string; description: string; icon: keyof typeof Ionicons.glyphMap; color: string; soft: string }[] = role === 'administrador' ? [
    { key: 'tareas', title: 'Organizar tareas', description: 'Pendientes y trabajo del equipo', icon: 'checkbox-outline', color: '#2d6a3f', soft: '#e7f2e8' },
    { key: 'sanidad', title: 'Revisar bajas', description: 'Reportes pendientes de confirmación', icon: 'shield-checkmark-outline', color: '#b04c43', soft: '#faeae8' },
    { key: 'reproduccion', title: 'Reproducción', description: 'Servicios, diagnósticos y nacimientos', icon: 'git-branch-outline', color: '#436fae', soft: '#eaf0fa' },
    { key: 'avisos', title: 'Ver avisos', description: 'Alertas y novedades de la estancia', icon: 'notifications-outline', color: '#8a6230', soft: '#f7efe2' },
  ] : [
    { key: 'reproduccion', title: 'Reproducción', description: 'Servicios, diagnósticos y nacimientos', icon: 'git-branch-outline', color: '#2d6a3f', soft: '#e7f2e8' },
    { key: 'mapa', title: 'Mi campo', description: 'Potreros y corrales sobre el terreno', icon: 'map-outline', color: '#436fae', soft: '#eaf0fa' },
    { key: 'avisos', title: 'Ver avisos', description: 'Alertas y novedades de la estancia', icon: 'notifications-outline', color: '#8a6230', soft: '#f7efe2' },
    { key: 'equipo', title: 'Consultar equipo', description: 'Personas y actividad de la estancia', icon: 'people-outline', color: '#7659a8', soft: '#f0ebf8' },
  ];
  const statistics = metrics ? [
    { label: 'Crías del año', value: metrics.crias_ano, color: '#4d9364' },
    { label: 'Hembras preñadas', value: metrics.hembras_prenadas, color: '#d49b3d' },
    { label: 'Servicios · 90 días', value: metrics.servicios_90_dias, color: '#6488c7' },
    { label: role === 'administrador' ? 'Muertes pendientes' : 'Alertas sanitarias', value: role === 'administrador' ? metrics.muertes_pendientes : metrics.alertas_sanitarias, color: '#d26b5d' },
  ] : [];
  return <Page><Header title={isManager ? `¡Hola, ${name}!` : 'Inicio'} subtitle={`${roleLabel[role] ?? 'EQUIPO'} · ${today}`} />
    {!isManager ? <View style={s.welcome}><View><Text style={s.welcomeEyebrow}>{roleLabel[role] ?? 'Equipo de estancia'}</Text><Text style={s.welcomeTitle}>Buen día, {name}</Text><Text style={s.welcomeCopy}>{dashboardCopy}</Text></View><Text style={s.welcomeIcon}>☀</Text></View> : null}
    {isManager ? <View style={chartStyles.card}><View style={s.sectionHead}><View><Text style={s.sectionTitle}>Estadísticas de la estancia</Text><Text style={s.sectionCopy}>Resumen productivo actual</Text></View><Text style={s.dateChip}>HOY</Text></View>{statistics.length ? statistics.map((item) => { const max = Math.max(1, ...statistics.map((entry) => entry.value)); return <View key={item.label} style={chartStyles.row}><View style={chartStyles.labelRow}><Text style={chartStyles.label}>{item.label}</Text><Text style={chartStyles.value}>{item.value}</Text></View><View style={chartStyles.track}><View style={[chartStyles.bar, { backgroundColor: item.color, width: `${Math.max(item.value > 0 ? 8 : 0, item.value / max * 100)}%` }]} /></View></View>; }) : <Text style={s.sectionCopy}>Cargando estadísticas…</Text>}</View> : null}
    {metricsError ? <Text style={s.requestError}>{metricsError}</Text> : null}
    <View style={s.sectionHead}><View><Text style={s.sectionTitle}>{isManager ? 'Accesos directos' : 'Accesos rápidos'}</Text><Text style={s.sectionCopy}>{isManager ? 'Las tareas más usadas de tu panel' : 'Entrá a lo que necesitás'}</Text></View></View>
    {isManager ? <View style={dashboardStyles.actionGrid}>{managerActions.map(({ key, ...action }) => <QuickAction key={key} {...action} wide={width >= 720} onPress={() => goTo(key)} />)}</View> : <View style={s.moduleList}>{roleModules.slice(0, 4).map((item) => <ModuleRow key={item.key} item={item} onPress={() => goTo(item.key)} />)}</View>}
  </Page>;
}

function QuickAction({ title, description, icon, color, soft, wide, onPress }: { title: string; description: string; icon: keyof typeof Ionicons.glyphMap; color: string; soft: string; wide: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [dashboardStyles.actionCard, { flexBasis: wide ? '22%' : '46%' }, pressed && dashboardStyles.actionPressed]}><View style={[dashboardStyles.actionIcon, { backgroundColor: soft }]}><Ionicons color={color} name={icon} size={21} /></View><Text style={dashboardStyles.actionTitle}>{title}</Text><Text style={dashboardStyles.actionDescription}>{description}</Text><Ionicons color="#95a099" name="arrow-forward-outline" size={16} style={dashboardStyles.actionArrow} /></Pressable>; }
function ModuleRow({ item, onPress }: { item: (typeof modules)[number]; onPress: () => void }) { return <Pressable onPress={onPress} style={s.moduleRow}><View style={s.moduleIcon}><Text style={s.moduleIconText}>{item.icon}</Text></View><View style={{ flex: 1 }}><Text style={s.moduleTitle}>{item.label}</Text><Text style={s.moduleDescription}>{item.description}</Text></View><Text style={s.chevron}>›</Text></Pressable>; }

function useMyRole(): string { const { session } = useSession(); return normalizeRole(session?.usuario.rol.toLowerCase() ?? 'dueno'); }
export function AnimalsScreen() { const role = useMyRole(); if (role === 'veterinario') return <HealthScreen />; return <AnimalsInventoryScreen />; }
export function TasksScreen() { const role = useMyRole(); if (role === 'veterinario') return <HealthScreen />; return <TasksManagerScreen />; }
export function HealthScreen() { const role = useMyRole(); if (role === 'veterinario') return <NursingScreen />; if (role === 'peon') return <FieldReportScreen />; if (role === 'administrador') return <DeathReviewScreen />; return <AnimalsInventoryScreen />; }

// registro reportes sanitarios y muertes desde el trabajo de campo.
function FieldReportScreen() {
  const { session } = useSession(); const [animalId, setAnimalId] = useState(''); const [reason, setReason] = useState(''); const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); const [kind, setKind] = useState<'sanitario'|'muerte'>('sanitario'); const [latitude, setLatitude] = useState(''); const [longitude, setLongitude] = useState(''); const [message, setMessage] = useState('');
  async function submit(): Promise<void> { const lat = latitude.trim() ? Number(latitude) : undefined; const lon = longitude.trim() ? Number(longitude) : undefined; if (!session || !Number(animalId) || !reason.trim()) { setMessage('Indicá el número del animal y el motivo.'); return; } if (kind === 'muerte' && ((lat === undefined) !== (lon === undefined) || (lat !== undefined && (!Number.isFinite(lat) || Math.abs(lat) > 90 || lon === undefined || !Number.isFinite(lon) || Math.abs(lon) > 180)))) { setMessage('Si informás ubicación, completá latitud y longitud GPS válidas.'); return; } try { await reportAnimal(session, kind, { id_animal: Number(animalId), fecha: date, motivo: reason.trim(), ...(kind === 'muerte' && lat !== undefined && lon !== undefined ? { latitud: lat, longitud: lon } : {}) }); setMessage(kind === 'muerte' ? 'Baja operativa registrada. Falta revisión administrativa.' : 'Reporte sanitario registrado; trasladá físicamente el animal a enfermería.'); setAnimalId(''); setReason(''); setLatitude(''); setLongitude(''); } catch (cause) { setMessage(cause instanceof Error ? cause.message : 'No se pudo guardar el reporte.'); } }
  return <Page><Header title="Reportes del campo" subtitle="ENFERMEDAD Y MUERTE" /><View style={s.requestCard}><Text style={s.sectionTitle}>Nuevo reporte</Text><View style={s.roleOptions}>{(['sanitario','muerte'] as const).map((value) => <Pressable key={value} onPress={() => setKind(value)} style={[s.roleOption, kind === value && s.roleOptionSelected]}><Text style={[s.roleOptionText, kind === value && s.roleOptionTextSelected]}>{value === 'muerte' ? 'Muerte' : 'Sanidad'}</Text></Pressable>)}</View><Text style={s.roleLabel}>ID DEL ANIMAL</Text><TextInput keyboardType="number-pad" onChangeText={setAnimalId} placeholder="Ej. 120" style={s.searchInput} value={animalId} /><Text style={s.roleLabel}>FECHA</Text><TextInput onChangeText={setDate} placeholder="AAAA-MM-DD" style={s.searchInput} value={date} /><Text style={s.roleLabel}>MOTIVO / OBSERVACIONES</Text><TextInput multiline onChangeText={setReason} placeholder="Describí lo que observaste" style={s.searchInput} value={reason} />{kind === 'muerte' ? <><Text style={s.roleLabel}>UBICACIÓN GPS (OPCIONAL)</Text><TextInput keyboardType="decimal-pad" onChangeText={setLatitude} placeholder="Latitud" style={s.searchInput} value={latitude} /><TextInput keyboardType="decimal-pad" onChangeText={setLongitude} placeholder="Longitud" style={s.searchInput} value={longitude} /></> : null}<Pressable onPress={() => void submit()} style={s.createButton}><Text style={s.createButtonText}>Guardar reporte</Text></Pressable>{message ? <Text style={s.requestNotice}>{message}</Text> : null}</View></Page>;
}

// permito al administrador confirmar o rechazar bajas pendientes.
function DeathReviewScreen() {
  const { session } = useSession(); const [rows, setRows] = useState<DeathReport[]>([]); const [message, setMessage] = useState('');
  async function load(): Promise<void> { if (!session) return; try { setRows(await listPendingDeaths(session)); } catch (cause) { setMessage(cause instanceof Error ? cause.message : 'No se pudieron cargar los reportes.'); } }
  useEffect(() => {
    if (!session) return;
    let active = true;
    listPendingDeaths(session).then((data) => { if (active) setRows(data); }).catch((cause: unknown) => { if (active) setMessage(cause instanceof Error ? cause.message : 'No se pudieron cargar los reportes.'); });
    return () => { active = false; };
  }, [session]);
  async function decide(row: DeathReport, decision: 'confirmar'|'rechazar'): Promise<void> { if (!session) return; try { await reviewDeath(session, row.id_reporte, decision, decision === 'rechazar' ? 'Reporte rechazado por el administrador' : undefined); setMessage(decision === 'confirmar' ? 'Muerte confirmada.' : 'Animal reactivado; reporte conservado.'); await load(); } catch (cause) { setMessage(cause instanceof Error ? cause.message : 'No se pudo revisar el reporte.'); } }
  return <Page><Header title="Revisión de muertes" subtitle="BAJAS PENDIENTES" />{message ? <Text style={s.requestNotice}>{message}</Text> : null}{rows.length ? rows.map((row) => <View key={row.id_reporte} style={s.requestCard}><Text style={s.requestName}>{row.nombre || row.identificador} · {row.corral}</Text><Text style={s.requestEmail}>{row.fecha} · {row.motivo}</Text><View style={s.requestActions}><Pressable onPress={() => void decide(row, 'rechazar')} style={s.rejectButton}><Text style={s.rejectText}>Rechazar y reactivar</Text></Pressable><Pressable onPress={() => void decide(row, 'confirmar')} style={s.approveButton}><Text style={s.approveText}>Confirmar muerte</Text></Pressable></View></View>) : <View style={s.emptyCard}><Text style={s.emptyTitle}>Sin reportes pendientes</Text><Text style={s.emptyCopy}>Las bajas operativas aparecen acá para su revisión.</Text></View>}</Page>;
}

export function MoreScreen() {
  const { session, setSession } = useSession();
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
  async function logout(): Promise<void> { await removeSession(); setSession(null); router.replace('/'); }
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
      const updated = { ...session, usuario }; await saveSession(updated); setSession(updated); setMessage('Perfil actualizado.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo actualizar el perfil.'); }
    finally { setBusy(false); }
  }
  async function savePassword(): Promise<void> {
    if (!session) return;
    if (!currentPassword) { setError('Ingresá tu contraseña actual.'); return; }
    if (newPassword.length < 10) { setError('La contraseña nueva debe tener al menos 10 caracteres.'); return; }
    if (newPassword !== confirmPassword) { setError('Las contraseñas nuevas no coinciden.'); return; }
    setBusy(true); setError(''); setMessage('');
    try { setMessage(await changeMyPassword(session, currentPassword, newPassword)); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo cambiar la contraseña.'); }
    finally { setBusy(false); }
  }
  return <Page><Header title="Mi perfil" subtitle="DATOS PERSONALES Y SESIÓN" />
    <View style={profileStyles.card}><View style={profileStyles.photoRow}>{photo ? <Image source={{ uri: photo }} style={profileStyles.photo} /> : <View style={profileStyles.photoFallback}><Text style={profileStyles.photoInitials}>{`${name[0] ?? 'E'}${surname[0] ?? ''}`.toUpperCase()}</Text></View>}<View style={{ flex: 1 }}><Text style={profileStyles.name}>{name || session?.usuario.nombre} {surname || session?.usuario.apellido}</Text><Text style={profileStyles.meta}>{roleLabel[role] ?? role} · {session?.usuario.email}</Text><View style={profileStyles.photoActions}><Pressable onPress={() => void pickPhoto()} style={profileStyles.smallButton}><Text style={profileStyles.smallButtonText}>Elegir foto</Text></Pressable>{photo ? <Pressable onPress={() => setPhoto(null)}><Text style={profileStyles.removePhoto}>Quitar</Text></Pressable> : null}</View></View></View>
      <Text style={profileStyles.label}>NOMBRE</Text><TextInput autoCapitalize="words" onChangeText={setName} style={profileStyles.input} value={name} />
      <Text style={profileStyles.label}>APELLIDO</Text><TextInput autoCapitalize="words" onChangeText={setSurname} style={profileStyles.input} value={surname} />
      <Pressable disabled={busy} onPress={() => void saveProfile()} style={[profileStyles.primary, busy && profileStyles.disabled]}><Text style={profileStyles.primaryText}>Guardar datos personales</Text></Pressable>
    </View>
    <View style={profileStyles.card}><Text style={profileStyles.sectionTitle}>Cambiar contraseña</Text><Text style={profileStyles.help}>Para proteger tu cuenta, primero ingresá tu contraseña actual.</Text>
      <Text style={profileStyles.label}>CONTRASEÑA ACTUAL</Text><TextInput autoCapitalize="none" onChangeText={setCurrentPassword} secureTextEntry style={profileStyles.input} value={currentPassword} />
      <Text style={profileStyles.label}>CONTRASEÑA NUEVA</Text><TextInput autoCapitalize="none" onChangeText={setNewPassword} placeholder="Al menos 10 caracteres" secureTextEntry style={profileStyles.input} value={newPassword} />
      <Text style={profileStyles.label}>REPETIR CONTRASEÑA</Text><TextInput autoCapitalize="none" onChangeText={setConfirmPassword} secureTextEntry style={profileStyles.input} value={confirmPassword} />
      <Pressable disabled={busy} onPress={() => void savePassword()} style={[profileStyles.primary, busy && profileStyles.disabled]}><Text style={profileStyles.primaryText}>Cambiar contraseña</Text></Pressable>
      <Pressable onPress={() => router.push({ pathname: '/recover', params: { email: session?.usuario.email ?? '' } })} style={profileStyles.recovery}><Text style={profileStyles.recoveryText}>¿No recordás tu contraseña? Usar código de recuperación</Text></Pressable>
    </View>
    {message ? <Text style={s.requestNotice}>{message}</Text> : null}{error ? <Text style={s.requestError}>{error}</Text> : null}
    <Pressable onPress={() => void logout()} style={s.logout}><Text style={s.logoutText}>Cerrar sesión</Text></Pressable><Text style={s.appVersion}>ESTANCIAAPP · GESTIÓN GANADERA</Text></Page>;
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
  if (item.key === 'avisos') return <NotificationsScreen />;
  if (item.key === 'reproduccion') return <ReproductionScreen />;
  if (item.key === 'eventos') return <EventsScreen />;
  if (item.key === 'mapa') return <MapAreasScreen />;
  return <Redirect href="/(app)" />;
}

export function TeamModuleScreen() { return useMyRole() === 'administrador' ? <AdminRequestsScreen /> : <TeamScreen />; }

// muestro solicitudes verificadas y permito al administrador asignar un rol antes de aprobar.
function AdminRequestsScreen() {
  const { session } = useSession();
  const token = session?.accessToken;
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Record<number, RequestedRole>>({});
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [decision, setDecision] = useState<{ request: RegistrationRequest; action: 'approve' | 'reject' } | null>(null);
  const [showTeam, setShowTeam] = useState(false);

  // cargo la cola de la organización cuando hay una sesión administrativa.
  useEffect(() => {
    let active = true;
    if (!token) return () => { active = false; };
    void listRegistrationRequests(token).then((items) => { if (active) setRequests(items); }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las solicitudes.');
    });
    return () => { active = false; };
  }, [token]);

  // ejecuto la aprobación o el rechazo después de confirmar la decisión en el modal.
  async function resolveRequest(): Promise<void> {
    if (!decision || !token) return;
    setBusyId(decision.request.id_solicitud); setError(''); setNotice('');
    try {
      if (decision.action === 'approve') await approveRegistrationRequest(token, decision.request.id_solicitud, selectedRoles[decision.request.id_solicitud] ?? 'peon');
      else await rejectRegistrationRequest(token, decision.request.id_solicitud);
      setRequests((current) => current.filter((request) => request.id_solicitud !== decision.request.id_solicitud));
      setNotice(decision.action === 'approve' ? 'Solicitud aprobada. Se envió el código de acceso al correo.' : 'Solicitud rechazada.');
      setDecision(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo resolver la solicitud.'); }
    finally { setBusyId(null); }
  }

  const roleOptions: { role: RequestedRole; label: string }[] = [{ role: 'dueno', label: 'Dueño' }, { role: 'peon', label: 'Peón' }, { role: 'veterinario', label: 'Veterinario' }];
  if (showTeam) return <View style={{ flex: 1 }}><Pressable onPress={() => setShowTeam(false)} style={{ alignSelf: 'flex-start', backgroundColor: c.pale, borderRadius: 9, margin: 12, padding: 10 }}><Text style={{ color: c.green, fontSize: 11, fontWeight: '700' }}>‹ Volver a solicitudes</Text></Pressable><TeamScreen /></View>;
  return <Page><Header title="Solicitudes" subtitle="ALTAS DE LA ORGANIZACIÓN" />
    <Pressable onPress={() => setShowTeam(true)} style={s.approveButton}><Text style={s.approveText}>Administrar usuarios</Text></Pressable>
    {notice ? <Text style={s.requestNotice}>{notice}</Text> : null}{error ? <Text style={s.requestError}>{error}</Text> : null}
    {requests.length ? requests.map((request) => <View key={request.id_solicitud} style={s.requestCard}>
      <Text style={s.requestName}>{request.nombre} {request.apellido}</Text><Text style={s.requestEmail}>{request.email}</Text>
      <Text style={s.roleLabel}>ASIGNAR ROL AL APROBAR</Text><View style={s.roleOptions}>{roleOptions.map((option) => <Pressable key={option.role} onPress={() => setSelectedRoles((current) => ({ ...current, [request.id_solicitud]: option.role }))} style={[s.roleOption, (selectedRoles[request.id_solicitud] ?? 'peon') === option.role && s.roleOptionSelected]}><Text style={[s.roleOptionText, (selectedRoles[request.id_solicitud] ?? 'peon') === option.role && s.roleOptionTextSelected]}>{option.label}</Text></Pressable>)}</View>
      <View style={s.requestActions}><Pressable disabled={busyId === request.id_solicitud} onPress={() => setDecision({ request, action: 'reject' })} style={s.rejectButton}><Text style={s.rejectText}>Rechazar</Text></Pressable><Pressable disabled={busyId === request.id_solicitud} onPress={() => setDecision({ request, action: 'approve' })} style={s.approveButton}><Text style={s.approveText}>{busyId === request.id_solicitud ? 'Procesando…' : 'Aprobar y enviar código'}</Text></Pressable></View>
    </View>) : <View style={s.emptyCard}><View style={s.emptyIcon}><Text style={s.emptyIconText}>♙</Text></View><Text style={s.emptyTitle}>No hay solicitudes pendientes</Text><Text style={s.emptyCopy}>Las solicitudes aparecen cuando la persona confirma su correo.</Text></View>}
    <Modal animationType="fade" onRequestClose={() => setDecision(null)} transparent visible={Boolean(decision)}><View style={s.modalBackdrop}><View style={s.modalCard}><Text style={s.modalTitle}>{decision?.action === 'approve' ? 'Aprobar solicitud' : 'Rechazar solicitud'}</Text><Text style={s.modalCopy}>{decision ? `${decision.request.nombre} ${decision.request.apellido} · ${decision.request.email}` : ''}{decision?.action === 'approve' ? `\nRol asignado: ${roleOptions.find((option) => option.role === (selectedRoles[decision.request.id_solicitud] ?? 'peon'))?.label}. Se enviará un código de acceso.` : '\nNo se creará una cuenta activa.'}</Text><View style={s.requestActions}><Pressable onPress={() => setDecision(null)} style={s.rejectButton}><Text style={s.rejectText}>Cancelar</Text></Pressable><Pressable onPress={() => void resolveRequest()} style={s.approveButton}><Text style={s.approveText}>Confirmar</Text></Pressable></View></View></View></Modal>
  </Page>;
}

const s = StyleSheet.create({ safe: { backgroundColor: c.canvas, flex: 1 }, page: { paddingBottom: 28, paddingHorizontal: 19, paddingTop: 10 }, header: { marginBottom: 18 }, brandLine: { alignItems: 'center', flexDirection: 'row', gap: 8, marginBottom: 17 }, brandBadge: { alignItems: 'center', backgroundColor: c.green, borderRadius: 8, height: 26, justifyContent: 'center', width: 26 }, brandBadgeText: { color: '#e2eccf', fontSize: 17 }, brand: { color: c.green, fontSize: 16, fontWeight: '800', letterSpacing: -0.5 }, brandSoft: { color: '#8b9983', fontWeight: '500' }, connection: { alignItems: 'center', backgroundColor: '#e9f2e9', borderRadius: 20, flexDirection: 'row', gap: 5, marginLeft: 'auto', paddingHorizontal: 9, paddingVertical: 5 }, connectionOff: { backgroundColor: '#fff1d5' }, connectionDot: { backgroundColor: '#47945c', borderRadius: 4, height: 6, width: 6 }, connectionDotOff: { backgroundColor: '#bb8730' }, connectionText: { color: c.green, fontSize: 9, fontWeight: '700' }, titleRow: { alignItems: 'center', flexDirection: 'row' }, pageTitle: { color: c.ink, fontSize: 24, fontWeight: '700', letterSpacing: -0.6 }, pageSubtitle: { color: c.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1, marginTop: 4 }, avatar: { alignItems: 'center', backgroundColor: '#e1e9dd', borderColor: '#fff', borderRadius: 22, borderWidth: 2, height: 42, justifyContent: 'center', width: 42 }, avatarText: { color: c.green, fontSize: 12, fontWeight: '800' }, welcome: { backgroundColor: c.greenDark, borderRadius: 17, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 19, overflow: 'hidden', padding: 17 }, welcomeEyebrow: { color: '#bbd0b2', fontSize: 9, fontWeight: '800', letterSpacing: 1.1 }, welcomeTitle: { color: c.white, fontSize: 20, fontWeight: '700', marginTop: 6 }, welcomeCopy: { color: '#d0ddd0', fontSize: 11, marginTop: 4 }, welcomeIcon: { color: '#f2cf7c', fontSize: 27, marginRight: 2, marginTop: 1 }, sectionHead: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 11, marginTop: 4 }, sectionTitle: { color: c.ink, fontSize: 15, fontWeight: '700', letterSpacing: -0.3 }, sectionCopy: { color: c.muted, fontSize: 10, marginTop: 3 }, dateChip: { backgroundColor: '#edf1e9', borderRadius: 7, color: c.green, fontSize: 8, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 5 }, metricGrid: { flexDirection: 'row', gap: 10, marginBottom: 13 }, metricCard: { backgroundColor: c.white, borderColor: c.line, borderRadius: 14, borderWidth: 1, flex: 1, minHeight: 106, padding: 13 }, metricTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, metricLabel: { color: '#667268', fontSize: 10, fontWeight: '600' }, metricIcon: { color: '#81967c', fontSize: 14 }, metricValue: { color: c.ink, fontSize: 26, fontWeight: '700', marginTop: 8 }, metricCaption: { color: '#9aa39a', fontSize: 9, marginTop: 1 }, note: { alignItems: 'flex-start', backgroundColor: '#edf3ea', borderColor: '#dce8d8', borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 9, marginBottom: 20, padding: 12 }, noteIcon: { alignItems: 'center', backgroundColor: '#dfeadb', borderRadius: 9, height: 28, justifyContent: 'center', width: 28 }, noteTitle: { color: c.green, fontSize: 11, fontWeight: '700' }, noteCopy: { color: '#627263', fontSize: 10, lineHeight: 15, marginTop: 2 }, quickGrid: { flexDirection: 'row', gap: 9, marginBottom: 20 }, quickCard: { backgroundColor: c.white, borderColor: c.line, borderRadius: 13, borderWidth: 1, flex: 1, minHeight: 83, padding: 11, position: 'relative' }, quickIcon: { alignItems: 'center', backgroundColor: c.pale, borderRadius: 9, height: 29, justifyContent: 'center', width: 29 }, quickIconText: { color: c.green, fontSize: 16 }, quickTitle: { color: c.ink, fontSize: 10, fontWeight: '700', marginTop: 8 }, quickArrow: { color: '#9aa59a', fontSize: 12, position: 'absolute', right: 10, top: 11 }, moduleList: { backgroundColor: c.white, borderColor: c.line, borderRadius: 14, borderWidth: 1, overflow: 'hidden' }, moduleRow: { alignItems: 'center', borderBottomColor: '#edf0eb', borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 11, minHeight: 63, paddingHorizontal: 12 }, moduleIcon: { alignItems: 'center', backgroundColor: '#f0f4ed', borderRadius: 10, height: 34, justifyContent: 'center', width: 34 }, moduleIconText: { color: c.green, fontSize: 16 }, moduleTitle: { color: c.ink, fontSize: 12, fontWeight: '700' }, moduleDescription: { color: c.muted, fontSize: 10, marginTop: 3 }, chevron: { color: '#98a29a', fontSize: 24 }, collectionTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 13 }, countPill: { alignItems: 'baseline', flexDirection: 'row' }, count: { color: c.ink, fontSize: 21, fontWeight: '700' }, countLabel: { color: c.muted, fontSize: 11 }, createButton: { backgroundColor: c.green, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }, createButtonText: { color: c.white, fontSize: 10, fontWeight: '700' }, search: { alignItems: 'center', backgroundColor: c.white, borderColor: c.line, borderRadius: 11, borderWidth: 1, flexDirection: 'row', height: 44, paddingHorizontal: 11 }, searchIcon: { color: '#87938a', fontSize: 20 }, searchInput: { color: c.ink, flex: 1, fontSize: 12, paddingHorizontal: 8 }, filterRow: { flexDirection: 'row', gap: 7, marginBottom: 16, marginTop: 10 }, filterChip: { backgroundColor: '#edf1e9', borderRadius: 20, paddingHorizontal: 11, paddingVertical: 7 }, filterText: { color: '#5f6e60', fontSize: 10, fontWeight: '600' }, emptyCard: { alignItems: 'center', backgroundColor: c.white, borderColor: c.line, borderRadius: 16, borderWidth: 1, marginTop: 2, paddingHorizontal: 24, paddingVertical: 29 }, emptyIcon: { alignItems: 'center', backgroundColor: c.pale, borderRadius: 24, height: 48, justifyContent: 'center', width: 48 }, emptyIconText: { color: c.green, fontSize: 23 }, emptyTitle: { color: c.ink, fontSize: 15, fontWeight: '700', marginTop: 13, textAlign: 'center' }, emptyCopy: { color: c.muted, fontSize: 11, lineHeight: 17, marginTop: 7, textAlign: 'center' }, emptyFoot: { color: '#a0a9a0', fontSize: 9, marginTop: 12, textAlign: 'center' }, profileCard: { alignItems: 'center', backgroundColor: c.white, borderColor: c.line, borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 10, marginTop: 18, padding: 12 }, logout: { alignItems: 'center', borderColor: '#e7d9d7', borderRadius: 11, borderWidth: 1, height: 44, justifyContent: 'center', marginTop: 12 }, logoutText: { color: '#9b4943', fontSize: 12, fontWeight: '700' }, appVersion: { color: '#a1aaa1', fontSize: 8, fontWeight: '700', letterSpacing: 1.5, marginTop: 18, textAlign: 'center' }, requestCard: { backgroundColor: c.white, borderColor: c.line, borderRadius: 14, borderWidth: 1, marginBottom: 12, padding: 15 }, requestName: { color: c.ink, fontSize: 14, fontWeight: '700' }, requestEmail: { color: c.muted, fontSize: 11, marginTop: 4 }, roleLabel: { color: c.muted, fontSize: 8, fontWeight: '800', letterSpacing: 1, marginTop: 16 }, roleOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 8 }, roleOption: { backgroundColor: '#eef1eb', borderRadius: 20, paddingHorizontal: 11, paddingVertical: 8 }, roleOptionSelected: { backgroundColor: c.green }, roleOptionText: { color: '#526054', fontSize: 10, fontWeight: '600' }, roleOptionTextSelected: { color: c.white }, requestActions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end', marginTop: 13 }, approveButton: { alignItems: 'center', backgroundColor: c.green, borderRadius: 9, justifyContent: 'center', minHeight: 38, paddingHorizontal: 13 }, approveText: { color: c.white, fontSize: 10, fontWeight: '700' }, rejectButton: { alignItems: 'center', borderColor: '#e6ceca', borderRadius: 9, borderWidth: 1, justifyContent: 'center', minHeight: 38, paddingHorizontal: 13 }, rejectText: { color: '#9b4943', fontSize: 10, fontWeight: '700' }, requestNotice: { backgroundColor: '#e8efe5', borderRadius: 10, color: c.green, fontSize: 11, marginBottom: 12, padding: 12 }, requestError: { backgroundColor: '#fff0ed', borderRadius: 10, color: '#9b3d36', fontSize: 11, marginBottom: 12, padding: 12 }, modalBackdrop: { alignItems: 'center', backgroundColor: 'rgba(19,31,22,0.48)', flex: 1, justifyContent: 'center', padding: 22 }, modalCard: { backgroundColor: c.white, borderRadius: 18, padding: 20, width: '100%' }, modalTitle: { color: c.ink, fontSize: 17, fontWeight: '700' }, modalCopy: { color: c.muted, fontSize: 12, lineHeight: 18, marginTop: 9 },
});

const chartStyles = StyleSheet.create({ card: { backgroundColor: c.white, borderColor: c.line, borderRadius: 14, borderWidth: 1, marginBottom: 16, padding: 14 }, row: { marginTop: 13 }, labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }, label: { color: c.muted, fontSize: 10, fontWeight: '600' }, value: { color: c.ink, fontSize: 10, fontWeight: '800' }, track: { backgroundColor: '#edf1eb', borderRadius: 5, height: 9, overflow: 'hidden' }, bar: { borderRadius: 5, height: 9 } });

const dashboardStyles = StyleSheet.create({
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 18 },
  metricCard: { alignItems: 'flex-start', backgroundColor: c.white, borderColor: c.line, borderRadius: 16, borderWidth: 1, flexDirection: 'row', flexGrow: 1, gap: 12, minHeight: 112, padding: 15, shadowColor: '#17281c', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, shadowRadius: 9 },
  metricIcon: { alignItems: 'center', borderRadius: 12, height: 43, justifyContent: 'center', width: 43 },
  metricBody: { flex: 1 },
  metricLabel: { color: c.muted, fontSize: 10, fontWeight: '600' },
  metricValue: { color: c.ink, fontSize: 25, fontWeight: '800', lineHeight: 30, marginTop: 3 },
  metricCaption: { color: '#929b94', fontSize: 9, lineHeight: 13, marginTop: 1 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  actionCard: { backgroundColor: c.white, borderColor: c.line, borderRadius: 16, borderWidth: 1, flexGrow: 1, minHeight: 145, padding: 16, position: 'relative', shadowColor: '#17281c', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, shadowRadius: 9 },
  actionPressed: { borderColor: '#8eaa92', opacity: 0.82, transform: [{ translateY: 1 }] },
  actionIcon: { alignItems: 'center', borderRadius: 12, height: 42, justifyContent: 'center', marginBottom: 13, width: 42 },
  actionTitle: { color: c.ink, fontSize: 13, fontWeight: '800', paddingRight: 22 },
  actionDescription: { color: c.muted, fontSize: 10, lineHeight: 15, marginTop: 5, paddingRight: 14 },
  actionArrow: { position: 'absolute', right: 15, top: 17 },
});

const profileStyles = StyleSheet.create({ card: { backgroundColor: c.white, borderColor: c.line, borderRadius: 16, borderWidth: 1, marginBottom: 15, padding: 16 }, photoRow: { alignItems: 'center', flexDirection: 'row', gap: 14, marginBottom: 8 }, photo: { borderRadius: 38, height: 76, width: 76 }, photoFallback: { alignItems: 'center', backgroundColor: c.pale, borderRadius: 38, height: 76, justifyContent: 'center', width: 76 }, photoInitials: { color: c.green, fontSize: 20, fontWeight: '900' }, name: { color: c.ink, fontSize: 16, fontWeight: '800' }, meta: { color: c.muted, fontSize: 10, marginTop: 3 }, photoActions: { alignItems: 'center', flexDirection: 'row', gap: 13, marginTop: 9 }, smallButton: { backgroundColor: c.pale, borderRadius: 8, paddingHorizontal: 11, paddingVertical: 8 }, smallButtonText: { color: c.green, fontSize: 10, fontWeight: '800' }, removePhoto: { color: c.red, fontSize: 10, fontWeight: '700' }, label: { color: c.muted, fontSize: 8, fontWeight: '800', letterSpacing: 1, marginBottom: 6, marginTop: 14 }, input: { backgroundColor: '#fafbf9', borderColor: c.line, borderRadius: 10, borderWidth: 1, color: c.ink, fontSize: 13, height: 46, paddingHorizontal: 12 }, primary: { alignItems: 'center', backgroundColor: c.green, borderRadius: 10, height: 44, justifyContent: 'center', marginTop: 16 }, primaryText: { color: c.white, fontSize: 11, fontWeight: '800' }, disabled: { opacity: 0.65 }, sectionTitle: { color: c.ink, fontSize: 15, fontWeight: '800' }, help: { color: c.muted, fontSize: 10, lineHeight: 15, marginTop: 4 }, recovery: { alignItems: 'center', paddingHorizontal: 8, paddingTop: 15 }, recoveryText: { color: c.green, fontSize: 10, fontWeight: '800', textAlign: 'center' } });
