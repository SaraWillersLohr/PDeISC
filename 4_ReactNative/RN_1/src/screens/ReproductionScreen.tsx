// Archivo src/screens/ReproductionScreen.tsx: registra y consulta eventos de servicio, gestación y cría.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { FarmButton, FarmCard, FarmEmpty, FarmModal, FarmPageHeader, FarmPicker, FarmTextField } from '../components/FarmComponents';
import { useFeedback } from '../components/FeedbackProvider';
import { createReproductionEvent, listAnimals, listReproductionEvents } from '../services/farmApi';
import type { Animal, ReproductionEvent, ReproductionEventType, ReproductionResult } from '../types/domain';
import { useAppDarkMode } from '../components/AppTheme';

// Contrato ReproductionScreenProps: el token identifica la sesión y el rol habilita las acciones de registro.
interface ReproductionScreenProps { token: string; }

// Esta función organiza el historial del rodeo y permite capturar las etapas reproductivas desde el móvil.
export function ReproductionScreen({ token }: ReproductionScreenProps) {
  const styles = getReproductionStyles(useAppDarkMode());
  const { showMessage } = useFeedback();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [events, setEvents] = useState<ReproductionEvent[]>([]);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ReproductionEventType>('servicio');
  const [damId, setDamId] = useState<string | number>('');
  const [sireId, setSireId] = useState<string | number>('');
  const [calfId, setCalfId] = useState<string | number>('');
  const [date, setDate] = useState(localDateToday());
  const [result, setResult] = useState<ReproductionResult | string>('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // Esta función carga los animales y eventos con llamadas paralelas, y muestra los errores con mensajes de la app.
  const load = useCallback(async () => {
    setBusy(true);
    try { const [animalRows, eventRows] = await Promise.all([listAnimals(token), listReproductionEvents(token)]); setAnimals(animalRows); setEvents(eventRows); }
    catch (error) { showMessage('No se pudo cargar Reproducción', error instanceof Error ? error.message : 'Error de conexión.', 'error'); }
    finally { setBusy(false); }
  }, [token, showMessage]);
  useEffect(() => { void load(); }, [load]);

  const females = useMemo(() => animals.filter((animal) => animal.sexo === 'hembra'), [animals]);
  const selectedDam = females.find((animal) => animal.id_animal === Number(damId));
  const males = animals.filter((animal) => animal.sexo === 'macho' && (!selectedDam || animal.id_especie === selectedDam.id_especie));
  const calves = animals.filter((animal) => animal.id_madre === selectedDam?.id_animal);
  const upcoming = useMemo(() => {
    const latestByFemale = new Map<number, ReproductionEvent>();
    for (const event of events) if (!latestByFemale.has(event.id_animal)) latestByFemale.set(event.id_animal, event);
    const today = new Date(`${localDateToday()}T00:00:00`);
    const horizon = new Date(today); horizon.setDate(horizon.getDate() + 30);
    return [...latestByFemale.values()].filter((event) => event.tipo === 'diagnostico_gestacion' && event.resultado === 'prenada' && event.fecha_probable_parto)
      .map((event) => ({ event, remainingDays: Math.ceil((new Date(`${event.fecha_probable_parto}T00:00:00`).getTime() - today.getTime()) / 86_400_000) }))
      .filter(({ event, remainingDays }) => remainingDays <= 30 && event.fecha_probable_parto! <= `${horizon.getFullYear()}-${String(horizon.getMonth() + 1).padStart(2, '0')}-${String(horizon.getDate()).padStart(2, '0')}`)
      .sort((a, b) => a.remainingDays - b.remainingDays);
  }, [events]);

  // Esta función prepara el formulario para cada tipo, conservando la fecha local actual como valor inicial.
  const startForm = () => { setType('servicio'); setDamId(females[0]?.id_animal ?? ''); setSireId(''); setCalfId(''); setDate(localDateToday()); setResult(''); setDueDate(''); setNotes(''); setOpen(true); };

  // Esta función valida los campos necesarios y pide al backend aplicar las reglas de sexo, especie y fechas.
  const saveEvent = async () => {
    if (!damId || !date) { showMessage('Faltan datos', 'Elegí la hembra y la fecha del evento.', 'error'); return; }
    if (type === 'servicio' && !sireId) { showMessage('Falta el reproductor', 'Elegí el macho utilizado para el servicio.', 'error'); return; }
    if (type === 'destete' && !calfId) { showMessage('Falta la cría', 'Elegí la cría vinculada a esta madre para registrar el destete.', 'error'); return; }
    if (type === 'diagnostico_gestacion' && !result) { showMessage('Falta el resultado', 'Indicá si está preñada, vacía o el resultado es inconcluso.', 'error'); return; }
    if (type === 'diagnostico_gestacion' && result === 'prenada' && !dueDate) { showMessage('Falta la fecha probable', 'Ingresá la fecha estimada de parto para la gestación confirmada.', 'error'); return; }
    setSaving(true);
    try {
      await createReproductionEvent(token, { id_animal: Number(damId), id_reproductor: sireId ? Number(sireId) : null, id_cria: type === 'parto' || type === 'destete' ? calfId ? Number(calfId) : null : null, tipo: type, fecha_evento: date, resultado: result ? result as ReproductionResult : null, fecha_probable_parto: dueDate || null, observaciones: notes.trim() || null });
      setOpen(false); showMessage('Evento registrado', 'Quedó guardado en el historial reproductivo.', 'success'); await load();
    } catch (error) { showMessage('No se pudo registrar', error instanceof Error ? error.message : 'Error de API.', 'error'); }
    finally { setSaving(false); }
  };

  return <View>
    <FarmPageHeader title="Reproducción" subtitle="Registrá servicios, diagnósticos, partos, abortos y destetes con trazabilidad por hembra." />
    <FarmButton label="＋ Registrar evento" onPress={startForm} />
    {upcoming.length ? <FarmCard><Text style={styles.title}>Gestaciones próximas o vencidas</Text>{upcoming.map(({ event, remainingDays }) => <Text key={event.id_evento} style={styles.notice}>{event.animal_identificador}{event.animal_nombre ? ` · ${event.animal_nombre}` : ''} · {remainingDays < 0 ? `fecha estimada vencida hace ${Math.abs(remainingDays)} días` : remainingDays === 0 ? 'fecha estimada de parto hoy' : `parto estimado en ${remainingDays} días`}</Text>)}</FarmCard> : null}
    {busy ? <ActivityIndicator color="#315a3c" style={styles.loader} /> : events.length ? events.map((event) => <FarmCard key={event.id_evento}><View style={styles.row}><Text style={styles.title}>{EVENT_LABELS[event.tipo]}</Text><Text style={styles.badge}>{event.fecha_evento}</Text></View><Text style={styles.body}>{event.animal_identificador}{event.animal_nombre ? ` · ${event.animal_nombre}` : ''}{event.resultado ? ` · ${RESULT_LABELS[event.resultado]}` : ''}</Text>{event.reproductor_identificador ? <Text style={styles.body}>Reproductor: {event.reproductor_identificador}{event.reproductor_nombre ? ` · ${event.reproductor_nombre}` : ''}</Text> : null}{event.cria_identificador ? <Text style={styles.body}>Cría: {event.cria_identificador}{event.cria_nombre ? ` · ${event.cria_nombre}` : ''}</Text> : null}{event.fecha_probable_parto ? <Text style={styles.body}>Parto probable: {event.fecha_probable_parto}</Text> : null}{event.observaciones ? <Text style={styles.body}>{event.observaciones}</Text> : null}{event.usuario_nombre ? <Text style={styles.caption}>Registrado por {event.usuario_nombre}</Text> : null}</FarmCard>) : <FarmEmpty label="Todavía no hay eventos reproductivos registrados." />}
    <FarmModal visible={open} title="Nuevo evento reproductivo" onClose={() => { if (!saving) setOpen(false); }}>
      <FarmPicker label="Tipo de evento" value={type} options={EVENT_TYPES.map((item) => ({ label: item.label, value: item.value }))} onChange={(value) => { setType(value as ReproductionEventType); setResult(''); setDueDate(''); setSireId(''); setCalfId(''); }} />
      <FarmPicker label="Hembra" value={damId} options={females.map((animal) => ({ label: `${animal.identificador}${animal.nombre ? ` · ${animal.nombre}` : ''} · ${animal.especie_nombre}`, value: animal.id_animal }))} onChange={(value) => { setDamId(value); setSireId(''); setCalfId(''); }} emptyLabel="Elegir hembra" />
      {type === 'servicio' || type === 'inseminacion' || type === 'parto' ? <FarmPicker label={type === 'servicio' ? 'Macho utilizado' : type === 'inseminacion' ? 'Reproductor conocido (opcional)' : 'Padre conocido (opcional)'} value={sireId} options={males.map((animal) => ({ label: `${animal.identificador}${animal.nombre ? ` · ${animal.nombre}` : ''}`, value: animal.id_animal }))} onChange={setSireId} emptyLabel="Elegir reproductor" /> : null}
      {type === 'parto' || type === 'destete' ? <FarmPicker label={type === 'parto' ? 'Cría vinculada (opcional)' : 'Cría a destetar'} value={calfId} options={calves.map((animal) => ({ label: `${animal.identificador}${animal.nombre ? ` · ${animal.nombre}` : ''}`, value: animal.id_animal }))} onChange={setCalfId} emptyLabel={type === 'parto' ? 'Sin cría vinculada' : 'Elegir cría'} /> : null}
      <FarmTextField label="Fecha del evento (AAAA-MM-DD)" value={date} onChangeText={setDate} placeholder="2026-10-12" />
      {type === 'diagnostico_gestacion' ? <><FarmPicker label="Resultado" value={result} options={GESTATION_RESULTS.map((item) => ({ label: item.label, value: item.value }))} onChange={(value) => setResult(String(value))} emptyLabel="Elegir resultado" />{result === 'prenada' ? <FarmTextField label="Fecha probable de parto (AAAA-MM-DD)" value={dueDate} onChangeText={setDueDate} placeholder="2027-07-22" /> : null}</> : null}
      {type === 'parto' ? <FarmPicker label="Resultado del parto" value={result} options={PARTURITION_RESULTS.map((item) => ({ label: item.label, value: item.value }))} onChange={(value) => setResult(String(value))} emptyLabel="Sin especificar" /> : null}
      <FarmTextField label="Observaciones" value={notes} onChangeText={setNotes} multiline placeholder="Detalles, cantidad de crías, condición, etc." />
      <View style={styles.actions}><FarmButton label={saving ? 'Guardando…' : 'Guardar evento'} disabled={saving} onPress={() => void saveEvent()} /><FarmButton label="Cancelar" kind="secondary" disabled={saving} onPress={() => setOpen(false)} /></View>
    </FarmModal>
  </View>;
}

// Esta función usa la fecha del dispositivo en formato de base de datos sin convertir la hora a UTC.
function localDateToday(): string { const current = new Date(); return `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`; }

// Catálogos de traducción entre códigos persistidos y textos legibles en la app.
const EVENT_TYPES: { value: ReproductionEventType; label: string }[] = [
  { value: 'servicio', label: 'Servicio natural' }, { value: 'inseminacion', label: 'Inseminación artificial' },
  { value: 'diagnostico_gestacion', label: 'Diagnóstico de gestación' }, { value: 'parto', label: 'Parto' },
  { value: 'aborto', label: 'Aborto / pérdida' }, { value: 'destete', label: 'Destete' },
];
const EVENT_LABELS: Record<ReproductionEventType, string> = Object.fromEntries(EVENT_TYPES.map((item) => [item.value, item.label])) as Record<ReproductionEventType, string>;
const GESTATION_RESULTS: { value: ReproductionResult; label: string }[] = [{ value: 'prenada', label: 'Preñada' }, { value: 'vacia', label: 'Vacía' }, { value: 'inconcluso', label: 'Inconcluso' }];
const PARTURITION_RESULTS: { value: ReproductionResult; label: string }[] = [{ value: 'exitoso', label: 'Sin complicaciones registradas' }, { value: 'fallido', label: 'Con complicaciones / pérdida' }];
const RESULT_LABELS: Record<ReproductionResult, string> = { pendiente: 'Pendiente', prenada: 'Preñada', vacia: 'Vacía', inconcluso: 'Inconcluso', exitoso: 'Exitoso', fallido: 'Con complicaciones' };

// Estilos adaptables para la cronología, alertas de fecha probable y formularios reproductivos.
const styles = StyleSheet.create({ loader: { marginVertical: 24 }, row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, title: { color: '#263329', fontSize: 16, fontWeight: '800', flexShrink: 1 }, body: { color: '#59645a', fontSize: 14, lineHeight: 20, marginTop: 7 }, caption: { color: '#879087', fontSize: 12, marginTop: 8 }, badge: { color: '#315a3c', backgroundColor: '#edf4eb', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8, fontSize: 12, fontWeight: '700', overflow: 'hidden' }, notice: { color: '#5d4730', backgroundColor: '#fbf5e8', borderRadius: 9, padding: 10, marginTop: 8, lineHeight: 19 }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 } });

// Esta función conserva un fondo y texto contrastantes en cronologías y avisos reproductivos.
function getReproductionStyles(dark: boolean) {
  return dark ? { ...styles, title: { ...styles.title, color: '#f0f4ef' }, body: { ...styles.body, color: '#c5cec6' }, caption: { ...styles.caption, color: '#b0bbb2' }, badge: { ...styles.badge, color: '#dcebd9', backgroundColor: '#3c4a3f' }, notice: { ...styles.notice, color: '#f0dfbf', backgroundColor: '#4b4435' } } : styles;
}
