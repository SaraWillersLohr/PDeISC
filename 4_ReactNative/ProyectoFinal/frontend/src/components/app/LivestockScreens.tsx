// muestro los inventarios de animales y corrales con datos del backend.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../../context/SessionContext';
import { deleteCorral, dischargeAnimal, listAnimals, listCorrals, listNursingAnimals, listNotifications, moveAnimal, saveCorral, updateAnimal, type AnimalRecord, type CorralRecord, type NursingAnimalRecord, type NotificationRecord } from '../../services/livestockApi';
import { AnimalCreateModal } from './AnimalCreateModal';
import { AnimalWeightModal } from './AnimalWeightModal';

const color = { green: '#214d35', ink: '#202c23', muted: '#748076', line: '#e5eae3', canvas: '#f4f6f1', white: '#fff', pale: '#e8efe5', red: '#a34b43' };

// consulto animales y aplico búsqueda local sobre la respuesta vigente.
export function AnimalsInventoryScreen() {
  const { session } = useSession();
  const role = session?.usuario.rol.toLowerCase();
  const canMove = role === 'administrador' || role === 'peon';
  const canWeigh = role === 'administrador' || role === 'peon';
  const canEdit = role === 'administrador' || role === 'dueno' || role === 'peon';
  const [rows, setRows] = useState<AnimalRecord[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [corrals, setCorrals] = useState<CorralRecord[]>([]);
  const [moving, setMoving] = useState<AnimalRecord | null>(null);
  const [destination, setDestination] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [moveError, setMoveError] = useState('');
  const [editing, setEditing] = useState<AnimalRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [weighing, setWeighing] = useState<AnimalRecord | null>(null);
  const [editName, setEditName] = useState('');
  const [editIdentifier, setEditIdentifier] = useState('');
  const [editBirth, setEditBirth] = useState('');
  const [editError, setEditError] = useState('');
  const load = useCallback(async () => {
    if (!session) return;
    try { const [animals, currentCorrals] = await Promise.all([listAnimals(session), listCorrals(session)]); setRows(animals); setCorrals(currentCorrals); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo cargar el inventario.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, [session]);
  useEffect(() => {
    if (!session) return;
    let active = true;
    Promise.all([listAnimals(session), listCorrals(session)]).then(([animals, currentCorrals]) => { if (active) { setRows(animals); setCorrals(currentCorrals); } })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'No se pudo cargar el inventario.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session]);
  const filtered = useMemo(() => rows.filter((animal) => `${animal.identificador} ${animal.nombre ?? ''} ${animal.raza} ${animal.corral}`.toLowerCase().includes(query.trim().toLowerCase())), [query, rows]);
  return <InventoryPage title="Animales" subtitle="INVENTARIO DE LA ESTANCIA" count={filtered.length} search={query} onSearch={setQuery} loading={loading} error={error} onRetry={() => { setLoading(true); void load(); }} onRefresh={() => { setRefreshing(true); void load(); }} refreshing={refreshing}>
    {canEdit ? <Pressable onPress={() => setCreating(true)} style={style.confirmButton}><Text style={style.confirmText}>＋ Agregar animal</Text></Pressable> : null}
    {filtered.map((animal) => <View key={animal.id_animal} style={style.card}><View style={style.row}><View style={style.badge}><Text style={style.badgeText}>◉</Text></View><View style={{ flex: 1 }}><Text style={style.title}>{animal.nombre || animal.identificador}</Text><Text style={style.detail}>{animal.identificador} · {animal.especie} {animal.raza}</Text></View><Text style={[style.state, animal.estado_salud !== 'sano' && style.stateAlert]}>{animal.estado_salud.replaceAll('_', ' ')}</Text></View><View style={style.divider} /><View style={style.row}><Text style={[style.detail, { flex: 1 }]}>⌖  {animal.corral}  ·  {animal.peso_kg == null ? 'Sin peso registrado' : `${animal.peso_kg} kg`}</Text>{canEdit ? <Pressable onPress={() => { setEditing(animal); setEditName(animal.nombre ?? ''); setEditIdentifier(animal.identificador); setEditBirth(animal.fecha_nacimiento?.slice(0, 10) ?? ''); setEditError(''); }} style={style.moveButton}><Text style={style.moveButtonText}>Editar</Text></Pressable> : null}{canWeigh ? <Pressable onPress={() => setWeighing(animal)} style={style.moveButton}><Text style={style.moveButtonText}>Pesar</Text></Pressable> : null}{canMove ? <Pressable onPress={() => { setMoving(animal); setDestination(null); setMoveError(''); }} style={style.moveButton}><Text style={style.moveButtonText}>Mover</Text></Pressable> : null}</View>{animal.alta_pendiente_traslado ? <Text style={style.notice}>Alta veterinaria registrada · falta el traslado físico</Text> : null}</View>)}
    {!loading && !error && filtered.length === 0 ? <Empty title={query ? 'No encontramos animales' : 'Todavía no hay animales'} text={query ? 'Probá buscar por identificador, nombre, raza o corral.' : 'Los animales activos de la estancia aparecerán acá.'} /> : null}
    <Modal animationType="fade" onRequestClose={() => setEditing(null)} transparent visible={Boolean(editing)}><View style={style.backdrop}><View style={style.modal}><Text style={style.title}>Editar ficha del animal</Text><TextInput accessibilityLabel="Nombre" onChangeText={setEditName} placeholder="Nombre" style={style.notesInput} value={editName} /><TextInput accessibilityLabel="Identificador" onChangeText={setEditIdentifier} placeholder="Identificador" style={style.notesInput} value={editIdentifier} /><TextInput accessibilityLabel="Fecha de nacimiento" onChangeText={setEditBirth} placeholder="AAAA-MM-DD" style={style.notesInput} value={editBirth} />{editError ? <Text style={style.error}>{editError}</Text> : null}<View style={style.modalActions}><Pressable onPress={() => setEditing(null)} style={style.cancelButton}><Text style={style.cancelText}>Cancelar</Text></Pressable><Pressable onPress={() => void persistAnimal()} style={style.confirmButton}><Text style={style.confirmText}>Guardar cambios</Text></Pressable></View></View></View></Modal>
    <Modal animationType="fade" onRequestClose={() => setMoving(null)} transparent visible={Boolean(moving)}><View style={style.backdrop}><View style={style.modal}><Text style={style.title}>Mover animal</Text><Text style={style.detail}>{moving?.nombre || moving?.identificador} · ubicación actual: {moving?.corral}</Text><Text style={style.selectLabel}>SELECCIONÁ EL CORRAL DE DESTINO</Text>{corrals.filter((corral) => corral.id_corral !== moving?.id_corral && (session?.usuario.rol.toLowerCase() !== 'peon' || !corrals.find((source) => source.id_corral === moving?.id_corral)?.es_enfermeria || Boolean(corral.es_enfermeria))).map((corral) => <Pressable key={corral.id_corral} onPress={() => setDestination(corral.id_corral)} style={[style.destination, destination === corral.id_corral && style.destinationSelected]}><Text style={[style.destinationText, destination === corral.id_corral && style.destinationTextSelected]}>{corral.nombre}</Text><Text style={[style.detail, destination === corral.id_corral && style.destinationTextSelected]}>{corral.ocupacion}/{corral.capacidad} animales</Text></Pressable>)}{moveError ? <Text style={style.error}>{moveError}</Text> : null}<View style={style.modalActions}><Pressable onPress={() => setMoving(null)} style={style.cancelButton}><Text style={style.cancelText}>Cancelar</Text></Pressable><Pressable disabled={!destination || saving} onPress={() => void saveMovement()} style={[style.confirmButton, (!destination || saving) && style.disabledButton]}><Text style={style.confirmText}>{saving ? 'Guardando…' : 'Confirmar traslado'}</Text></Pressable></View></View></View></Modal>
    <AnimalCreateModal visible={creating} corrals={corrals} onClose={() => setCreating(false)} onCreated={() => { setLoading(true); void load(); }} />
    <AnimalWeightModal animal={weighing} onClose={() => setWeighing(null)} onSaved={() => { setLoading(true); void load(); }} />
  </InventoryPage>;

  async function saveMovement(): Promise<void> {
    if (!session || !moving || !destination) return;
    setSaving(true); setMoveError('');
    try { await moveAnimal(session, moving.id_animal, destination); setMoving(null); setLoading(true); await load(); }
    catch (cause) { setMoveError(cause instanceof Error ? cause.message : 'No se pudo registrar el traslado.'); }
    finally { setSaving(false); }
  }

  async function persistAnimal(): Promise<void> {
    if (!session || !editing || !editIdentifier.trim()) { setEditError('El identificador es obligatorio.'); return; }
    try { await updateAnimal(session, editing, { nombre: editName.trim(), identificador: editIdentifier.trim(), fecha_nacimiento: editBirth.trim() }); setEditing(null); setLoading(true); await load(); }
    catch (cause) { setEditError(cause instanceof Error ? cause.message : 'No se pudo guardar la ficha.'); }
  }
}

// consulto ocupación y capacidad de cada corral activo.
export function CorralsInventoryScreen() {
  const { session } = useSession();
  const [rows, setRows] = useState<CorralRecord[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const role = session?.usuario.rol.toLowerCase();
  const canManage = role === 'dueno' || role === 'administrador' || role === 'copropietario';
  const [editing, setEditing] = useState<CorralRecord | null | false>(false);
  const [deleting, setDeleting] = useState<CorralRecord | null>(null);
  const [corralName, setCorralName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [actionError, setActionError] = useState('');
  const [savingCorral, setSavingCorral] = useState(false);
  const load = useCallback(async () => {
    if (!session) return;
    try { setRows(await listCorrals(session)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo cargar la lista de corrales.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, [session]);
  useEffect(() => {
    if (!session) return;
    let active = true;
    listCorrals(session).then((data) => { if (active) setRows(data); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'No se pudo cargar la lista de corrales.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session]);
  const filtered = useMemo(() => rows.filter((corral) => corral.nombre.toLowerCase().includes(query.trim().toLowerCase())), [query, rows]);
  return <InventoryPage title="Corrales" subtitle="OCUPACIÓN Y CAPACIDAD" count={filtered.length} search={query} onSearch={setQuery} loading={loading} error={error} onRetry={() => { setLoading(true); void load(); }} onRefresh={() => { setRefreshing(true); void load(); }} refreshing={refreshing}>
    {canManage ? <Pressable onPress={() => { setEditing(null); setCorralName(''); setCapacity(''); setActionError(''); }} style={style.confirmButton}><Text style={style.confirmText}>＋ Crear corral</Text></Pressable> : null}
    {actionError ? <Text style={style.error}>{actionError}</Text> : null}
    {filtered.map((corral) => { const occupancy = Number(corral.ocupacion); const maxCapacity = Number(corral.capacidad); const ratio = maxCapacity ? Math.min(occupancy / maxCapacity, 1) : 0; return <View key={corral.id_corral} style={style.card}><View style={style.row}><View style={style.badge}><Text style={style.badgeText}>{corral.es_enfermeria ? '✚' : '▦'}</Text></View><View style={{ flex: 1 }}><Text style={style.title}>{corral.nombre}</Text><Text style={style.detail}>{corral.es_enfermeria ? 'Corral de enfermería' : 'Corral operativo'}</Text></View><Text style={style.occupancy}>{occupancy}<Text style={style.detail}> / {maxCapacity}</Text></Text></View><View style={style.track}><View style={[style.progress, ratio >= 0.9 && style.progressHigh, { width: `${ratio * 100}%` }]} /></View><Text style={style.detail}>Ocupación · {Math.round(ratio * 100)}%</Text>{canManage && !corral.es_enfermeria ? <View style={style.modalActions}><Pressable onPress={() => { setEditing(corral); setCorralName(corral.nombre); setCapacity(String(corral.capacidad)); setActionError(''); }} style={style.moveButton}><Text style={style.moveButtonText}>Editar</Text></Pressable><Pressable onPress={() => { setDeleting(corral); setActionError(''); }} style={style.cancelButton}><Text style={style.cancelText}>Dar de baja</Text></Pressable></View> : null}</View>; })}
    {!loading && !error && filtered.length === 0 ? <Empty title={query ? 'No encontramos corrales' : 'Todavía no hay corrales'} text={query ? 'Probá con otro nombre.' : 'Los corrales activos de la estancia aparecerán acá.'} /> : null}
    <Modal animationType="fade" onRequestClose={() => setEditing(false)} transparent visible={editing !== false}><View style={style.backdrop}><View style={style.modal}><Text style={style.title}>{editing ? 'Editar corral' : 'Nuevo corral'}</Text><Text style={style.selectLabel}>NOMBRE</Text><TextInput onChangeText={setCorralName} placeholder="Ej. Potrero norte" style={style.notesInput} value={corralName} /><Text style={style.selectLabel}>CAPACIDAD</Text><TextInput keyboardType="number-pad" onChangeText={setCapacity} placeholder="Cantidad de animales" style={style.notesInput} value={capacity} />{actionError ? <Text style={style.error}>{actionError}</Text> : null}<View style={style.modalActions}><Pressable onPress={() => setEditing(false)} style={style.cancelButton}><Text style={style.cancelText}>Cancelar</Text></Pressable><Pressable disabled={savingCorral} onPress={() => void persist()} style={style.confirmButton}><Text style={style.confirmText}>{savingCorral ? 'Guardando…' : 'Guardar corral'}</Text></Pressable></View></View></View></Modal>
    <Modal animationType="fade" onRequestClose={() => setDeleting(null)} transparent visible={Boolean(deleting)}><View style={style.backdrop}><View style={style.modal}><Text style={style.title}>Dar de baja {deleting?.nombre}</Text><Text style={style.detail}>{Number(deleting?.ocupacion ?? 0) > 0 ? `Primero trasladá los ${deleting?.ocupacion} animales asignados a otro corral.` : 'El corral quedará inactivo y se conservará el historial.'}</Text>{actionError ? <Text style={style.error}>{actionError}</Text> : null}<View style={style.modalActions}><Pressable onPress={() => setDeleting(null)} style={style.cancelButton}><Text style={style.cancelText}>Cancelar</Text></Pressable><Pressable disabled={savingCorral || Number(deleting?.ocupacion ?? 0) > 0} onPress={() => deleting && void remove(deleting)} style={[style.confirmButton, Number(deleting?.ocupacion ?? 0) > 0 && style.disabledButton]}><Text style={style.confirmText}>{savingCorral ? 'Procesando…' : 'Confirmar baja'}</Text></Pressable></View></View></View></Modal>
  </InventoryPage>;

  async function persist(): Promise<void> {
    if (!session || !corralName.trim() || !Number.isInteger(Number(capacity)) || Number(capacity) < 1) { setActionError('Ingresá un nombre y una capacidad válida.'); return; }
    setSavingCorral(true); setActionError('');
    try { await saveCorral(session, { ...(editing ? { id_corral: editing.id_corral } : {}), nombre: corralName.trim(), capacidad: Number(capacity) }); setEditing(false); await load(); }
    catch (cause) { setActionError(cause instanceof Error ? cause.message : 'No se pudo guardar el corral.'); }
    finally { setSavingCorral(false); }
  }

  async function remove(corral: CorralRecord): Promise<void> {
    if (!session) return;
    setActionError('');
    setSavingCorral(true);
    try { await deleteCorral(session, corral.id_corral); setDeleting(null); await load(); }
    catch (cause) { setActionError(cause instanceof Error ? cause.message : 'No se pudo dar de baja el corral.'); }
    finally { setSavingCorral(false); }
  }
  
}

// permito al veterinario registrar el alta sin alterar la ubicación física.
export function NursingScreen() {
  const { session } = useSession();
  const [rows, setRows] = useState<NursingAnimalRecord[]>([]);
  const [selected, setSelected] = useState<NursingAnimalRecord | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    if (!session) return;
    try { setRows(await listNursingAnimals(session)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo cargar enfermería.'); }
    finally { setLoading(false); }
  }, [session]);
  useEffect(() => {
    if (!session) return;
    let active = true;
    listNursingAnimals(session).then((data) => { if (active) setRows(data); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'No se pudo cargar enfermería.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session]);
  async function confirmDischarge(): Promise<void> {
    if (!session || !selected) return;
    setSaving(true); setError('');
    try { await dischargeAnimal(session, selected.id_animal, notes); setSelected(null); setNotes(''); setLoading(true); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo registrar el alta.'); }
    finally { setSaving(false); }
  }
  return <InventoryPage title="Enfermería" subtitle="SEGUIMIENTO VETERINARIO" count={rows.length} search="" onSearch={() => undefined} loading={loading} error={error} onRetry={() => { setLoading(true); void load(); }} onRefresh={() => { setLoading(true); void load(); }} refreshing={false}>
    {rows.map((animal) => <View key={animal.id_animal} style={style.card}><View style={style.row}><View style={style.badge}><Text style={style.badgeText}>✚</Text></View><View style={{ flex: 1 }}><Text style={style.title}>{animal.nombre || animal.identificador}</Text><Text style={style.detail}>{animal.identificador} · {animal.especie} {animal.raza}</Text></View><Text style={[style.state, animal.estado_salud !== 'sano' && style.stateAlert]}>{animal.estado_salud.replaceAll('_', ' ')}</Text></View><Text style={style.detail}>Ubicación: {animal.corral} · {animal.peso_kg == null ? 'Sin peso registrado' : `${animal.peso_kg} kg`}</Text>{animal.reporte_sanitario ? <Text style={style.notice}>Reporte del peón: {animal.reporte_sanitario}</Text> : null}{animal.alta_pendiente_traslado ? <Text style={style.notice}>Alta registrada · esperando traslado del peón</Text> : <Pressable onPress={() => { setSelected(animal); setNotes(''); setError(''); }} style={style.dischargeButton}><Text style={style.dischargeText}>Registrar alta y avisar al peón</Text></Pressable>}</View>)}
    {!loading && !error && rows.length === 0 ? <Empty title="Enfermería está vacía" text="Los animales trasladados a enfermería aparecerán acá." /> : null}
    <Modal animationType="fade" onRequestClose={() => setSelected(null)} transparent visible={Boolean(selected)}><View style={style.backdrop}><View style={style.modal}><Text style={style.title}>Registrar alta veterinaria</Text><Text style={style.detail}>{selected?.nombre || selected?.identificador} sigue en enfermería hasta que el peón haga el traslado físico.</Text><TextInput accessibilityLabel="Observaciones del alta" multiline onChangeText={setNotes} placeholder="Indicaciones para el equipo de campo (opcional)" placeholderTextColor={color.muted} style={style.notesInput} value={notes} /><View style={style.modalActions}><Pressable onPress={() => setSelected(null)} style={style.cancelButton}><Text style={style.cancelText}>Cancelar</Text></Pressable><Pressable disabled={saving} onPress={() => void confirmDischarge()} style={style.confirmButton}><Text style={style.confirmText}>{saving ? 'Guardando…' : 'Dar el alta y avisar'}</Text></Pressable></View></View></View></Modal>
  </InventoryPage>;
}

// muestro avisos del equipo y abro el inventario cuando requieren traslado.
export function NotificationsScreen() {
  const { session } = useSession();
  const [rows, setRows] = useState<NotificationRecord[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!session) return;
    let active = true;
    listNotifications(session).then((data) => { if (active) setRows(data); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los avisos.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session]);
  async function reload(): Promise<void> {
    if (!session) return;
    setLoading(true); setError('');
    try { setRows(await listNotifications(session)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los avisos.'); }
    finally { setLoading(false); }
  }
  return <InventoryPage title="Avisos" subtitle="NOVEDADES DE LA ESTANCIA" count={rows.length} search="" onSearch={() => undefined} loading={loading} error={error} onRetry={() => void reload()} onRefresh={() => void reload()} refreshing={false}>
    {rows.map((notice) => <Pressable key={notice.id_notificacion} onPress={() => { if (notice.tipo === 'alta_enfermeria') router.navigate('/(app)/animals'); if (notice.tipo === 'reporte_sanitario') router.navigate('/(app)/health'); }} style={style.card}><Text style={style.title}>{notice.titulo}</Text><Text style={style.detail}>{notice.mensaje}</Text><Text style={style.noticeDate}>{new Date(notice.created_at).toLocaleString('es-AR')}</Text>{notice.tipo === 'alta_enfermeria' ? <Text style={style.notice}>Abrir animales y registrar el traslado</Text> : notice.tipo === 'reporte_sanitario' ? <Text style={style.notice}>Abrir reporte del campo</Text> : null}</Pressable>)}
    {!loading && !error && rows.length === 0 ? <Empty title="Sin avisos nuevos" text="Las novedades de la estancia aparecerán acá." /> : null}
  </InventoryPage>;
}

// presento estados de carga, error y contenido con refresco manual.
function InventoryPage({ title, subtitle, count, search, onSearch, loading, error, onRetry, onRefresh, refreshing, children }: { title: string; subtitle: string; count: number; search: string; onSearch: (value: string) => void; loading: boolean; error: string; onRetry: () => void; onRefresh: () => void; refreshing: boolean; children: React.ReactNode }) {
  return <SafeAreaView edges={['bottom','left','right']} style={style.safe}><ScrollView contentContainerStyle={style.page} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.green} />}><Text style={style.heading}>{title}</Text><Text style={style.subtitle}>{subtitle}</Text><View style={style.top}><Text style={style.count}>{count} registros</Text></View><TextInput accessibilityLabel={`Buscar ${title.toLowerCase()}`} onChangeText={onSearch} placeholder={`Buscar ${title.toLowerCase()}…`} placeholderTextColor={color.muted} style={style.search} value={search} />{loading ? <View style={style.message}><ActivityIndicator color={color.green} /><Text style={style.detail}>Cargando datos…</Text></View> : error ? <View style={style.empty}><Text style={style.title}>No se pudo cargar</Text><Text style={style.detail}>{error}</Text><Pressable accessibilityRole="button" onPress={onRetry} style={style.retry}><Text style={style.retryText}>Reintentar</Text></Pressable></View> : children}</ScrollView></SafeAreaView>;
}

// explico por qué la lista no muestra registros.
function Empty({ title, text }: { title: string; text: string }) { return <View style={style.empty}><Text style={style.title}>{title}</Text><Text style={style.detail}>{text}</Text></View>; }

const style = StyleSheet.create({ safe: { backgroundColor: color.canvas, flex: 1 }, page: { padding: 20, paddingBottom: 34 }, brand: { color: color.green, fontSize: 14, fontWeight: '800', marginBottom: 22 }, heading: { color: color.ink, fontSize: 25, fontWeight: '800' }, subtitle: { color: color.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1, marginTop: 5 }, top: { marginBottom: 10, marginTop: 23 }, count: { color: color.ink, fontSize: 13, fontWeight: '700' }, search: { backgroundColor: color.white, borderColor: color.line, borderRadius: 11, borderWidth: 1, color: color.ink, fontSize: 13, height: 46, marginBottom: 14, paddingHorizontal: 13 }, card: { backgroundColor: color.white, borderColor: color.line, borderRadius: 14, borderWidth: 1, marginBottom: 10, padding: 14 }, row: { alignItems: 'center', flexDirection: 'row', gap: 10 }, badge: { alignItems: 'center', backgroundColor: color.pale, borderRadius: 11, height: 38, justifyContent: 'center', width: 38 }, badgeText: { color: color.green, fontSize: 16 }, title: { color: color.ink, fontSize: 13, fontWeight: '700' }, detail: { color: color.muted, fontSize: 10, lineHeight: 15, marginTop: 4 }, state: { backgroundColor: '#eaf2e8', borderRadius: 12, color: color.green, fontSize: 9, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 5, textTransform: 'capitalize' }, stateAlert: { backgroundColor: '#fff0ed', color: color.red }, divider: { backgroundColor: color.line, height: StyleSheet.hairlineWidth, marginVertical: 11 }, occupancy: { color: color.ink, fontSize: 17, fontWeight: '800' }, track: { backgroundColor: '#edf0eb', borderRadius: 5, height: 7, marginBottom: 7, marginTop: 13, overflow: 'hidden' }, progress: { backgroundColor: '#78a06d', borderRadius: 5, height: 7 }, progressHigh: { backgroundColor: '#c29343' }, empty: { alignItems: 'center', backgroundColor: color.white, borderColor: color.line, borderRadius: 14, borderWidth: 1, marginTop: 4, padding: 23 }, message: { alignItems: 'center', gap: 10, padding: 28 }, retry: { backgroundColor: color.green, borderRadius: 9, marginTop: 13, paddingHorizontal: 15, paddingVertical: 9 }, retryText: { color: color.white, fontSize: 11, fontWeight: '700' }, moveButton: { backgroundColor: color.pale, borderRadius: 8, paddingHorizontal: 11, paddingVertical: 7 }, moveButtonText: { color: color.green, fontSize: 10, fontWeight: '800' }, backdrop: { alignItems: 'center', backgroundColor: 'rgba(20,35,25,0.5)', flex: 1, justifyContent: 'center', padding: 20 }, modal: { backgroundColor: color.white, borderRadius: 18, maxHeight: '85%', padding: 18, width: '100%' }, selectLabel: { color: color.muted, fontSize: 8, fontWeight: '800', letterSpacing: 0.8, marginBottom: 9, marginTop: 17 }, destination: { borderColor: color.line, borderRadius: 10, borderWidth: 1, marginBottom: 7, padding: 11 }, destinationSelected: { backgroundColor: color.green, borderColor: color.green }, destinationText: { color: color.ink, fontSize: 11, fontWeight: '700' }, destinationTextSelected: { color: color.white }, error: { color: color.red, fontSize: 10, marginTop: 8 }, modalActions: { flexDirection: 'row', gap: 9, justifyContent: 'flex-end', marginTop: 14 }, cancelButton: { borderColor: color.line, borderRadius: 9, borderWidth: 1, justifyContent: 'center', paddingHorizontal: 11, paddingVertical: 9 }, cancelText: { color: color.muted, fontSize: 10, fontWeight: '700' }, confirmButton: { backgroundColor: color.green, borderRadius: 9, justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 9 }, confirmText: { color: color.white, fontSize: 10, fontWeight: '700' }, disabledButton: { opacity: 0.5 }, notice: { backgroundColor: '#fff4dc', borderRadius: 8, color: '#73531e', fontSize: 10, fontWeight: '700', marginTop: 9, overflow: 'hidden', padding: 9 }, noticeDate: { color: color.muted, fontSize: 9, marginTop: 9 }, dischargeButton: { alignItems: 'center', backgroundColor: color.green, borderRadius: 9, marginTop: 12, padding: 10 }, dischargeText: { color: color.white, fontSize: 10, fontWeight: '700' }, notesInput: { backgroundColor: color.canvas, borderColor: color.line, borderRadius: 9, borderWidth: 1, color: color.ink, fontSize: 11, marginTop: 14, minHeight: 74, padding: 10, textAlignVertical: 'top' } });
