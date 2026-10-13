// Archivo src/screens/HomeScreen.tsx: el panel principal, las secciones por rol y sus acciones. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiRequest } from '../services/api';
import type { Animal, Corral, DashboardSummary, Notification, PublicUser, Role } from '../types/domain';
import { useFeedback } from '../components/FeedbackProvider';
import { AnimalsManagementScreen, CorralsManagementScreen, FarmDashboardScreen, FieldOperationsScreen, VeterinaryOperationsScreen } from './FarmOperationScreens';

// Contrato de datos Section: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
type Section = 'inicio' | 'animales' | 'corrales' | 'equipo' | 'solicitudes' | 'campo' | 'veterinaria' | 'avisos';
// Contrato de datos HomeScreenProps: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
interface HomeScreenProps { user: PublicUser; token: string; onLogout: () => void; }
// Contrato de datos EquipoItem: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
interface EquipoItem { id_usuario: number; nombre: string; apellido: string; email: string; rol: Role; rolLabel: string; activo: boolean; }
// Contrato de datos SignupRequest: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
interface SignupRequest { id_solicitud: number; nombre: string; apellido: string; email: string; created_at: string; }
const NAV: { id: Section; title: string; roles: PublicUser['rol'][] }[] = [
  { id: 'inicio', title: 'Inicio', roles: ['dueno', 'copropietario'] },
  { id: 'animales', title: 'Animales', roles: ['dueno', 'copropietario', 'peon', 'veterinario'] },
  { id: 'corrales', title: 'Corrales', roles: ['dueno', 'copropietario'] },
  { id: 'equipo', title: 'Usuarios', roles: ['administrador'] },
  { id: 'solicitudes', title: 'Solicitudes', roles: ['administrador'] },
  { id: 'campo', title: 'Campo', roles: ['peon', 'dueno', 'copropietario'] },
  { id: 'veterinaria', title: 'Veterinaria', roles: ['veterinario', 'dueno', 'copropietario'] },
  { id: 'avisos', title: 'Avisos', roles: ['administrador', 'dueno', 'copropietario', 'peon', 'veterinario', 'empleado'] },
];
// Esta función renderiza el bloque de interfaz HomeScreen dentro de la pantalla y conecta sus props con las acciones disponibles. Recibe user, token, onLogout como entrada.
export function HomeScreen({ user, token, onLogout }: HomeScreenProps) {
  const { width } = useWindowDimensions();
  const wide = width >= 980;
  const { showMessage, confirm, choose } = useFeedback();
  const gutter = Math.max(14, Math.min(32, width * 0.05));
  const [section, setSection] = useState<Section>(user.rol === 'peon' ? 'campo' : user.rol === 'veterinario' ? 'veterinaria' : user.rol === 'empleado' || user.rol === 'administrador' ? 'avisos' : 'inicio');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [corrals, setCorrals] = useState<Corral[]>([]);
  const [team, setTeam] = useState<EquipoItem[]>([]);
  const [requests, setRequests] = useState<SignupRequest[]>([]);
  const [alerts, setAlerts] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [animalAction, setAnimalAction] = useState<{ animal: Animal; kind: 'report' | 'discharge' } | null>(null);
  const [actionText, setActionText] = useState('');
  const [actionBusy, setActionBusy] = useState(false);

  const loadSection = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    try {
      if (section === 'equipo') setTeam(await apiRequest<EquipoItem[]>('/usuarios', token));
      else if (section === 'solicitudes') setRequests(await apiRequest<SignupRequest[]>('/usuarios/solicitudes', token));
      else if (section === 'avisos') setAlerts(await apiRequest<Notification[]>('/notificaciones', token));
    } catch (cause) {
      showMessage('No se pudo actualizar', cause instanceof Error ? cause.message : 'Error de conexión.', 'error');
    } finally { setLoading(false); setRefreshing(false); }
  }, [section, token, showMessage]);

  useEffect(() => { void loadSection(); }, [loadSection]);
  // La campanita usa la misma respuesta filtrada por destinatario que la pantalla Avisos.
  useEffect(() => {
    let mounted = true;
    // Esta función vuelve a consultar los avisos dirigidos al usuario actual y actualiza el contador de la campanita.
    const refreshNotifications = async () => {
      try {
        const data = await apiRequest<Notification[]>('/notificaciones', token);
        if (mounted) setAlerts(data);
      } catch {
        // El contenido se vuelve a intentar cuando la persona abre la sección Avisos.
      }
    };
    void refreshNotifications();
    const timer = setInterval(() => void refreshNotifications(), 30_000);
    return () => { mounted = false; clearInterval(timer); };
  }, [token]);
  const navItems = NAV.filter((item) => item.roles.includes(user.rol));
  // Esta función valida los datos ingresados para la acción veterinaria o de campo, envía la operación a la API y actualiza la lista si se completa.
  const submitAnimalAction = async () => {
    if (!animalAction || actionBusy) return;
    if (animalAction.kind === 'report' && !actionText.trim()) { showMessage('Faltan síntomas', 'Describí los síntomas observados.', 'error'); return; }
    setActionBusy(true);
    try {
      const report = animalAction.kind === 'report';
      await apiRequest(`/animales/${animalAction.animal.id_animal}/${report ? 'reportar-enfermedad' : 'alta'}`, token, {
        method: 'POST', body: JSON.stringify(report ? { comentarios: actionText.trim() } : { notas_alta: actionText.trim() }),
      });
      setAnimalAction(null); setActionText('');
      showMessage(report ? 'Reporte enviado' : 'Alta registrada', report ? 'El equipo veterinario recibió el reporte.' : 'Se registró el alta veterinaria.', 'success');
      await loadSection(true);
    } catch (error) { showMessage('No se pudo guardar', error instanceof Error ? error.message : 'Error de API.', 'error'); }
    finally { setActionBusy(false); }
  };
  const farmSection = ['inicio', 'animales', 'corrales', 'campo', 'veterinaria'].includes(section);
  const records: (Animal | Corral | EquipoItem | SignupRequest | Notification)[] = section === 'equipo' ? team : section === 'solicitudes' ? requests : section === 'avisos' ? alerts : [];
  // Esta función solicita confirmación para aprobar o denegar un registro, llama al endpoint de administración y recarga las solicitudes pendientes. Recibe request, approve como entrada.
  const handleRequestDecision = async (request: SignupRequest, approve: boolean) => {
    const action = approve ? 'aprobar' : 'rechazar';
    const accepted = await confirm(`${approve ? 'Aceptar' : 'Denegar'} solicitud`, `¿Querés ${action} el acceso de ${request.nombre} ${request.apellido}?`, approve ? 'Aceptar solicitud' : 'Denegar solicitud', !approve);
    if (!accepted) return;
    try {
      await apiRequest(`/usuarios/solicitudes/${request.id_solicitud}/${approve ? 'aprobar' : 'rechazar'}`, token, { method: 'POST' });
      showMessage(approve ? 'Solicitud aprobada' : 'Solicitud denegada', approve ? 'Se envió el token de acceso al correo registrado.' : 'La solicitud fue rechazada.', 'success');
      await loadSection(true);
    } catch (error) {
      showMessage('No se pudo resolver la solicitud', error instanceof Error ? error.message : 'Error de API.', 'error');
    }
  };
  // Esta función permite elegir un nuevo rango para la cuenta, guarda el cambio con la API y vuelve a consultar el equipo. Recibe item como entrada.
  const handleRoleChange = async (item: EquipoItem) => {
    const nextRole = await choose(`Cambiar rango de ${item.nombre}`, 'Elegí el nuevo rol para esta cuenta.', MANAGED_ROLES.map(({ role, label }) => ({ label, value: role })));
    if (!nextRole) return;
    try {
      await apiRequest(`/usuarios/${item.id_usuario}`, token, { method: 'PATCH', body: JSON.stringify({ rol: nextRole }) });
      showMessage('Rango actualizado', `Se asignó el rol ${MANAGED_ROLES.find((entry) => entry.role === nextRole)?.label ?? nextRole}.`, 'success');
      await loadSection(true);
    } catch (error) { showMessage('No se pudo cambiar el rango', error instanceof Error ? error.message : 'Error de API.', 'error'); }
  };

  return <View style={[styles.screen, wide && styles.screenWide]}>
    {wide ? <View style={styles.sidebar}>
      <View style={styles.sidebarBrandMark}><Text style={styles.sidebarLeaf}>✦</Text></View>
      <Text style={styles.sidebarBrand}>Gestión de Campo</Text><Text style={styles.sidebarCaption}>ESTANCIA APP</Text>
      <View style={styles.sidebarUser}><View style={styles.sidebarAvatar}><Text style={styles.sidebarAvatarText}>{user.nombre.charAt(0).toUpperCase()}</Text></View><View style={styles.sidebarUserCopy}><Text numberOfLines={1} style={styles.sidebarUserName}>{user.nombre} {user.apellido}</Text><Text style={styles.sidebarUserRole}>{user.rolLabel}</Text></View></View>
      <Text style={styles.sidebarSection}>MENÚ PRINCIPAL</Text>
      <ScrollView style={styles.sidebarNav} contentContainerStyle={styles.sidebarNavContent} showsVerticalScrollIndicator={false}>
        {navItems.map((item) => <Pressable key={item.id} onPress={() => setSection(item.id)} style={[styles.sidebarItem, section === item.id && styles.sidebarItemSelected]}><View style={[styles.sidebarItemDot, section === item.id && styles.sidebarItemDotSelected]} /><Text style={[styles.sidebarItemText, section === item.id && styles.sidebarItemTextSelected]}>{item.title}</Text></Pressable>)}
      </ScrollView>
      <Pressable accessibilityRole="button" onPress={onLogout} style={styles.sidebarLogout}><Text style={styles.sidebarLogoutIcon}>↗</Text><Text style={styles.sidebarLogoutText}>Cerrar sesión</Text></Pressable>
    </View> : null}
    <View style={styles.main}>
    <View style={[styles.header, !wide && styles.headerMobile, { paddingHorizontal: gutter, paddingTop: (Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 18) + 8 }]}>
      <View style={styles.headerInner}>
        <View style={styles.headerMain}><Text style={styles.brand}>{wide ? 'PANEL DE GESTIÓN' : 'ESTANCIA APP'}</Text><Text numberOfLines={1} style={[styles.greeting, !wide && width < 360 && styles.greetingCompact]}>{wide ? NAV.find((item) => item.id === section)?.title : `Hola, ${user.nombre}`}</Text><Text numberOfLines={1} style={styles.role}>{wide ? `${user.nombre} ${user.apellido} · ${user.rolLabel}` : user.rolLabel}</Text></View>
        <View style={styles.headerActions}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Ver avisos${alerts.length ? `, ${alerts.length} notificaciones` : ''}`} onPress={() => setSection('avisos')} style={styles.bellButton}>
            <MaterialCommunityIcons name="bell-outline" size={23} color="#315a3c" />
            {alerts.length > 0 ? <View style={styles.bellBadge}><Text style={styles.bellBadgeText}>{alerts.length > 99 ? '99+' : alerts.length}</Text></View> : null}
          </Pressable>
          {!wide ? <Pressable accessibilityRole="button" onPress={onLogout} style={styles.logout}><Text style={styles.logoutText}>Salir</Text></Pressable> : null}
        </View>
      </View>
    </View>
    {!wide ? <View style={[styles.nav, { paddingHorizontal: gutter }]}>
      {navItems.map((item) => <Pressable key={item.id} onPress={() => setSection(item.id)} style={[styles.navItem, section === item.id && styles.navSelected]}><Text style={[styles.navText, section === item.id && styles.navTextSelected]}>{item.title}</Text></Pressable>)}
    </View> : null}
    <FlatList
      style={styles.list}
      data={loading ? [] : records}
      keyExtractor={(item: any, index) => String(item.id_animal ?? item.id_corral ?? item.id_usuario ?? item.id_solicitud ?? item.id ?? index)}
      contentContainerStyle={[styles.content, { paddingHorizontal: wide ? 42 : gutter, maxWidth: Math.max(620, Math.min(1200, width)), width: '100%', alignSelf: 'center' }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadSection(true)} tintColor="#315a3c" />}
      ListHeaderComponent={loading ? <View style={styles.loading}><ActivityIndicator color="#315a3c" /><Text style={styles.muted}>Cargando…</Text></View>
        : section === 'inicio' ? <FarmDashboardScreen token={token} user={user} onNavigate={setSection} />
          : section === 'animales' ? <AnimalsManagementScreen token={token} user={user} />
            : section === 'corrales' ? <CorralsManagementScreen token={token} user={user} />
              : section === 'campo' ? <FieldOperationsScreen token={token} user={user} />
                : section === 'veterinaria' ? <VeterinaryOperationsScreen token={token} user={user} />
          : <View><Text style={styles.sectionTitle}>{NAV.find((item) => item.id === section)?.title}</Text>{section === 'equipo' ? <CreateUserCard token={token} onCreated={() => loadSection(true)} /> : null}{['animales', 'campo', 'veterinaria'].includes(section) ? <TextInput placeholder="Buscar por caravana, nombre o estado" value={search} onChangeText={setSearch} style={styles.search} /> : null}</View>}
      ListEmptyComponent={!loading && !farmSection ? <Text style={styles.empty}>No hay elementos para mostrar.</Text> : null}
      renderItem={({ item }: { item: Animal | Corral | EquipoItem | SignupRequest | Notification }) => <RecordCard item={item} section={section} token={token} currentUser={user} onChanged={() => loadSection(true)} onAnimalAction={(animal, kind) => { setActionText(''); setAnimalAction({ animal, kind }); }} onRequestDecision={(request, approve) => void handleRequestDecision(request, approve)} onChooseRole={(member) => void handleRoleChange(member)} showMessage={showMessage} />}
    />
    <Modal visible={!!animalAction} transparent animationType="fade" onRequestClose={() => { if (!actionBusy) setAnimalAction(null); }}>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
          <View style={[styles.modalCard, { width: Math.min(width - gutter * 2, 560) }]}>
            <Text style={styles.sectionTitle}>{animalAction?.kind === 'report' ? 'Reportar enfermedad' : 'Registrar alta veterinaria'}</Text>
            <Text style={styles.muted}>{animalAction?.animal.identificador}{animalAction?.animal.nombre ? ` · ${animalAction.animal.nombre}` : ''}</Text>
            <TextInput autoFocus multiline textAlignVertical="top" value={actionText} onChangeText={setActionText} style={styles.actionInput}
              placeholder={animalAction?.kind === 'report' ? 'Describí los síntomas observados' : 'Notas clínicas del alta (opcional)'} />
            <View style={styles.adminActions}>
              <Pressable disabled={actionBusy} style={styles.approveButton} onPress={() => void submitAnimalAction()}><Text style={styles.approveText}>{actionBusy ? 'Guardando…' : 'Guardar'}</Text></Pressable>
              <Pressable disabled={actionBusy} style={styles.rejectButton} onPress={() => setAnimalAction(null)}><Text style={styles.rejectText}>Cancelar</Text></Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
    </View>
  </View>;
}
// Esta función renderiza el bloque de interfaz Dashboard dentro de la pantalla y conecta sus props con las acciones disponibles. Recibe summary como entrada.
function Dashboard({ summary }: { summary: DashboardSummary | null }) {
  if (!summary) return <Text style={styles.empty}>No hay resumen disponible.</Text>;
  const cards: [string, string | number][] = [['Animales', summary.totalAnimales], ['Alertas activas', summary.alertasActivas], ['Corrales en uso', `${summary.corralesEnUso}/${summary.corralesTotal}`], ['Corrales libres', summary.corralesLibres]];
  return <View><Text style={styles.sectionTitle}>Resumen del establecimiento</Text><View style={styles.stats}>{cards.map(([label, value]) => <View key={label} style={styles.statCard}><Text style={styles.statValue}>{value}</Text><Text style={styles.muted}>{label}</Text></View>)}</View><View style={styles.card}><Text style={styles.itemTitle}>Clima</Text><Text style={styles.muted}>{summary.clima.descripcion} · {summary.clima.temperatura}°</Text></View></View>;
}
// Esta función renderiza el bloque de interfaz RecordCard dentro de la pantalla y conecta sus props con las acciones disponibles. Recibe item, section, token, currentUser, onChanged, onAnimalAction, onRequestDecision, onChooseRole, showMessage como entrada.
function RecordCard({ item, section, token, currentUser, onChanged, onAnimalAction, onRequestDecision, onChooseRole, showMessage }: { item: Animal | Corral | EquipoItem | SignupRequest | Notification; section: Section; token: string; currentUser: PublicUser; onChanged: () => void; onAnimalAction: (animal: Animal, kind: 'report' | 'discharge') => void; onRequestDecision: (request: SignupRequest, approve: boolean) => void; onChooseRole: (item: EquipoItem) => void; showMessage: (title: string, message: string, tone?: 'success' | 'error' | 'info') => void }) {
  if ('id_animal' in item) return <View style={styles.card}>
    <View style={styles.row}><Text style={styles.itemTitle}>{item.identificador}{item.nombre ? ` · ${item.nombre}` : ''}</Text><Text style={styles.status}>{item.estado_salud.replace('_', ' ')}</Text></View>
    <Text style={styles.muted}>{item.especie_nombre} · {item.raza_nombre} · {item.corral_nombre}</Text>
    {section === 'campo' ? <Pressable style={styles.smallButton} onPress={() => onAnimalAction(item, 'report')}><Text style={styles.smallButtonText}>Reportar enfermedad</Text></Pressable> : null}
    {section === 'veterinaria' && item.estado_salud === 'en_tratamiento' ? <Pressable style={styles.smallButton} onPress={() => onAnimalAction(item, 'discharge')}><Text style={styles.smallButtonText}>Registrar alta</Text></Pressable> : null}
  </View>;
  if ('id_corral' in item) return <View style={styles.card}><Text style={styles.itemTitle}>{item.nombre}</Text><Text style={styles.muted}>{item.ocupados}/{item.capacidad} ocupados{item.es_enfermeria ? ' · Enfermería' : ''}</Text></View>;
  if ('id_usuario' in item) return <View style={styles.card}><Text style={styles.itemTitle}>{item.nombre} {item.apellido}</Text><Text style={styles.muted}>{item.email} · {item.rolLabel} · {item.activo ? 'Activo' : 'Inactivo'}</Text>
    {currentUser.rol === 'administrador' && item.rol !== 'administrador' ? <View style={styles.adminActions}>
      <Pressable style={styles.smallButton} onPress={() => onChooseRole(item)}><Text style={styles.smallButtonText}>Cambiar rango</Text></Pressable>
      <Pressable style={styles.smallButton} onPress={() => void apiRequest(`/usuarios/${item.id_usuario}`, token, { method: 'PATCH', body: JSON.stringify({ activo: !item.activo }) }).then(onChanged).catch((e: Error) => showMessage('No se pudo actualizar', e.message, 'error'))}><Text style={styles.smallButtonText}>{item.activo ? 'Desactivar' : 'Reactivar'}</Text></Pressable>
    </View> : null}</View>;
  if ('id_solicitud' in item) return <View style={styles.card}><Text style={styles.itemTitle}>{item.nombre} {item.apellido}</Text><Text style={styles.muted}>{item.email} · Correo verificado · Solicitud {new Date(item.created_at).toLocaleDateString()}</Text>
    <View style={styles.adminActions}><Pressable style={styles.approveButton} onPress={() => onRequestDecision(item, true)}><Text style={styles.approveText}>Aceptar · crear como peón</Text></Pressable><Pressable style={styles.rejectButton} onPress={() => onRequestDecision(item, false)}><Text style={styles.rejectText}>Denegar</Text></Pressable></View></View>;
  return <View style={styles.card}><Text style={styles.itemTitle}>{item.titulo ?? 'Notificación'}</Text><Text style={styles.muted}>{item.mensaje}</Text></View>;
}

const MANAGED_ROLES: { role: Exclude<Role, 'administrador' | 'empleado'>; label: string }[] = [
  { role: 'peon', label: 'Peón' }, { role: 'veterinario', label: 'Veterinario' }, { role: 'copropietario', label: 'Copropietario' }, { role: 'dueno', label: 'Dueño' },
];
// Esta función renderiza el bloque de interfaz CreateUserCard dentro de la pantalla y conecta sus props con las acciones disponibles. Recibe token, onCreated como entrada.
function CreateUserCard({ token, onCreated }: { token: string; onCreated: () => void }) {
  const { showMessage } = useFeedback();
  const [nombre, setNombre] = useState(''); const [apellido, setApellido] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [role, setRole] = useState<Exclude<Role, 'administrador' | 'empleado'>>('peon');
  // Esta función valida los datos del formulario de creación, envía el alta al backend y notifica al componente padre para actualizar la lista.
  const create = async () => {
    if (!nombre.trim() || !apellido.trim() || !/^\S+@\S+\.\S+$/.test(email.trim()) || password.length < 10) { showMessage('Revisá los datos', 'Completá nombre, apellido, correo y una contraseña de al menos 10 caracteres.', 'error'); return; }
    try { await apiRequest('/usuarios', token, { method: 'POST', body: JSON.stringify({ nombre, apellido, email, password, rol: role }) }); setNombre(''); setApellido(''); setEmail(''); setPassword(''); showMessage('Cuenta creada', 'Se creó la cuenta. La persona deberá cambiar la contraseña inicial.', 'success'); onCreated(); }
    catch (error) { showMessage('No se pudo crear', error instanceof Error ? error.message : 'Error de API.', 'error'); }
  };
  return <View style={styles.card}><Text style={styles.itemTitle}>Crear usuario</Text><Text style={styles.muted}>Por defecto el rol inicial es Peón; podés elegir otro rango.</Text>
    <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre} style={styles.formInput} /><TextInput placeholder="Apellido" value={apellido} onChangeText={setApellido} style={styles.formInput} />
    <TextInput placeholder="Correo" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.formInput} /><TextInput placeholder="Contraseña inicial (10 caracteres mínimo)" secureTextEntry value={password} onChangeText={setPassword} style={styles.formInput} />
    <Pressable style={styles.smallButton} onPress={() => { const index = MANAGED_ROLES.findIndex((entry) => entry.role === role); setRole(MANAGED_ROLES[(index + 1) % MANAGED_ROLES.length].role); }}><Text style={styles.smallButtonText}>Rol nuevo: {MANAGED_ROLES.find((entry) => entry.role === role)?.label} · cambiar</Text></Pressable>
    <Pressable style={styles.approveButton} onPress={() => void create()}><Text style={styles.approveText}>Crear cuenta</Text></Pressable>
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f7f6' }, screenWide: { flexDirection: 'row' }, main: { flex: 1, minWidth: 0, backgroundColor: '#f4f7f6' },
  sidebar: { width: 246, flexShrink: 0, backgroundColor: '#1a3020', paddingTop: 30, paddingHorizontal: 18, paddingBottom: 18 }, sidebarBrandMark: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }, sidebarLeaf: { color: '#a8d5a2', fontSize: 21, fontWeight: '900' }, sidebarBrand: { color: '#f2f8f1', fontSize: 16, fontWeight: '800', marginTop: 13 }, sidebarCaption: { color: '#adc2af', fontSize: 10, letterSpacing: 1.6, fontWeight: '800', marginTop: 4 }, sidebarUser: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 28, paddingVertical: 15, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }, sidebarAvatar: { width: 37, height: 37, borderRadius: 19, backgroundColor: '#dce8da', alignItems: 'center', justifyContent: 'center' }, sidebarAvatarText: { color: '#315a3c', fontSize: 16, fontWeight: '800' }, sidebarUserCopy: { flex: 1, minWidth: 0 }, sidebarUserName: { color: '#fff', fontSize: 13, fontWeight: '700' }, sidebarUserRole: { color: '#b3c4b5', fontSize: 11, marginTop: 3 }, sidebarSection: { color: '#90a795', fontSize: 9, letterSpacing: 1.5, fontWeight: '800', marginTop: 25, marginBottom: 10 }, sidebarNav: { flex: 1 }, sidebarNavContent: { gap: 5 }, sidebarItem: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44, paddingHorizontal: 13, borderRadius: 10 }, sidebarItemSelected: { backgroundColor: 'rgba(74,222,128,0.16)' }, sidebarItemDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#829284' }, sidebarItemDotSelected: { backgroundColor: '#8fc794' }, sidebarItemText: { color: '#d2dfd3', fontSize: 13, fontWeight: '600' }, sidebarItemTextSelected: { color: '#fff', fontWeight: '800' }, sidebarLogout: { flexDirection: 'row', alignItems: 'center', gap: 11, minHeight: 46, paddingHorizontal: 12, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }, sidebarLogoutIcon: { color: '#c9d7ca', fontSize: 18 }, sidebarLogoutText: { color: '#d2dfd3', fontSize: 13, fontWeight: '600' },
  header: { paddingBottom: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e7ece7' }, headerInner: { width: '100%', maxWidth: 1240, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, headerMain: { flex: 1, minWidth: 0 }, headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 }, brand: { color: '#4a704d', fontWeight: '800', fontSize: 10, letterSpacing: 1.7 }, greeting: { color: '#1a3020', fontSize: 25, fontWeight: '800', marginTop: 5, flexShrink: 1 }, greetingCompact: { fontSize: 21 }, role: { color: '#6b756b', fontSize: 13, marginTop: 3 }, bellButton: { width: 44, height: 44, borderRadius: 13, backgroundColor: '#edf4eb', alignItems: 'center', justifyContent: 'center', position: 'relative' }, bellBadge: { position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, paddingHorizontal: 4, borderRadius: 9, backgroundColor: '#b43d35', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#fff' }, bellBadgeText: { color: '#fff', fontSize: 9, lineHeight: 12, fontWeight: '800' }, logout: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#edf2eb', borderRadius: 11 }, logoutText: { color: '#315a3c', fontWeight: '700' },
  headerMobile: { marginTop: 10, marginHorizontal: 14, paddingBottom: 14, borderWidth: 1, borderColor: '#e5e9e4', borderRadius: 16, shadowColor: '#1a3020', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  nav: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, paddingVertical: 11, paddingHorizontal: 16, backgroundColor: 'transparent' }, navItem: { flexShrink: 0, paddingVertical: 9, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e9e4' }, navSelected: { backgroundColor: '#2d5a27', borderColor: '#2d5a27' }, navText: { color: '#59645a', fontWeight: '600' }, navTextSelected: { color: '#fff' }, list: { flex: 1, minHeight: 0 }, content: { paddingTop: 14, paddingBottom: 48, flexGrow: 1 }, sectionTitle: { fontSize: 23, color: '#1a3020', fontWeight: '800', marginBottom: 17 }, stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 14 }, statCard: { flexBasis: '45%', flexGrow: 1, minWidth: 150, backgroundColor: '#fff', borderRadius: 14, padding: 20, borderColor: '#e5e9e4', borderWidth: 1, shadowColor: '#1a3020', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } }, statValue: { color: '#2d5a27', fontSize: 27, fontWeight: '800' },
  card: { backgroundColor: '#fff', borderRadius: 14, borderColor: '#e5e9e4', borderWidth: 1, padding: 19, marginBottom: 13, shadowColor: '#1a3020', shadowOpacity: 0.035, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } }, row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8 }, itemTitle: { color: '#263329', fontSize: 16, fontWeight: '700', flexShrink: 1 }, muted: { color: '#6b756b', fontSize: 13, lineHeight: 19, marginTop: 5 }, status: { color: '#52765a', fontWeight: '700', fontSize: 12, flexShrink: 1 }, search: { backgroundColor: '#fff', minHeight: 47, borderColor: '#dfe5df', borderWidth: 1, borderRadius: 11, paddingHorizontal: 14, marginBottom: 14, color: '#263329' }, smallButton: { alignSelf: 'flex-start', backgroundColor: '#edf4eb', paddingHorizontal: 13, paddingVertical: 9, marginTop: 12, borderRadius: 9 }, smallButtonText: { color: '#315a3c', fontWeight: '700' }, empty: { color: '#6b756b', textAlign: 'center', paddingVertical: 32 }, loading: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  adminActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }, approveButton: { alignSelf: 'flex-start', backgroundColor: '#2d5a27', paddingHorizontal: 15, paddingVertical: 11, marginTop: 13, borderRadius: 10 }, approveText: { color: '#fff', fontWeight: '700' }, rejectButton: { alignSelf: 'flex-start', backgroundColor: '#fbefed', paddingHorizontal: 15, paddingVertical: 11, marginTop: 13, borderRadius: 10 }, rejectText: { color: '#a64236', fontWeight: '700' }, formInput: { minHeight: 46, borderWidth: 1, borderColor: '#dfe5df', borderRadius: 10, backgroundColor: '#fbfcfa', paddingHorizontal: 13, marginTop: 10, color: '#263329' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(20,36,25,0.48)', justifyContent: 'center' }, modalScroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 24 }, modalCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24 }, actionInput: { minHeight: 120, maxHeight: 240, borderWidth: 1, borderColor: '#dfe5df', borderRadius: 12, backgroundColor: '#fbfcfa', padding: 13, marginTop: 14, color: '#263329' },
});
