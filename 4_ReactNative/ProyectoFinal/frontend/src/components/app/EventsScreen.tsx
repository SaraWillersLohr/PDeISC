// Muestro el calendario y separo la navegación del mes del detalle de cada evento.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Linking, Modal, NativeScrollEvent, NativeSyntheticEvent, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../../context/SessionContext';
import { useLiveChanges } from '../../context/LiveChangesContext';
import { useTheme } from '../../context/ThemeContext';
import { ScrollToTop } from './ScrollToTop';
import { friendlyErrorMessage } from '../../services/apiErrors';
import { listFieldEvents, type FieldEvent, type FieldEventsData } from '../../services/modulesApi';

type FilterKind = 'especie' | 'raza' | 'provincia';
// La fecha de origen permite volver a la lista del día desde un evento.
type EventSelection = { kind: 'day'; date: string } | { kind: 'event'; id: string; fromDate?: string };
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

function displayTag(value: string | null | undefined): string {
  const text = String(value ?? '').trim();
  return text ? `${text[0].toLocaleUpperCase('es')}${text.slice(1)}` : '';
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
  const revision = useLiveChanges();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;
  const scrollToTop = useRef<() => void>(() => {});
  const [showScrollTop, setShowScrollTop] = useState(false);
  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) { setShowScrollTop(event.nativeEvent.contentOffset.y > 320); }
  const [data, setData] = useState<FieldEventsData>({ eventos: [], especies: [], razas: [], provincias: [], total_nacional: 0 });
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(localDateKey(new Date()));
  const [selection, setSelection] = useState<EventSelection | null>(null);
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
  }, [session, allEvents, revision]);

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
  // Consulto los datos actuales para que el modal refleje cambios mientras está abierto.
  const modalEvents = selection?.kind === 'day' ? eventsByDate.get(selection.date) ?? [] : [];
  const modalEvent = selection?.kind === 'event' ? data.eventos.find((event) => event.id_evento === selection.id) : undefined;
  const cells = monthCells(month);
  const filterOptions = filterKind === 'especie' ? data.especies : filterKind === 'raza' ? data.razas : data.provincias;
  const monthLabel = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(month);

  // Resalto el primer día del nuevo mes sin abrir un modal.
  function changeMonth(offset: number): void {
    const next = new Date(month.getFullYear(), month.getMonth() + offset, 1);
    setMonth(next);
    setSelectedDate(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-01`);
  }

  // Un evento abre su ficha de inmediato. Varios eventos abren la lista del día.
  function openDay(date: string, events: FieldEvent[]): void {
    setSelectedDate(date);
    if (events.length === 1) setSelection({ kind: 'event', id: events[0].id_evento });
    if (events.length > 1) setSelection({ kind: 'day', date });
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
      <ScrollView ref={(instance) => { scrollToTop.current = () => instance?.scrollTo({ y: 0, animated: true }); }} onScroll={handleScroll} scrollEventThrottle={16} contentContainerStyle={[styles.page, isDesktop && styles.pageDesktop]}>
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
                        <Pressable accessibilityRole="button" accessibilityState={{ selected }} accessibilityLabel={displayDate(key)} onPress={() => openDay(key, dayEvents)} style={styles.dayButton}>
                          <Text style={[styles.dayNumber, { color: selected ? colors.primary : colors.textMain }]}>{day}</Text>
                        </Pressable>
                        {visibleEvents.map((event) => <Pressable key={event.id_evento} accessibilityRole="button" accessibilityLabel={`${event.titulo}, ${displayDate(event.fecha_inicio)}`} onPress={() => { setSelectedDate(key); setSelection({ kind: 'event', id: event.id_evento }); }} style={[styles.dayEvent, { backgroundColor: selected ? colors.bgCard : isDark ? '#214532' : '#eaf4ec' }]}>
                          <Text numberOfLines={1} style={[styles.dayEventTitle, { color: colors.textMain }]}>{event.titulo}</Text>
                        </Pressable>)}
                        {dayEvents.length > visibleEvents.length ? (
                          <Pressable accessibilityRole="button" accessibilityLabel={`Ver todos los eventos del ${displayDate(key)}`} onPress={() => openDay(key, dayEvents)}>
                            <Text style={[styles.dayEventMore, { color: selected ? colors.primary : colors.textMuted }]}>+{dayEvents.length - visibleEvents.length} más</Text>
                          </Pressable>
                        ) : null}
                      </View>;
                    })}
                  </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
      <ScrollToTop visible={showScrollTop} onPress={() => scrollToTop.current()} />

      {/* El modal conserva el mes, los filtros y la posición del calendario al cerrarse. */}
      <Modal animationType="fade" transparent visible={selection !== null} onRequestClose={() => setSelection(null)}>
        <View style={styles.modalBackdrop}>
          <Pressable accessible={false} importantForAccessibility="no" onPress={() => setSelection(null)} style={StyleSheet.absoluteFill} />
          <View accessibilityViewIsModal style={[styles.eventModal, { backgroundColor: colors.bgCard }]}>
            <View style={[styles.eventModalHeader, { borderBottomColor: colors.border }]}>
              <Text accessibilityRole="header" style={[styles.eventModalHeading, { color: colors.textMain }]}>
                {selection?.kind === 'day' ? `Eventos del ${displayDate(selection.date)}` : 'Detalle del evento'}
              </Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Cerrar eventos" onPress={() => setSelection(null)} style={styles.eventModalClose}>
                <Ionicons color={colors.textMain} name="close" size={24} />
              </Pressable>
            </View>
            <ScrollView style={styles.eventModalScroll} contentContainerStyle={styles.eventModalContent} key={selection?.kind === 'event' ? selection.id : selection?.date}>
              {selection?.kind === 'day' ? (
                modalEvents.length ? modalEvents.map((event) => (
                  <Pressable key={event.id_evento} accessibilityRole="button" onPress={() => setSelection({ kind: 'event', id: event.id_evento, fromDate: selection.date })} style={[styles.eventChoice, { borderColor: colors.border }]}>
                    <Text style={[styles.eventChoiceTitle, { color: colors.textMain }]}>{event.titulo}</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.primary} />
                  </Pressable>
                )) : <Text style={[styles.eventCopy, { color: colors.textMuted }]}>Ya no hay eventos disponibles para este día.</Text>
              ) : modalEvent ? <EventDetails key={modalEvent.id_evento} event={modalEvent} /> : (
                <Text style={[styles.eventCopy, { color: colors.textMuted }]}>El evento ya no está disponible.</Text>
              )}
              {selection?.kind === 'event' && selection.fromDate ? (
                <Pressable accessibilityRole="button" onPress={() => { if (selection.fromDate) setSelection({ kind: 'day', date: selection.fromDate }); }} style={styles.eventBack}>
                  <Ionicons name="chevron-back" size={18} color={colors.primary} />
                  <Text style={[styles.eventActionText, { color: colors.primary }]}>Volver a los eventos del día</Text>
                </Pressable>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>

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

// Conservo el enlace oficial dentro del detalle y aviso si no puede abrirse.
function EventDetails({ event }: { event: FieldEvent }) {
  const { colors } = useTheme();
  const [linkError, setLinkError] = useState(false);
  const endDate = event.fecha_fin && dateKey(event.fecha_fin) !== dateKey(event.fecha_inicio) ? event.fecha_fin : null;
  const location = [...new Set([event.ubicacion, event.localidad, event.provincia].filter(Boolean))].join(' · ');
  const category = [event.tipo_evento, event.especie, event.raza].map(displayTag).filter(Boolean).join(' · ');
  const officialUrl = event.url && /^https?:\/\//i.test(event.url) ? event.url : null;
  return (
    <View style={styles.eventDetails}>
      {category ? <Text style={[styles.eventCategory, { color: colors.primary }]}>{category}</Text> : null}
      <Text accessibilityRole="header" style={[styles.eventTitle, { color: colors.textMain }]}>{event.titulo}</Text>
      <View style={styles.eventInfoRow}>
        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
        <Text style={[styles.eventCopy, { color: colors.textMain }]}>{displayDate(event.fecha_inicio)}{endDate ? ` al ${displayDate(endDate)}` : ''}</Text>
      </View>
      {location ? (
        <View style={styles.eventInfoRow}>
          <Ionicons name="location-outline" size={20} color={colors.primary} />
          <Text style={[styles.eventCopy, { color: colors.textMain }]}>{location}</Text>
        </View>
      ) : null}
      {event.descripcion ? <Text style={[styles.eventCopy, { color: colors.textSecondary }]}>{event.descripcion}</Text> : null}
      {event.organizador ? <Text style={[styles.eventCopy, { color: colors.textSecondary }]}>Organiza: {event.organizador}</Text> : null}
      {event.fuente ? <Text style={[styles.eventCopy, { color: colors.textMuted }]}>Fuente: {event.fuente}</Text> : null}
      {officialUrl ? (
        <Pressable accessibilityRole="link" onPress={() => { setLinkError(false); void Linking.openURL(officialUrl).catch(() => setLinkError(true)); }} style={[styles.eventLink, { backgroundColor: colors.primary }]}>
          <Text style={[styles.eventActionText, { color: '#fff' }]}>Abrir publicación oficial</Text>
          <Ionicons name="open-outline" size={18} color="#fff" />
        </Pressable>
      ) : null}
      {linkError ? <Text accessibilityRole="alert" style={styles.error}>No se pudo abrir la publicación oficial.</Text> : null}
    </View>
  );
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
  calendar: { borderRadius: 16, borderWidth: 1, marginTop: 16, padding: 12 }, monthHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }, monthActions: { alignItems: 'center', flexDirection: 'row' }, todayText: { fontSize: 12, fontWeight: '800', paddingHorizontal: 8 }, monthArrow: { alignItems: 'center', height: 36, justifyContent: 'center', width: 40 }, monthTitle: { fontSize: 16, fontWeight: '800', textTransform: 'capitalize' }, calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', width: '100%' }, weekday: { alignItems: 'center', fontSize: 11, fontWeight: '800', paddingVertical: 8, textAlign: 'center', width: '14.285%', flexShrink: 0 }, dayCell: { borderRadius: 8, marginBottom: 2, minHeight: 82, padding: 2, width: '14.285%', flexShrink: 0 }, dayButton: { alignSelf: 'flex-start', minWidth: 24, padding: 3 }, dayNumber: { fontSize: 13, fontWeight: '700' }, dayEvent: { borderRadius: 4, marginTop: 2, paddingHorizontal: 2, paddingVertical: 2 }, dayEventTitle: { fontSize: 8, fontWeight: '700', lineHeight: 10 }, dayEventMore: { fontSize: 8, fontWeight: '700', marginTop: 2, textAlign: 'center' },
  emptyCopy: { fontSize: 12, lineHeight: 17, textAlign: 'center' },
  error: { color: '#b42318', fontSize: 12, marginTop: 12 },
  eventModal: { borderRadius: 20, flexShrink: 1, maxHeight: '90%', maxWidth: 680, overflow: 'hidden', width: '100%' },
  eventModalHeader: { alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 12, paddingHorizontal: 18, paddingVertical: 8 },
  eventModalHeading: { flex: 1, fontSize: 17, fontWeight: '800' },
  eventModalClose: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  eventModalScroll: { flexGrow: 0, flexShrink: 1 },
  eventModalContent: { gap: 12, padding: 18 },
  eventChoice: { alignItems: 'center', borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 12, minHeight: 48, padding: 12 },
  eventChoiceTitle: { flex: 1, fontSize: 15, fontWeight: '700' },
  eventDetails: { gap: 12 },
  eventCategory: { fontSize: 12, fontWeight: '800' },
  eventTitle: { fontSize: 25, fontWeight: '800' },
  eventInfoRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 8 },
  eventCopy: { flexShrink: 1, fontSize: 14, lineHeight: 21 },
  eventLink: { alignItems: 'center', alignSelf: 'flex-start', borderRadius: 12, flexDirection: 'row', gap: 8, minHeight: 44, paddingHorizontal: 12, paddingVertical: 8 },
  eventBack: { alignItems: 'center', flexDirection: 'row', gap: 6, minHeight: 44 },
  eventActionText: { flexShrink: 1, fontSize: 14, fontWeight: '700' },
  modalBackdrop: { alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.42)', flex: 1, justifyContent: 'center', padding: 20 }, modalCard: { borderRadius: 16, maxHeight: '70%', maxWidth: 480, padding: 18, width: '100%' }, modalTitle: { fontSize: 17, fontWeight: '800', marginBottom: 12 }, optionList: { maxHeight: 400 }, option: { alignItems: 'center', borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', minHeight: 44, paddingHorizontal: 10 }, optionText: { fontSize: 13, textTransform: 'capitalize' },
});
