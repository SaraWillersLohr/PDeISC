import { DateField } from './DateField';
// gestiono las tareas asignadas al equipo de campo.
// muestro operaciones de campo conectadas a las APIs productivas.
import { friendlyErrorMessage } from '../../services/apiErrors';
import { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Platform, Pressable, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSession } from '../../context/SessionContext';
import { useLiveChanges } from '../../context/LiveChangesContext';
import { useTheme } from '../../context/ThemeContext';
import { createTask, listTasks, updateTask, type TaskRecord } from '../../services/modulesApi';
import { listOrganizationUsers, type OrganizationUser } from '../../services/organizationApi';
import { Frame } from './FieldModuleScreens.shared';
import { s } from './FieldModuleStyles';

const taskStates = {
  pendiente: 'Pendiente',
  en_progreso: 'En proceso',
  completada: 'Completada',
} as const;
type TaskState = keyof typeof taskStates;
const taskStateOptions = Object.keys(taskStates) as TaskState[];

export function TasksManagerScreen() {
  const { session } = useSession();
  const revision = useLiveChanges();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;
  const admin = session?.usuario.rol.toLowerCase() === 'dueno';

  const [rows, setRows] = useState<TaskRecord[]>([]);
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [responsible, setResponsible] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [due, setDue] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingTask, setChangingTask] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const fieldUsers = users.filter((user) => user.rol === 'peon' && user.activo);

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
      })
      .catch((e: unknown) => { if (active) setMessage(friendlyErrorMessage(e, 'No se pudieron cargar las tareas.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session, admin, revision]);

  async function add(): Promise<void> {
    if (!session || !title.trim() || !responsible || !fieldUsers.some((user) => user.id_usuario === responsible)) {
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

  async function change(row: TaskRecord, next: TaskState): Promise<void> {
    if (!session || row.id_responsable !== session.usuario.id_usuario || changingTask !== null || row.estado === next) return;
    setChangingTask(row.id_tarea);
    try {
      await updateTask(session, row.id_tarea, next);
      setRows((current) => current.map((task) => task.id_tarea === row.id_tarea && task.estado === row.estado ? { ...task, estado: next } : task));
      setMessage('');
    } catch (e) {
      setMessage(friendlyErrorMessage(e, 'No se pudo actualizar la tarea.'));
    } finally {
      setChangingTask(null);
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
          <Text style={[s.section, { color: colors.textSecondary }]}>Fecha límite (opcional)</Text>
          <DateField
            accessibilityLabel="Fecha límite de la tarea"
            onChangeText={setDue}
            placeholder="Elegir fecha"
            placeholderTextColor={colors.textMuted}
            showCalendarIcon
            style={[s.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
            value={due}
          />
          {due ? (
            <Pressable accessibilityRole="button" onPress={() => setDue('')} style={[s.userChip, { alignSelf: 'flex-start', backgroundColor: colors.bgCardMuted }]}>
              <Text style={[s.userChipText, { color: colors.textMain }]}>Quitar fecha</Text>
            </Pressable>
          ) : null}
          <Text style={[s.section, { color: colors.textSecondary }]}>Asignar al personal de campo</Text>
          <View style={s.rowWrap}>
            {fieldUsers.map((user) => (
                <Pressable
                  key={user.id_usuario}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: responsible === user.id_usuario }}
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
            const canChange = row.id_responsable === session?.usuario.id_usuario && row.estado !== 'cancelada';
            const isDone = row.estado === 'completada';
            const inProgress = row.estado === 'en_progreso';
            return (
              <View
                key={row.id_tarea}
                style={[
                  s.card,
                  { backgroundColor: colors.bgCard, borderColor: colors.border },
                  isDesktop && s.cardDesktop,
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
                      {taskStates[row.estado as TaskState] ?? (row.estado === 'cancelada' ? 'Cancelada' : row.estado)}
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
                </View>
                {canChange ? (
                  <>
                    <Text style={[s.section, { color: colors.textSecondary }]}>{changingTask === row.id_tarea ? 'Guardando estado…' : 'Cambiar estado'}</Text>
                    <View style={s.rowWrap}>
                      {taskStateOptions.map((state) => (
                        <Pressable
                          key={state}
                          accessibilityRole="radio"
                          accessibilityState={{ checked: row.estado === state }}
                          disabled={changingTask !== null}
                          onPress={() => void change(row, state)}
                          style={[s.userChip, { backgroundColor: row.estado === state ? colors.primary : colors.bgCardMuted }]}
                        >
                          <Text style={[s.userChipText, { color: row.estado === state ? '#fff' : colors.textMain }]}>{taskStates[state]}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </>
                ) : null}
              </View>
            );
          })}
        </View>
      )}
    </Frame>
  );
}
