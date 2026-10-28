// muestro la ficha ganadera y sus operaciones desde el inventario.
// muestro los inventarios de animales y corrales con datos del backend.
import { friendlyErrorMessage } from '../../services/apiErrors';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Image, Modal, Platform, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { deactivateAnimal, listAnimals, listCorrals, moveAnimal, permanentlyDeleteInactiveAnimal, updateAnimal, type AnimalGender, type AnimalRecord, type CorralRecord } from '../../services/livestockApi';
import { reportAnimal } from '../../services/productionApi';
import { listCatalog } from '../../services/organizationApi';
import { AnimalCreateModal } from './AnimalCreateModal';
import { AnimalWeightModal } from './AnimalWeightModal';
import { BirthForm } from './BirthForm';
import { PhotoAttachment } from './PhotoAttachment';
import { InventoryPage , SpeciesFilterChip , formatAnimalAge , Empty , isValidBirthDate } from './LivestockScreens.shared';
import { style } from './LivestockStyles';
import { MatingServiceForm } from './MatingServiceForm';

export const genderOptions: { value: AnimalGender; label: string }[] = [
  { value: 'hembra', label: 'Hembra' },
  { value: 'macho', label: 'Macho' },
  { value: 'no_especificado', label: 'No especificado' },
];

export function genderLabel(gender: AnimalGender): string {
  return genderOptions.find((option) => option.value === gender)?.label ?? 'No especificado';
}

// consulto animales y aplico búsqueda local sobre la respuesta vigente.
export function AnimalsInventoryScreen() {
  const { session } = useSession();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;

  const storedRole = session?.usuario.rol.toLowerCase();
  const role = storedRole === 'copropietario' ? 'administrador' : storedRole;
  const canMove = role === 'peon';
  const canWeigh = role === 'peon';
  const canEdit = role === 'dueno' || role === 'peon';
  const ownerCanDeactivate = role === 'dueno';

  const [rows, setRows] = useState<AnimalRecord[]>([]);
  const [catalogSpecies, setCatalogSpecies] = useState<string[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState('Todas');
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
  const [deactivating, setDeactivating] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState<'venta' | 'muerte' | 'otro'>('venta');
  const [deactivationDetail, setDeactivationDetail] = useState('');
  const [deactivationError, setDeactivationError] = useState('');
  const [deactivatingBusy, setDeactivatingBusy] = useState(false);
  const [deathLocation, setDeathLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [deathLocationError, setDeathLocationError] = useState('');
  const [gettingDeathLocation, setGettingDeathLocation] = useState(false);
  const [deathPhoto, setDeathPhoto] = useState<string | null>(null);
  const [reportingIllness, setReportingIllness] = useState(false);
  const [illnessNotes, setIllnessNotes] = useState('');
  const [illnessCorralId, setIllnessCorralId] = useState<number | null>(null);
  const [illnessError, setIllnessError] = useState('');
  const [illnessSaving, setIllnessSaving] = useState(false);
  const [confirmPermanentDelete, setConfirmPermanentDelete] = useState(false);
  const [permanentDeleteError, setPermanentDeleteError] = useState('');
  const [permanentDeleteBusy, setPermanentDeleteBusy] = useState(false);
  const [registeringMating, setRegisteringMating] = useState(false);
  const [registeringBirth, setRegisteringBirth] = useState(false);
  const [serviceNotice, setServiceNotice] = useState('');
  const [creating, setCreating] = useState(false);
  const [weighing, setWeighing] = useState<AnimalRecord | null>(null);
  const [editName, setEditName] = useState('');
  const [editIdentifier, setEditIdentifier] = useState('');
  const [editBirth, setEditBirth] = useState('');
  const [editGender, setEditGender] = useState<AnimalGender>('no_especificado');
  const [editError, setEditError] = useState('');
  const [corralError, setCorralError] = useState('');

  const load = useCallback(async () => {
    if (!session) return;
    setError(''); setCorralError('');
    const [animalsResult, corralsResult] = await Promise.allSettled([listAnimals(session, includeInactive), listCorrals(session)]);
    if (animalsResult.status === 'fulfilled') setRows(animalsResult.value);
    else { setRows([]); setError(friendlyErrorMessage(animalsResult.reason, 'No se pudo cargar el inventario de animales.')); }
    if (corralsResult.status === 'fulfilled') setCorrals(corralsResult.value);
    else { setCorrals([]); setCorralError(friendlyErrorMessage(corralsResult.reason, 'No se pudieron cargar los corrales.')); }
    setLoading(false); setRefreshing(false);
  }, [includeInactive, session]);

  useEffect(() => {
    if (!session) return;
    let active = true;
    Promise.allSettled([listAnimals(session, includeInactive), listCorrals(session)]).then(([animalsResult, corralsResult]) => {
      if (!active) return;
      setError(''); setCorralError('');
      if (animalsResult.status === 'fulfilled') setRows(animalsResult.value);
      else { setRows([]); setError(friendlyErrorMessage(animalsResult.reason, 'No se pudo cargar el inventario de animales.')); }
      if (corralsResult.status === 'fulfilled') setCorrals(corralsResult.value);
      else { setCorrals([]); setCorralError(friendlyErrorMessage(corralsResult.reason, 'No se pudieron cargar los corrales.')); }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [includeInactive, load, session]);

  useEffect(() => {
    if (!session) return;
    let active = true;
    void listCatalog(session)
      .then((catalog) => {
        if (active) setCatalogSpecies(catalog.especies.map((item) => item.nombre).sort((a, b) => a.localeCompare(b, 'es')));
      })
      .catch(() => {
        // Si el catálogo no está disponible, ofrezco los tipos presentes en las fichas cargadas.
        if (active) setCatalogSpecies([]);
      });
    return () => { active = false; };
  }, [session]);

  const availableSpecies = useMemo(() => {
    const names = catalogSpecies.length ? catalogSpecies : rows.map((animal) => animal.especie);
    return Array.from(new Set(names.map((name) => name.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es'));
  }, [catalogSpecies, rows]);

  const filtered = useMemo(() => rows.filter((animal) => {
    const matchesSpecies = selectedSpecies === 'Todas' || animal.especie.trim().toLocaleLowerCase('es') === selectedSpecies.toLocaleLowerCase('es');
    const matchesSearch = `${animal.identificador} ${animal.nombre ?? ''} ${animal.especie} ${animal.raza} ${animal.corral}`.toLocaleLowerCase('es').includes(query.trim().toLocaleLowerCase('es'));
    return matchesSpecies && matchesSearch;
  }), [query, rows, selectedSpecies]);

  return (
    <InventoryPage
      title="Mis animales"
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
      {serviceNotice ? <Text style={style.successText}>{serviceNotice}</Text> : null}

      <View style={style.speciesFilter}>
        <Text style={[style.speciesFilterLabel, { color: colors.textSecondary }]}>Filtrar por especie</Text>
        <ScrollView horizontal contentContainerStyle={style.speciesFilterOptions} showsHorizontalScrollIndicator={false}>
          <SpeciesFilterChip active={selectedSpecies === 'Todas'} label="Todos" onPress={() => setSelectedSpecies('Todas')} />
          {availableSpecies.map((species) => (
            <SpeciesFilterChip key={species} active={selectedSpecies.toLocaleLowerCase('es') === species.toLocaleLowerCase('es')} label={species} onPress={() => setSelectedSpecies(species)} />
          ))}
        </ScrollView>
      </View>

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
                {animal.foto ? <Image source={{ uri: animal.foto }} style={style.animalPhoto} /> : <Ionicons color={isDark ? '#86efac' : '#2d6a4f'} name="paw" size={18} />}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Ver ficha de ${animal.nombre || animal.identificador}`}
                onPress={() => { setViewing(animal); setRegisteringMating(false); setRegisteringBirth(false); }}
                style={{ flex: 1 }}
              >
                <Text style={[style.title, { color: colors.textMain }]}>{animal.nombre || animal.identificador}</Text>
                <Text style={[style.detail, { color: colors.textMuted }]}>{animal.identificador} · {animal.especie} {animal.raza} · {genderLabel(animal.genero)}</Text>
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
                <Pressable onPress={() => { setEditing(animal); setEditName(animal.nombre ?? ''); setEditIdentifier(animal.identificador); setEditBirth(animal.fecha_nacimiento?.slice(0, 10) ?? ''); setEditGender(animal.genero); setEditError(''); }} style={[style.moveButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#edf4ec' }]}>
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
          title={query || selectedSpecies !== 'Todas' ? 'No encontramos animales' : includeInactive ? 'Todavía no hay animales registrados' : 'No hay animales activos'}
          text={query || selectedSpecies !== 'Todas' ? 'Probá cambiar la especie o buscar por identificador, nombre, raza o corral.' : includeInactive ? 'Los animales registrados del establecimiento aparecerán acá.' : 'Activá «Incluir inactivos» para consultar las fichas de animales dados de baja.'}
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
            <Text style={[style.selectLabel, { color: colors.textMuted }]}>GÉNERO</Text>
            <View style={style.genderOptions}>
              {genderOptions.map((option) => {
                const active = editGender === option.value;
                return <Pressable accessibilityRole="radio" accessibilityState={{ selected: active }} key={option.value} onPress={() => setEditGender(option.value)} style={[style.genderOption, { backgroundColor: active ? colors.primary : colors.bgCardMuted, borderColor: active ? colors.primary : colors.border }]}><Text style={[style.destinationText, { color: active ? '#ffffff' : colors.textSecondary }]}>{option.label}</Text></Pressable>;
              })}
            </View>
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
      <Modal animationType="fade" onRequestClose={() => { setViewing(null); setRegisteringMating(false); setRegisteringBirth(false); setDeactivating(false); setReportingIllness(false); }} transparent visible={Boolean(viewing)}>
        <View style={style.backdrop}>
          <View style={[style.modal, style.animalDetailModal, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            {confirmPermanentDelete && viewing ? (
              <View>
                <Text style={[style.modalTitle, { color: colors.textMain }]}>Eliminar definitivamente {viewing.nombre || viewing.identificador}</Text>
                <Text style={[style.detail, { color: colors.textSecondary, marginTop: 8 }]}>Se eliminará la ficha inactiva y sus registros vinculados. Esta acción no se puede deshacer.</Text>
                {permanentDeleteError ? <Text style={style.errorText}>{permanentDeleteError}</Text> : null}
                <View style={style.modalActions}>
                  <Pressable disabled={permanentDeleteBusy} onPress={() => { setConfirmPermanentDelete(false); setPermanentDeleteError(''); }} style={[style.cancelButton, { borderColor: colors.border }]}><Text style={[style.cancelText, { color: colors.textMuted }]}>Cancelar</Text></Pressable>
                  <Pressable disabled={permanentDeleteBusy} onPress={() => void permanentlyDeleteViewingAnimal()} style={[style.confirmButton, { backgroundColor: '#dc2626' }, permanentDeleteBusy && style.disabledButton]}><Text style={style.confirmText}>{permanentDeleteBusy ? 'Eliminando…' : 'Eliminar definitivamente'}</Text></Pressable>
                </View>
              </View>
            ) : reportingIllness && viewing ? (
              <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: '82%' }}>
                <Text style={[style.modalTitle, { color: colors.textMain }]}>Reportar enfermedad</Text>
                <Text style={[style.detail, { color: colors.textSecondary, marginBottom: 12 }]}>{viewing.nombre || viewing.identificador} · se registrará el problema y el traslado físico a enfermería.</Text>
                <Text style={[style.selectLabel, { color: colors.textMuted }]}>CORRAL DE ENFERMERÍA</Text>
                <View style={style.genderOptions}>
                  {corrals.filter((corral) => corral.es_enfermeria && (corral.id_corral === viewing.id_corral || Number(corral.ocupacion) < Number(corral.capacidad))).map((corral) => <Pressable key={corral.id_corral} accessibilityRole="radio" accessibilityState={{ selected: illnessCorralId === corral.id_corral }} onPress={() => setIllnessCorralId(corral.id_corral)} style={[style.genderOption, { backgroundColor: illnessCorralId === corral.id_corral ? colors.primary : colors.bgCardMuted, borderColor: illnessCorralId === corral.id_corral ? colors.primary : colors.border }]}><Text style={[style.destinationText, { color: illnessCorralId === corral.id_corral ? '#fff' : colors.textSecondary }]}>{corral.nombre} · {corral.ocupacion}/{corral.capacidad}</Text></Pressable>)}
                </View>
                {!corrals.some((corral) => corral.es_enfermeria && (corral.id_corral === viewing.id_corral || Number(corral.ocupacion) < Number(corral.capacidad))) ? <Text style={[style.detail, { color: '#b42318' }]}>No hay lugar disponible en enfermería.</Text> : null}
                <TextInput accessibilityLabel="Observaciones de enfermedad" maxLength={500} multiline onChangeText={setIllnessNotes} placeholder="Síntomas u observaciones (opcional)" placeholderTextColor={colors.textMuted} style={[style.modalInput, style.notesInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]} value={illnessNotes} />
                {illnessError ? <Text style={style.errorText}>{illnessError}</Text> : null}
                <View style={style.modalActions}>
                  <Pressable disabled={illnessSaving} onPress={() => setReportingIllness(false)} style={[style.cancelButton, { borderColor: colors.border }]}><Text style={[style.cancelText, { color: colors.textMuted }]}>Volver</Text></Pressable>
                  <Pressable disabled={illnessSaving || !illnessCorralId} onPress={() => void submitIllnessReport()} style={[style.confirmButton, { backgroundColor: colors.primary }, (illnessSaving || !illnessCorralId) && style.disabledButton]}><Text style={style.confirmText}>{illnessSaving ? 'Guardando…' : 'Reportar e ingresar'}</Text></Pressable>
                </View>
              </ScrollView>
            ) : deactivating && viewing ? (
              <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: '82%' }}>
                <Text style={[style.modalTitle, { color: colors.textMain }]}>{deactivationReason === 'muerte' ? `Notificar muerte · ${viewing.nombre || viewing.identificador}` : `Dar de baja ${viewing.nombre || viewing.identificador}`}</Text>
                <Text style={[style.detail, { color: colors.textSecondary, marginBottom: 12 }]}>{deactivationReason === 'muerte' ? ownerCanDeactivate ? 'La muerte quedará registrada y la ficha se conservará.' : 'La muerte quedará notificada para revisión administrativa y la ficha se conservará.' : 'El animal dejará de aparecer en el inventario activo. Su ficha y su historial se conservarán.'}</Text>
                {ownerCanDeactivate && deactivationReason !== 'muerte' ? <><Text style={[style.selectLabel, { color: colors.textMuted }]}>MOTIVO</Text><View style={style.genderOptions}>{(['venta', 'otro'] as const).map((reason) => <Pressable key={reason} accessibilityRole="radio" accessibilityState={{ selected: deactivationReason === reason }} onPress={() => setDeactivationReason(reason)} style={[style.genderOption, { backgroundColor: deactivationReason === reason ? colors.primary : colors.bgCardMuted, borderColor: deactivationReason === reason ? colors.primary : colors.border }]}><Text style={[style.destinationText, { color: deactivationReason === reason ? '#fff' : colors.textSecondary }]}>{reason === 'otro' ? 'Otro' : 'Venta'}</Text></Pressable>)}</View></> : <Text style={[style.selectLabel, { color: colors.textMuted }]}>NOTIFICACIÓN DE MUERTE</Text>}
                <TextInput accessibilityLabel="Detalle opcional de la baja o muerte" maxLength={500} multiline onChangeText={setDeactivationDetail} placeholder="Detalle u observaciones (opcional)" placeholderTextColor={colors.textMuted} style={[style.modalInput, style.notesInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]} value={deactivationDetail} />
                {deactivationReason === 'muerte' ? <>
                  <Text style={[style.selectLabel, { color: colors.textMuted, marginTop: 10 }]}>UBICACIÓN GPS · OBLIGATORIA</Text>
                  <Pressable disabled={gettingDeathLocation} onPress={() => void captureDeathLocation()} style={[style.cancelButton, { borderColor: colors.border, alignSelf: 'flex-start' }]}><Text style={[style.cancelText, { color: colors.primary }]}>{gettingDeathLocation ? 'Obteniendo ubicación…' : deathLocation ? 'Actualizar ubicación GPS' : 'Obtener ubicación GPS'}</Text></Pressable>
                  {deathLocation ? <Text style={[style.detail, { color: colors.textSecondary }]}>Ubicación lista · {deathLocation.latitude.toFixed(6)}, {deathLocation.longitude.toFixed(6)}</Text> : null}
                  <PhotoAttachment value={deathPhoto} onChange={setDeathPhoto} />
                  {deathLocationError ? <Text style={style.errorText}>{deathLocationError}</Text> : null}
                </> : null}
                {deactivationError ? <Text style={style.errorText}>{deactivationError}</Text> : null}
                <View style={style.modalActions}>
                  <Pressable disabled={deactivatingBusy} onPress={() => setDeactivating(false)} style={[style.cancelButton, { borderColor: colors.border }]}><Text style={[style.cancelText, { color: colors.textMuted }]}>Volver</Text></Pressable>
                  <Pressable disabled={deactivatingBusy} onPress={() => void confirmDeactivation()} style={[style.confirmButton, { backgroundColor: '#dc2626' }, deactivatingBusy && style.disabledButton]}><Text style={style.confirmText}>{deactivatingBusy ? 'Guardando…' : deactivationReason === 'muerte' ? ownerCanDeactivate ? 'Confirmar muerte' : 'Notificar muerte' : 'Confirmar baja'}</Text></Pressable>
                </View>
              </ScrollView>
            ) : registeringMating && viewing ? (
              <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: '82%' }}>
                <MatingServiceForm
                  animals={rows}
                  mother={viewing}
                  onBack={() => setRegisteringMating(false)}
                  onCancel={() => { setViewing(null); setRegisteringMating(false); }}
                  onSaved={() => { setServiceNotice('Servicio reproductivo registrado.'); setViewing(null); setRegisteringMating(false); }}
                />
              </ScrollView>
            ) : registeringBirth && viewing ? (
              <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: '82%' }}>
                <BirthForm
                  initialMother={viewing}
                  onSaved={() => { setServiceNotice('Nacimiento registrado.'); setViewing(null); setRegisteringBirth(false); }}
                />
                <View style={style.matingActions}>
                  <Pressable onPress={() => setRegisteringBirth(false)} style={[style.matingActionButton, { borderColor: colors.border }]}>
                    <Text style={[style.cancelText, { color: colors.textMuted }]}>Volver a ficha</Text>
                  </Pressable>
                  <Pressable onPress={() => { setViewing(null); setRegisteringBirth(false); }} style={[style.matingActionButton, { borderColor: colors.border }]}>
                    <Text style={[style.cancelText, { color: colors.textMuted }]}>Cancelar</Text>
                  </Pressable>
                </View>
              </ScrollView>
            ) : (
              <ScrollView
                contentContainerStyle={style.animalDetailContent}
                showsVerticalScrollIndicator
                style={style.animalDetailScroll}
              >
                <Text style={[style.modalTitle, { color: colors.textMain }]}>{viewing?.nombre || 'Ficha del animal'}</Text>
                <Text style={[style.detail, { color: colors.textMuted }]}>Identificador · {viewing?.identificador}</Text>
                <View style={[style.divider, { backgroundColor: colors.borderLight }]} />
                <Text style={[style.detail, { color: colors.textSecondary }]}>Especie y raza · {viewing?.especie} · {viewing?.raza}</Text>
                <Text style={[style.detail, { color: colors.textSecondary }]}>Género · {viewing ? genderLabel(viewing.genero) : 'No especificado'}</Text>
                <Text style={[style.detail, { color: colors.textSecondary }]}>Registro · {viewing?.activo ? 'Activo' : 'Inactivo'}</Text>
                {!viewing?.activo && viewing?.motivo_baja ? <Text style={[style.detail, { color: colors.textSecondary }]}>Baja · {viewing.motivo_baja} · {viewing.fecha_baja?.slice(0, 10)}{viewing.detalle_baja ? ` · ${viewing.detalle_baja}` : ''}</Text> : null}
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
                {viewing?.activo && canEdit && viewing.genero === 'no_especificado' ? (
                  <View style={style.noticeBanner}>
                    <Text style={style.noticeText}>Elegí el género en «Editar» para habilitar los registros reproductivos de este animal.</Text>
                  </View>
                ) : null}
                {viewing?.activo && canEdit && viewing.genero === 'hembra' ? (
                  <View style={style.matingCtas}>
                    <Pressable onPress={() => setRegisteringMating(true)} style={[style.matingCta, { backgroundColor: colors.primary }]}>
                      <Ionicons color="#ffffff" name="git-branch-outline" size={16} />
                      <Text style={style.confirmText}>Registrar servicio reproductivo</Text>
                    </Pressable>
                    <Pressable onPress={() => setRegisteringBirth(true)} style={[style.matingCta, { backgroundColor: colors.accentLime }]}>
                      <Ionicons color={colors.primary} name="heart-outline" size={16} />
                      <Text style={[style.confirmText, { color: colors.primary }]}>Registrar nacimiento</Text>
                    </Pressable>
                  </View>
                ) : null}
                {viewing?.activo && canMove ? <View style={style.matingCtas}>
                  <Pressable onPress={() => { const currentNursing = corrals.find((corral) => corral.id_corral === viewing.id_corral && corral.es_enfermeria); const availableNursing = corrals.find((corral) => corral.es_enfermeria && Number(corral.ocupacion) < Number(corral.capacidad)); setIllnessCorralId(currentNursing?.id_corral ?? availableNursing?.id_corral ?? null); setIllnessNotes(''); setIllnessError(''); setReportingIllness(true); }} style={[style.matingCta, { backgroundColor: '#a8473d' }]}>
                    <Ionicons color="#ffffff" name="medkit-outline" size={16} /><Text style={style.confirmText}>Reportar enfermedad e ingresar a enfermería</Text>
                  </Pressable>
                  {!ownerCanDeactivate ? <Pressable onPress={() => { setDeactivationReason('muerte'); setDeactivationDetail(''); setDeathLocation(null); setDeathLocationError(''); setDeathPhoto(null); setDeactivationError(''); setDeactivating(true); }} style={[style.matingCta, { backgroundColor: '#dc2626' }]}>
                    <Ionicons color="#ffffff" name="heart-dislike-outline" size={16} /><Text style={style.confirmText}>Notificar muerte</Text>
                  </Pressable> : null}
                </View> : null}
                {viewing?.activo && ownerCanDeactivate ? (
                  <View style={style.matingCtas}>
                    <Pressable onPress={() => { setDeactivationReason('venta'); setDeactivationDetail(''); setDeathLocation(null); setDeathLocationError(''); setDeathPhoto(null); setDeactivationError(''); setDeactivating(true); }} style={[style.matingCta, { backgroundColor: '#dc2626' }]}><Ionicons color="#ffffff" name="trash-outline" size={16} /><Text style={style.confirmText}>Borrar animal</Text></Pressable>
                    <Pressable onPress={() => { setDeactivationReason('muerte'); setDeactivationDetail(''); setDeathLocation(null); setDeathLocationError(''); setDeathPhoto(null); setDeactivationError(''); setDeactivating(true); }} style={[style.matingCta, { backgroundColor: '#a83232' }]}><Ionicons color="#ffffff" name="heart-dislike-outline" size={16} /><Text style={style.confirmText}>Notificar muerte</Text></Pressable>
                  </View>
                ) : null}
                {!viewing?.activo && ownerCanDeactivate ? (
                  <Pressable onPress={() => { setPermanentDeleteError(''); setConfirmPermanentDelete(true); }} style={[style.matingCta, { backgroundColor: '#dc2626', marginTop: 12 }]}>
                    <Ionicons color="#ffffff" name="trash-outline" size={16} />
                    <Text style={style.confirmText}>Eliminar ficha definitivamente</Text>
                  </Pressable>
                ) : null}
                <View style={style.modalActions}>
                  <Pressable onPress={() => setViewing(null)} style={[style.confirmButton, { backgroundColor: colors.primary }]}>
                    <Text style={style.confirmText}>Cerrar ficha</Text>
                  </Pressable>
                </View>
              </ScrollView>
            )}
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
    try {
      const result = await moveAnimal(session, moving.id_animal, destination);
      if (result.estado === 'pendiente') setServiceNotice(`Traslado guardado en el dispositivo. ${result.mensaje}`);
      setMoving(null); setLoading(true); await load();
    }
    catch (cause) { setMoveError(friendlyErrorMessage(cause, 'No se pudo registrar el traslado.')); }
    finally { setSaving(false); }
  }

  async function persistAnimal(): Promise<void> {
    if (!session || !editing || !editIdentifier.trim() || (editBirth.trim() && !isValidBirthDate(editBirth.trim()))) {
      setEditError('El identificador es obligatorio. Revisá que la fecha de nacimiento sea real y no futura.');
      return;
    }
    try {
      await updateAnimal(session, editing, { nombre: editName.trim(), identificador: editIdentifier.trim(), fecha_nacimiento: editBirth.trim(), genero: editGender });
      setEditing(null); setLoading(true); await load();
    } catch (cause) {
      setEditError(friendlyErrorMessage(cause, 'No se pudo guardar la ficha.'));
    }
  }

  async function confirmDeactivation(): Promise<void> {
    if (!session || !viewing) return;
    if (deactivationReason === 'muerte' && !deathLocation) { setDeathLocationError('Obtené la ubicación GPS antes de notificar la muerte.'); return; }
    setDeactivatingBusy(true); setDeactivationError('');
    try {
      if (deactivationReason === 'muerte' && !ownerCanDeactivate) {
        const now = new Date(); const fecha = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const result = await reportAnimal(session, 'muerte', { id_animal: viewing.id_animal, fecha, motivo: deactivationDetail.trim() || undefined, latitud: deathLocation!.latitude, longitud: deathLocation!.longitude, foto: deathPhoto ?? undefined });
        setServiceNotice(result.estado === 'pendiente'
          ? `Muerte guardada en el dispositivo. Al sincronizar se dará de baja operativa y quedará pendiente de revisión administrativa. ${result.mensaje}`
          : 'Muerte notificada con ubicación. La baja operativa quedó registrada y espera revisión administrativa.');
      } else {
        await deactivateAnimal(session, viewing.id_animal, deactivationReason, deactivationDetail.trim(), deactivationReason === 'muerte' ? { ...deathLocation!, foto: deathPhoto ?? undefined } : undefined);
        setServiceNotice(deactivationReason === 'muerte' ? 'Muerte registrada y confirmada.' : 'Animal dado de baja; se conservó su ficha e historial.');
      }
      setViewing(null); setDeactivating(false); setLoading(true); await load();
    } catch (cause) { setDeactivationError(friendlyErrorMessage(cause, 'No se pudo guardar la baja o notificación.')); }
    finally { setDeactivatingBusy(false); }
  }

  async function captureDeathLocation(): Promise<void> {
    setGettingDeathLocation(true); setDeathLocationError('');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) { setDeathLocationError('Dale permiso de ubicación a EstanciaApp para continuar.'); return; }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setDeathLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
    } catch { setDeathLocationError('No se pudo obtener la ubicación GPS. Revisá el permiso y la señal e intentá de nuevo.'); }
    finally { setGettingDeathLocation(false); }
  }

  async function submitIllnessReport(): Promise<void> {
    if (!session || !viewing || !illnessCorralId) { setIllnessError('Elegí un corral de enfermería con lugar disponible.'); return; }
    const now = new Date(); const fecha = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    setIllnessSaving(true); setIllnessError('');
    try {
      const result = await reportAnimal(session, 'sanitario', { id_animal: viewing.id_animal, fecha, motivo: illnessNotes.trim() || undefined, id_corral_destino: illnessCorralId });
      setServiceNotice(result.estado === 'pendiente' ? `Reporte sanitario guardado en el dispositivo. ${result.mensaje}` : 'Enfermedad registrada y animal ingresado a enfermería.');
      setViewing(null); setReportingIllness(false); setLoading(true); await load();
    } catch (cause) { setIllnessError(friendlyErrorMessage(cause, 'No se pudo ingresar el animal a enfermería.')); }
    finally { setIllnessSaving(false); }
  }

  async function permanentlyDeleteViewingAnimal(): Promise<void> {
    if (!session || !viewing || viewing.activo) return;
    setPermanentDeleteBusy(true); setPermanentDeleteError('');
    try {
      await permanentlyDeleteInactiveAnimal(session, viewing.id_animal);
      setRows((current) => current.filter((animal) => animal.id_animal !== viewing.id_animal));
      setViewing(null); setConfirmPermanentDelete(false); setServiceNotice('Ficha y registros vinculados eliminados definitivamente.');
    } catch (cause) { setPermanentDeleteError(friendlyErrorMessage(cause, 'No se pudo eliminar definitivamente la ficha.')); }
    finally { setPermanentDeleteBusy(false); }
  }
}
