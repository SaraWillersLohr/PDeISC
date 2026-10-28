// consulto y gestiono especies, razas y propuestas del catálogo.
// hago operativas la consulta del equipo y la aprobación del catálogo.
import { friendlyErrorMessage } from '../../services/apiErrors';
import { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Modal, Platform, Pressable, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { createBreed, createSpecies, deleteBreed, deleteSpecies, listCatalog, requestCatalog, reviewCatalog, type CatalogData, type Species } from '../../services/organizationApi';
import { Screen } from './OrganizationScreens.shared';
import { st } from './OrganizationStyles';

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
