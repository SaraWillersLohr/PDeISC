// presento los resúmenes y accesos principales según el perfil activo.
import NetInfo from '@react-native-community/netinfo';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../../context/SessionContext';
import { removeSession } from '../../services/sessionStorage';
import { approveRegistrationRequest, listRegistrationRequests, rejectRegistrationRequest, type RegistrationRequest, type RequestedRole } from '../../services/adminApi';
import { AnimalsInventoryScreen, CorralsInventoryScreen, NotificationsScreen, NursingScreen } from './LivestockScreens';
import { BrandWordmark } from '../BrandWordmark';
import { EventsScreen, MapAreasScreen, ReproductionScreen, TasksManagerScreen } from './FieldModuleScreens';
import { CatalogScreen, TeamScreen } from './OrganizationScreens';
import { getDashboard, listPendingDeaths, reportAnimal, reviewDeath, type DashboardMetrics, type DeathReport } from '../../services/productionApi';

const c = { green: '#214d35', greenDark: '#173d2a', ink: '#202c23', muted: '#748076', line: '#e5eae3', canvas: '#f4f6f1', white: '#fff', pale: '#e8efe5', gold: '#c29343' };
type ModuleKey = 'inicio' | 'animales' | 'corrales' | 'tareas' | 'sanidad' | 'reproduccion' | 'mapa' | 'eventos' | 'avisos' | 'equipo' | 'catalogo' | 'perfil';
const modules: { key: ModuleKey; label: string; icon: string; description: string; roles: string[] }[] = [
  { key: 'animales', label: 'Animales', icon: '◉', description: 'Fichas, pesajes, movimientos e historial', roles: ['administrador', 'dueno', 'peon'] },
  { key: 'corrales', label: 'Corrales', icon: '▦', description: 'Ocupación, capacidad y traslados', roles: ['administrador', 'dueno', 'peon'] },
  { key: 'tareas', label: 'Tareas', icon: '✓', description: 'Pendientes y trabajo del equipo', roles: ['administrador', 'peon'] },
  { key: 'sanidad', label: 'Corral de enfermería', icon: '✚', description: 'Animales enfermos, controles y tratamientos', roles: ['administrador', 'peon', 'veterinario'] },
  { key: 'reproduccion', label: 'Reproducción', icon: '⌁', description: 'Servicios, diagnósticos y nacimientos', roles: ['administrador', 'dueno', 'peon'] },
  { key: 'mapa', label: 'Mapa del campo', icon: '⌖', description: 'Potreros y corrales sobre el terreno', roles: ['administrador', 'dueno', 'peon'] },
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
  if (key === 'sanidad') { router.navigate('/(app)/health'); return; }
  router.push({ pathname: '/(app)/[module]', params: { module: key } });
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  const { session } = useSession();
  const [online, setOnline] = useState(true);
  useEffect(() => { const unsubscribe = NetInfo.addEventListener((state) => setOnline(Boolean(state.isConnected))); return unsubscribe; }, []);
  const initials = `${session?.usuario.nombre?.[0] ?? 'E'}${session?.usuario.apellido?.[0] ?? ''}`.toUpperCase();
  return <View style={s.header}>
    <View style={s.brandLine}><BrandWordmark /><View style={[s.connection, !online && s.connectionOff]}><View style={[s.connectionDot, !online && s.connectionDotOff]} /><Text style={s.connectionText}>{online ? 'En línea' : 'Sin señal'}</Text></View></View>
    <View style={s.titleRow}><View style={{ flex: 1 }}><Text style={s.pageTitle}>{title}</Text><Text style={s.pageSubtitle}>{subtitle}</Text></View><View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View></View>
  </View>;
}

function Page({ children }: { children: React.ReactNode }) { return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>{children}</ScrollView></SafeAreaView>; }

export function HomeScreen() {
  const { session } = useSession();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [metricsError, setMetricsError] = useState('');
  const role = normalizeRole(session?.usuario.rol.toLowerCase() ?? 'dueno');
  const name = session?.usuario.nombre?.trim() || 'equipo';
  const isVet = role === 'veterinario';
  const isField = role === 'peon';
  const roleModules = modules.filter((item) => item.roles.includes(role));
  const shortcuts = isField ? ['tareas', 'animales', 'corrales'] : ['animales', 'corrales', 'equipo'];
  const dashboardTitle = isVet ? 'Panel sanitario' : isField ? 'Tu jornada' : 'Resumen de estancia';
  const dashboardCopy = isVet ? 'Controles y seguimiento de animales.' : isField ? 'Lo importante para el trabajo de hoy.' : 'Una mirada rápida a la actividad del campo.';
  const today = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  useEffect(() => {
    if (!session || isField || isVet) return;
    let active = true;
    getDashboard(session).then((data) => { if (active) setMetrics(data); }).catch((cause: unknown) => { if (active) setMetricsError(cause instanceof Error ? cause.message : 'No se pudieron cargar las métricas.'); });
    return () => { active = false; };
  }, [session, isField, isVet]);
  if (isVet) return <HealthScreen />;
  return <Page><Header title="Inicio" subtitle={`GESTIÓN DE ESTANCIA · ${today}`} />
    <View style={s.welcome}><View><Text style={s.welcomeEyebrow}>{roleLabel[role] ?? 'Equipo de estancia'}</Text><Text style={s.welcomeTitle}>Buen día, {name}</Text><Text style={s.welcomeCopy}>{dashboardCopy}</Text></View><Text style={s.welcomeIcon}>☀</Text></View>
    <View style={s.sectionHead}><View><Text style={s.sectionTitle}>{dashboardTitle}</Text><Text style={s.sectionCopy}>Estado actual de la estancia</Text></View><Text style={s.dateChip}>HOY</Text></View>
    <View style={s.metricGrid}><Metric label="Crías este año" value={metrics ? String(metrics.crias_ano) : '—'} caption="Nacimientos registrados" icon="◉" /><Metric label="Hembras preñadas" value={metrics ? String(metrics.hembras_prenadas) : '—'} caption="Inventario activo" icon="⌁" /></View>
    <View style={s.metricGrid}><Metric label="Servicios · 90 días" value={metrics ? String(metrics.servicios_90_dias) : '—'} caption="Monta realizada" icon="↻" /><Metric label={role === 'administrador' ? 'Muertes pendientes' : 'Alertas sanitarias'} value={metrics ? String(role === 'administrador' ? metrics.muertes_pendientes : metrics.alertas_sanitarias) : '—'} caption={role === 'administrador' ? 'Requieren revisión' : 'Animales activos'} icon="✚" /></View>
    {metricsError ? <Text style={s.requestError}>{metricsError}</Text> : null}
    <View style={s.sectionHead}><View><Text style={s.sectionTitle}>Accesos rápidos</Text><Text style={s.sectionCopy}>Entrá a lo que necesitás</Text></View></View>
    <View style={s.quickGrid}>{shortcuts.map((key) => { const item = modules.find((module) => module.key === key); if (!item) return null; return <Pressable key={key} onPress={() => goTo(item.key)} style={s.quickCard}><View style={s.quickIcon}><Text style={s.quickIconText}>{item.icon}</Text></View><Text style={s.quickTitle}>{item.label}</Text><Text style={s.quickArrow}>↗</Text></Pressable>; })}</View>
    <View style={s.sectionHead}><View><Text style={s.sectionTitle}>Tus secciones</Text><Text style={s.sectionCopy}>Según tu perfil de acceso</Text></View></View>
    <View style={s.moduleList}>{roleModules.slice(0, 4).map((item) => <ModuleRow key={item.key} item={item} onPress={() => goTo(item.key)} />)}</View>
  </Page>;
}

function Metric({ label, value, caption, icon }: { label: string; value: string; caption: string; icon: string }) { return <View style={s.metricCard}><View style={s.metricTop}><Text style={s.metricLabel}>{label}</Text><Text style={s.metricIcon}>{icon}</Text></View><Text style={s.metricValue}>{value}</Text><Text style={s.metricCaption}>{caption}</Text></View>; }
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
  const visibleModules = useMemo(() => modules.filter((item) => item.roles.includes(role) && (role !== 'veterinario' || item.key === 'perfil')), [role]);
  async function logout(): Promise<void> { await removeSession(); setSession(null); router.replace('/'); }
  return <Page><Header title="Más secciones" subtitle="MÓDULOS DE LA ESTANCIA" /><View style={s.moduleList}>{visibleModules.map((item) => <ModuleRow key={item.key} item={item} onPress={() => goTo(item.key)} />)}</View><View style={s.profileCard}><View style={s.avatar}><Text style={s.avatarText}>{`${session?.usuario.nombre?.[0] ?? 'E'}${session?.usuario.apellido?.[0] ?? ''}`.toUpperCase()}</Text></View><View style={{ flex: 1 }}><Text style={s.moduleTitle}>{session?.usuario.nombre} {session?.usuario.apellido}</Text><Text style={s.moduleDescription}>{roleLabel[role] ?? role} · {session?.usuario.email}</Text></View></View><Pressable onPress={() => void logout()} style={s.logout}><Text style={s.logoutText}>Cerrar sesión</Text></Pressable><Text style={s.appVersion}>ESTANCIAAPP · GESTIÓN GANADERA</Text></Page>;
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
