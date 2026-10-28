// administro las cuentas y los accesos del equipo.
// hago operativas la consulta del equipo y la aprobación del catálogo.
import { friendlyErrorMessage } from '../../services/apiErrors';
import { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Modal, Platform, Pressable, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { deactivateOrganizationUser, listOrganizationUsers, updateOrganizationUser, type OrganizationUser } from '../../services/organizationApi';
import { Screen } from './OrganizationScreens.shared';
import { st } from './OrganizationStyles';

export function TeamScreen() {
  const { session } = useSession();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;
  const admin = session?.usuario.rol.toLowerCase() === 'administrador';

  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<OrganizationUser | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<OrganizationUser | null>(null);
  const [reassignmentId, setReassignmentId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [roleDraft, setRoleDraft] = useState('peon');

  const load = useCallback(async () => {
    if (!session) return;
    try {
      setUsers(await listOrganizationUsers(session));
      setError('');
    } catch (e) {
      setError(friendlyErrorMessage(e, 'No se pudo cargar el equipo.'));
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    let active = true;
    listOrganizationUsers(session)
      .then((result) => { if (active) { setUsers(result); setError(''); } })
      .catch((e: unknown) => { if (active) setError(friendlyErrorMessage(e, 'No se pudo cargar el equipo.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session]);

  async function saveUser(): Promise<void> {
    if (!session || !selected || !name.trim() || !surname.trim()) {
      setError('Completá nombre y apellido.');
      return;
    }
    setBusy(true);
    try {
      await updateOrganizationUser(session, { ...selected, nombre: name.trim(), apellido: surname.trim() }, roleDraft);
      setSelected(null);
      await load();
    } catch (e) {
      setError(friendlyErrorMessage(e, 'No se pudo editar el usuario.'));
    } finally {
      setBusy(false);
    }
  }

  async function remove(): Promise<void> {
    if (!session || !confirmDelete) return;
    setBusy(true);
    try {
      await deactivateOrganizationUser(session, confirmDelete.id_usuario, reassignmentId ?? undefined);
      setConfirmDelete(null);
      setReassignmentId(null);
      await load();
    } catch (e) {
      setError(friendlyErrorMessage(e, 'No se pudo dar de baja el usuario.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen title="Equipo de la estancia">
      {error ? <Text style={st.error}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginVertical: 24 }} />
      ) : (
        <View style={[st.gridWrap, isDesktop && st.gridWrapDesktop]}>
          {users.map((user) => (
            <View
              key={user.id_usuario}
              style={[
                st.card,
                { backgroundColor: colors.bgCard, borderColor: colors.border },
                isDesktop && st.cardDesktop,
              ]}
            >
              <View style={st.row}>
                <View style={[st.avatarBadge, { backgroundColor: isDark ? 'rgba(134,239,172,0.15)' : '#e8f5ed' }]}>
                  <Ionicons color={isDark ? '#86efac' : '#2d6a4f'} name="person" size={18} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[st.title, { color: colors.textMain }]}>{user.nombre} {user.apellido}</Text>
                  <Text style={[st.copy, { color: colors.textMuted }]}>{user.email}</Text>
                </View>
                <View
                  style={[
                    st.roleBadge,
                    {
                      backgroundColor: user.activo
                        ? isDark ? 'rgba(134,239,172,0.15)' : '#eaf4ec'
                        : isDark ? 'rgba(239,68,68,0.15)' : '#fee2e2',
                    },
                  ]}
                >
                  <Text
                    style={[
                      st.roleBadgeText,
                      { color: user.activo ? (isDark ? '#86efac' : '#2d6a4f') : '#dc2626' },
                    ]}
                  >
                    {user.activo ? user.rol : 'inactivo'}
                  </Text>
                </View>
              </View>

              {admin ? (
                <View style={[st.row, { justifyContent: 'flex-end', marginTop: 14 }]}>
                  <Pressable
                    onPress={() => {
                      setSelected(user);
                      setName(user.nombre);
                      setSurname(user.apellido);
                      setRoleDraft(user.rol);
                    }}
                    style={[st.secondary, { borderColor: colors.border }]}
                  >
                    <Text style={[st.secondaryText, { color: colors.primary }]}>Editar usuario</Text>
                  </Pressable>
                  {user.id_usuario !== session?.usuario.id_usuario ? (
                    <Pressable onPress={() => { setReassignmentId(null); setConfirmDelete(user); }} style={st.danger}>
                      <Text style={st.dangerText}>Dar de baja</Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
            </View>
          ))}
        </View>
      )}

      {/* Edit User Modal */}
      <Modal transparent visible={Boolean(selected)} onRequestClose={() => setSelected(null)}>
        <View style={st.overlay}>
          <View style={[st.modal, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[st.title, { color: colors.textMain, fontSize: 17 }]}>Editar usuario</Text>
            <TextInput
              accessibilityLabel="Nombre"
              onChangeText={setName}
              placeholder="Nombre"
              placeholderTextColor={colors.textMuted}
              style={[st.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
              value={name}
            />
            <TextInput
              accessibilityLabel="Apellido"
              onChangeText={setSurname}
              placeholder="Apellido"
              placeholderTextColor={colors.textMuted}
              style={[st.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
              value={surname}
            />
            <Text style={[st.copy, { color: colors.textSecondary, marginTop: 12 }]}>Rol en la estancia</Text>
            <View style={st.rowWrap}>
              {(['dueno', 'peon', 'veterinario', 'administrador'] as const).map((role) => (
                <Pressable
                  key={role}
                  onPress={() => setRoleDraft(role)}
                  style={[
                    st.option,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#edf4ec' },
                    roleDraft === role && { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={[st.optionText, { color: colors.textMain }, roleDraft === role && { color: '#ffffff', fontWeight: '800' }]}>
                    {role === 'dueno' ? 'Dueño' : role === 'peon' ? 'Peón' : role === 'veterinario' ? 'Veterinario' : 'Administrador'}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={[st.row, { justifyContent: 'flex-end', marginTop: 18 }]}>
              <Pressable onPress={() => setSelected(null)} style={[st.secondary, { borderColor: colors.border }]}>
                <Text style={[st.secondaryText, { color: colors.textMuted }]}>Cancelar</Text>
              </Pressable>
              <Pressable
                disabled={busy}
                onPress={() => void saveUser()}
                style={[st.primary, { backgroundColor: isDark ? colors.primaryLight : colors.primary }]}
              >
                <Text style={st.primaryText}>{busy ? 'Guardando…' : 'Guardar cambios'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete User Modal */}
      <Modal transparent visible={Boolean(confirmDelete)} onRequestClose={() => { setConfirmDelete(null); setReassignmentId(null); }}>
        <View style={st.overlay}>
          <View style={[st.modal, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[st.title, { color: colors.textMain, fontSize: 17 }]}>Dar de baja usuario</Text>
            <Text style={[st.copy, { color: colors.textSecondary, marginTop: 8 }]}>
              Se bloqueará el acceso de {confirmDelete?.nombre} {confirmDelete?.apellido} y se conservará toda la trazabilidad histórica de sus registros.
            </Text>
            <Text style={[st.copy, { color: colors.textMain, fontWeight: '700', marginTop: 14 }]}>Si tiene tareas pendientes, elegí quién las recibe:</Text>
            <View style={[st.row, { flexWrap: 'wrap', marginTop: 8 }]}>
              {users.filter((user) => user.activo && user.rol === 'peon' && user.id_usuario !== confirmDelete?.id_usuario).map((user) => (
                <Pressable key={user.id_usuario} onPress={() => setReassignmentId(user.id_usuario)} style={[st.option, { backgroundColor: reassignmentId === user.id_usuario ? colors.primary : colors.bgCardMuted }]}>
                  <Text style={[st.optionText, { color: reassignmentId === user.id_usuario ? '#fff' : colors.textMain }]}>{user.nombre} {user.apellido}</Text>
                </Pressable>
              ))}
            </View>
            {reassignmentId !== null ? <Pressable onPress={() => setReassignmentId(null)}><Text style={[st.copy, { color: colors.primary, marginTop: 8 }]}>Quitar responsable seleccionado</Text></Pressable> : null}
            <View style={[st.row, { justifyContent: 'flex-end', marginTop: 18 }]}>
              <Pressable onPress={() => { setConfirmDelete(null); setReassignmentId(null); }} style={[st.secondary, { borderColor: colors.border }]}>
                <Text style={[st.secondaryText, { color: colors.textMuted }]}>Cancelar</Text>
              </Pressable>
              <Pressable
                disabled={busy}
                onPress={() => void remove()}
                style={[st.danger, { backgroundColor: '#dc2626', borderColor: '#dc2626' }]}
              >
                <Text style={[st.dangerText, { color: '#ffffff' }]}>{busy ? 'Procesando…' : 'Confirmar baja'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
