// gestiono las tareas asignadas al equipo de campo.
// muestro operaciones de campo conectadas a las APIs productivas.
import { friendlyErrorMessage } from '../../services/apiErrors';
import { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Platform, Pressable, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { createTask, listTasks, updateTask, type TaskRecord } from '../../services/modulesApi';
import { listOrganizationUsers, type OrganizationUser } from '../../services/organizationApi';
import { Frame } from './FieldModuleScreens.shared';
import { s } from './FieldModuleStyles';

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
