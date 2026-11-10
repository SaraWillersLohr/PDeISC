import { FieldError, useFieldErrors } from '../FieldError';
import { dateFieldError } from '../../services/formValidation';
import { DateField } from './DateField';
import { FormDialog } from '../FormDialog';
// gestiono las tareas asignadas al equipo de campo.
// muestro operaciones de campo conectadas a las APIs productivas.
import { friendlyErrorMessage } from '../../services/apiErrors';
import { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Modal, Platform, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSession } from '../../context/SessionContext';
import { useLiveChanges } from '../../context/LiveChangesContext';
import { useTheme } from '../../context/ThemeContext';
import { createTask, deleteTasks, editTask, listTasks, updateTask, type TaskRecord } from '../../services/modulesApi';
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
  const form = useFieldErrors();
  const statusErrors = useFieldErrors();
  const revision = useLiveChanges();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;
  const owner = session?.usuario.rol.toLowerCase() === 'dueno';

  const [rows, setRows] = useState<TaskRecord[]>([]);
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [responsible, setResponsible] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [due, setDue] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingTask, setChangingTask] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number[] | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<number | null>(null);
  const [deletingTask, setDeletingTask] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [message, setMessage] = useState('');
  const fieldUsers = users.filter((user) => user.rol === 'peon' && user.activo);

  // Aplico el mismo criterio que el servidor y lo vuelvo a evaluar si la tarea cambia.
  function canDelete(row: TaskRecord): boolean {
    if (!session) return false;
    return owner
      ? row.id_creador === session.usuario.id_usuario
      : session.usuario.rol === 'peon' && row.id_responsable === session.usuario.id_usuario && row.estado === 'completada';
  }
  // Seleccionar todas abarca todas las páginas, únicamente entre las tareas permitidas.
  const eligible = rows.filter(canDelete);
  const selectedIds = selected.filter((id) => eligible.some((row) => row.id_tarea === id));
  const totalPages = Math.max(1, Math.ceil(rows.length / 10));
  const currentPage = Math.min(page, totalPages - 1);
  const visibleRows = rows.slice(currentPage * 10, currentPage * 10 + 10);
  const deleteBlocked = deleteTarget?.some((id) => !rows.some((row) => row.id_tarea === id && canDelete(row)))
    ? 'Alguna tarea cambió o ya no está disponible. Cancelá y revisá la selección.' : '';

  function startEditing(row: TaskRecord): void {
    setEditing(row.id_tarea); setTitle(row.titulo); setNotes(row.descripcion ?? '');
    setDue(row.fecha_vencimiento?.slice(0, 10) ?? ''); setResponsible(row.id_responsable); form.clear();
  }

  const load = useCallback(async () => {
    if (!session) return;
    try {
      const [tasks, members] = await Promise.all([listTasks(session), owner ? listOrganizationUsers(session) : Promise.resolve([])]);
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
  }, [session, owner]);

  useEffect(() => {
    if (!session) return;
    let active = true;
    Promise.all([listTasks(session), owner ? listOrganizationUsers(session) : Promise.resolve([])])
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
  }, [session, owner, revision]);

  async function add(): Promise<void> {
    if (!session) return;
    if (!form.validate({
      title: !title.trim() ? 'Escribí el título de la tarea.' : title.trim().length > 150 && 'El título admite hasta 150 caracteres.',
      due: dateFieldError(due, true, true),
      responsible: !fieldUsers.length ? 'No hay peones activos disponibles. Agregá uno en Equipo y Accesos.' : !fieldUsers.some((user) => user.id_usuario === responsible) && 'Elegí un peón activo como responsable.',
    })) return;
    if (!responsible) return;
    setSaving(true);
    try {
      await (editing ? editTask(session, editing, { titulo: title.trim(), descripcion: notes.trim(), id_responsable: responsible, fecha_vencimiento: due || null }) : createTask(session, {
        titulo: title.trim(),
        descripcion: notes.trim(),
        id_responsable: responsible,
        ...(due ? { fecha_vencimiento: due } : {}),
      }));
      setEditing(null);
      setTitle(''); setNotes(''); setDue('');
      await load();
    } catch (e) {
      form.serverError(friendlyErrorMessage(e, 'No se pudo crear la tarea.'), [['title', /título|titulo/i], ['due', /fecha|vencimiento/i], ['responsible', /responsable|peón|peon/i]]);
    } finally {
      setSaving(false);
    }
  }

  async function change(row: TaskRecord, next: TaskState): Promise<void> {
    if (!session || row.id_responsable !== session.usuario.id_usuario || changingTask !== null || row.estado === next) return;
    setChangingTask(row.id_tarea); statusErrors.clear();
    try {
      await updateTask(session, row.id_tarea, next);
      setRows((current) => current.map((task) => task.id_tarea === row.id_tarea && task.estado === row.estado ? { ...task, estado: next } : task));
      setMessage('');
    } catch (e) {
      statusErrors.serverError(friendlyErrorMessage(e, 'No se pudo actualizar la tarea.'), [['task_' + row.id_tarea, /./]]);
    } finally {
      setChangingTask(null);
    }
  }

  async function removeTask(): Promise<void> {
    if (!session || !deleteTarget?.length || deleteBlocked || deletingTask !== null) return;
    setDeletingTask(deleteTarget[0]); setDeleteError('');
    try {
      await deleteTasks(session, deleteTarget);
      setRows((current) => current.filter((row) => !deleteTarget.includes(row.id_tarea)));
      setSelected((current) => current.filter((id) => !deleteTarget.includes(id)));
      if (editing !== null && deleteTarget.includes(editing)) { setEditing(null); setTitle(''); setNotes(''); setDue(''); }
      setDeleteTarget(null);
    } catch (cause) {
      setDeleteError(friendlyErrorMessage(cause, 'No se pudo borrar la tarea.'));
    } finally {
      setDeletingTask(null);
    }
  }

  // El formulario de edición se abre sobre la tarea sin obligar a subir al inicio.
  const taskForm = (

        <View style={[s.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[s.cardTitle, { color: colors.textMain }]}>{editing ? 'Editar tarea' : 'Nueva tarea para el equipo'}</Text>
          <TextInput
            accessibilityLabel="Título de tarea"
            onChangeText={form.change('title', setTitle)}
            placeholder="Ej. Revisar y apartar lote en corral 4"
            placeholderTextColor={colors.textMuted}
            style={[s.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
            value={title}
          /><FieldError message={form.fields.title} />
          <TextInput
            accessibilityLabel="Descripción de tarea"
            onChangeText={form.change('notes', setNotes)}
            placeholder="Instrucciones o detalles adicionales (opcional)"
            placeholderTextColor={colors.textMuted}
            style={[s.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
            value={notes}
          /><FieldError message={form.fields.notes} />
          <Text style={[s.section, { color: colors.textSecondary }]}>Fecha límite (opcional)</Text>
          <DateField
            accessibilityLabel="Fecha límite de la tarea"
            onChangeText={form.change('due', setDue)}
            placeholder="Elegir fecha"
            placeholderTextColor={colors.textMuted}
            showCalendarIcon
            style={[s.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
            value={due}
          /><FieldError message={form.fields.due} />
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
                  onPress={() => { setResponsible(user.id_usuario); form.clear('responsible'); }}
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
          <FieldError message={form.fields.responsible} />
          <FieldError message={form.fields.submit} />
          <Pressable
            disabled={saving}
            onPress={() => void add()}
            style={[s.primary, { backgroundColor: colors.primary }, (saving) && { opacity: 0.6 }]}
          >
            <Text style={s.primaryText}>{saving ? 'Guardando…' : 'Crear y asignar tarea'}</Text>
          </Pressable>
          {editing !== null ? <Pressable accessibilityRole="button" disabled={saving} onPress={() => { setEditing(null); setTitle(''); setNotes(''); setDue(''); form.clear(); }} style={styles.dialogButton}><Text style={{ color: colors.textMain }}>Cancelar edición</Text></Pressable> : null}
        </View>

  );

  return (
    <Frame title="Tareas" subtitle="TRABAJO DIARIO DEL EQUIPO DE CAMPO">
      {owner && editing === null ? taskForm : null}
      <Modal transparent visible={owner && editing !== null} animationType="fade" onRequestClose={() => { if (!saving) { setEditing(null); setTitle(''); setNotes(''); setDue(''); form.clear(); } }}>
        <View style={styles.deleteBackdrop}><FormDialog style={[styles.deleteDialog, { backgroundColor: colors.bgCard }]}>{taskForm}</FormDialog></View>
      </Modal>

      {message ? <Text style={s.error}>{message}</Text> : null}

      {eligible.length > 0 ? <View style={styles.deleteActions}>
        <Pressable accessibilityRole="button" onPress={() => setSelected(selectedIds.length === eligible.length ? [] : eligible.map((row) => row.id_tarea))} style={[styles.deleteTaskButton, { borderColor: colors.border }]}><Text style={{ color: colors.textMain }}>{selectedIds.length === eligible.length ? 'Deseleccionar todas' : 'Seleccionar todas'} ({eligible.length})</Text></Pressable>
        <Pressable accessibilityRole="button" disabled={!selectedIds.length || deletingTask !== null} onPress={() => { setDeleteError(''); setDeleteTarget(selectedIds); }} style={[styles.deleteTaskButton, { borderColor: colors.border, opacity: selectedIds.length ? 1 : 0.5 }]}><Text style={{ color: colors.accentRed }}>Borrar seleccionadas ({selectedIds.length})</Text></Pressable>
      </View> : null}
      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginVertical: 24 }} />
      ) : (
        <View style={[s.gridWrap, isDesktop && s.gridWrapDesktop]}>
          {visibleRows.map((row) => {
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
                    <FieldError message={statusErrors.fields['task_' + row.id_tarea]} />
                  </>
                ) : null}
                {canDelete(row) ? (
                  <View style={[styles.deleteActions, { marginTop: 12 }]}>
                    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selected.includes(row.id_tarea) }} onPress={() => setSelected((ids) => ids.includes(row.id_tarea) ? ids.filter((id) => id !== row.id_tarea) : [...ids, row.id_tarea])} style={[styles.deleteTaskButton, { borderColor: colors.border }]}><Ionicons name={selected.includes(row.id_tarea) ? 'checkbox' : 'square-outline'} size={20} color={colors.primary} /><Text style={{ color: colors.textMain }}>Seleccionar</Text></Pressable>
                    {owner ? <Pressable accessibilityRole="button" disabled={saving} onPress={() => startEditing(row)} style={[styles.deleteTaskButton, { borderColor: colors.border }]}><Text style={{ color: colors.textMain }}>Editar tarea</Text></Pressable> : null}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Borrar tarea: ${row.titulo}`}
                      disabled={changingTask !== null || deletingTask !== null}
                      onPress={() => { setDeleteError(''); setDeleteTarget([row.id_tarea]); }}
                      style={[styles.deleteTaskButton, { borderColor: colors.border, backgroundColor: colors.bgCardMuted }]}
                    >
                      <Ionicons name="trash-outline" size={17} color={isDark ? '#ff9a91' : '#b83232'} />
                      <Text style={[styles.deleteTaskText, { color: isDark ? '#ff9a91' : '#b83232' }]}>Borrar tarea</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      )}
      <View style={[styles.deleteActions, { justifyContent: 'center' }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Página anterior de tareas" disabled={currentPage === 0} onPress={() => setPage(currentPage - 1)} style={[styles.dialogButton, { opacity: currentPage === 0 ? 0.4 : 1 }]}><Ionicons name="chevron-back" size={24} color={colors.primary} /></Pressable>
        <Text style={{ color: colors.textMain, alignSelf: 'center' }}>Página {currentPage + 1} de {totalPages} · {rows.length} tareas</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Página siguiente de tareas" disabled={currentPage + 1 >= totalPages} onPress={() => setPage(currentPage + 1)} style={[styles.dialogButton, { opacity: currentPage + 1 >= totalPages ? 0.4 : 1 }]}><Ionicons name="chevron-forward" size={24} color={colors.primary} /></Pressable>
      </View>
      {/* El cuadro se ajusta al contenido y sus botones se envuelven en pantallas pequeñas. */}
      <Modal animationType="fade" transparent visible={deleteTarget !== null} onRequestClose={() => { if (deletingTask === null) setDeleteTarget(null); }}>
        <View style={styles.deleteBackdrop}>
          <FormDialog style={[styles.deleteDialog, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text accessibilityRole="header" style={[s.cardTitle, { color: colors.textMain }]}>¿Estás seguro de que deseás borrar?</Text>
            <Text style={[s.copy, { color: colors.textMain }]}>{deleteTarget?.length ?? 0} tarea(s) seleccionada(s)</Text>
            <Text style={[s.copy, { color: colors.textMuted }]}>La tarea se eliminará de los paneles del dueño y del empleado.</Text>
            <FieldError message={deleteError || deleteBlocked} />
            <View style={styles.deleteActions}>
              <Pressable
                accessibilityRole="button"
                disabled={deletingTask !== null || Boolean(deleteBlocked)}
                onPress={() => void removeTask()}
                style={[styles.dialogButton, { backgroundColor: '#b83232' }, (deletingTask !== null || Boolean(deleteBlocked)) && { opacity: 0.6 }]}
              >
                <Text style={[styles.deleteTaskText, { color: '#fff' }]}>{deletingTask !== null ? 'Borrando…' : 'Borrar tarea'}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" disabled={deletingTask !== null} onPress={() => setDeleteTarget(null)} style={[styles.dialogButton, { backgroundColor: colors.bgCardMuted }]}>
                <Text style={[styles.deleteTaskText, { color: colors.textMain }]}>Cancelar</Text>
              </Pressable>
            </View>
          </FormDialog>
        </View>
      </Modal>
    </Frame>
  );
}

const styles = StyleSheet.create({
  deleteTaskRow: { alignItems: 'flex-start', marginTop: 12 },
  deleteTaskButton: { alignItems: 'center', borderRadius: 10, borderWidth: 1, flexDirection: 'row', gap: 8, maxWidth: '100%', minHeight: 44, paddingHorizontal: 12, paddingVertical: 10 },
  deleteTaskText: { flexShrink: 1, fontSize: 13, fontWeight: '700' },
  deleteBackdrop: { alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)', flex: 1, justifyContent: 'center', padding: 16 },
  deleteDialog: { borderRadius: 16, borderWidth: 1, maxWidth: 520, padding: 18, width: '100%' },
  deleteActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18 },
  dialogButton: { alignItems: 'center', borderRadius: 10, justifyContent: 'center', maxWidth: '100%', minHeight: 44, paddingHorizontal: 16, paddingVertical: 10 },
});
