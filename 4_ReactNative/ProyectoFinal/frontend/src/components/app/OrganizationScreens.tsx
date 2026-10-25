// hago operativas la consulta del equipo y la aprobación del catálogo.
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { createBreed, createSpecies, deactivateOrganizationUser, listCatalog, listOrganizationUsers, requestCatalog, reviewCatalog, updateOrganizationUser, type CatalogData, type OrganizationUser, type Species } from '../../services/organizationApi';

const p = { green: '#214d35', ink: '#202c23', muted: '#748076', line: '#e5eae3', canvas: '#f4f6f1', white: '#fff', pale: '#e8efe5', red: '#a34b43' };
function Screen({ title, children }: React.PropsWithChildren<{ title: string }>) { const { isDark } = useTheme(); return <SafeAreaView edges={['bottom','left','right']} style={[st.safe, isDark && { backgroundColor: '#101b14' }]}><ScrollView contentContainerStyle={st.page}><Text style={[st.heading, isDark && { color: '#f0fdf4' }]}>{title}</Text>{children}</ScrollView></SafeAreaView>; }

export function TeamScreen() {
  const { session } = useSession(); const admin = session?.usuario.rol.toLowerCase() === 'administrador';
  const [users, setUsers] = useState<OrganizationUser[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [selected, setSelected] = useState<OrganizationUser | null>(null); const [confirmDelete, setConfirmDelete] = useState<OrganizationUser | null>(null); const [busy, setBusy] = useState(false);
  const [name, setName] = useState(''); const [surname, setSurname] = useState(''); const [roleDraft, setRoleDraft] = useState('peon');
  const load = useCallback(async () => { if (!session) return; try { setUsers(await listOrganizationUsers(session)); setError(''); } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cargar el equipo.'); } finally { setLoading(false); } }, [session]);
  useEffect(() => {
    if (!session) return;
    let active = true;
    listOrganizationUsers(session)
      .then((result) => { if (active) { setUsers(result); setError(''); } })
      .catch((e: unknown) => { if (active) setError(e instanceof Error ? e.message : 'No se pudo cargar el equipo.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session]);
  async function saveUser(): Promise<void> { if (!session || !selected || !name.trim() || !surname.trim()) { setError('Completá nombre y apellido.'); return; } setBusy(true); try { await updateOrganizationUser(session, { ...selected, nombre: name.trim(), apellido: surname.trim() }, roleDraft); setSelected(null); await load(); } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo editar el usuario.'); } finally { setBusy(false); } }
  async function remove(): Promise<void> { if (!session || !confirmDelete) return; setBusy(true); try { await deactivateOrganizationUser(session, confirmDelete.id_usuario); setConfirmDelete(null); await load(); } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo dar de baja el usuario.'); } finally { setBusy(false); } }
  return <Screen title="Equipo de la estancia">{error ? <Text style={st.error}>{error}</Text> : null}{loading ? <ActivityIndicator color={p.green} /> : users.map((user) => <View key={user.id_usuario} style={st.card}><View style={st.row}><View style={{ flex: 1 }}><Text style={st.title}>{user.nombre} {user.apellido}</Text><Text style={st.copy}>{user.email}</Text></View><Text style={st.badge}>{user.activo ? user.rol : 'inactivo'}</Text></View>{admin ? <View style={st.row}><Pressable onPress={() => { setSelected(user); setName(user.nombre); setSurname(user.apellido); setRoleDraft(user.rol); }} style={st.secondary}><Text style={st.secondaryText}>Editar usuario</Text></Pressable>{user.id_usuario !== session?.usuario.id_usuario ? <Pressable onPress={() => setConfirmDelete(user)} style={st.danger}><Text style={st.dangerText}>Dar de baja</Text></Pressable> : null}</View> : null}</View>)}
    <Modal transparent visible={Boolean(selected)} onRequestClose={() => setSelected(null)}><View style={st.overlay}><View style={st.modal}><Text style={st.title}>Editar usuario</Text><TextInput accessibilityLabel="Nombre" onChangeText={setName} placeholder="Nombre" style={st.input} value={name} /><TextInput accessibilityLabel="Apellido" onChangeText={setSurname} placeholder="Apellido" style={st.input} value={surname} /><Text style={st.copy}>Rol</Text><View style={st.row}>{(['dueno','peon','veterinario','administrador'] as const).map((role) => <Pressable key={role} onPress={() => setRoleDraft(role)} style={[st.option, roleDraft === role && st.optionActive]}><Text style={roleDraft === role ? st.optionActiveText : st.copy}>{role}</Text></Pressable>)}</View><View style={st.row}><Pressable onPress={() => setSelected(null)} style={st.secondary}><Text style={st.secondaryText}>Cancelar</Text></Pressable><Pressable disabled={busy} onPress={() => void saveUser()} style={st.primary}><Text style={st.primaryText}>{busy ? 'Guardando…' : 'Guardar cambios'}</Text></Pressable></View></View></View></Modal>
    <Modal transparent visible={Boolean(confirmDelete)} onRequestClose={() => setConfirmDelete(null)}><View style={st.overlay}><View style={st.modal}><Text style={st.title}>Dar de baja</Text><Text style={st.copy}>Se bloqueará el acceso de {confirmDelete?.nombre} y quedará la autoría histórica.</Text><View style={st.row}><Pressable onPress={() => setConfirmDelete(null)} style={st.secondary}><Text style={st.secondaryText}>Cancelar</Text></Pressable><Pressable disabled={busy} onPress={() => void remove()} style={st.danger}><Text style={st.dangerText}>{busy ? 'Procesando…' : 'Confirmar baja'}</Text></Pressable></View></View></View></Modal>
  </Screen>;
}

export function CatalogScreen() {
  const { session } = useSession();
  const role = session?.usuario.rol.toLowerCase();
  const admin = role === 'administrador' || role === 'copropietario';
  const owner = role === 'dueno';
  const canCreate = admin || owner;
  const peon = role === 'peon';
  const [data, setData] = useState<CatalogData>({ especies: [], razas: [], pendientes: [] });
  const [kind, setKind] = useState<'especie'|'raza'>('especie');
  const [name, setName] = useState('');
  const [speciesId, setSpeciesId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const load = useCallback(async () => {
    if (!session) return;
    try { setData(await listCatalog(session)); setError(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cargar el catálogo.'); }
    finally { setLoading(false); }
  }, [session]);
  useEffect(() => {
    if (!session) return;
    let active = true;
    listCatalog(session)
      .then((result) => { if (active) { setData(result); setError(''); } })
      .catch((e: unknown) => { if (active) setError(e instanceof Error ? e.message : 'No se pudo cargar el catálogo.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session]);
  function openForm(nextKind: 'especie'|'raza', species?: Species): void {
    setKind(nextKind);
    setSpeciesId(species?.id_especie ?? null);
    setName(''); setError(''); setMessage(''); setModalOpen(true);
  }
  async function submit(): Promise<void> {
    if (!session || !name.trim() || (kind === 'raza' && !speciesId)) { setError(kind === 'raza' ? 'Elegí la especie e ingresá el nombre de la raza.' : 'Ingresá el nombre de la especie.'); return; }
    setBusy(true); setError(''); setMessage('');
    try {
      if (canCreate) {
        if (kind === 'especie') await createSpecies(session, name.trim());
        else await createBreed(session, speciesId!, name.trim());
        await load(); setModalOpen(false); setName(''); setMessage(kind === 'especie' ? 'Especie agregada al catálogo.' : 'Raza agregada a la especie.');
      } else {
        await requestCatalog(session, kind, name.trim(), speciesId ?? undefined);
        setModalOpen(false); setName(''); setMessage('Solicitud enviada al administrador para su aprobación.');
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar el cambio.'); }
    finally { setBusy(false); }
  }
  async function decide(id: number, decision: 'aprobar'|'rechazar'): Promise<void> {
    if (!session) return;
    setBusy(true); setError(''); setMessage('');
    try { await reviewCatalog(session, id, decision); await load(); setMessage(decision === 'aprobar' ? 'Solicitud aprobada y agregada al catálogo.' : 'Solicitud rechazada.'); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo revisar la solicitud.'); }
    finally { setBusy(false); }
  }
  return <Screen title="Especies y razas">
    <Text style={st.copy}>Catálogo de la estancia. Las razas quedan agrupadas dentro de su especie.</Text>
    {message ? <Text accessibilityRole="alert" style={st.success}>{message}</Text> : null}
    {error && !loading ? <Text accessibilityRole="alert" style={st.error}>{error}</Text> : null}
    {canCreate ? <Pressable accessibilityRole="button" onPress={() => openForm('especie')} style={[st.primary, { alignSelf: 'flex-start', marginVertical: 12 }]}><Text style={st.primaryText}>＋ Agregar especie</Text></Pressable> : null}
    {peon ? <Pressable accessibilityRole="button" onPress={() => openForm('especie')} style={[st.secondary, { alignSelf: 'flex-start', marginVertical: 12 }]}><Text style={st.secondaryText}>＋ Proponer especie o raza</Text></Pressable> : null}
    {loading ? <ActivityIndicator color={p.green} /> : data.especies.length ? data.especies.map((species) => {
      const breeds = data.razas.filter((breed) => breed.id_especie === species.id_especie);
      return <View key={species.id_especie} style={st.card}>
        <View style={st.row}><View style={{ flex: 1 }}><Text style={st.title}>{species.nombre}</Text><Text style={st.copy}>{breeds.length ? `${breeds.length} ${breeds.length === 1 ? 'raza' : 'razas'}` : 'Todavía no tiene razas'}</Text></View>
          {canCreate ? <Pressable accessibilityRole="button" onPress={() => openForm('raza', species)} style={st.secondary}><Text style={st.secondaryText}>＋ Agregar raza</Text></Pressable> : null}
          {peon ? <Pressable accessibilityRole="button" onPress={() => openForm('raza', species)} style={st.secondary}><Text style={st.secondaryText}>＋ Proponer raza</Text></Pressable> : null}
        </View>
        <View style={st.breedList}>{breeds.length ? breeds.map((breed) => <Text key={breed.id_raza} style={st.breedChip}>{breed.nombre}</Text>) : <Text style={st.copy}>Las razas disponibles aparecerán acá.</Text>}</View>
      </View>;
    }) : !loading && !error ? <View style={st.card}><Text style={st.title}>El catálogo está vacío</Text><Text style={st.copy}>{canCreate ? 'Agregá la primera especie para empezar a cargar animales.' : 'Pedile al administrador que agregue una especie o raza.'}</Text></View> : null}
    {admin && data.pendientes.length ? <><Text style={st.sectionTitle}>Solicitudes pendientes</Text>{data.pendientes.map((item) => <View key={item.id_solicitud_catalogo} style={st.card}><Text style={st.title}>{item.tipo === 'especie' ? 'Especie' : 'Raza'}: {item.nombre}</Text><Text style={st.copy}>{item.tipo === 'raza' ? `Especie: ${item.especie ?? 'sin identificar'}` : 'Nueva especie propuesta'}</Text><View style={st.row}><Pressable disabled={busy} onPress={() => void decide(item.id_solicitud_catalogo, 'rechazar')} style={st.danger}><Text style={st.dangerText}>Rechazar</Text></Pressable><Pressable disabled={busy} onPress={() => void decide(item.id_solicitud_catalogo, 'aprobar')} style={st.primary}><Text style={st.primaryText}>Aprobar</Text></Pressable></View></View>)}</> : null}
    <Modal animationType="fade" onRequestClose={() => setModalOpen(false)} transparent visible={modalOpen}>
      <View style={st.overlay}><View style={st.modal}>
        <Text style={st.title}>{canCreate ? kind === 'especie' ? 'Agregar especie' : 'Agregar raza' : kind === 'especie' ? 'Proponer especie' : 'Proponer raza'}</Text>
        <Text style={st.copy}>{kind === 'raza' ? 'La raza se guardará dentro de la especie seleccionada.' : canCreate ? 'Quedará disponible para cargar animales en esta estancia.' : 'El administrador revisará la solicitud antes de habilitarla.'}</Text>
        {peon && kind === 'raza' ? <><Text style={st.fieldLabel}>ESPECIE</Text><View style={st.row}>{data.especies.map((species) => <Pressable key={species.id_especie} onPress={() => setSpeciesId(species.id_especie)} style={[st.option, speciesId === species.id_especie && st.optionActive]}><Text style={speciesId === species.id_especie ? st.optionActiveText : st.copy}>{species.nombre}</Text></Pressable>)}</View></> : null}
        <Text style={st.fieldLabel}>{kind === 'especie' ? 'NOMBRE DE LA ESPECIE' : `NOMBRE DE LA RAZA${speciesId ? ` · ${data.especies.find((item) => item.id_especie === speciesId)?.nombre ?? ''}` : ''}`}</Text>
        <TextInput accessibilityLabel={kind === 'especie' ? 'Nombre de la especie' : 'Nombre de la raza'} autoCapitalize="words" maxLength={80} onChangeText={setName} onSubmitEditing={() => void submit()} placeholder={kind === 'especie' ? 'Ej. Bovino' : 'Ej. Angus'} style={st.input} value={name} />
        {error ? <Text accessibilityRole="alert" style={st.error}>{error}</Text> : null}
        <View style={st.row}><Pressable disabled={busy} onPress={() => setModalOpen(false)} style={st.secondary}><Text style={st.secondaryText}>Cancelar</Text></Pressable><Pressable accessibilityRole="button" disabled={busy} onPress={() => void submit()} style={[st.primary, busy && { opacity: 0.6 }]}><Text style={st.primaryText}>{busy ? 'Guardando…' : canCreate ? 'Guardar' : 'Enviar solicitud'}</Text></Pressable></View>
      </View></View>
    </Modal>
  </Screen>;
}

const st = StyleSheet.create({ safe: { backgroundColor: p.canvas, flex: 1 }, page: { padding: 20, paddingBottom: 40 }, brand: { color: p.green, fontSize: 15, fontWeight: '900', marginBottom: 18 }, heading: { color: p.ink, fontSize: 24, fontWeight: '800', marginBottom: 18 }, card: { backgroundColor: p.white, borderColor: p.line, borderRadius: 13, borderWidth: 1, marginBottom: 10, padding: 14 }, row: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 9 }, title: { color: p.ink, fontSize: 13, fontWeight: '800' }, sectionTitle: { color: p.ink, fontSize: 17, fontWeight: '800', marginBottom: 11, marginTop: 22 }, copy: { color: p.muted, fontSize: 11, marginTop: 5 }, badge: { backgroundColor: p.pale, borderRadius: 14, color: p.green, fontSize: 9, overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 5, textTransform: 'capitalize' }, primary: { alignItems: 'center', backgroundColor: p.green, borderRadius: 8, justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 10 }, primaryText: { color: p.white, fontSize: 10, fontWeight: '800' }, secondary: { borderColor: p.line, borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9 }, secondaryText: { color: p.green, fontSize: 10, fontWeight: '700' }, danger: { borderColor: '#edd8d5', borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9 }, dangerText: { color: p.red, fontSize: 10, fontWeight: '700' }, error: { backgroundColor: '#fff0ed', borderRadius: 8, color: p.red, marginBottom: 10, padding: 10 }, success: { backgroundColor: '#e8f3e8', borderRadius: 9, color: p.green, fontSize: 11, marginVertical: 9, padding: 11 }, fieldLabel: { color: p.muted, fontSize: 9, fontWeight: '800', letterSpacing: 0.7, marginTop: 16 }, input: { backgroundColor: p.white, borderColor: p.line, borderRadius: 8, borderWidth: 1, color: p.ink, height: 42, marginTop: 8, paddingHorizontal: 10 }, option: { borderRadius: 8, padding: 10 }, optionActive: { backgroundColor: p.green }, optionActiveText: { color: p.white, fontSize: 10, fontWeight: '700' }, catalogRow: { borderTopColor: p.line, borderTopWidth: 1, marginTop: 8, paddingTop: 8 }, breedList: { alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 13 }, breedChip: { backgroundColor: p.pale, borderRadius: 15, color: p.green, fontSize: 10, fontWeight: '700', overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 6 }, overlay: { alignItems: 'center', backgroundColor: 'rgba(0,0,0,.45)', flex: 1, justifyContent: 'center', padding: 20 }, modal: { backgroundColor: p.white, borderRadius: 14, maxWidth: 480, padding: 18, width: '100%' } });
