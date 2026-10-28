// hago operativas la consulta del equipo y la aprobación del catálogo.
import { friendlyErrorMessage } from '../../services/apiErrors';
import { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { createBreed, createSpecies, deactivateOrganizationUser, deleteBreed, deleteSpecies, listCatalog, listOrganizationUsers, requestCatalog, reviewCatalog, updateOrganizationUser, type CatalogData, type OrganizationUser, type Species } from '../../services/organizationApi';

function Screen({ title, children }: React.PropsWithChildren<{ title: string }>) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;
  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[st.safe, { backgroundColor: colors.bgCanvas }]}>
      <ScrollView contentContainerStyle={[st.page, isDesktop && st.pageDesktop]} showsVerticalScrollIndicator={false}>
        <View style={[st.innerWrapper, isDesktop && st.innerWrapperDesktop]}>
          <Text style={[st.heading, { color: colors.textMain }]}>{title}</Text>
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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

export function CatalogScreen() {
  const { session } = useSession();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;

  const role = session?.usuario.rol.toLowerCase();
  const admin = role === 'administrador' || role === 'copropietario';
  const owner = role === 'dueno';
  const canCreate = owner;
  const peon = role === 'peon';

  const [data, setData] = useState<CatalogData>({ especies: [], razas: [], pendientes: [] });
  const [kind, setKind] = useState<'especie' | 'raza'>('especie');
  const [name, setName] = useState('');
  const [speciesId, setSpeciesId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'especie' | 'raza'; id: number; name: string } | null>(null);

  const load = useCallback(async () => {
    if (!session) return;
    try {
      setData(await listCatalog(session));
      setError('');
    } catch (e) {
      setError(friendlyErrorMessage(e, 'No se pudo cargar el catálogo.'));
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    let active = true;
    listCatalog(session)
      .then((result) => { if (active) { setData(result); setError(''); } })
      .catch((e: unknown) => { if (active) setError(friendlyErrorMessage(e, 'No se pudo cargar el catálogo.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session]);

  function openForm(nextKind: 'especie' | 'raza', species?: Species): void {
    setKind(nextKind);
    setSpeciesId(species?.id_especie ?? null);
    setName(''); setError(''); setMessage(''); setModalOpen(true);
  }

  async function submit(): Promise<void> {
    if (!session || !name.trim() || (kind === 'raza' && !speciesId)) {
      setError(kind === 'raza' ? 'Elegí la especie e ingresá el nombre de la raza.' : 'Ingresá el nombre de la especie.');
      return;
    }
    setBusy(true); setError(''); setMessage('');
    try {
      if (canCreate) {
        if (kind === 'especie') await createSpecies(session, name.trim());
        else await createBreed(session, speciesId!, name.trim());
        await load(); setModalOpen(false); setName(''); setMessage(kind === 'especie' ? 'Especie agregada al catálogo.' : 'Raza agregada a la especie.');
      } else {
        await requestCatalog(session, kind, name.trim(), speciesId ?? undefined);
        setModalOpen(false); setName(''); setMessage('Propuesta enviada al dueño para su revisión.');
      }
    } catch (e) {
      setError(friendlyErrorMessage(e, 'No se pudo guardar el cambio.'));
    } finally {
      setBusy(false);
    }
  }

  async function decide(id: number, decision: 'aprobar' | 'rechazar'): Promise<void> {
    if (!session) return;
    setBusy(true); setError(''); setMessage('');
    try {
      await reviewCatalog(session, id, decision);
      await load();
      setMessage(decision === 'aprobar' ? 'Solicitud aprobada y agregada al catálogo.' : 'Solicitud rechazada.');
    } catch (e) {
      setError(friendlyErrorMessage(e, 'No se pudo revisar la solicitud.'));
    } finally {
      setBusy(false);
    }
  }

  async function removeCatalogItem(): Promise<void> {
    if (!session || !deleteTarget) return;
    setBusy(true); setError(''); setMessage('');
    try {
      if (deleteTarget.type === 'especie') await deleteSpecies(session, deleteTarget.id);
      else await deleteBreed(session, deleteTarget.id);
      setMessage(`${deleteTarget.type === 'especie' ? 'Especie' : 'Raza'} borrada permanentemente.`);
      setDeleteTarget(null); await load();
    } catch (e) { setError(friendlyErrorMessage(e, 'No se pudo borrar. Revisá si hay animales asociados.')); }
    finally { setBusy(false); }
  }

  return (
    <Screen title="Especies y razas">
      <Text style={[st.copy, { color: colors.textMuted }]}>
        Catálogo productivo de la estancia. Las razas registradas quedan organizadas por su especie.
      </Text>

      {message ? <Text accessibilityRole="alert" style={st.success}>{message}</Text> : null}
      {error && !loading ? <Text accessibilityRole="alert" style={st.error}>{error}</Text> : null}

      <View style={{ flexDirection: 'row', gap: 10, marginVertical: 14 }}>
        {canCreate ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => openForm('especie')}
            style={[st.primary, { backgroundColor: isDark ? colors.primaryLight : colors.primary }]}
          >
            <Ionicons color="#ffffff" name="add" size={16} style={{ marginRight: 4 }} />
            <Text style={st.primaryText}>Agregar especie</Text>
          </Pressable>
        ) : null}
        {peon ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => openForm('especie')}
            style={[st.secondary, { borderColor: colors.border }]}
          >
            <Text style={[st.secondaryText, { color: colors.primary }]}>Proponer especie o raza</Text>
          </Pressable>
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginVertical: 24 }} />
      ) : data.especies.length ? (
        <View style={[st.gridWrap, isDesktop && st.gridWrapDesktop]}>
          {data.especies.map((species) => {
            const breeds = data.razas.filter((breed) => breed.id_especie === species.id_especie);
            return (
              <View
                key={species.id_especie}
                style={[
                  st.card,
                  { backgroundColor: colors.bgCard, borderColor: colors.border },
                  isDesktop && st.cardDesktop,
                ]}
              >
                <View style={st.row}>
                  <View style={[st.avatarBadge, { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.15)' : '#ecfdf5' }]}>
                    <Ionicons color={isDark ? '#34d399' : '#059669'} name="paw" size={18} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[st.title, { color: colors.textMain }]}>{species.nombre}</Text>
                    <Text style={[st.copy, { color: colors.textMuted }]}>
                      {breeds.length ? `${breeds.length} ${breeds.length === 1 ? 'raza registrada' : 'razas registradas'}` : 'Sin razas aún'}
                    </Text>
                  </View>
                  {canCreate ? (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <Pressable accessibilityRole="button" onPress={() => openForm('raza', species)} style={[st.secondary, { backgroundColor: isDark ? colors.bgCardMuted : colors.bgCard, borderColor: colors.border }]}><Text style={[st.secondaryText, { color: isDark ? colors.accentLime : colors.primary }]}>＋ Raza</Text></Pressable>
                      <Pressable accessibilityRole="button" accessibilityLabel={`Borrar especie ${species.nombre}`} onPress={() => setDeleteTarget({ type: 'especie', id: species.id_especie, name: species.nombre })} style={[st.deleteIconButton, { backgroundColor: colors.accentRedBg, borderColor: isDark ? 'rgba(226,107,96,0.45)' : '#fecaca' }]}><Ionicons color={isDark ? '#ff8b80' : '#dc2626'} name="trash-outline" size={18} /></Pressable>
                    </View>
                  ) : null}
                  {peon ? (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => openForm('raza', species)}
                      style={[st.secondary, { borderColor: colors.border }]}
                    >
                      <Text style={[st.secondaryText, { color: colors.primary }]}>Proponer</Text>
                    </Pressable>
                  ) : null}
                </View>

                <View style={st.breedList}>
                  {breeds.length ? (
                    breeds.map((breed) => (
                      <View
                        key={breed.id_raza}
                        style={[
                          st.breedChip,
                          { backgroundColor: isDark ? 'rgba(134,239,172,0.12)' : '#e8f5ed' },
                        ]}
                      >
                        <Text style={[st.breedChipText, { color: isDark ? '#86efac' : '#2d6a4f' }]}>{breed.nombre}</Text>
                        {owner ? <Pressable accessibilityRole="button" accessibilityLabel={`Borrar raza ${breed.nombre}`} hitSlop={6} onPress={() => setDeleteTarget({ type: 'raza', id: breed.id_raza, name: breed.nombre })}><Ionicons color={isDark ? '#ff8b80' : '#dc2626'} name="close-circle" size={17} /></Pressable> : null}
                      </View>
                    ))
                  ) : (
                    <Text style={[st.copy, { color: colors.textMuted }]}>Las razas disponibles aparecerán acá.</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      ) : !loading && !error ? (
        <View style={[st.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[st.title, { color: colors.textMain }]}>El catálogo está vacío</Text>
          <Text style={[st.copy, { color: colors.textMuted }]}>
            {canCreate ? 'Agregá la primera especie para empezar a cargar animales.' : 'Pedile al administrador que agregue una especie o raza.'}
          </Text>
        </View>
      ) : null}

      {(admin || owner) && data.pendientes.length ? (
        <>
          <Text style={[st.sectionTitle, { color: colors.textMain }]}>Solicitudes de catálogo pendientes</Text>
          <View style={[st.gridWrap, isDesktop && st.gridWrapDesktop]}>
            {data.pendientes.map((item) => (
              <View
                key={item.id_solicitud_catalogo}
                style={[
                  st.card,
                  { backgroundColor: colors.bgCard, borderColor: colors.border },
                  isDesktop && st.cardDesktop,
                ]}
              >
                <Text style={[st.title, { color: colors.textMain }]}>
                  {item.tipo === 'especie' ? 'Especie' : 'Raza'}: {item.nombre}
                </Text>
                <Text style={[st.copy, { color: colors.textSecondary }]}>
                  {item.tipo === 'raza' ? `Especie: ${item.especie ?? 'sin identificar'}` : 'Nueva especie propuesta por el personal'}
                </Text>
                {owner ? <View style={[st.row, { justifyContent: 'flex-end', marginTop: 14 }]}>
                  <Pressable disabled={busy} onPress={() => void decide(item.id_solicitud_catalogo, 'rechazar')} style={st.danger}><Text style={st.dangerText}>Rechazar</Text></Pressable>
                  <Pressable disabled={busy} onPress={() => void decide(item.id_solicitud_catalogo, 'aprobar')} style={[st.primary, { backgroundColor: isDark ? colors.primaryLight : colors.primary }]}><Text style={st.primaryText}>Aprobar</Text></Pressable>
                </View> : <Text style={[st.copy, { color: colors.textMuted, marginTop: 10 }]}>Pendiente de revisión del dueño.</Text>}
              </View>
            ))}
          </View>
        </>
      ) : null}

      {/* Add Species/Breed Modal */}
      <Modal animationType="fade" onRequestClose={() => setModalOpen(false)} transparent visible={modalOpen}>
        <View style={st.overlay}>
          <View style={[st.modal, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[st.title, { color: colors.textMain, fontSize: 17 }]}>
              {canCreate ? (kind === 'especie' ? 'Agregar especie' : 'Agregar raza') : (kind === 'especie' ? 'Proponer especie' : 'Proponer raza')}
            </Text>
            <Text style={[st.copy, { color: colors.textSecondary }]}>
              {kind === 'raza' ? 'La raza se guardará dentro de la especie seleccionada.' : canCreate ? 'Quedará disponible para registrar animales en la estancia.' : 'El administrador revisará la propuesta antes de habilitarla.'}
            </Text>

            {peon && kind === 'raza' ? (
              <>
                <Text style={[st.fieldLabel, { color: colors.textMuted }]}>ESPECIE</Text>
                <View style={st.rowWrap}>
                  {data.especies.map((species) => (
                    <Pressable
                      key={species.id_especie}
                      onPress={() => setSpeciesId(species.id_especie)}
                      style={[
                        st.option,
                        { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#edf4ec' },
                        speciesId === species.id_especie && { backgroundColor: colors.primary },
                      ]}
                    >
                      <Text style={[st.optionText, { color: colors.textMain }, speciesId === species.id_especie && { color: '#ffffff' }]}>
                        {species.nombre}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}

            <Text style={[st.fieldLabel, { color: colors.textMuted }]}>
              {kind === 'especie' ? 'NOMBRE DE LA ESPECIE' : `NOMBRE DE LA RAZA${speciesId ? ` · ${data.especies.find((item) => item.id_especie === speciesId)?.nombre ?? ''}` : ''}`}
            </Text>
            <TextInput
              accessibilityLabel={kind === 'especie' ? 'Nombre de la especie' : 'Nombre de la raza'}
              autoCapitalize="words"
              maxLength={80}
              onChangeText={setName}
              onSubmitEditing={() => void submit()}
              placeholder={kind === 'especie' ? 'Ej. Bovino, Ovino, Equino' : 'Ej. Angus, Hereford, Criollo'}
              placeholderTextColor={colors.textMuted}
              style={[st.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
              value={name}
            />

            {error ? <Text accessibilityRole="alert" style={st.error}>{error}</Text> : null}

            <View style={[st.row, { justifyContent: 'flex-end', marginTop: 18 }]}>
              <Pressable disabled={busy} onPress={() => setModalOpen(false)} style={[st.secondary, { borderColor: colors.border }]}>
                <Text style={[st.secondaryText, { color: colors.textMuted }]}>Cancelar</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={() => void submit()}
                style={[st.primary, { backgroundColor: colors.primary }, busy && { opacity: 0.6 }]}
              >
                <Text style={st.primaryText}>{busy ? 'Guardando…' : canCreate ? 'Guardar' : 'Enviar solicitud'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal animationType="fade" onRequestClose={() => { if (!busy) setDeleteTarget(null); }} transparent visible={Boolean(deleteTarget)}>
        <View style={st.overlay}><View style={[st.modal, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[st.title, { color: colors.textMain, fontSize: 17 }]}>¿Estás seguro de que querés borrar {deleteTarget?.type === 'especie' ? 'esta especie' : 'esta raza'}?</Text>
          <Text style={[st.copy, { color: colors.textSecondary, marginTop: 8 }]}>Este elemento se eliminará de forma permanente. {deleteTarget?.type === 'especie' ? 'También se borrarán sus razas si no tienen animales asociados.' : ''}</Text>
          {error ? <Text accessibilityRole="alert" style={st.error}>{error}</Text> : null}
          <View style={[st.row, { justifyContent: 'flex-end', marginTop: 18 }]}>
            <Pressable disabled={busy} onPress={() => { setDeleteTarget(null); setError(''); }} style={[st.secondary, { borderColor: colors.border }]}><Text style={[st.secondaryText, { color: colors.textMuted }]}>No, cancelar</Text></Pressable>
            <Pressable disabled={busy} onPress={() => void removeCatalogItem()} style={[st.danger, busy && { opacity: 0.6 }]}><Text style={st.dangerText}>{busy ? 'Borrando…' : 'Sí, borrar'}</Text></Pressable>
          </View>
        </View></View>
      </Modal>
    </Screen>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1 },
  page: { padding: 18, paddingBottom: 36 },
  pageDesktop: { paddingHorizontal: 40, paddingTop: 24 },
  innerWrapper: { width: '100%' },
  innerWrapperDesktop: { alignSelf: 'center', maxWidth: 1200, width: '100%' },

  heading: { fontSize: 26, fontWeight: '800', letterSpacing: -0.6, marginBottom: 14 },
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
  gridWrap: {
    gap: 12,
  },
  gridWrapDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
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
  title: {
    fontSize: 14,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 24,
  },
  copy: {
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 3,
  },
  avatarBadge: {
    alignItems: 'center',
    borderRadius: 12,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  roleBadge: {
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  primary: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    height: 42,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  secondary: {
    borderRadius: 10,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  secondaryText: {
    fontSize: 11,
    fontWeight: '700',
  },
  deleteIconButton: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 48,
  },
  danger: {
    borderColor: '#fca5a5',
    borderRadius: 10,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  dangerText: {
    color: '#dc2626',
    fontSize: 11,
    fontWeight: '700',
  },
  error: {
    backgroundColor: '#fff0ed',
    borderRadius: 10,
    color: '#dc2626',
    fontSize: 12,
    marginBottom: 14,
    padding: 12,
  },
  success: {
    backgroundColor: '#eaf4ec',
    borderRadius: 10,
    color: '#1f4e38',
    fontSize: 12,
    marginVertical: 10,
    padding: 12,
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
    marginTop: 14,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 13,
    height: 46,
    marginTop: 6,
    paddingHorizontal: 12,
  },
  option: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  optionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  breedList: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  breedChip: {
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  breedChipText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(10,20,12,0.6)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: 440,
    padding: 22,
    width: '100%',
  },
});

