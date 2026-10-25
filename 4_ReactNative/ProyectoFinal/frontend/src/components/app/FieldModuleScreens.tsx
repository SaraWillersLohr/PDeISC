// muestro operaciones de campo conectadas a las APIs productivas.
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { createMatingService, createTask, listFieldEvents, listReproduction, listTasks, updateTask, type FieldEvent, type ReproductionData, type TaskRecord } from '../../services/modulesApi';
import { listMapAreas, saveMapArea, type MapArea, type MapPoint } from '../../services/productionApi';
import { BirthForm } from './BirthForm';
import { listOrganizationUsers, type OrganizationUser } from '../../services/organizationApi';

const palette = { green: '#214d35', ink: '#202c23', muted: '#748076', line: '#e5eae3', canvas: '#f4f6f1', white: '#fff', pale: '#e8efe5', red: '#a34b43' };

function Frame({ title, subtitle, children }: React.PropsWithChildren<{ title: string; subtitle: string }>) {
  const { isDark } = useTheme();
  return <SafeAreaView edges={['bottom','left','right']} style={[s.safe, isDark && { backgroundColor: '#101b14' }]}><ScrollView contentContainerStyle={s.page}><Text style={[s.heading, isDark && { color: '#f0fdf4' }]}>{title}</Text><Text style={[s.subtitle, isDark && { color: '#b5c5b8' }]}>{subtitle.toUpperCase()}</Text>{children}</ScrollView></SafeAreaView>;
}

export function TasksManagerScreen() {
  const { session } = useSession();
  const admin = session?.usuario.rol.toLowerCase() === 'administrador';
  const [rows, setRows] = useState<TaskRecord[]>([]); const [users, setUsers] = useState<OrganizationUser[]>([]); const [responsible, setResponsible] = useState<number | null>(null); const [title, setTitle] = useState(''); const [notes, setNotes] = useState('');
  const [due, setDue] = useState(''); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [message, setMessage] = useState('');
  const load = useCallback(async () => { if (!session) return; try { const [tasks, members] = await Promise.all([listTasks(session), admin ? listOrganizationUsers(session) : Promise.resolve([])]); setRows(tasks); setUsers(members); const fieldUsers = members.filter((user) => user.rol === 'peon' && user.activo); setResponsible((current) => current ?? fieldUsers[0]?.id_usuario ?? null); setMessage(''); } catch (e) { setMessage(e instanceof Error ? e.message : 'No se pudieron cargar las tareas.'); } finally { setLoading(false); } }, [session, admin]);
  useEffect(() => {
    if (!session) return;
    let active = true;
    Promise.all([listTasks(session), admin ? listOrganizationUsers(session) : Promise.resolve([])])
      .then(([tasks, members]) => {
        if (!active) return;
        setRows(tasks);
        setUsers(members);
        const fieldUsers = members.filter((user) => user.rol === 'peon' && user.activo);
        setResponsible((current) => current ?? fieldUsers[0]?.id_usuario ?? null);
        setMessage('');
      })
      .catch((e: unknown) => { if (active) setMessage(e instanceof Error ? e.message : 'No se pudieron cargar las tareas.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session, admin]);
  async function add(): Promise<void> { if (!session || !title.trim() || !responsible) { setMessage('Escribí un título y asigná la tarea a un peón activo.'); return; } setSaving(true); try { await createTask(session, { titulo: title.trim(), descripcion: notes.trim(), id_responsable: responsible, ...(due ? { fecha_vencimiento: due } : {}) }); setTitle(''); setNotes(''); setDue(''); await load(); } catch (e) { setMessage(e instanceof Error ? e.message : 'No se pudo crear la tarea.'); } finally { setSaving(false); } }
  async function change(row: TaskRecord): Promise<void> { if (!session) return; const next = row.estado === 'pendiente' ? 'en_progreso' : row.estado === 'en_progreso' ? 'completada' : 'pendiente'; try { await updateTask(session, row.id_tarea, next); await load(); } catch (e) { setMessage(e instanceof Error ? e.message : 'No se pudo actualizar la tarea.'); } }
  return <Frame title="Tareas" subtitle="Trabajo del equipo">
    {admin ? <View style={s.card}><Text style={s.cardTitle}>Nueva tarea</Text><TextInput accessibilityLabel="Título de tarea" onChangeText={setTitle} placeholder="Ej. Revisar lote 4" style={s.input} value={title} /><TextInput accessibilityLabel="Descripción de tarea" onChangeText={setNotes} placeholder="Detalle (opcional)" style={s.input} value={notes} /><TextInput accessibilityLabel="Fecha de vencimiento" onChangeText={setDue} placeholder="Fecha AAAA-MM-DD (opcional)" style={s.input} value={due} /><Text style={s.section}>Asignar al peón</Text><View style={s.row}>{users.filter((user) => user.rol === 'peon' && user.activo).map((user) => <Pressable key={user.id_usuario} onPress={() => setResponsible(user.id_usuario)} style={[s.badge, responsible === user.id_usuario && { backgroundColor: palette.green }]}><Text style={[s.copy, responsible === user.id_usuario && { color: palette.white }]}>{user.nombre} {user.apellido}</Text></Pressable>)}</View><Pressable disabled={saving || !responsible} onPress={() => void add()} style={s.primary}><Text style={s.primaryText}>{saving ? 'Guardando…' : 'Crear y asignar tarea'}</Text></Pressable></View> : null}
    {message ? <Text style={s.error}>{message}</Text> : null}{loading ? <ActivityIndicator color={palette.green} /> : rows.map((row) => <Pressable key={row.id_tarea} onPress={() => void change(row)} style={s.card}><View style={s.row}><Text style={[s.cardTitle, { flex: 1 }]}>{row.titulo}</Text><Text style={s.badge}>{row.estado.replace('_', ' ')}</Text></View>{row.descripcion ? <Text style={s.copy}>{row.descripcion}</Text> : null}<Text style={s.copy}>Responsable: {row.responsable ? `${row.responsable} ${row.apellido_responsable ?? ''}` : 'Sin asignar'}{row.fecha_vencimiento ? ` · vence ${String(row.fecha_vencimiento).slice(0, 10)}` : ''}</Text><Text style={s.action}>Tocá para avanzar el estado</Text></Pressable>)}
  </Frame>;
}

export function ReproductionScreen() {
  const { session } = useSession(); const [data, setData] = useState<ReproductionData>({ servicios: [], nacimientos: [] });
  const [mother, setMother] = useState(''); const [father, setFather] = useState(''); const [fatherName, setFatherName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); const [method, setMethod] = useState('Monta natural'); const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true); const [message, setMessage] = useState(''); const [saving, setSaving] = useState(false);
  const load = useCallback(async () => { if (!session) return; try { setData(await listReproduction(session)); setMessage(''); } catch (e) { setMessage(e instanceof Error ? e.message : 'No se pudo cargar reproducción.'); } finally { setLoading(false); } }, [session]);
  useEffect(() => {
    if (!session) return;
    let active = true;
    listReproduction(session)
      .then((result) => { if (active) { setData(result); setMessage(''); } })
      .catch((e: unknown) => { if (active) setMessage(e instanceof Error ? e.message : 'No se pudo cargar reproducción.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session]);
  async function addService(): Promise<void> { if (!session || !Number(mother) || (!Number(father) && !fatherName.trim())) { setMessage('Indicá la madre y el padre, por ID o nombre informado.'); return; } setSaving(true); try { await createMatingService(session, { id_madre: Number(mother), ...(Number(father) ? { id_padre: Number(father) } : { padre_texto: fatherName.trim() }), fecha: date, metodo: method, observaciones: notes }); setMother(''); setFather(''); setFatherName(''); setNotes(''); await load(); } catch (e) { setMessage(e instanceof Error ? e.message : 'No se pudo registrar el servicio.'); } finally { setSaving(false); } }
  return <Frame title="Reproducción" subtitle="Servicios y nacimientos">
    <View style={s.card}><Text style={s.cardTitle}>Registrar servicio de monta</Text><TextInput keyboardType="number-pad" onChangeText={setMother} placeholder="ID de la madre" style={s.input} value={mother} /><TextInput keyboardType="number-pad" onChangeText={setFather} placeholder="ID del padre (si está registrado)" style={s.input} value={father} /><TextInput onChangeText={setFatherName} placeholder="Nombre del padre si no está registrado" style={s.input} value={fatherName} /><TextInput onChangeText={setDate} placeholder="Fecha AAAA-MM-DD" style={s.input} value={date} /><TextInput onChangeText={setMethod} placeholder="Método" style={s.input} value={method} /><TextInput onChangeText={setNotes} placeholder="Observaciones" style={s.input} value={notes} /><Pressable disabled={saving} onPress={() => void addService()} style={s.primary}><Text style={s.primaryText}>{saving ? 'Guardando…' : 'Guardar servicio'}</Text></Pressable></View>
    <BirthForm onSaved={() => void load()} />
    {message ? <Text style={s.error}>{message}</Text> : null}{loading ? <ActivityIndicator color={palette.green} /> : <><Text style={s.section}>Servicios recientes · {data.servicios.length}</Text>{data.servicios.map((item) => <View key={item.id_servicio} style={s.card}><Text style={s.cardTitle}>{item.nombre_madre || item.madre} · {item.fecha.slice(0, 10)}</Text><Text style={s.copy}>Padre: {item.padre || item.padre_texto || 'Sin identificar'} · {item.metodo} · {item.estado}</Text>{item.observaciones ? <Text style={s.copy}>{item.observaciones}</Text> : null}</View>)}<Text style={s.section}>Nacimientos registrados · {data.nacimientos.length}</Text>{data.nacimientos.map((item) => <View key={item.id_nacimiento} style={s.card}><Text style={s.cardTitle}>{item.nombre_cria || item.cria} · {item.fecha.slice(0, 10)}</Text><Text style={s.copy}>Madre: {item.madre || item.madre_texto || 'Sin informar'} · Padre: {item.padre || item.padre_texto || 'Sin informar'}</Text></View>)}</>}
  </Frame>;
}

export function EventsScreen() {
  const { session } = useSession(); const [rows, setRows] = useState<FieldEvent[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { let active = true; if (!session) return () => { active = false; }; listFieldEvents(session).then((items) => { if (active) setRows(items); }).catch((e: unknown) => { if (active) setError(e instanceof Error ? e.message : 'No se pudieron cargar los eventos.'); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [session]);
  return <Frame title="Eventos" subtitle="Agenda del campo">{loading ? <ActivityIndicator color={palette.green} /> : error ? <Text style={s.error}>{error}</Text> : rows.length ? rows.map((item) => <View key={item.id_evento} style={s.card}><Text style={s.cardTitle}>{item.titulo}</Text><Text style={s.copy}>{item.fecha_inicio.slice(0, 10)}{item.fecha_fin ? ` al ${item.fecha_fin.slice(0, 10)}` : ''}{item.ubicacion ? ` · ${item.ubicacion}` : ''}</Text>{item.descripcion ? <Text style={s.copy}>{item.descripcion}</Text> : null}{item.fuente ? <Text style={s.action}>Fuente: {item.fuente}</Text> : null}</View>) : <View style={s.card}><Text style={s.cardTitle}>No hay eventos cargados</Text><Text style={s.copy}>La agenda se muestra cuando la organización incorpora eventos.</Text></View>}</Frame>;
}

export function MapAreasScreen() {
  const { session } = useSession(); const role = session?.usuario.rol.toLowerCase(); const canEdit = role === 'dueno' || role === 'administrador' || role === 'copropietario';
  const [areas, setAreas] = useState<MapArea[]>([]); const [selected, setSelected] = useState<MapArea | null>(null); const [pointsText, setPointsText] = useState('');
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [message, setMessage] = useState('');
  const load = useCallback(async () => { if (!session) return; try { setAreas(await listMapAreas(session)); setMessage(''); } catch (e) { setMessage(e instanceof Error ? e.message : 'No se pudo cargar el mapa.'); } finally { setLoading(false); } }, [session]);
  useEffect(() => {
    if (!session) return;
    let active = true;
    listMapAreas(session)
      .then((result) => { if (active) { setAreas(result); setMessage(''); } })
      .catch((e: unknown) => { if (active) setMessage(e instanceof Error ? e.message : 'No se pudo cargar el mapa.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session]);
  function select(area: MapArea): void { setSelected(area); const points = typeof area.puntos_mapa === 'string' ? JSON.parse(area.puntos_mapa) as MapPoint[] : area.puntos_mapa ?? []; setPointsText(points.map((p) => `${p.lat}, ${p.lon}`).join('\n')); }
  async function save(): Promise<void> {
    if (!session || !selected) return;
    const points = pointsText.split('\n').map((line) => line.split(',').map(Number)).filter((pair) => pair.length === 2).map(([lat, lon]) => ({ lat, lon }));
    if (points.length < 3 || points.some((p) => !Number.isFinite(p.lat) || !Number.isFinite(p.lon) || Math.abs(p.lat) > 90 || Math.abs(p.lon) > 180)) { setMessage('El perímetro necesita al menos tres puntos GPS válidos, uno por renglón.'); return; }
    setSaving(true); try { await saveMapArea(session, selected.id_corral, points); setSelected(null); await load(); } catch (e) { setMessage(e instanceof Error ? e.message : 'No se pudo guardar el perímetro.'); } finally { setSaving(false); }
  }
  return <Frame title="Mi campo" subtitle="Perímetros de corrales y potreros">{message ? <Text style={s.error}>{message}</Text> : null}{loading ? <ActivityIndicator color={palette.green} /> : areas.map((area) => { const count = typeof area.puntos_mapa === 'string' ? (JSON.parse(area.puntos_mapa) as MapPoint[]).length : area.puntos_mapa?.length ?? 0; return <View key={area.id_corral} style={s.card}><View style={s.row}><Text style={[s.cardTitle, { flex: 1 }]}>{area.nombre}</Text><Text style={s.badge}>{count ? `${count} puntos GPS` : 'Sin perímetro'}</Text></View>{canEdit ? <Pressable onPress={() => select(area)} style={s.primary}><Text style={s.primaryText}>{count ? 'Editar perímetro' : 'Cargar perímetro GPS'}</Text></Pressable> : null}</View>; })}
    {selected ? <View style={s.card}><Text style={s.cardTitle}>Puntos GPS · {selected.nombre}</Text><Text style={s.copy}>Ingresá latitud y longitud por línea (separadas por coma). Se guardará el perímetro del corral.</Text><TextInput multiline onChangeText={setPointsText} placeholder={'-34.60, -58.38\n-34.61, -58.37\n-34.60, -58.36'} style={[s.input, { height: 130, textAlignVertical: 'top' }]} value={pointsText} /><View style={s.row}><Pressable onPress={() => setSelected(null)} style={[s.primary, { flex: 1, backgroundColor: '#e8efe5' }]}><Text style={[s.primaryText, { color: palette.green }]}>Cancelar</Text></Pressable><Pressable disabled={saving} onPress={() => void save()} style={[s.primary, { flex: 1 }]}><Text style={s.primaryText}>{saving ? 'Guardando…' : 'Guardar puntos'}</Text></Pressable></View></View> : null}
  </Frame>;
}

const s = StyleSheet.create({ safe: { backgroundColor: palette.canvas, flex: 1 }, page: { padding: 20, paddingBottom: 40 }, brand: { color: palette.green, fontSize: 15, fontWeight: '900', marginBottom: 18 }, heading: { color: palette.ink, fontSize: 25, fontWeight: '800' }, subtitle: { color: palette.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1, marginTop: 5, marginBottom: 20 }, card: { backgroundColor: palette.white, borderColor: palette.line, borderRadius: 14, borderWidth: 1, marginBottom: 10, padding: 15 }, cardTitle: { color: palette.ink, fontSize: 13, fontWeight: '800' }, input: { backgroundColor: palette.white, borderColor: palette.line, borderRadius: 9, borderWidth: 1, color: palette.ink, fontSize: 12, height: 43, marginTop: 9, paddingHorizontal: 11 }, primary: { alignItems: 'center', backgroundColor: palette.green, borderRadius: 9, marginTop: 12, padding: 12 }, primaryText: { color: palette.white, fontSize: 11, fontWeight: '800' }, copy: { color: palette.muted, fontSize: 11, lineHeight: 17, marginTop: 7 }, error: { backgroundColor: '#fff0ed', borderRadius: 9, color: palette.red, fontSize: 11, marginBottom: 10, padding: 11 }, badge: { backgroundColor: palette.pale, borderRadius: 12, color: palette.green, fontSize: 9, overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 5, textTransform: 'capitalize' }, row: { alignItems: 'center', flexDirection: 'row', gap: 8 }, action: { color: palette.green, fontSize: 10, fontWeight: '700', marginTop: 8 }, section: { color: palette.ink, fontSize: 14, fontWeight: '800', marginBottom: 10, marginTop: 8 }, });
