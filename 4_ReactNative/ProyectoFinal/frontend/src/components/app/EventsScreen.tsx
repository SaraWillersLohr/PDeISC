// organizo los eventos de las especies activas y dejo las demás fuentes en espera.
import { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { friendlyErrorMessage } from '../../services/apiErrors';
import { listFieldEvents, type FieldEvent, type FieldEventsData } from '../../services/modulesApi';

type FilterKind = 'especie' | 'raza' | 'provincia';
const weekdays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

// convierto valores de fecha de mysql o iso en la misma clave local del calendario.
function dateKey(value: string): string {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value);
  return match?.[1] ?? '';
}

// genero una clave desde la fecha local para que el día argentino no cambie por utc.
function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function normalizeSpecies(value: string | null | undefined): string {
  const normalized = String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('es');
  if (/bovin|vaca|toro/.test(normalized)) return 'bovino';
  if (/equin|caball|yegua/.test(normalized)) return 'equino';
  if (/ovin|oveja|carnero/.test(normalized)) return 'ovino';
  if (/porcin|cerdo|chancho/.test(normalized)) return 'porcino';
  return normalized.replace(/s$/, '');
}

function displayTag(value: string | null | undefined): string {
  const text = String(value ?? '').trim();
  return text ? `${text[0].toLocaleUpperCase('es')}${text.slice(1)}` : '';
}

function displaySpecies(value: string): string {
  const names: Record<string, string> = { bovino: 'Bovinos', equino: 'Equinos', ovino: 'Ovinos', porcino: 'Porcinos' };
  return names[normalizeSpecies(value)] ?? displayTag(value);
}

// formateo una fecha sin cambiar su día por conversiones de zona horaria.
function displayDate(value: string): string {
  const key = dateKey(value);
  if (!key) return value;
  const [year, month, day] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(year, month - 1, day));
}

// construyo celdas del mes empezando el lunes para el calendario argentino.
function monthCells(month: Date): (number | null)[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7;
  return [...Array<(number | null)>(offset).fill(null), ...Array.from({ length: count }, (_, index) => index + 1)];
}

export function EventsScreen() {
  const { session } = useSession();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;
  const [data, setData] = useState<FieldEventsData>({ eventos: [], especies: [], razas: [], provincias: [], total_nacional: 0, fuentes: [] });
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(localDateKey(new Date()));
  const [filterKind, setFilterKind] = useState<FilterKind | null>(null);
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [allEvents, setAllEvents] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!session) return () => { active = false; };
    listFieldEvents(session, allEvents)
      .then((result) => { if (active) { setData(result); setError(''); } })
      .catch((cause: unknown) => { if (active) setError(friendlyErrorMessage(cause, 'No se pudieron cargar los eventos.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session, allEvents]);

  const filteredEvents = useMemo(() => data.eventos.filter((event) =>
    (!selectedSpecies || !event.especie || event.especie.toLocaleLowerCase('es') === selectedSpecies.toLocaleLowerCase('es')) &&
    (!selectedBreed || !event.raza || event.raza.toLocaleLowerCase('es') === selectedBreed.toLocaleLowerCase('es')) &&
    (!selectedProvince || event.provincia?.toLocaleLowerCase('es') === selectedProvince.toLocaleLowerCase('es')),
  ), [data.eventos, selectedSpecies, selectedBreed, selectedProvince]);
  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, FieldEvent[]>();
    for (const event of filteredEvents) {
      const startKey = dateKey(event.fecha_inicio);
      const endKey = dateKey(event.fecha_fin ?? event.fecha_inicio) || startKey;
      if (!startKey) continue;
      const cursor = new Date(`${startKey}T12:00:00`);
      const end = new Date(`${endKey}T12:00:00`);
      for (let day = 0; cursor <= end && day < 60; day += 1, cursor.setDate(cursor.getDate() + 1)) {
        const key = localDateKey(cursor);
        grouped.set(key, [...(grouped.get(key) ?? []), event]);
      }
    }
    return grouped;
  }, [filteredEvents]);
  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
  const todayKey = localDateKey(new Date());
  const monthEventCount = [...eventsByDate.entries()]
    .filter(([key]) => key.startsWith(`${monthKey}-`))
    .flatMap(([, events]) => events.map((event) => event.id_evento))
    .filter((id, index, all) => all.indexOf(id) === index).length;
  const selectedDayEvents = eventsByDate.get(selectedDate) ?? [];
  const sourceGroups = useMemo(() => {
    const activeSpecies = new Set(data.especies.map(normalizeSpecies));
    const groups = new Map<string, { especie: string; enEspera: boolean; fuentes: NonNullable<FieldEventsData['fuentes']> }>();
    for (const source of data.fuentes ?? []) {
      const especie = source.especie ?? 'Sin especie';
      const key = normalizeSpecies(especie) || 'sin-especie';
      const enEspera = !activeSpecies.has(key);
      const existing = groups.get(key) ?? { especie, enEspera, fuentes: [] };
      existing.fuentes.push(source);
      groups.set(key, existing);
    }
    return [...groups.values()].sort((a, b) => Number(a.enEspera) - Number(b.enEspera) || a.especie.localeCompare(b.especie, 'es'));
  }, [data.especies, data.fuentes]);
  const cells = monthCells(month);
  const filterOptions = filterKind === 'especie' ? data.especies : filterKind === 'raza' ? data.razas : data.provincias;
  const monthLabel = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(month);

  // cambio el mes visible y selecciono su primer día para actualizar el detalle.
  function changeMonth(offset: number): void {
    const next = new Date(month.getFullYear(), month.getMonth() + offset, 1);
    setMonth(next);
    setSelectedDate(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-01`);
  }

  // guardo la opción elegida sin modificar los demás filtros.
  function selectFilter(value: string): void {
    if (filterKind === 'especie') { setSelectedSpecies(value); setSelectedBreed(''); }
    if (filterKind === 'raza') setSelectedBreed(value);
    if (filterKind === 'provincia') setSelectedProvince(value);
    setFilterKind(null);
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.safe, { backgroundColor: colors.bgCanvas }]}>
      <ScrollView contentContainerStyle={[styles.page, isDesktop && styles.pageDesktop]}>
        <View style={[styles.inner, isDesktop && styles.innerDesktop]}>
          <Text style={[styles.heading, { color: colors.textMain }]}>Eventos ganaderos</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>CALENDARIO DE ASOCIACIONES DE CRIADORES</Text>

          <View style={styles.filterRow}>
            <FilterButton label={selectedSpecies || 'Especie'} active={Boolean(selectedSpecies)} onPress={() => setFilterKind('especie')} />
            <FilterButton label={selectedBreed || 'Raza'} active={Boolean(selectedBreed)} onPress={() => setFilterKind('raza')} />
            <FilterButton label={selectedProvince || 'Provincia'} active={Boolean(selectedProvince)} onPress={() => setFilterKind('provincia')} />
            {(selectedSpecies || selectedBreed || selectedProvince) ? <Pressable accessibilityRole="button" onPress={() => { setSelectedSpecies(''); setSelectedBreed(''); setSelectedProvince(''); }}><Text style={[styles.clearText, { color: colors.primary }]}>Limpiar</Text></Pressable> : null}
          </View>

          <Pressable accessibilityRole="switch" accessibilityState={{ checked: allEvents }} onPress={() => { setLoading(true); setAllEvents((current) => !current); }} style={[styles.scope, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Ionicons color={colors.primary} name={allEvents ? 'globe-outline' : 'sparkles-outline'} size={18} />
            <Text style={[styles.scopeText, { color: colors.textMain }]}>{allEvents ? 'Todos los eventos de mis especies' : 'Eventos de mis especies y razas'}</Text>
            <View style={[styles.toggle, allEvents && { backgroundColor: colors.primary }]}><View style={[styles.toggleDot, allEvents && styles.toggleDotOn]} /></View>
          </Pressable>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {loading ? <ActivityIndicator color={colors.primary} size="large" style={{ marginVertical: 20 }} /> : (
            <>
              <View style={[styles.calendar, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                <View style={styles.monthHeader}>
                  <Pressable accessibilityLabel="Mes anterior" onPress={() => changeMonth(-1)} style={styles.monthArrow}><Ionicons color={colors.textMain} name="chevron-back" size={20} /></Pressable>
                  <Text style={[styles.monthTitle, { color: colors.textMain }]}>{monthLabel}</Text>
                  <View style={styles.monthActions}><Pressable accessibilityRole="button" onPress={() => { const today = new Date(); setMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDate(todayKey); }}><Text style={[styles.todayText, { color: colors.primary }]}>Hoy</Text></Pressable><Pressable accessibilityLabel="Mes siguiente" onPress={() => changeMonth(1)} style={styles.monthArrow}><Ionicons color={colors.textMain} name="chevron-forward" size={20} /></Pressable></View>
                </View>
                <View style={styles.calendarGrid}>
                    {weekdays.map((day, index) => <Text key={`${day}-${index}`} style={[styles.weekday, { color: colors.textMuted }]}>{day}</Text>)}
                    {cells.map((day, index) => {
                      if (!day) return <View key={`blank-${index}`} style={styles.dayCell} />;
                      const key = `${monthKey}-${String(day).padStart(2, '0')}`;
                      const dayEvents = eventsByDate.get(key) ?? [];
                      const selected = key === selectedDate;
                      const visibleEvents = dayEvents.slice(0, 2);
                      return <View key={key} style={[styles.dayCell, selected && { backgroundColor: isDark ? '#23533d' : '#e9f4ec' }]}>
                        <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setSelectedDate(key)} style={styles.dayButton}>
                          <Text style={[styles.dayNumber, { color: selected ? colors.primary : colors.textMain }]}>{day}</Text>
                        </Pressable>
                        {visibleEvents.map((event) => <Pressable key={event.id_evento} accessibilityRole="button" accessibilityLabel={`${event.titulo}, ${displayDate(event.fecha_inicio)}`} onPress={() => setSelectedDate(key)} style={[styles.dayEvent, { backgroundColor: selected ? colors.bgCard : isDark ? '#214532' : '#eaf4ec' }]}>
                          <Text numberOfLines={1} style={[styles.dayEventTitle, { color: colors.textMain }]}>{event.titulo}</Text>
                        </Pressable>)}
                        {dayEvents.length > visibleEvents.length ? <Text style={[styles.dayEventMore, { color: selected ? colors.primary : colors.textMuted }]}>+{dayEvents.length - visibleEvents.length} más</Text> : null}
                      </View>;
                    })}
                  </View>
                <View style={[styles.calendarDetails, { borderTopColor: colors.border }]}>
                  <View style={styles.calendarDetailsHeader}>
                    <View><Text style={[styles.sectionTitle, { color: colors.textMain }]}>Eventos del {displayDate(selectedDate)}</Text><Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>{monthEventCount} eventos en {monthLabel}</Text></View>
                  </View>
                  {selectedDayEvents.length ? selectedDayEvents.map((event) => <EventCard key={event.id_evento} event={event} />) : <Text style={[styles.calendarEmpty, { color: colors.textMuted }]}>No hay eventos para este día. Los días con eventos muestran sus nombres en el calendario.</Text>}
                </View>
              </View>
              {sourceGroups.length ? <View style={[styles.sourceStatus, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
                <Text style={[styles.statusTitle, { color: colors.textMain }]}>Fuentes organizadas por especie</Text>
                {sourceGroups.some((group) => group.enEspera) ? <Text style={[styles.statusDetail, { color: colors.textMuted }]}>Las especies en espera quedan ocultas de la agenda hasta que la estancia las incorpore.</Text> : null}
                {sourceGroups.map((group) => <SourceGroup key={group.especie} title={displaySpecies(group.especie)} enEspera={group.enEspera} fuentes={group.fuentes} />)}
              </View> : null}
            </>
          )}
        </View>
      </ScrollView>

      <Modal animationType="fade" transparent visible={Boolean(filterKind)} onRequestClose={() => setFilterKind(null)}>
        <Pressable onPress={() => setFilterKind(null)} style={styles.modalBackdrop}>
          <Pressable onPress={(event) => event.stopPropagation()} style={[styles.modalCard, { backgroundColor: colors.bgCard }]}>
            <Text style={[styles.modalTitle, { color: colors.textMain }]}>{filterKind === 'especie' ? 'Filtrar por especie' : filterKind === 'raza' ? 'Filtrar por raza' : 'Filtrar por provincia'}</Text>
            <ScrollView style={styles.optionList}>
              <Option label="Todas" selected={!(filterKind === 'especie' ? selectedSpecies : filterKind === 'raza' ? selectedBreed : selectedProvince)} onPress={() => selectFilter('')} />
              {filterOptions.map((option) => <Option key={option} label={option} selected={option === (filterKind === 'especie' ? selectedSpecies : filterKind === 'raza' ? selectedBreed : selectedProvince)} onPress={() => selectFilter(option)} />)}
              {!filterOptions.length ? <Text style={[styles.emptyCopy, { color: colors.textMuted }]}>No hay opciones disponibles.</Text> : null}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// presento opciones de filtro en un cuadro compatible con móvil y web.
function FilterButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return <Pressable accessibilityRole="button" onPress={onPress} style={[styles.filterButton, { backgroundColor: colors.bgCard, borderColor: active ? colors.primary : colors.border }]}><Text numberOfLines={1} style={[styles.filterText, { color: active ? colors.primary : colors.textSecondary }]}>{label}</Text><Ionicons color={active ? colors.primary : colors.textMuted} name="chevron-down" size={14} /></Pressable>;
}

// dibujo una tarjeta con la fuente original para conservar trazabilidad.
function EventCard({ event }: { event: FieldEvent }) {
  const { colors } = useTheme();
  return <View style={[styles.eventCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
    <View style={styles.eventTop}><View style={[styles.eventIcon, { backgroundColor: '#fef3e7' }]}><Ionicons color="#b06d2c" name={event.tipo_evento === 'remate' ? 'pricetag-outline' : 'calendar-outline'} size={17} /></View><View style={{ flex: 1 }}><Pressable disabled={!event.url} accessibilityRole={event.url ? 'link' : undefined} onPress={() => event.url && void Linking.openURL(event.url).catch(() => undefined)}><Text style={[styles.eventTitle, { color: event.url ? colors.primary : colors.textMain }]}>{event.titulo}</Text></Pressable><Text style={[styles.eventMeta, { color: colors.textMuted }]}>{displayDate(event.fecha_inicio)}{event.fecha_fin && dateKey(event.fecha_fin) !== dateKey(event.fecha_inicio) ? ` al ${displayDate(event.fecha_fin)}` : ''}</Text></View></View>
    <Text style={[styles.eventMeta, { color: colors.textSecondary }]}>{[displayTag(event.tipo_evento), displayTag(event.especie), displayTag(event.raza), event.localidad, event.provincia, event.ubicacion].filter(Boolean).join(' · ') || 'Evento ganadero'}</Text>
    {event.descripcion ? <Text style={[styles.eventMeta, { color: colors.textSecondary }]}>{event.descripcion}</Text> : null}
    {(event.organizador || event.fuente) ? <Text style={[styles.eventMeta, { color: colors.textMuted }]}>{event.organizador ? `Organiza: ${event.organizador}` : ''}{event.organizador && event.fuente ? ' · ' : ''}{event.fuente ? `Fuente: ${event.fuente}` : ''}</Text> : null}
    {event.url ? <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(event.url!).catch(() => undefined)} style={styles.sourceLink}><Text style={[styles.source, { color: colors.primary }]}>Abrir evento y publicación oficial</Text><Ionicons color={colors.primary} name="open-outline" size={13} /></Pressable> : <Text style={[styles.eventMeta, { color: colors.textMuted }]}>La asociación no publicó un enlace directo para este evento.</Text>}
  </View>;
}

function SourceGroup({ title, enEspera, fuentes }: { title: string; enEspera: boolean; fuentes: NonNullable<FieldEventsData['fuentes']> }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(!enEspera);
  return <View style={[styles.sourceGroup, { borderColor: colors.border }]}>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen((value) => !value)} style={styles.sourceGroupHeader}>
      <View style={{ flex: 1 }}><Text style={[styles.sourceGroupTitle, { color: colors.textMain }]}>{title} · {enEspera ? 'En espera' : 'Activo'}</Text><Text style={[styles.statusDetail, { color: colors.textMuted }]}>{fuentes.length} fuente{fuentes.length === 1 ? '' : 's'}</Text></View>
      <Ionicons color={colors.textMuted} name={open ? 'chevron-up' : 'chevron-down'} size={17} />
    </Pressable>
    {open ? fuentes.map((source) => <View key={source.nombre} style={styles.statusRow}>
      <View style={{ flex: 1 }}><Text style={[styles.statusName, { color: colors.textSecondary }]}>{source.nombre}{source.raza ? ` · ${displayTag(source.raza)}` : ''}</Text><Text style={[styles.statusDetail, { color: colors.textMuted }]}>{source.consultada_en ? `Consultada ${displayDate(source.consultada_en)} · ${source.eventos_leidos ?? 0} eventos` : 'Pendiente de primera consulta'}{source.ultimo_error ? ` · ${source.ultimo_error}` : ''}</Text></View>
      <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(source.url).catch(() => undefined)}><Ionicons color={colors.primary} name="open-outline" size={16} /></Pressable>
    </View>) : null}
  </View>;
}

// muestro cada opción con el estado seleccionado del filtro.
function Option({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return <Pressable accessibilityRole="button" onPress={onPress} style={[styles.option, selected && { backgroundColor: colors.bgCanvas }]}><Text style={[styles.optionText, { color: colors.textMain }]}>{label}</Text>{selected ? <Ionicons color={colors.primary} name="checkmark" size={18} /> : null}</Pressable>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, page: { padding: 18, paddingBottom: 32 }, pageDesktop: { alignItems: 'center' }, inner: { width: '100%' }, innerDesktop: { maxWidth: 900 },
  heading: { fontSize: 27, fontWeight: '800', letterSpacing: -0.6 }, subtitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginTop: 5 },
  filterRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 }, filterButton: { alignItems: 'center', borderRadius: 18, borderWidth: 1, flexDirection: 'row', gap: 5, maxWidth: 180, paddingHorizontal: 11, paddingVertical: 8 }, filterText: { fontSize: 12, fontWeight: '700' }, clearText: { fontSize: 12, fontWeight: '700', padding: 8 },
  scope: { alignItems: 'center', borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 10, marginTop: 12, padding: 12 }, scopeText: { flex: 1, fontSize: 12, fontWeight: '700' }, toggle: { backgroundColor: '#9ca3af', borderRadius: 10, height: 20, justifyContent: 'center', padding: 2, width: 36 }, toggleDot: { backgroundColor: '#ffffff', borderRadius: 8, height: 16, width: 16 }, toggleDotOn: { alignSelf: 'flex-end' },
  calendar: { borderRadius: 16, borderWidth: 1, marginTop: 16, padding: 12 }, monthHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }, monthActions: { alignItems: 'center', flexDirection: 'row' }, todayText: { fontSize: 12, fontWeight: '800', paddingHorizontal: 8 }, monthArrow: { alignItems: 'center', height: 36, justifyContent: 'center', width: 40 }, monthTitle: { fontSize: 16, fontWeight: '800', textTransform: 'capitalize' }, calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', width: '100%' }, weekday: { alignItems: 'center', fontSize: 11, fontWeight: '800', paddingVertical: 8, textAlign: 'center', width: `${100 / 7}%` }, dayCell: { borderRadius: 8, marginBottom: 2, minHeight: 82, padding: 2, width: `${100 / 7}%` }, dayButton: { alignSelf: 'flex-start', minWidth: 24, padding: 3 }, dayNumber: { fontSize: 13, fontWeight: '700' }, dayEvent: { borderRadius: 4, marginTop: 2, paddingHorizontal: 2, paddingVertical: 2 }, dayEventTitle: { fontSize: 8, fontWeight: '700', lineHeight: 10 }, dayEventMore: { fontSize: 8, fontWeight: '700', marginTop: 2, textAlign: 'center' }, calendarDetails: { borderTopWidth: 1, marginTop: 12, paddingTop: 12 }, calendarDetailsHeader: { marginBottom: 10 }, calendarEmpty: { fontSize: 11, lineHeight: 16, paddingBottom: 4 }, sectionTitle: { fontSize: 17, fontWeight: '800', textTransform: 'capitalize' }, sectionSubtitle: { fontSize: 11, marginTop: 3 }, eventCard: { borderRadius: 14, borderWidth: 1, gap: 8, marginBottom: 10, padding: 14 }, eventTop: { alignItems: 'center', flexDirection: 'row', gap: 10 }, eventIcon: { alignItems: 'center', borderRadius: 10, height: 36, justifyContent: 'center', width: 36 }, eventTitle: { fontSize: 14, fontWeight: '800' }, eventMeta: { fontSize: 11, lineHeight: 16 }, source: { fontSize: 11, fontWeight: '700' }, sourceLink: { alignItems: 'center', flexDirection: 'row', gap: 4, alignSelf: 'flex-start' }, sourceStatus: { borderRadius: 14, borderWidth: 1, gap: 10, marginTop: 12, padding: 14 }, statusTitle: { fontSize: 13, fontWeight: '800' }, statusRow: { alignItems: 'center', flexDirection: 'row', gap: 10 }, statusName: { fontSize: 11, fontWeight: '700' }, statusDetail: { fontSize: 10, lineHeight: 15, marginTop: 2 }, sourceGroup: { borderTopWidth: 1, gap: 10, paddingTop: 10 }, sourceGroupHeader: { alignItems: 'center', flexDirection: 'row', gap: 10 }, sourceGroupTitle: { fontSize: 12, fontWeight: '800' },
  emptyCard: { alignItems: 'center', borderRadius: 14, borderWidth: 1, gap: 8, padding: 22 }, emptyTitle: { fontSize: 14, fontWeight: '800', textAlign: 'center' }, emptyCopy: { fontSize: 12, lineHeight: 17, textAlign: 'center' }, error: { color: '#b42318', fontSize: 12, marginTop: 12 },
  modalBackdrop: { alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.42)', flex: 1, justifyContent: 'center', padding: 20 }, modalCard: { borderRadius: 16, maxHeight: '70%', maxWidth: 480, padding: 18, width: '100%' }, modalTitle: { fontSize: 17, fontWeight: '800', marginBottom: 12 }, optionList: { maxHeight: 400 }, option: { alignItems: 'center', borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', minHeight: 44, paddingHorizontal: 10 }, optionText: { fontSize: 13, textTransform: 'capitalize' },
});
