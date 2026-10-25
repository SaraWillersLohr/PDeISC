// muestro los inventarios de animales y corrales con datos del backend.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, Modal, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { deleteCorral, dischargeAnimal, listAnimals, listCorrals, listNursingAnimals, listNotifications, moveAnimal, saveCorral, updateAnimal, type AnimalRecord, type CorralRecord, type NursingAnimalRecord, type NotificationRecord } from '../../services/livestockApi';
import { AnimalCreateModal } from './AnimalCreateModal';
import { AnimalWeightModal } from './AnimalWeightModal';

// consulto animales y aplico búsqueda local sobre la respuesta vigente.
export function AnimalsInventoryScreen() {
  const { session } = useSession();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;

  const storedRole = session?.usuario.rol.toLowerCase();
  const role = storedRole === 'copropietario' ? 'administrador' : storedRole;
  const canMove = role === 'administrador' || role === 'peon';
  const canWeigh = role === 'administrador' || role === 'peon';
  const canEdit = role === 'administrador' || role === 'dueno' || role === 'peon';

  const [rows, setRows] = useState<AnimalRecord[]>([]);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [corrals, setCorrals] = useState<CorralRecord[]>([]);
  const [moving, setMoving] = useState<AnimalRecord | null>(null);
  const [destination, setDestination] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [moveError, setMoveError] = useState('');
  const [editing, setEditing] = useState<AnimalRecord | null>(null);
  const [viewing, setViewing] = useState<AnimalRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [weighing, setWeighing] = useState<AnimalRecord | null>(null);
  const [editName, setEditName] = useState('');
  const [editIdentifier, setEditIdentifier] = useState('');
  const [editBirth, setEditBirth] = useState('');
  const [editError, setEditError] = useState('');
  const [corralError, setCorralError] = useState('');

  const load = useCallback(async () => {
    if (!session) return;
    setError(''); setCorralError('');
    const [animalsResult, corralsResult] = await Promise.allSettled([listAnimals(session, includeInactive), listCorrals(session)]);
    if (animalsResult.status === 'fulfilled') setRows(animalsResult.value);
    else { setRows([]); setError(animalsResult.reason instanceof Error ? animalsResult.reason.message : 'No se pudo cargar el inventario de animales.'); }
    if (corralsResult.status === 'fulfilled') setCorrals(corralsResult.value);
    else { setCorrals([]); setCorralError(corralsResult.reason instanceof Error ? corralsResult.reason.message : 'No se pudieron cargar los corrales.'); }
    setLoading(false); setRefreshing(false);
  }, [includeInactive, session]);

  useEffect(() => {
    if (!session) return;
    let active = true;
    Promise.allSettled([listAnimals(session, includeInactive), listCorrals(session)]).then(([animalsResult, corralsResult]) => {
      if (!active) return;
      setError(''); setCorralError('');
      if (animalsResult.status === 'fulfilled') setRows(animalsResult.value);
      else { setRows([]); setError(animalsResult.reason instanceof Error ? animalsResult.reason.message : 'No se pudo cargar el inventario de animales.'); }
      if (corralsResult.status === 'fulfilled') setCorrals(corralsResult.value);
      else { setCorrals([]); setCorralError(corralsResult.reason instanceof Error ? corralsResult.reason.message : 'No se pudieron cargar los corrales.'); }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [includeInactive, load, session]);

  const filtered = useMemo(() => rows.filter((animal) => `${animal.identificador} ${animal.nombre ?? ''} ${animal.especie} ${animal.raza} ${animal.corral}`.toLowerCase().includes(query.trim().toLowerCase())), [query, rows]);

  return (
    <InventoryPage
      title="Animales"
      subtitle="INVENTARIO GENERAL DE LA ESTANCIA"
      count={filtered.length}
      search={query}
      onSearch={setQuery}
      loading={loading}
      error={error}
      onRetry={() => { setLoading(true); void load(); }}
      onRefresh={() => { setRefreshing(true); void load(); }}
      refreshing={refreshing}
      headerAction={(
        <View style={style.inventoryActions}>
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: includeInactive }} onPress={() => { setLoading(true); setError(''); setCorralError(''); setIncludeInactive((value) => !value); }} style={[style.cancelButton, { borderColor: colors.border, flexDirection: 'row', gap: 6 }]}>
            <Ionicons color={colors.primary} name={includeInactive ? 'checkbox-outline' : 'square-outline'} size={18} />
            <Text style={[style.cancelText, { color: colors.textSecondary }]}>Incluir inactivos</Text>
          </Pressable>
          {canEdit ? (
            <Pressable onPress={() => setCreating(true)} style={[style.confirmButton, { backgroundColor: colors.primary }]}>
              <Ionicons color="#ffffff" name="add" size={17} style={{ marginRight: 4 }} />
              <Text style={style.confirmText}>Agregar animal</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    >
      {corralError ? <Text style={style.errorText}>No se pudieron cargar los corrales para traslados: {corralError}</Text> : null}

      <View style={[style.gridContainer, isDesktop && style.gridContainerDesktop]}>
        {filtered.map((animal) => (
          <View
            key={animal.id_animal}
            style={[
              style.card,
              { backgroundColor: colors.bgCard, borderColor: colors.border },
              isDesktop && style.cardDesktop,
            ]}
          >
            <View style={style.row}>
              <View style={[style.badge, { backgroundColor: isDark ? 'rgba(134,239,172,0.14)' : '#e8f5ed' }]}>
                <Ionicons color={isDark ? '#86efac' : '#2d6a4f'} name="paw" size={18} />
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Ver ficha de ${animal.nombre || animal.identificador}`}
                onPress={() => setViewing(animal)}
                style={{ flex: 1 }}
              >
                <Text style={[style.title, { color: colors.textMain }]}>{animal.nombre || animal.identificador}</Text>
                <Text style={[style.detail, { color: colors.textMuted }]}>{animal.identificador} · {animal.especie} {animal.raza}</Text>
              </Pressable>
              <View style={[style.statePill, !animal.activo ? { backgroundColor: colors.bgCardMuted } : animal.estado_salud === 'sano' ? style.stateHealthy : style.stateAlert]}>
                <Text style={[style.stateText, !animal.activo ? { color: colors.textMuted } : animal.estado_salud === 'sano' ? style.stateTextHealthy : style.stateTextAlert]}>
                  {animal.activo ? animal.estado_salud.replaceAll('_', ' ') : 'Inactivo'}
                </Text>
              </View>
            </View>

            <View style={[style.divider, { backgroundColor: colors.borderLight }]} />

            <View style={style.row}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons color={colors.textMuted} name="location-outline" size={14} />
                <Text style={[style.detail, { color: colors.textSecondary }]}>
                  {animal.corral}  ·  {animal.peso_kg == null ? 'Sin peso' : `${animal.peso_kg} kg`}
                </Text>
              </View>
              {canEdit && Boolean(animal.activo) ? (
                <Pressable onPress={() => { setEditing(animal); setEditName(animal.nombre ?? ''); setEditIdentifier(animal.identificador); setEditBirth(animal.fecha_nacimiento?.slice(0, 10) ?? ''); setEditError(''); }} style={[style.moveButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#edf4ec' }]}>
                  <Text style={[style.moveButtonText, { color: colors.primary }]}>Editar</Text>
                </Pressable>
              ) : null}
              {canWeigh && Boolean(animal.activo) ? (
                <Pressable onPress={() => setWeighing(animal)} style={[style.moveButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#edf4ec' }]}>
                  <Text style={[style.moveButtonText, { color: colors.primary }]}>Pesar</Text>
                </Pressable>
              ) : null}
              {canMove && Boolean(animal.activo) ? (
                <Pressable onPress={() => { setMoving(animal); setDestination(null); setMoveError(''); }} style={[style.moveButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#edf4ec' }]}>
                  <Text style={[style.moveButtonText, { color: colors.primary }]}>Mover</Text>
                </Pressable>
              ) : null}
            </View>

            <Text style={[style.detail, { color: colors.textMuted, marginTop: 6 }]}>
              {animal.fecha_nacimiento ? `Edad · ${formatAnimalAge(animal.fecha_nacimiento)}` : 'Edad no registrada'}
            </Text>
            {animal.activo && animal.alta_pendiente_traslado ? (
              <View style={style.noticeBanner}>
                <Ionicons color="#b45309" name="alert-circle" size={14} style={{ marginRight: 6 }} />
                <Text style={style.noticeText}>Alta veterinaria lista · pendiente de traslado por el peón</Text>
              </View>
            ) : null}
          </View>
        ))}
      </View>

      {!loading && !error && filtered.length === 0 ? (
        <Empty
          title={query ? 'No encontramos animales' : includeInactive ? 'Todavía no hay animales registrados' : 'No hay animales activos'}
          text={query ? 'Probá buscar por identificador, nombre, raza o corral.' : includeInactive ? 'Los animales registrados del establecimiento aparecerán acá.' : 'Activá «Incluir inactivos» para consultar las fichas de animales dados de baja.'}
        />
      ) : null}

      {/* Edit Modal */}
      <Modal animationType="fade" onRequestClose={() => setEditing(null)} transparent visible={Boolean(editing)}>
        <View style={style.backdrop}>
          <View style={[style.modal, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[style.modalTitle, { color: colors.textMain }]}>Editar ficha del animal</Text>
            <TextInput
              accessibilityLabel="Nombre"
              onChangeText={setEditName}
              placeholder="Nombre"
              placeholderTextColor={colors.textMuted}
              style={[style.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
              value={editName}
            />
            <TextInput
              accessibilityLabel="Identificador"
              onChangeText={setEditIdentifier}
              placeholder="Identificador"
              placeholderTextColor={colors.textMuted}
              style={[style.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
              value={editIdentifier}
            />
            <TextInput
              accessibilityLabel="Fecha de nacimiento"
              onChangeText={setEditBirth}
              placeholder="AAAA-MM-DD"
              placeholderTextColor={colors.textMuted}
              style={[style.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
              value={editBirth}
            />
            {editError ? <Text style={style.errorText}>{editError}</Text> : null}
            <View style={style.modalActions}>
              <Pressable onPress={() => setEditing(null)} style={[style.cancelButton, { borderColor: colors.border }]}>
                <Text style={[style.cancelText, { color: colors.textMuted }]}>Cancelar</Text>
              </Pressable>
              <Pressable onPress={() => void persistAnimal()} style={[style.confirmButton, { backgroundColor: colors.primary }]}>
                <Text style={style.confirmText}>Guardar cambios</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* View Details Modal */}
      <Modal animationType="fade" onRequestClose={() => setViewing(null)} transparent visible={Boolean(viewing)}>
        <View style={style.backdrop}>
          <View style={[style.modal, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[style.modalTitle, { color: colors.textMain }]}>{viewing?.nombre || 'Ficha del animal'}</Text>
            <Text style={[style.detail, { color: colors.textMuted }]}>Identificador · {viewing?.identificador}</Text>
            <View style={[style.divider, { backgroundColor: colors.borderLight }]} />
            <Text style={[style.detail, { color: colors.textSecondary }]}>Especie y raza · {viewing?.especie} · {viewing?.raza}</Text>
            <Text style={[style.detail, { color: colors.textSecondary }]}>Registro · {viewing?.activo ? 'Activo' : 'Inactivo'}</Text>
            <Text style={[style.detail, { color: colors.textSecondary }]}>{viewing?.activo ? 'Ubicación actual' : 'Última ubicación'} · {viewing?.corral}</Text>
            <Text style={[style.detail, { color: colors.textSecondary }]}>Estado sanitario · {viewing?.estado_salud.replaceAll('_', ' ')}</Text>
            <Text style={[style.detail, { color: colors.textSecondary }]}>Edad calculada · {viewing?.fecha_nacimiento ? formatAnimalAge(viewing.fecha_nacimiento) : 'No registrada'}</Text>
            <Text style={[style.detail, { color: colors.textSecondary }]}>Fecha de nacimiento · {viewing?.fecha_nacimiento?.slice(0, 10) ?? 'No registrada'}</Text>
            <Text style={[style.detail, { color: colors.textSecondary }]}>Último peso registrado · {viewing?.peso_kg == null ? 'No registrado' : `${viewing.peso_kg} kg`}</Text>
            {viewing?.activo && viewing.alta_pendiente_traslado ? (
              <View style={style.noticeBanner}>
                <Text style={style.noticeText}>Alta veterinaria registrada · pendiente de traslado físico por el peón.</Text>
              </View>
            ) : null}
            <View style={style.modalActions}>
              <Pressable onPress={() => setViewing(null)} style={[style.confirmButton, { backgroundColor: colors.primary }]}>
                <Text style={style.confirmText}>Cerrar ficha</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Move Animal Modal */}
      <Modal animationType="fade" onRequestClose={() => setMoving(null)} transparent visible={Boolean(moving)}>
        <View style={style.backdrop}>
          <View style={[style.modal, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[style.modalTitle, { color: colors.textMain }]}>Mover animal</Text>
            <Text style={[style.detail, { color: colors.textMuted }]}>
              {moving?.nombre || moving?.identificador} · ubicación actual: {moving?.corral}
            </Text>
            {corrals.find((corral) => corral.id_corral === moving?.id_corral)?.es_enfermeria ? (
              <View style={style.noticeBanner}>
                <Text style={style.noticeText}>El alta veterinaria debe estar confirmada antes de trasladar el animal fuera de enfermería.</Text>
              </View>
            ) : null}
            <Text style={[style.selectLabel, { color: colors.textMuted }]}>SELECCIONÁ EL CORRAL DE DESTINO</Text>
            <ScrollView style={{ maxHeight: 220 }}>
              {corrals
                .filter((corral) => corral.id_corral !== moving?.id_corral && Number(corral.ocupacion) < Number(corral.capacidad))
                .map((corral) => (
                  <Pressable
                    key={corral.id_corral}
                    onPress={() => setDestination(corral.id_corral)}
                    style={[
                      style.destination,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#f8faf7', borderColor: colors.borderLight },
                      destination === corral.id_corral && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                  >
                    <Text style={[style.destinationText, { color: colors.textMain }, destination === corral.id_corral && { color: '#ffffff' }]}>
                      {corral.nombre}
                    </Text>
                    <Text style={[style.detail, { color: colors.textMuted }, destination === corral.id_corral && { color: 'rgba(255,255,255,0.85)' }]}>
                      {corral.ocupacion}/{corral.capacidad} animales · {corral.es_enfermeria ? 'Enfermería' : 'General'}
                    </Text>
                  </Pressable>
                ))}
            </ScrollView>
            {moveError ? <Text style={style.errorText}>{moveError}</Text> : null}
            <View style={style.modalActions}>
              <Pressable onPress={() => setMoving(null)} style={[style.cancelButton, { borderColor: colors.border }]}>
                <Text style={[style.cancelText, { color: colors.textMuted }]}>Cancelar</Text>
              </Pressable>
              <Pressable
                disabled={!destination || saving}
                onPress={() => void saveMovement()}
                style={[style.confirmButton, { backgroundColor: colors.primary }, (!destination || saving) && style.disabledButton]}
              >
                <Text style={style.confirmText}>{saving ? 'Guardando…' : 'Confirmar traslado'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <AnimalCreateModal visible={creating} corrals={corrals} onClose={() => setCreating(false)} onCreated={() => { setLoading(true); void load(); }} />
      <AnimalWeightModal animal={weighing} onClose={() => setWeighing(null)} onSaved={() => { setLoading(true); void load(); }} />
    </InventoryPage>
  );

  async function saveMovement(): Promise<void> {
    if (!session || !moving || !destination) return;
    setSaving(true); setMoveError('');
    try { await moveAnimal(session, moving.id_animal, destination); setMoving(null); setLoading(true); await load(); }
    catch (cause) { setMoveError(cause instanceof Error ? cause.message : 'No se pudo registrar el traslado.'); }
    finally { setSaving(false); }
  }

  async function persistAnimal(): Promise<void> {
    if (!session || !editing || !editIdentifier.trim() || (editBirth.trim() && !isValidBirthDate(editBirth.trim()))) {
      setEditError('El identificador es obligatorio. Revisá que la fecha de nacimiento sea real y no futura.');
      return;
    }
    try {
      await updateAnimal(session, editing, { nombre: editName.trim(), identificador: editIdentifier.trim(), fecha_nacimiento: editBirth.trim() });
      setEditing(null); setLoading(true); await load();
    } catch (cause) {
      setEditError(cause instanceof Error ? cause.message : 'No se pudo guardar la ficha.');
    }
  }
}

// consulto ocupación y capacidad de cada corral activo.
export function CorralsInventoryScreen() {
  const { session } = useSession();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;

  const [rows, setRows] = useState<CorralRecord[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const role = session?.usuario.rol.toLowerCase();
  const canManage = role === 'dueno' || role === 'administrador' || role === 'copropietario';
  const [editing, setEditing] = useState<CorralRecord | null | false>(false);
  const [deleting, setDeleting] = useState<CorralRecord | null>(null);
  const [corralName, setCorralName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [actionError, setActionError] = useState('');
  const [savingCorral, setSavingCorral] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    try { setRows(await listCorrals(session)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo cargar la lista de corrales.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    let active = true;
    listCorrals(session).then((data) => { if (active) setRows(data); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'No se pudo cargar la lista de corrales.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session]);

  const filtered = useMemo(() => rows.filter((corral) => corral.nombre.toLowerCase().includes(query.trim().toLowerCase())), [query, rows]);

  return (
    <InventoryPage
      title="Corrales"
      subtitle="OCUPACIÓN Y CAPACIDAD PRODUCTIVA"
      count={filtered.length}
      search={query}
      onSearch={setQuery}
      loading={loading}
      error={error}
      onRetry={() => { setLoading(true); void load(); }}
      onRefresh={() => { setRefreshing(true); void load(); }}
      refreshing={refreshing}
      headerAction={canManage ? (
        <Pressable onPress={() => { setEditing(null); setCorralName(''); setCapacity(''); setActionError(''); }} style={[style.confirmButton, { backgroundColor: colors.primary }]}>
          <Ionicons color="#ffffff" name="add" size={17} style={{ marginRight: 4 }} />
          <Text style={style.confirmText}>Crear corral</Text>
        </Pressable>
      ) : null}
    >
      {actionError ? <Text style={style.errorText}>{actionError}</Text> : null}

      <View style={[style.gridContainer, isDesktop && style.gridContainerDesktop]}>
        {filtered.map((corral) => {
          const occupancy = Number(corral.ocupacion);
          const maxCapacity = Number(corral.capacidad);
          const ratio = maxCapacity ? Math.min(occupancy / maxCapacity, 1) : 0;
          return (
            <View
              key={corral.id_corral}
              style={[
                style.card,
                { backgroundColor: colors.bgCard, borderColor: colors.border },
                isDesktop && style.cardDesktop,
              ]}
            >
              <View style={style.row}>
                <View style={[style.badge, { backgroundColor: corral.es_enfermeria ? (isDark ? 'rgba(239,68,68,0.18)' : '#faecea') : (isDark ? 'rgba(245,158,11,0.18)' : '#fef3e7') }]}>
                  <Ionicons
                    color={corral.es_enfermeria ? '#ef4444' : '#d97706'}
                    name={corral.es_enfermeria ? 'medkit' : 'grid'}
                    size={18}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[style.title, { color: colors.textMain }]}>{corral.nombre}</Text>
                  <Text style={[style.detail, { color: colors.textMuted }]}>
                    {corral.es_enfermeria ? 'Corral sanitario / enfermería' : 'Corral general operativo'}
                  </Text>
                </View>
                <Text style={[style.occupancy, { color: colors.textMain }]}>
                  {occupancy}
                  <Text style={[style.detail, { color: colors.textMuted }]}> / {maxCapacity}</Text>
                </Text>
              </View>

              <View style={style.track}>
                <View
                  style={[
                    style.progress,
                    {
                      backgroundColor: ratio >= 0.9 ? '#ef4444' : ratio >= 0.7 ? '#f59e0b' : '#34d399',
                      width: `${Math.max(ratio > 0 ? 6 : 0, ratio * 100)}%`,
                    },
                  ]}
                />
              </View>

              <View style={style.row}>
                <Text style={[style.detail, { color: colors.textSecondary, flex: 1 }]}>
                  Ocupación actual · {Math.round(ratio * 100)}%
                </Text>
                {canManage && !corral.es_enfermeria ? (
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable
                      onPress={() => { setEditing(corral); setCorralName(corral.nombre); setCapacity(String(corral.capacidad)); setActionError(''); }}
                      style={[style.moveButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#edf4ec' }]}
                    >
                      <Text style={[style.moveButtonText, { color: colors.primary }]}>Editar</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => { setDeleting(corral); setActionError(''); }}
                      style={[style.moveButton, { backgroundColor: isDark ? 'rgba(239,68,68,0.14)' : '#fee2e2' }]}
                    >
                      <Text style={[style.moveButtonText, { color: '#dc2626' }]}>Baja</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>

      {!loading && !error && filtered.length === 0 ? (
        <Empty
          title={query ? 'No encontramos corrales' : 'Todavía no hay corrales creados'}
          text={query ? 'Probá con otro nombre.' : 'Los corrales del establecimiento aparecerán acá.'}
        />
      ) : null}

      <Modal animationType="fade" onRequestClose={() => setEditing(false)} transparent visible={editing !== false}>
        <View style={style.backdrop}>
          <View style={[style.modal, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[style.modalTitle, { color: colors.textMain }]}>{editing ? 'Editar corral' : 'Nuevo corral'}</Text>
            <Text style={[style.selectLabel, { color: colors.textMuted }]}>NOMBRE</Text>
            <TextInput
              onChangeText={setCorralName}
              placeholder="Ej. Potrero norte"
              placeholderTextColor={colors.textMuted}
              style={[style.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
              value={corralName}
            />
            <Text style={[style.selectLabel, { color: colors.textMuted }]}>CAPACIDAD DE ANIMALES</Text>
            <TextInput
              keyboardType="number-pad"
              onChangeText={setCapacity}
              placeholder="Cantidad de animales permitida"
              placeholderTextColor={colors.textMuted}
              style={[style.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
              value={capacity}
            />
            {actionError ? <Text style={style.errorText}>{actionError}</Text> : null}
            <View style={style.modalActions}>
              <Pressable onPress={() => setEditing(false)} style={[style.cancelButton, { borderColor: colors.border }]}>
                <Text style={[style.cancelText, { color: colors.textMuted }]}>Cancelar</Text>
              </Pressable>
              <Pressable disabled={savingCorral} onPress={() => void persist()} style={[style.confirmButton, { backgroundColor: colors.primary }]}>
                <Text style={style.confirmText}>{savingCorral ? 'Guardando…' : 'Guardar corral'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal animationType="fade" onRequestClose={() => setDeleting(null)} transparent visible={Boolean(deleting)}>
        <View style={style.backdrop}>
          <View style={[style.modal, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[style.modalTitle, { color: colors.textMain }]}>Dar de baja {deleting?.nombre}</Text>
            <Text style={[style.detail, { color: colors.textSecondary }]}>
              {Number(deleting?.ocupacion ?? 0) > 0 ? `Primero trasladá los ${deleting?.ocupacion} animales asignados a otro corral antes de darlo de baja.` : 'El corral quedará inactivo y se conservará su historial productivo.'}
            </Text>
            {actionError ? <Text style={style.errorText}>{actionError}</Text> : null}
            <View style={style.modalActions}>
              <Pressable onPress={() => setDeleting(null)} style={[style.cancelButton, { borderColor: colors.border }]}>
                <Text style={[style.cancelText, { color: colors.textMuted }]}>Cancelar</Text>
              </Pressable>
              <Pressable
                disabled={savingCorral || Number(deleting?.ocupacion ?? 0) > 0}
                onPress={() => deleting && void remove(deleting)}
                style={[style.confirmButton, { backgroundColor: '#dc2626' }, Number(deleting?.ocupacion ?? 0) > 0 && style.disabledButton]}
              >
                <Text style={style.confirmText}>{savingCorral ? 'Procesando…' : 'Confirmar baja'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </InventoryPage>
  );

  async function persist(): Promise<void> {
    if (!session || !corralName.trim() || !Number.isInteger(Number(capacity)) || Number(capacity) < 1) {
      setActionError('Ingresá un nombre y una capacidad válida.');
      return;
    }
    setSavingCorral(true); setActionError('');
    try {
      await saveCorral(session, { ...(editing ? { id_corral: editing.id_corral } : {}), nombre: corralName.trim(), capacidad: Number(capacity) });
      setEditing(false); await load();
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'No se pudo guardar el corral.');
    } finally {
      setSavingCorral(false);
    }
  }

  async function remove(corral: CorralRecord): Promise<void> {
    if (!session) return;
    setActionError('');
    setSavingCorral(true);
    try { await deleteCorral(session, corral.id_corral); setDeleting(null); await load(); }
    catch (cause) { setActionError(cause instanceof Error ? cause.message : 'No se pudo dar de baja el corral.'); }
    finally { setSavingCorral(false); }
  }
}

// permito al veterinario registrar el alta sin alterar la ubicación física.
export function NursingScreen() {
  const { session } = useSession();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;

  const [rows, setRows] = useState<NursingAnimalRecord[]>([]);
  const [selected, setSelected] = useState<NursingAnimalRecord | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    try { setRows(await listNursingAnimals(session)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo cargar enfermería.'); }
    finally { setLoading(false); }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    let active = true;
    listNursingAnimals(session).then((data) => { if (active) setRows(data); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'No se pudo cargar enfermería.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session]);

  async function confirmDischarge(): Promise<void> {
    if (!session || !selected) return;
    setSaving(true); setError('');
    try {
      await dischargeAnimal(session, selected.id_animal, notes);
      setSelected(null); setNotes(''); setLoading(true); await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo registrar el alta.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <InventoryPage
      title="Enfermería"
      subtitle="SEGUIMIENTO VETERINARIO Y ALTAS CLÍNICAS"
      count={rows.length}
      search=""
      onSearch={() => undefined}
      loading={loading}
      error={error}
      onRetry={() => { setLoading(true); void load(); }}
      onRefresh={() => { setLoading(true); void load(); }}
      refreshing={false}
    >
      <View style={[style.gridContainer, isDesktop && style.gridContainerDesktop]}>
        {rows.map((animal) => (
          <View
            key={animal.id_animal}
            style={[
              style.card,
              { backgroundColor: colors.bgCard, borderColor: colors.border },
              isDesktop && style.cardDesktop,
            ]}
          >
            <View style={style.row}>
              <View style={[style.badge, { backgroundColor: isDark ? 'rgba(239,68,68,0.18)' : '#faecea' }]}>
                <Ionicons color="#ef4444" name="medkit" size={18} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[style.title, { color: colors.textMain }]}>{animal.nombre || animal.identificador}</Text>
                <Text style={[style.detail, { color: colors.textMuted }]}>{animal.identificador} · {animal.especie} {animal.raza}</Text>
              </View>
              <View style={[style.statePill, style.stateAlert]}>
                <Text style={[style.stateText, style.stateTextAlert]}>{animal.estado_salud.replaceAll('_', ' ')}</Text>
              </View>
            </View>

            <Text style={[style.detail, { color: colors.textSecondary, marginTop: 10 }]}>
              Ubicación: {animal.corral} · {animal.peso_kg == null ? 'Sin peso registrado' : `${animal.peso_kg} kg`}
            </Text>

            {animal.reporte_sanitario ? (
              <View style={[style.noticeBanner, { backgroundColor: isDark ? 'rgba(245,158,11,0.12)' : '#fffbeb' }]}>
                <Text style={[style.noticeText, { color: isDark ? '#fcd34d' : '#92400e' }]}>Reporte del peón: {animal.reporte_sanitario}</Text>
              </View>
            ) : null}

            {animal.alta_pendiente_traslado ? (
              <View style={style.noticeBanner}>
                <Text style={style.noticeText}>Alta clínica registrada · esperando traslado físico del peón al corral</Text>
              </View>
            ) : (
              <Pressable
                onPress={() => { setSelected(animal); setNotes(''); setError(''); }}
                style={[style.confirmButton, { backgroundColor: colors.primary, marginTop: 12 }]}
              >
                <Ionicons color="#ffffff" name="checkmark-done" size={16} style={{ marginRight: 6 }} />
                <Text style={style.confirmText}>Registrar alta médica y avisar al peón</Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>

      {!loading && !error && rows.length === 0 ? (
        <Empty
          title="Enfermería sin animales"
          text="Los animales trasladados al corral de enfermería para tratamiento aparecerán acá."
        />
      ) : null}

      <Modal animationType="fade" onRequestClose={() => setSelected(null)} transparent visible={Boolean(selected)}>
        <View style={style.backdrop}>
          <View style={[style.modal, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[style.modalTitle, { color: colors.textMain }]}>Registrar alta médica veterinaria</Text>
            <Text style={[style.detail, { color: colors.textSecondary }]}>
              {selected?.nombre || selected?.identificador} permanecerá en enfermería hasta que el personal de campo concrete el traslado físico.
            </Text>
            <TextInput
              accessibilityLabel="Observaciones del alta"
              multiline
              onChangeText={setNotes}
              placeholder="Indicaciones para el equipo de campo (medicación, cuidados)"
              placeholderTextColor={colors.textMuted}
              style={[style.notesInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
              value={notes}
            />
            <View style={style.modalActions}>
              <Pressable onPress={() => setSelected(null)} style={[style.cancelButton, { borderColor: colors.border }]}>
                <Text style={[style.cancelText, { color: colors.textMuted }]}>Cancelar</Text>
              </Pressable>
              <Pressable
                disabled={saving}
                onPress={() => void confirmDischarge()}
                style={[style.confirmButton, { backgroundColor: colors.primary }]}
              >
                <Text style={style.confirmText}>{saving ? 'Guardando…' : 'Dar el alta médica'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </InventoryPage>
  );
}

// muestro avisos del equipo y abro el inventario cuando requieren traslado.
export function NotificationsScreen() {
  const { session } = useSession();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;

  const [rows, setRows] = useState<NotificationRecord[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    let active = true;
    listNotifications(session).then((data) => { if (active) setRows(data); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los avisos.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session]);

  async function reload(): Promise<void> {
    if (!session) return;
    setLoading(true); setError('');
    try { setRows(await listNotifications(session)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los avisos.'); }
    finally { setLoading(false); }
  }

  return (
    <InventoryPage
      title="Avisos"
      subtitle="NOVEDADES Y ALERTAS OPERATIVAS DE LA ESTANCIA"
      count={rows.length}
      search=""
      onSearch={() => undefined}
      loading={loading}
      error={error}
      onRetry={() => void reload()}
      onRefresh={() => void reload()}
      refreshing={false}
    >
      <View style={[style.gridContainer, isDesktop && style.gridContainerDesktop]}>
        {rows.map((notice) => (
          <Pressable
            key={notice.id_notificacion}
            onPress={() => {
              if (notice.tipo === 'alta_enfermeria') router.navigate('/(app)/animals');
              if (notice.tipo === 'reporte_sanitario') router.navigate('/(app)/health');
            }}
            style={({ pressed }) => [
              style.card,
              { backgroundColor: colors.bgCard, borderColor: colors.border },
              isDesktop && style.cardDesktop,
              pressed && { opacity: 0.85 },
            ]}
          >
            <View style={style.row}>
              <View style={[style.badge, { backgroundColor: isDark ? 'rgba(217, 119, 6, 0.18)' : '#fef3c7' }]}>
                <Ionicons color="#d97706" name="notifications" size={18} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[style.title, { color: colors.textMain }]}>{notice.titulo}</Text>
                <Text style={[style.noticeDate, { color: colors.textMuted }]}>
                  {new Date(notice.created_at).toLocaleString('es-AR')}
                </Text>
              </View>
            </View>

            <Text style={[style.detail, { color: colors.textSecondary, marginTop: 8 }]}>{notice.mensaje}</Text>

            {notice.tipo === 'alta_enfermeria' ? (
              <View style={[style.noticeBanner, { marginTop: 12 }]}>
                <Ionicons color="#b45309" name="arrow-forward" size={14} style={{ marginRight: 6 }} />
                <Text style={style.noticeText}>Abrir animales y registrar el traslado físico</Text>
              </View>
            ) : notice.tipo === 'reporte_sanitario' ? (
              <View style={[style.noticeBanner, { marginTop: 12 }]}>
                <Ionicons color="#b45309" name="arrow-forward" size={14} style={{ marginRight: 6 }} />
                <Text style={style.noticeText}>Abrir reporte de campo</Text>
              </View>
            ) : null}
          </Pressable>
        ))}
      </View>

      {!loading && !error && rows.length === 0 ? (
        <Empty title="Sin avisos nuevos" text="Las novedades y alertas de la estancia aparecerán acá." />
      ) : null}
    </InventoryPage>
  );
}

// presento estados de carga, error y contenido con refresco manual.
function InventoryPage({
  title,
  subtitle,
  count,
  search,
  onSearch,
  loading,
  error,
  onRetry,
  onRefresh,
  refreshing,
  headerAction,
  children,
}: {
  title: string;
  subtitle: string;
  count: number;
  search: string;
  onSearch: (value: string) => void;
  loading: boolean;
  error: string;
  onRetry: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[style.safe, { backgroundColor: colors.bgCanvas }]}>
      <ScrollView
        contentContainerStyle={[style.page, isDesktop && style.pageDesktop]}
        refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={refreshing} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={[style.innerWrapper, isDesktop && style.innerWrapperDesktop]}>
          <View style={[style.pageHead, isDesktop && style.pageHeadDesktop]}>
            <View>
              <Text style={[style.heading, { color: colors.textMain }]}>{title}</Text>
              <Text style={[style.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
            </View>
            <View style={style.countBadge}>
              <Text style={[style.countText, { color: colors.primary }]}>{count} registros</Text>
            </View>
          </View>

          {/* Search bar & Action Button */}
          <View style={[style.searchRow, isDesktop && style.searchRowDesktop]}>
            <View style={[style.searchBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Ionicons color={colors.textMuted} name="search-outline" size={18} style={{ marginRight: 8 }} />
              <TextInput
                accessibilityLabel={`Buscar ${title.toLowerCase()}`}
                onChangeText={onSearch}
                placeholder={`Buscar en ${title.toLowerCase()}…`}
                placeholderTextColor={colors.textMuted}
                style={[style.searchInput, { color: colors.inputText }]}
                value={search}
              />
            </View>
            {headerAction}
          </View>

          {loading ? (
            <View style={style.message}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={[style.detail, { color: colors.textMuted }]}>Cargando datos del establecimiento…</Text>
            </View>
          ) : error ? (
            <View style={[style.empty, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              <Ionicons color="#dc2626" name="alert-circle" size={32} />
              <Text style={[style.title, { color: colors.textMain, marginTop: 8 }]}>No se pudo cargar la información</Text>
              <Text style={[style.detail, { color: colors.textMuted }]}>{error}</Text>
              <Pressable accessibilityRole="button" onPress={onRetry} style={[style.retry, { backgroundColor: colors.primary }]}>
                <Text style={style.retryText}>Reintentar conexión</Text>
              </Pressable>
            </View>
          ) : (
            children
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Empty({ title, text }: { title: string; text: string }) {
  const { colors } = useTheme();
  return (
    <View style={[style.empty, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
      <View style={[style.emptyIconWrap, { backgroundColor: colors.bgCardMuted }]}>
        <Ionicons color={colors.primary} name="file-tray-outline" size={28} />
      </View>
      <Text style={[style.title, { color: colors.textMain }]}>{title}</Text>
      <Text style={[style.detail, { color: colors.textMuted }]}>{text}</Text>
    </View>
  );
}

function formatAnimalAge(value: string): string {
  const birth = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return 'fecha no válida';
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  if (today.getDate() < birth.getDate()) months -= 1;
  if (months < 0) { years -= 1; months += 12; }
  if (years < 0) return 'fecha futura';
  if (years === 0 && months === 0) return 'menos de 1 mes';
  return [years ? `${years} ${years === 1 ? 'año' : 'años'}` : '', months ? `${months} ${months === 1 ? 'mes' : 'meses'}` : ''].filter(Boolean).join(' y ');
}

function isValidBirthDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && date <= today;
}

const style = StyleSheet.create({
  safe: { flex: 1 },
  page: { padding: 18, paddingBottom: 36 },
  pageDesktop: { paddingHorizontal: 40, paddingTop: 24 },
  innerWrapper: { width: '100%' },
  innerWrapperDesktop: { alignSelf: 'center', maxWidth: 1200, width: '100%' },

  pageHead: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pageHeadDesktop: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: { fontSize: 26, fontWeight: '800', letterSpacing: -0.6 },
  subtitle: { fontSize: 9.5, fontWeight: '800', letterSpacing: 1.2, marginTop: 4 },
  countBadge: {
    backgroundColor: 'rgba(134, 239, 172, 0.16)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  countText: { fontSize: 11, fontWeight: '800' },

  searchRow: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 18,
  },
  searchRowDesktop: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  inventoryActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  searchBox: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    height: 46,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },

  // Grid
  gridContainer: {
    gap: 12,
  },
  gridContainerDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cardDesktop: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  badge: {
    alignItems: 'center',
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
  },
  detail: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  statePill: {
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  stateHealthy: {
    backgroundColor: '#eaf4ec',
  },
  stateAlert: {
    backgroundColor: '#fee2e2',
  },
  stateText: {
    fontSize: 9.5,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  stateTextHealthy: {
    color: '#1f4e38',
  },
  stateTextAlert: {
    color: '#dc2626',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },
  occupancy: {
    fontSize: 18,
    fontWeight: '800',
  },
  track: {
    backgroundColor: 'rgba(128,128,128,0.15)',
    borderRadius: 5,
    height: 8,
    marginBottom: 8,
    marginTop: 14,
    overflow: 'hidden',
  },
  progress: {
    borderRadius: 5,
    height: 8,
  },

  noticeBanner: {
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    flexDirection: 'row',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  noticeText: {
    color: '#92400e',
    fontSize: 10.5,
    fontWeight: '700',
  },
  noticeDate: {
    fontSize: 10,
    marginTop: 2,
  },

  empty: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
  },
  emptyIconWrap: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginBottom: 12,
    width: 48,
  },
  message: {
    alignItems: 'center',
    gap: 12,
    padding: 40,
  },
  retry: {
    borderRadius: 10,
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  moveButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  moveButtonText: {
    fontSize: 11,
    fontWeight: '800',
  },
  confirmButton: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  confirmText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  cancelButton: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  cancelText: {
    fontSize: 12,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.5,
  },

  // Modal
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(10,20,12,0.6)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    borderRadius: 20,
    borderWidth: 1,
    maxHeight: '85%',
    maxWidth: 480,
    padding: 22,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  modalInput: {
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 13,
    height: 46,
    marginTop: 10,
    paddingHorizontal: 12,
  },
  notesInput: {
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 12,
    marginTop: 12,
    minHeight: 80,
    padding: 12,
    textAlignVertical: 'top',
  },
  selectLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 14,
  },
  destination: {
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    padding: 12,
  },
  destinationText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    marginTop: 18,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 11,
    marginTop: 8,
  },
});
