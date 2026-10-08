import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { apiRequest } from '../services/api';
import type { Animal, Corral, DashboardSummary, Notification, PublicUser, Role } from '../types/domain';

type Section = 'inicio' | 'animales' | 'corrales' | 'equipo' | 'solicitudes' | 'campo' | 'veterinaria' | 'avisos';
interface HomeScreenProps { user: PublicUser; token: string; onLogout: () => void; }
interface EquipoItem { id_usuario: number; nombre: string; apellido: string; email: string; rol: Role; rolLabel: string; activo: boolean; }
interface SignupRequest { id_solicitud: number; nombre: string; apellido: string; email: string; created_at: string; }
const NAV: { id: Section; title: string; roles: PublicUser['rol'][] }[] = [
  { id: 'inicio', title: 'Inicio', roles: ['administrador', 'dueno', 'copropietario'] },
  { id: 'animales', title: 'Animales', roles: ['dueno', 'copropietario', 'peon', 'veterinario'] },
  { id: 'corrales', title: 'Corrales', roles: ['dueno', 'copropietario'] },
  { id: 'equipo', title: 'Usuarios', roles: ['administrador'] },
  { id: 'solicitudes', title: 'Solicitudes', roles: ['administrador'] },
  { id: 'campo', title: 'Campo', roles: ['peon'] },
  { id: 'veterinaria', title: 'Veterinaria', roles: ['veterinario'] },
  { id: 'avisos', title: 'Avisos', roles: ['dueno', 'copropietario', 'peon', 'veterinario'] },
];

export function HomeScreen({ user, token, onLogout }: HomeScreenProps) {
  const [section, setSection] = useState<Section>(user.rol === 'peon' ? 'campo' : user.rol === 'veterinario' ? 'veterinaria' : 'inicio');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [corrals, setCorrals] = useState<Corral[]>([]);
  const [team, setTeam] = useState<EquipoItem[]>([]);
  const [requests, setRequests] = useState<SignupRequest[]>([]);
  const [alerts, setAlerts] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const loadSection = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    try {
      if (section === 'inicio') setSummary(await apiRequest<DashboardSummary>('/dashboard/summary', token));
      else if (section === 'animales' || section === 'campo' || section === 'veterinaria') {
        const params = section === 'veterinaria' ? '?id_corral=6' : '';
        setAnimals(await apiRequest<Animal[]>(`/animales${params}`, token));
      } else if (section === 'corrales') setCorrals(await apiRequest<Corral[]>('/corrales', token));
      else if (section === 'equipo') setTeam(await apiRequest<EquipoItem[]>('/usuarios', token));
      else if (section === 'solicitudes') setRequests(await apiRequest<SignupRequest[]>('/usuarios/solicitudes', token));
      else setAlerts(await apiRequest<Notification[]>('/notificaciones', token));
    } catch (cause) {
      Alert.alert('No se pudo actualizar', cause instanceof Error ? cause.message : 'Error de conexión.');
    } finally { setLoading(false); setRefreshing(false); }
  }, [section, token]);

  useEffect(() => { void loadSection(); }, [loadSection]);
  const navItems = NAV.filter((item) => user.rol === 'administrador' || item.roles.includes(user.rol));
  const records: (Animal | Corral | EquipoItem | SignupRequest | Notification)[] = section === 'animales' || section === 'campo' || section === 'veterinaria'
    ? animals.filter((item) => `${item.identificador} ${item.nombre ?? ''} ${item.estado_salud}`.toLowerCase().includes(search.toLowerCase()))
    : section === 'corrales' ? corrals : section === 'equipo' ? team : section === 'solicitudes' ? requests : section === 'avisos' ? alerts : [];

  return <View style={styles.screen}>
    <View style={styles.header}>
      <View style={styles.headerMain}><Text style={styles.brand}>ESTANCIA APP</Text><Text style={styles.greeting}>Hola, {user.nombre}</Text><Text style={styles.role}>{user.rolLabel}</Text></View>
      <Pressable accessibilityRole="button" onPress={onLogout} style={styles.logout}><Text style={styles.logoutText}>Salir</Text></Pressable>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nav}>
      {navItems.map((item) => <Pressable key={item.id} onPress={() => setSection(item.id)} style={[styles.navItem, section === item.id && styles.navSelected]}><Text style={[styles.navText, section === item.id && styles.navTextSelected]}>{item.title}</Text></Pressable>)}
    </ScrollView>
    <FlatList
      data={loading ? [] : records}
      keyExtractor={(item: any, index) => String(item.id_animal ?? item.id_corral ?? item.id_usuario ?? item.id_solicitud ?? item.id ?? index)}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadSection(true)} tintColor="#315a3c" />}
      ListHeaderComponent={loading ? <View style={styles.loading}><ActivityIndicator color="#315a3c" /><Text style={styles.muted}>Cargando…</Text></View>
        : section === 'inicio' ? <Dashboard summary={summary} />
          : <View><Text style={styles.sectionTitle}>{NAV.find((item) => item.id === section)?.title}</Text>{section === 'equipo' ? <CreateUserCard token={token} onCreated={() => loadSection(true)} /> : null}{['animales', 'campo', 'veterinaria'].includes(section) ? <TextInput placeholder="Buscar por caravana, nombre o estado" value={search} onChangeText={setSearch} style={styles.search} /> : null}</View>}
      ListEmptyComponent={!loading && section !== 'inicio' ? <Text style={styles.empty}>No hay elementos para mostrar.</Text> : null}
      renderItem={({ item }: { item: Animal | Corral | EquipoItem | SignupRequest | Notification }) => <RecordCard item={item} section={section} token={token} currentUser={user} onChanged={() => loadSection(true)} />}
    />
  </View>;
}

function Dashboard({ summary }: { summary: DashboardSummary | null }) {
  if (!summary) return <Text style={styles.empty}>No hay resumen disponible.</Text>;
  const cards: [string, string | number][] = [['Animales', summary.totalAnimales], ['Alertas activas', summary.alertasActivas], ['Corrales en uso', `${summary.corralesEnUso}/${summary.corralesTotal}`], ['Corrales libres', summary.corralesLibres]];
  return <View><Text style={styles.sectionTitle}>Resumen del establecimiento</Text><View style={styles.stats}>{cards.map(([label, value]) => <View key={label} style={styles.statCard}><Text style={styles.statValue}>{value}</Text><Text style={styles.muted}>{label}</Text></View>)}</View><View style={styles.card}><Text style={styles.itemTitle}>Clima</Text><Text style={styles.muted}>{summary.clima.descripcion} · {summary.clima.temperatura}°</Text></View></View>;
}

function RecordCard({ item, section, token, currentUser, onChanged }: { item: Animal | Corral | EquipoItem | SignupRequest | Notification; section: Section; token: string; currentUser: PublicUser; onChanged: () => void }) {
  if ('id_animal' in item) return <View style={styles.card}>
    <View style={styles.row}><Text style={styles.itemTitle}>{item.identificador}{item.nombre ? ` · ${item.nombre}` : ''}</Text><Text style={styles.status}>{item.estado_salud.replace('_', ' ')}</Text></View>
    <Text style={styles.muted}>{item.especie_nombre} · {item.raza_nombre} · {item.corral_nombre}</Text>
    {section === 'campo' ? <Pressable style={styles.smallButton} onPress={() => Alert.prompt?.('Reportar enfermedad', 'Describí los síntomas.', (comments) => {
      void apiRequest(`/animales/${item.id_animal}/reportar-enfermedad`, token, { method: 'POST', body: JSON.stringify({ comentarios: comments ?? '' }) }).then(onChanged).catch((error: Error) => Alert.alert('Error', error.message));
    }) ?? Alert.alert('Reportar enfermedad', 'La app abre un formulario de reporte en la siguiente iteración.')}><Text style={styles.smallButtonText}>Reportar enfermedad</Text></Pressable> : null}
    {section === 'veterinaria' && item.estado_salud === 'en_tratamiento' ? <Pressable style={styles.smallButton} onPress={() => Alert.alert('Alta veterinaria', 'El alta requiere confirmar notas clínicas antes de implementarla.')}><Text style={styles.smallButtonText}>Ver opciones de alta</Text></Pressable> : null}
  </View>;
  if ('id_corral' in item) return <View style={styles.card}><Text style={styles.itemTitle}>{item.nombre}</Text><Text style={styles.muted}>{item.ocupados}/{item.capacidad} ocupados{item.es_enfermeria ? ' · Enfermería' : ''}</Text></View>;
  if ('id_usuario' in item) return <View style={styles.card}><Text style={styles.itemTitle}>{item.nombre} {item.apellido}</Text><Text style={styles.muted}>{item.email} · {item.rolLabel} · {item.activo ? 'Activo' : 'Inactivo'}</Text>
    {currentUser.rol === 'administrador' && item.rol !== 'administrador' ? <View style={styles.adminActions}>
      <Pressable style={styles.smallButton} onPress={() => chooseRole(item, token, onChanged)}><Text style={styles.smallButtonText}>Cambiar rango</Text></Pressable>
      <Pressable style={styles.smallButton} onPress={() => void apiRequest(`/usuarios/${item.id_usuario}`, token, { method: 'PATCH', body: JSON.stringify({ activo: !item.activo }) }).then(onChanged).catch((e: Error) => Alert.alert('Error', e.message))}><Text style={styles.smallButtonText}>{item.activo ? 'Desactivar' : 'Reactivar'}</Text></Pressable>
    </View> : null}</View>;
  if ('id_solicitud' in item) return <View style={styles.card}><Text style={styles.itemTitle}>{item.nombre} {item.apellido}</Text><Text style={styles.muted}>{item.email} · Correo verificado · Solicitud {new Date(item.created_at).toLocaleDateString()}</Text>
    <View style={styles.adminActions}><Pressable style={styles.approveButton} onPress={() => confirmRequest(item, token, true, onChanged)}><Text style={styles.approveText}>Aceptar · crear como peón</Text></Pressable><Pressable style={styles.rejectButton} onPress={() => confirmRequest(item, token, false, onChanged)}><Text style={styles.rejectText}>Denegar</Text></Pressable></View></View>;
  return <View style={styles.card}><Text style={styles.itemTitle}>{item.titulo ?? 'Notificación'}</Text><Text style={styles.muted}>{item.mensaje}</Text></View>;
}

const MANAGED_ROLES: { role: Exclude<Role, 'administrador' | 'empleado'>; label: string }[] = [
  { role: 'peon', label: 'Peón' }, { role: 'veterinario', label: 'Veterinario' }, { role: 'copropietario', label: 'Copropietario' }, { role: 'dueno', label: 'Dueño' },
];
function chooseRole(item: EquipoItem, token: string, changed: () => void) {
  Alert.alert('Cambiar rango', `Elegí el rol para ${item.nombre} ${item.apellido}.`, [
    ...MANAGED_ROLES.map(({ role, label }) => ({ text: label, onPress: () => void apiRequest(`/usuarios/${item.id_usuario}`, token, { method: 'PATCH', body: JSON.stringify({ rol: role }) }).then(changed).catch((e: Error) => Alert.alert('Error', e.message)) })),
    { text: 'Cancelar', style: 'cancel' },
  ]);
}
function confirmRequest(request: SignupRequest, token: string, approve: boolean, changed: () => void) {
  const action = approve ? 'aprobar' : 'rechazar';
  Alert.alert(`${approve ? 'Aceptar' : 'Denegar'} solicitud`, `¿Querés ${action} el acceso de ${request.nombre} ${request.apellido}?`, [
    { text: 'Cancelar', style: 'cancel' },
    { text: approve ? 'Aceptar' : 'Denegar', style: approve ? 'default' : 'destructive', onPress: () => void apiRequest(`/usuarios/solicitudes/${request.id_solicitud}/${approve ? 'aprobar' : 'rechazar'}`, token, { method: 'POST' }).then(changed).catch((e: Error) => Alert.alert('Error', e.message)) },
  ]);
}

function CreateUserCard({ token, onCreated }: { token: string; onCreated: () => void }) {
  const [nombre, setNombre] = useState(''); const [apellido, setApellido] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [role, setRole] = useState<Exclude<Role, 'administrador' | 'empleado'>>('peon');
  const create = async () => {
    if (!nombre.trim() || !apellido.trim() || !/^\S+@\S+\.\S+$/.test(email.trim()) || password.length < 10) { Alert.alert('Revisá los datos', 'Completá nombre, apellido, correo y una contraseña de al menos 10 caracteres.'); return; }
    try { await apiRequest('/usuarios', token, { method: 'POST', body: JSON.stringify({ nombre, apellido, email, password, rol: role }) }); setNombre(''); setApellido(''); setEmail(''); setPassword(''); Alert.alert('Cuenta creada', 'Se creó la cuenta. La persona deberá cambiar la contraseña inicial.'); onCreated(); }
    catch (error) { Alert.alert('No se pudo crear', error instanceof Error ? error.message : 'Error de API.'); }
  };
  return <View style={styles.card}><Text style={styles.itemTitle}>Crear usuario</Text><Text style={styles.muted}>Por defecto el rol inicial es Peón; podés elegir otro rango.</Text>
    <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre} style={styles.formInput} /><TextInput placeholder="Apellido" value={apellido} onChangeText={setApellido} style={styles.formInput} />
    <TextInput placeholder="Correo" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.formInput} /><TextInput placeholder="Contraseña inicial (10 caracteres mínimo)" secureTextEntry value={password} onChangeText={setPassword} style={styles.formInput} />
    <Pressable style={styles.smallButton} onPress={() => { const index = MANAGED_ROLES.findIndex((entry) => entry.role === role); setRole(MANAGED_ROLES[(index + 1) % MANAGED_ROLES.length].role); }}><Text style={styles.smallButtonText}>Rol nuevo: {MANAGED_ROLES.find((entry) => entry.role === role)?.label} · cambiar</Text></Pressable>
    <Pressable style={styles.approveButton} onPress={() => void create()}><Text style={styles.approveText}>Crear cuenta</Text></Pressable>
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f5ef' }, header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, headerMain: { flex: 1 }, brand: { color: '#52765a', fontWeight: '800', fontSize: 10, letterSpacing: 1.7 }, greeting: { color: '#1f2a21', fontSize: 24, fontWeight: '800', marginTop: 4 }, role: { color: '#6b756b', fontSize: 13, marginTop: 2 }, logout: { paddingVertical: 9, paddingHorizontal: 14, backgroundColor: '#edf2eb', borderRadius: 11 }, logoutText: { color: '#315a3c', fontWeight: '700' },
  nav: { gap: 8, paddingHorizontal: 16, paddingVertical: 13, backgroundColor: '#fff' }, navItem: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#f2f4f0' }, navSelected: { backgroundColor: '#315a3c' }, navText: { color: '#59645a', fontWeight: '600' }, navTextSelected: { color: '#fff' }, content: { padding: 18, paddingBottom: 40, flexGrow: 1 }, sectionTitle: { fontSize: 22, color: '#1f2a21', fontWeight: '800', marginBottom: 15 }, stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 }, statCard: { flexBasis: '47%', flexGrow: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderColor: '#e4e8e0', borderWidth: 1 }, statValue: { color: '#315a3c', fontSize: 25, fontWeight: '800' },
  card: { backgroundColor: '#fff', borderRadius: 15, borderColor: '#e4e8e0', borderWidth: 1, padding: 16, marginBottom: 10 }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }, itemTitle: { color: '#263329', fontSize: 16, fontWeight: '700', flexShrink: 1 }, muted: { color: '#697269', fontSize: 13, lineHeight: 19, marginTop: 4 }, status: { color: '#52765a', fontWeight: '700', fontSize: 12 }, search: { backgroundColor: '#fff', minHeight: 46, borderColor: '#d8ddd3', borderWidth: 1, borderRadius: 12, paddingHorizontal: 13, marginBottom: 12, color: '#263329' }, smallButton: { alignSelf: 'flex-start', backgroundColor: '#fff1dc', paddingHorizontal: 12, paddingVertical: 8, marginTop: 12, borderRadius: 9 }, smallButtonText: { color: '#765d18', fontWeight: '700' }, empty: { color: '#6b756b', textAlign: 'center', paddingVertical: 28 }, loading: { alignItems: 'center', paddingVertical: 28, gap: 8 },
  adminActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }, approveButton: { alignSelf: 'flex-start', backgroundColor: '#315a3c', paddingHorizontal: 12, paddingVertical: 10, marginTop: 12, borderRadius: 9 }, approveText: { color: '#fff', fontWeight: '700' }, rejectButton: { alignSelf: 'flex-start', backgroundColor: '#fff0ee', paddingHorizontal: 12, paddingVertical: 10, marginTop: 12, borderRadius: 9 }, rejectText: { color: '#963f36', fontWeight: '700' }, formInput: { minHeight: 44, borderWidth: 1, borderColor: '#d8ddd3', borderRadius: 10, backgroundColor: '#fff', paddingHorizontal: 12, marginTop: 9, color: '#263329' },
});
