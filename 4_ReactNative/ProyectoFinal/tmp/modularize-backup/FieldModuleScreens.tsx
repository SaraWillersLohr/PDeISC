// muestro operaciones de campo conectadas a las APIs productivas.
import { friendlyErrorMessage } from '../../services/apiErrors';
import { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { confirmPregnancy, createTask, deleteBirthRecord, deleteMatingService, listReproduction, listTasks, updateTask, type ReproductionData, type TaskRecord } from '../../services/modulesApi';
import { listOrganizationUsers, type OrganizationUser } from '../../services/organizationApi';

function Frame({ title, subtitle, children }: React.PropsWithChildren<{ title: string; subtitle: string }>) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;
  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[s.safe, { backgroundColor: colors.bgCanvas }]}>
      <ScrollView contentContainerStyle={[s.page, isDesktop && s.pageDesktop]} showsVerticalScrollIndicator={false}>
        <View style={[s.innerContainer, isDesktop && s.innerContainerDesktop]}>
          <Text style={[s.heading, { color: colors.textMain }]}>{title}</Text>
          <Text style={[s.subtitle, { color: colors.textMuted }]}>{subtitle.toUpperCase()}</Text>
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function TasksManagerScreen() {
  const { session } = useSession();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;
  const admin = session?.usuario.rol.toLowerCase() === 'administrador';

  const [rows, setRows] = useState<TaskRecord[]>([]);
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [responsible, setResponsible] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [due, setDue] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    if (!session) return;
    try {
      const [tasks, members] = await Promise.all([listTasks(session), admin ? listOrganizationUsers(session) : Promise.resolve([])]);
      setRows(tasks);
      setUsers(members);
      const fieldUsers = members.filter((user) => user.rol === 'peon' && user.activo);
      setResponsible((current) => current ?? fieldUsers[0]?.id_usuario ?? null);
      setMessage('');
    } catch (e) {
      setMessage(friendlyErrorMessage(e, 'No se pudieron cargar las tareas.'));
    } finally {
      setLoading(false);
    }
  }, [session, admin]);

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
      .catch((e: unknown) => { if (active) setMessage(friendlyErrorMessage(e, 'No se pudieron cargar las tareas.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session, admin]);

  async function add(): Promise<void> {
    if (!session || !title.trim() || !responsible) {
      setMessage('Escribí un título y asigná la tarea a un peón activo.');
      return;
    }
    setSaving(true);
    try {
      await createTask(session, {
        titulo: title.trim(),
        descripcion: notes.trim(),
        id_responsable: responsible,
        ...(due ? { fecha_vencimiento: due } : {}),
      });
      setTitle(''); setNotes(''); setDue('');
      await load();
    } catch (e) {
      setMessage(friendlyErrorMessage(e, 'No se pudo crear la tarea.'));
    } finally {
      setSaving(false);
    }
  }

  async function change(row: TaskRecord): Promise<void> {
    if (!session) return;
    const next = row.estado === 'pendiente' ? 'en_progreso' : row.estado === 'en_progreso' ? 'completada' : 'pendiente';
    try {
      await updateTask(session, row.id_tarea, next);
      await load();
    } catch (e) {
      setMessage(friendlyErrorMessage(e, 'No se pudo actualizar la tarea.'));
    }
  }

  return (
    <Frame title="Tareas" subtitle="TRABAJO DIARIO DEL EQUIPO DE CAMPO">
      {admin ? (
        <View style={[s.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[s.cardTitle, { color: colors.textMain }]}>Nueva tarea para el equipo</Text>
          <TextInput
            accessibilityLabel="Título de tarea"
            onChangeText={setTitle}
            placeholder="Ej. Revisar y apartar lote en corral 4"
            placeholderTextColor={colors.textMuted}
            style={[s.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
            value={title}
          />
          <TextInput
            accessibilityLabel="Descripción de tarea"
            onChangeText={setNotes}
            placeholder="Instrucciones o detalles adicionales (opcional)"
            placeholderTextColor={colors.textMuted}
            style={[s.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
            value={notes}
          />
          <TextInput
            accessibilityLabel="Fecha de vencimiento"
            onChangeText={setDue}
            placeholder="Fecha límite AAAA-MM-DD (opcional)"
            placeholderTextColor={colors.textMuted}
            style={[s.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
            value={due}
          />
          <Text style={[s.section, { color: colors.textSecondary }]}>Asignar al personal de campo</Text>
          <View style={s.rowWrap}>
            {users
              .filter((user) => user.rol === 'peon' && user.activo)
              .map((user) => (
                <Pressable
                  key={user.id_usuario}
                  onPress={() => setResponsible(user.id_usuario)}
                  style={[
                    s.userChip,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#edf4ec' },
                    responsible === user.id_usuario && { backgroundColor: colors.primary },
                  ]}
                >
                  <Ionicons
                    color={responsible === user.id_usuario ? '#ffffff' : colors.primary}
                    name="person"
                    size={14}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[s.userChipText, { color: colors.textMain }, responsible === user.id_usuario && { color: '#ffffff' }]}>
                    {user.nombre} {user.apellido}
                  </Text>
                </Pressable>
              ))}
          </View>
          <Pressable
            disabled={saving || !responsible}
            onPress={() => void add()}
            style={[s.primary, { backgroundColor: colors.primary }, (saving || !responsible) && { opacity: 0.6 }]}
          >
            <Text style={s.primaryText}>{saving ? 'Guardando…' : 'Crear y asignar tarea'}</Text>
          </Pressable>
        </View>
      ) : null}

      {message ? <Text style={s.error}>{message}</Text> : null}

      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginVertical: 24 }} />
      ) : (
        <View style={[s.gridWrap, isDesktop && s.gridWrapDesktop]}>
          {rows.map((row) => {
            const isDone = row.estado === 'completada';
            const inProgress = row.estado === 'en_progreso';
            return (
              <Pressable
                key={row.id_tarea}
                onPress={() => void change(row)}
                style={({ pressed }) => [
                  s.card,
                  { backgroundColor: colors.bgCard, borderColor: colors.border },
                  isDesktop && s.cardDesktop,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <View style={s.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: colors.textMain }, isDone && { textDecorationLine: 'line-through', opacity: 0.7 }]}>
                      {row.titulo}
                    </Text>
                  </View>
                  <View
                    style={[
                      s.statusPill,
                      isDone
                        ? { backgroundColor: '#eaf4ec' }
                        : inProgress
                        ? { backgroundColor: '#fef3c7' }
                        : { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' },
                    ]}
                  >
                    <Ionicons
                      color={isDone ? '#2d6a4f' : inProgress ? '#d97706' : '#64748b'}
                      name={isDone ? 'checkmark-circle' : inProgress ? 'time' : 'radio-button-off'}
                      size={13}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        s.statusPillText,
                        { color: isDone ? '#2d6a4f' : inProgress ? '#b45309' : '#475569' },
                      ]}
                    >
                      {row.estado.replace('_', ' ')}
                    </Text>
                  </View>
                </View>

                {row.descripcion ? (
                  <Text style={[s.copy, { color: colors.textSecondary }]}>{row.descripcion}</Text>
                ) : null}

                <View style={s.taskFooter}>
                  <Text style={[s.copy, { color: colors.textMuted }]}>
                    Responsable: {row.responsable ? `${row.responsable} ${row.apellido_responsable ?? ''}` : 'Sin asignar'}
                    {row.fecha_vencimiento ? ` · vence ${String(row.fecha_vencimiento).slice(0, 10)}` : ''}
                  </Text>
                  <Text style={[s.actionHint, { color: colors.accentLime }]}>Tocá para avanzar estado →</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </Frame>
  );
}

export function ReproductionScreen() {
  const { session } = useSession();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;

  const [data, setData] = useState<ReproductionData>({ servicios: [], nacimientos: [] });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const currentRole = session?.usuario.rol.toLowerCase();
  const owner = currentRole === 'dueno';
  const canConfirmPregnancy = currentRole === 'dueno' || currentRole === 'peon';
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'servicio' | 'nacimiento'; id: number; label: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState<number | null>(null);

  const reload = useCallback(async () => {
    if (!session) return;
    try { setData(await listReproduction(session)); setMessage(''); }
    catch (e) { setMessage(friendlyErrorMessage(e, 'No se pudo cargar reproducción.')); }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    let active = true;
    listReproduction(session)
      .then((result) => { if (active) { setData(result); setMessage(''); } })
      .catch((e: unknown) => { if (active) setMessage(friendlyErrorMessage(e, 'No se pudo cargar reproducción.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session]);

  async function removeRecord(): Promise<void> {
    if (!session || !deleteTarget) return;
    setBusy(true); setMessage('');
    try {
      if (deleteTarget.type === 'servicio') await deleteMatingService(session, deleteTarget.id);
      else await deleteBirthRecord(session, deleteTarget.id);
      setDeleteTarget(null); await reload(); setMessage(deleteTarget.type === 'servicio' ? 'Servicio reproductivo borrado.' : 'Registro borrado; la ficha de la cría se conservó.');
    } catch (e) { setMessage(friendlyErrorMessage(e, 'No se pudo borrar el registro.')); }
    finally { setBusy(false); }
  }

  async function confirmServicePregnancy(id: number): Promise<void> {
    if (!session) return;
    setConfirming(id); setMessage('');
    try { const result = await confirmPregnancy(session, id); await reload(); setMessage(`Preñez confirmada. Fecha estimada de nacimiento: ${result.fecha_estimada_nacimiento.slice(0, 10)}.`); }
    catch (e) { setMessage(friendlyErrorMessage(e, 'No se pudo confirmar la preñez.')); }
    finally { setConfirming(null); }
  }

  return (
    <Frame title="Reproducción" subtitle="SERVICIOS DE MONTA, PREÑECES Y NACIMIENTOS">
      {message ? <Text style={s.error}>{message}</Text> : null}

      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginVertical: 20 }} />
      ) : (
        <>
          <Text style={[s.section, { color: colors.textMain }]}>Servicios recientes · {data.servicios.length}</Text>
          <View style={[s.gridWrap, isDesktop && s.gridWrapDesktop]}>
            {data.servicios.map((item) => (
              <View
                key={item.id_servicio}
                style={[
                  s.card,
                  { backgroundColor: colors.bgCard, borderColor: colors.border },
                  isDesktop && s.cardDesktop,
                ]}
              >
                <View style={s.row}>
                  <View style={[s.badgeCircle, { backgroundColor: isDark ? 'rgba(134,239,172,0.15)' : '#eaf4ec' }]}>
                    <Ionicons color={isDark ? '#86efac' : '#2d6a4f'} name="git-branch" size={16} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: colors.textMain }]}>{item.nombre_madre || item.madre} · {item.fecha.slice(0, 10)}</Text>
                    <Text style={[s.copy, { color: colors.textSecondary }]}>Padre: {item.padre || item.padre_texto || 'Sin identificar'} · {item.metodo} · {item.especie}</Text>
                    {item.fecha_estimada_nacimiento ? <Text style={[s.copy, { color: colors.accentLime, marginTop: 5 }]}>Preñez confirmada · nacimiento estimado {item.fecha_estimada_nacimiento.slice(0, 10)}</Text> : null}
                  </View>
                  {owner ? <Pressable accessibilityRole="button" accessibilityLabel="Borrar servicio reproductivo" disabled={busy} onPress={() => setDeleteTarget({ type: 'servicio', id: item.id_servicio, label: `${item.nombre_madre || item.madre} · ${item.fecha.slice(0, 10)}` })}><Ionicons color="#dc2626" name="trash-outline" size={18} /></Pressable> : null}
                </View>
                {item.observaciones ? <Text style={[s.copy, { color: colors.textMuted, marginTop: 6 }]}>{item.observaciones}</Text> : null}
                {canConfirmPregnancy && !item.fecha_estimada_nacimiento ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Confirmar preñez de ${item.nombre_madre || item.madre}`}
                    disabled={confirming !== null}
                    onPress={() => void confirmServicePregnancy(item.id_servicio)}
                    style={[s.pregnancyButton, { backgroundColor: colors.primary }, confirming !== null && { opacity: 0.6 }]}
                  >
                    <Ionicons color="#ffffff" name="checkmark-circle-outline" size={17} />
                    <Text style={s.primaryText}>{confirming === item.id_servicio ? 'CALCULANDO FECHA…' : 'CONFIRMAR PREÑEZ'}</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
          </View>

          <Text style={[s.section, { color: colors.textMain, marginTop: 18 }]}>Nacimientos registrados · {data.nacimientos.length}</Text>
          <View style={[s.gridWrap, isDesktop && s.gridWrapDesktop]}>
            {data.nacimientos.map((item) => (
              <View
                key={item.id_nacimiento}
                style={[
                  s.card,
                  { backgroundColor: colors.bgCard, borderColor: colors.border },
                  isDesktop && s.cardDesktop,
                ]}
              >
                <View style={s.row}>
                  <View style={[s.badgeCircle, { backgroundColor: isDark ? 'rgba(245,158,11,0.15)' : '#fef3e7' }]}>
                    <Ionicons color="#d97706" name="heart" size={16} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: colors.textMain }]}>{item.nombre_cria || item.cria} · {item.fecha.slice(0, 10)}</Text>
                    <Text style={[s.copy, { color: colors.textSecondary }]}>Madre: {item.madre || item.madre_texto || 'Sin informar'} · Padre: {item.padre || item.padre_texto || 'Sin informar'}</Text>
                  </View>
                  {owner ? <Pressable accessibilityRole="button" accessibilityLabel="Borrar registro de nacimiento" disabled={busy} onPress={() => setDeleteTarget({ type: 'nacimiento', id: item.id_nacimiento, label: `${item.nombre_cria || item.cria} · ${item.fecha.slice(0, 10)}` })}><Ionicons color="#dc2626" name="trash-outline" size={18} /></Pressable> : null}
                </View>
              </View>
            ))}
          </View>
        </>
      )}
      <Modal animationType="fade" onRequestClose={() => { if (!busy) setDeleteTarget(null); }} transparent visible={Boolean(deleteTarget)}>
        <View style={s.overlay}><View style={[s.card, s.modalCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[s.cardTitle, { color: colors.textMain, fontSize: 17 }]}>¿Estás seguro de que querés borrar este registro?</Text>
          <Text style={[s.copy, { color: colors.textSecondary, marginTop: 8 }]}>{deleteTarget?.label}{'\n'}Este elemento se eliminará de forma permanente.{deleteTarget?.type === 'nacimiento' ? ' La ficha de la cría se conservará.' : ''}</Text>
          <View style={[s.row, { justifyContent: 'flex-end', marginTop: 18 }]}>
            <Pressable disabled={busy} onPress={() => setDeleteTarget(null)} style={[s.primary, { backgroundColor: 'transparent', borderColor: colors.border, borderWidth: 1, marginTop: 0 }]}><Text style={[s.copy, { color: colors.textMuted }]}>No, cancelar</Text></Pressable>
            <Pressable disabled={busy} onPress={() => void removeRecord()} style={[s.primary, { backgroundColor: '#dc2626' }, busy && { opacity: 0.6 }]}><Text style={s.primaryText}>{busy ? 'Borrando…' : 'Sí, borrar'}</Text></Pressable>
          </View>
        </View></View>
      </Modal>
    </Frame>
  );
}

const s = StyleSheet.create({
  overlay: { alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.48)', flex: 1, justifyContent: 'center', padding: 20 },
  safe: { flex: 1 },
  page: { padding: 18, paddingBottom: 36 },
  pageDesktop: { paddingHorizontal: 40, paddingTop: 24 },
  innerContainer: { width: '100%' },
  innerContainerDesktop: { alignSelf: 'center', maxWidth: 1200, width: '100%' },

  heading: { fontSize: 26, fontWeight: '800', letterSpacing: -0.6 },
  subtitle: { fontSize: 9.5, fontWeight: '800', letterSpacing: 1.2, marginBottom: 20, marginTop: 4 },

  modalCard: {
    alignSelf: 'center',
    marginBottom: 0,
    maxWidth: 440,
    width: '100%',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  cardDesktop: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 13,
    height: 46,
    marginTop: 10,
    paddingHorizontal: 12,
  },
  primary: {
    alignItems: 'center',
    borderRadius: 10,
    height: 44,
    justifyContent: 'center',
    marginTop: 14,
    paddingHorizontal: 16,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  pregnancyButton: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    marginTop: 14,
    minHeight: 44,
    paddingHorizontal: 14,
    width: '100%',
  },
  copy: {
    fontSize: 11.5,
    lineHeight: 17,
    marginTop: 5,
  },
  error: {
    backgroundColor: '#fff0ed',
    borderRadius: 10,
    color: '#dc2626',
    fontSize: 12,
    marginBottom: 14,
    padding: 12,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  userChip: {
    alignItems: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  userChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusPill: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  taskFooter: {
    marginTop: 10,
  },
  actionHint: {
    fontSize: 10.5,
    fontWeight: '800',
    marginTop: 6,
  },
  section: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 14,
  },
  gridWrap: {
    gap: 12,
  },
  gridWrapDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  twoColDesktop: {
    flexDirection: 'row',
    gap: 16,
  },
  colItem: {
    flex: 1,
  },
  badgeCircle: {
    alignItems: 'center',
    borderRadius: 12,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
});
