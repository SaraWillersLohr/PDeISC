// presento los resúmenes y accesos principales según el perfil activo.
import NetInfo from '@react-native-community/netinfo';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../../context/SessionContext';
import { removeSession } from '../../services/sessionStorage';
import { approveRegistrationRequest, listRegistrationRequests, rejectRegistrationRequest, type RegistrationRequest, type RequestedRole } from '../../services/adminApi';
import { CorralsInventoryScreen, NotificationsScreen, NursingScreen } from './LivestockScreens';
import { BrandWordmark } from '../BrandWordmark';

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
  const role = normalizeRole(session?.usuario.rol.toLowerCase() ?? 'dueno');
  const name = session?.usuario.nombre?.trim() || 'equipo';
  const isVet = role === 'veterinario';
  const isField = role === 'peon';
  const roleModules = modules.filter((item) => item.roles.includes(role));
  const shortcuts = isField ? ['tareas', 'animales', 'corrales'] : ['animales', 'corrales', 'equipo'];
  if (isVet) return <HealthScreen />;
  const dashboardTitle = isVet ? 'Panel sanitario' : isField ? 'Tu jornada' : 'Resumen de estancia';
  const dashboardCopy = isVet ? 'Controles y seguimiento de animales.' : isField ? 'Lo importante para el trabajo de hoy.' : 'Una mirada rápida a la actividad del campo.';
  const today = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  return <Page><Header title="Inicio" subtitle={`GESTIÓN DE ESTANCIA · ${today}`} />
    <View style={s.welcome}><View><Text style={s.welcomeEyebrow}>{roleLabel[role] ?? 'Equipo de estancia'}</Text><Text style={s.welcomeTitle}>Buen día, {name}</Text><Text style={s.welcomeCopy}>{dashboardCopy}</Text></View><Text style={s.welcomeIcon}>☀</Text></View>
    <View style={s.sectionHead}><View><Text style={s.sectionTitle}>{dashboardTitle}</Text><Text style={s.sectionCopy}>Estado actual de la estancia</Text></View><Text style={s.dateChip}>HOY</Text></View>
    <View style={s.metricGrid}><Metric label={isField ? 'Mis tareas' : role === 'administrador' ? 'Solicitudes' : 'Animales'} value="—" caption="Se conecta al backend" icon={isField ? '✓' : role === 'administrador' ? '♙' : '◉'} /><Metric label={isField ? 'Pendientes' : role === 'administrador' ? 'Usuarios' : 'Efectividad de cría'} value="—" caption="Se conecta al backend" icon={isField ? '↻' : role === 'administrador' ? '♙' : '⌁'} /></View>
    <View style={s.note}><View style={s.noteIcon}><Text style={{ color: c.green, fontSize: 15 }}>↻</Text></View><View style={{ flex: 1 }}><Text style={s.noteTitle}>Preparando tus datos</Text><Text style={s.noteCopy}>El acceso ya está conectado. Estamos sumando los datos de animales, corrales y tareas.</Text></View></View>
    <View style={s.sectionHead}><View><Text style={s.sectionTitle}>Accesos rápidos</Text><Text style={s.sectionCopy}>Entrá a lo que necesitás</Text></View></View>
    <View style={s.quickGrid}>{shortcuts.map((key) => { const item = modules.find((module) => module.key === key); if (!item) return null; return <Pressable key={key} onPress={() => goTo(item.key)} style={s.quickCard}><View style={s.quickIcon}><Text style={s.quickIconText}>{item.icon}</Text></View><Text style={s.quickTitle}>{item.label}</Text><Text style={s.quickArrow}>↗</Text></Pressable>; })}</View>
    <View style={s.sectionHead}><View><Text style={s.sectionTitle}>Tus secciones</Text><Text style={s.sectionCopy}>Según tu perfil de acceso</Text></View></View>
    <View style={s.moduleList}>{roleModules.slice(0, 4).map((item) => <ModuleRow key={item.key} item={item} onPress={() => goTo(item.key)} />)}</View>
  </Page>;
}

function Metric({ label, value, caption, icon }: { label: string; value: string; caption: string; icon: string }) { return <View style={s.metricCard}><View style={s.metricTop}><Text style={s.metricLabel}>{label}</Text><Text style={s.metricIcon}>{icon}</Text></View><Text style={s.metricValue}>{value}</Text><Text style={s.metricCaption}>{caption}</Text></View>; }
function ModuleRow({ item, onPress }: { item: (typeof modules)[number]; onPress: () => void }) { return <Pressable onPress={onPress} style={s.moduleRow}><View style={s.moduleIcon}><Text style={s.moduleIconText}>{item.icon}</Text></View><View style={{ flex: 1 }}><Text style={s.moduleTitle}>{item.label}</Text><Text style={s.moduleDescription}>{item.description}</Text></View><Text style={s.chevron}>›</Text></Pressable>; }

function useMyRole(): string { const { session } = useSession(); return normalizeRole(session?.usuario.rol.toLowerCase() ?? 'dueno'); }
export function AnimalsScreen() { const role = useMyRole(); if (role === 'veterinario') return <HealthScreen />; const text = role === 'dueno' ? 'Consultá y editá las fichas. La ubicación operativa muestra el corral o potrero del último movimiento; el GPS individual se guarda solo al reportar una muerte.' : role === 'peon' ? 'Buscá por identificador, raza o corral y editá la ficha. La ubicación operativa refleja el último movimiento; el GPS individual se registra solo para ubicar una muerte.' : 'Administrá las fichas y el ciclo completo de los animales de la organización.'; const action = role === 'dueno' ? 'Editar ficha' : role === 'peon' ? 'Editar animal' : 'Gestionar animales'; return <CollectionScreen title="Animales" subtitle="Inventario y fichas de la estancia" icon="◉" text={text} action={action} />; }
export function TasksScreen() { const role = useMyRole(); if (role === 'veterinario') return <HealthScreen />; return <CollectionScreen title="Tareas" subtitle="Organización del trabajo diario" icon="✓" text="Acá vas a encontrar las tareas asignadas, sus fechas, responsables y el estado de sincronización." action={role === 'dueno' ? 'Consultar actividad' : 'Crear tarea'} />; }
export function HealthScreen() { const role = useMyRole(); if (role === 'veterinario') return <NursingScreen />; const fieldWorker = role === 'peon'; const admin = role === 'administrador'; return <CollectionScreen title={fieldWorker ? 'Reportes del campo' : admin ? 'Sanidad y revisiones' : 'Sanidad'} subtitle={fieldWorker ? 'Enfermedades, nacimientos y muertes' : admin ? 'Reportes y revisión de bajas' : 'Enfermería, tratamientos y controles'} icon="✚" text={fieldWorker ? 'Informá enfermedad, nacimiento o muerte con fecha y corral. En una muerte podés guardar un punto GPS para ubicar el hallazgo. Para un nacimiento, indicá madre y padre; si no están registrados, escribí sus nombres. La muerte da de baja al animal de inmediato y queda pendiente de revisión.' : admin ? 'Revisá reportes de muerte. Al confirmar, el animal queda dado de baja; al rechazar, se reactiva y el reporte permanece en el historial.' : 'Consultá reportes y animales alojados en enfermería; registrá controles, tratamientos y altas.'} action={fieldWorker ? 'Nuevo reporte' : admin ? 'Revisar reportes' : 'Nuevo control'} />; }

function CollectionScreen({ title, subtitle, icon, text, action }: { title: string; subtitle: string; icon: string; text: string; action: string }) {
  const [query, setQuery] = useState('');
  return <Page><Header title={title} subtitle={subtitle.toUpperCase()} /><View style={s.collectionTop}><View style={s.countPill}><Text style={s.count}>—</Text><Text style={s.countLabel}> registros</Text></View><Pressable style={s.createButton}><Text style={s.createButtonText}>＋ {action}</Text></Pressable></View><View style={s.search}><Text style={s.searchIcon}>⌕</Text><TextInput onChangeText={setQuery} placeholder={`Buscar ${title.toLowerCase()}...`} placeholderTextColor="#929b93" style={s.searchInput} value={query} /></View><View style={s.filterRow}><Pressable style={s.filterChip}><Text style={s.filterText}>Todos⌄</Text></Pressable><Pressable style={s.filterChip}><Text style={s.filterText}>Estado⌄</Text></Pressable><Pressable style={s.filterChip}><Text style={s.filterText}>Filtros +</Text></Pressable></View><View style={s.emptyCard}><View style={s.emptyIcon}><Text style={s.emptyIconText}>{icon}</Text></View><Text style={s.emptyTitle}>{query ? 'Sin resultados todavía' : `Todavía no hay ${title.toLowerCase()}`}</Text><Text style={s.emptyCopy}>{text}</Text><Text style={s.emptyFoot}>La conexión con la API de gestión sigue pendiente.</Text></View></Page>;
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
  if (!item) return <CollectionScreen title="Sección no disponible" subtitle="Acceso por perfil" icon="⌑" text="Este módulo no está habilitado para tu perfil." action="Volver" />;
  if (role === 'administrador' && item.key === 'equipo') return <AdminRequestsScreen />;
  if (item.key === 'corrales') return <CorralsInventoryScreen />;
  if (item.key === 'avisos') return <NotificationsScreen />;
  const ownerReadOnly = role === 'dueno' && !['animales', 'mapa'].includes(item.key);
  const fieldAction: Record<string, string> = { corrales: 'Registrar movimiento', catalogo: 'Solicitar especie o raza', reproduccion: 'Registrar servicio de monta', mapa: 'Consultar mapa' };
  const ownerAction: Record<string, string> = { corrales: 'Editar corrales y capacidad', mapa: 'Editar mapa del campo' };
  const action = ownerReadOnly ? `Consultar ${item.label.toLowerCase()}` : role === 'dueno' ? item.key === 'animales' ? 'Editar animales' : ownerAction[item.key] ?? `Gestionar ${item.label.toLowerCase()}` : role === 'peon' ? fieldAction[item.key] ?? `Registrar ${item.label.toLowerCase()}` : role === 'administrador' && item.key === 'catalogo' ? 'Revisar solicitudes' : item.key === 'equipo' ? 'Revisar solicitudes' : item.key === 'eventos' ? 'Configurar fuentes' : `Gestionar ${item.label.toLowerCase()}`;
  const copy = role === 'dueno' && item.key === 'animales' ? 'Consultá y editá fichas; los cambios quedan registrados en el historial.' : role === 'dueno' && item.key === 'mapa' ? 'Consultá y actualizá las áreas del campo. Los puntos GPS guardados definen el perímetro de cada corral.' : ownerReadOnly ? `Consultá ${item.label.toLowerCase()} y los resultados de la organización.` : role === 'peon' && item.key === 'catalogo' ? 'Solicitá nuevas especies o razas. El administrador las revisa antes de que se puedan usar.' : role === 'peon' && item.key === 'mapa' ? 'Consultá los corrales y potreros guardados en el mapa. Para ubicar una muerte se puede registrar un punto GPS puntual.' : role === 'administrador' && item.key === 'eventos' ? 'Configurá las fuentes oficiales; los eventos importados son de consulta.' : role === 'peon' ? 'Registrá operaciones del campo; cada cambio guarda quién lo hizo, cuándo y dónde.' : `Gestioná ${item.label.toLowerCase()} dentro de la organización.`;
  return <CollectionScreen title={item.label} subtitle={item.description} icon={item.icon} text={copy} action={action} />;
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
  return <Page><Header title="Solicitudes" subtitle="ALTAS DE LA ORGANIZACIÓN" />
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
