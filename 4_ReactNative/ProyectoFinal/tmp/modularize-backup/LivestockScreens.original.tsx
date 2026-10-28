// muestro los inventarios de animales y corrales con datos del backend.
import { friendlyErrorMessage } from '../../services/apiErrors';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { ActivityIndicator, Image, Modal, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { createVeterinaryRecord, deactivateAnimal, deleteCorral, dischargeAnimal, listAnimals, listCorrals, listNursingAnimals, listVeterinaryRecords, moveAnimal, permanentlyDeleteInactiveAnimal, saveCorral, updateAnimal, updateNursingHealthStatus, type AnimalGender, type AnimalRecord, type CorralRecord, type NursingAnimalRecord, type VeterinaryRecord } from '../../services/livestockApi';
import { createMatingService } from '../../services/modulesApi';
import { reportAnimal } from '../../services/productionApi';
import { listCatalog } from '../../services/organizationApi';
import { AnimalCreateModal } from './AnimalCreateModal';
import { AnimalWeightModal } from './AnimalWeightModal';
import { BirthForm } from './BirthForm';
import { PhotoAttachment } from './PhotoAttachment';

const genderOptions: { value: AnimalGender; label: string }[] = [
  { value: 'hembra', label: 'Hembra' },
  { value: 'macho', label: 'Macho' },
  { value: 'no_especificado', label: 'No especificado' },
];
function genderLabel(gender: AnimalGender): string {
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
  const canManage = role === 'dueno';
  const [editing, setEditing] = useState<CorralRecord | null | false>(false);
  const [deleting, setDeleting] = useState<CorralRecord | null>(null);
  const [corralName, setCorralName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [actionError, setActionError] = useState('');
  const [savingCorral, setSavingCorral] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    try { setRows(await listCorrals(session)); }
    catch (cause) { setError(friendlyErrorMessage(cause, 'No se pudo cargar la lista de corrales.')); }
    finally { setLoading(false); setRefreshing(false); }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    let active = true;
    listCorrals(session).then((data) => { if (active) setRows(data); })
      .catch((cause: unknown) => { if (active) setError(friendlyErrorMessage(cause, 'No se pudo cargar la lista de corrales.')); })
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
                {corral.es_enfermeria && role === 'dueno' ? (
                  <Pressable onPress={() => router.push('/(app)/health')} style={[style.moveButton, { backgroundColor: isDark ? 'rgba(134,239,172,0.14)' : '#eaf4ec' }]}>
                    <Text style={[style.moveButtonText, { color: colors.primary }]}>Ver animales y evolución</Text>
                  </Pressable>
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
      setActionError(friendlyErrorMessage(cause, 'No se pudo guardar el corral.'));
    } finally {
      setSavingCorral(false);
    }
  }

  async function remove(corral: CorralRecord): Promise<void> {
    if (!session) return;
    setActionError('');
    setSavingCorral(true);
    try { await deleteCorral(session, corral.id_corral); setDeleting(null); await load(); }
    catch (cause) { setActionError(friendlyErrorMessage(cause, 'No se pudo dar de baja el corral.')); }
    finally { setSavingCorral(false); }
  }
}

// permito al veterinario registrar el alta sin alterar la ubicación física.
export function NursingScreen() {
  const { session } = useSession();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;
  const role = session?.usuario.rol.toLowerCase();
  const canAddEvolution = role === 'veterinario';

  const [rows, setRows] = useState<NursingAnimalRecord[]>([]);
  const [selected, setSelected] = useState<NursingAnimalRecord | null>(null);
  const [historyAnimal, setHistoryAnimal] = useState<NursingAnimalRecord | null>(null);
  const [history, setHistory] = useState<VeterinaryRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySaving, setHistorySaving] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().slice(0, 10));
  const [recordType, setRecordType] = useState<'tratamiento' | 'nota'>('tratamiento');
  const [recordDetail, setRecordDetail] = useState('');
  const [recordPhoto, setRecordPhoto] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<'enfermo' | 'herido'>('enfermo');
  const [diagnosisSaving, setDiagnosisSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    try { setRows(await listNursingAnimals(session)); }
    catch (cause) { setError(friendlyErrorMessage(cause, 'No se pudo cargar enfermería.')); }
    finally { setLoading(false); }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    let active = true;
    listNursingAnimals(session).then((data) => { if (active) setRows(data); })
      .catch((cause: unknown) => { if (active) setError(friendlyErrorMessage(cause, 'No se pudo cargar enfermería.')); })
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
      setError(friendlyErrorMessage(cause, 'No se pudo registrar el alta.'));
    } finally {
      setSaving(false);
    }
  }

  async function openHistory(animal: NursingAnimalRecord): Promise<void> {
    if (!session) return;
    setDiagnosis(animal.estado_salud === 'herido' ? 'herido' : 'enfermo');
    setHistoryAnimal(animal); setHistory([]); setHistoryError(''); setHistoryLoading(true);
    try { setHistory(await listVeterinaryRecords(session, animal.id_animal)); }
    catch (cause) { setHistoryError(friendlyErrorMessage(cause, 'No se pudo cargar la evolución del animal.')); }
    finally { setHistoryLoading(false); }
  }

  async function saveEvolution(): Promise<void> {
    if (!session || !historyAnimal || !recordDetail.trim()) { setHistoryError('Escribí el tratamiento o la nota para guardar.'); return; }
    setHistorySaving(true); setHistoryError('');
    try {
      const result = await createVeterinaryRecord(session, historyAnimal.id_animal, { fecha: recordDate, tipo: recordType, detalle: recordDetail.trim(), foto: recordPhoto });
      setRecordDetail(''); setRecordPhoto(null); setRecordType('tratamiento'); setRecordDate(new Date().toISOString().slice(0, 10));
      if (result.estado === 'pendiente') setHistoryError(`Evolución guardada en el dispositivo. ${result.mensaje}`);
      setHistory(await listVeterinaryRecords(session, historyAnimal.id_animal));
    } catch (cause) { setHistoryError(friendlyErrorMessage(cause, 'No se pudo guardar la evolución veterinaria.')); }
    finally { setHistorySaving(false); }
  }

  async function saveDiagnosis(): Promise<void> {
    if (!session || !historyAnimal) return;
    setDiagnosisSaving(true); setHistoryError('');
    try {
      await updateNursingHealthStatus(session, historyAnimal.id_animal, diagnosis);
      const updatedRows = await listNursingAnimals(session);
      setRows(updatedRows);
      const updatedAnimal = updatedRows.find((row) => row.id_animal === historyAnimal.id_animal);
      if (updatedAnimal) setHistoryAnimal(updatedAnimal);
      setHistory(await listVeterinaryRecords(session, historyAnimal.id_animal));
    } catch (cause) { setHistoryError(friendlyErrorMessage(cause, 'No se pudo guardar el diagnóstico.')); }
    finally { setDiagnosisSaving(false); }
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
                {animal.foto ? <Image source={{ uri: animal.foto }} style={style.animalPhoto} /> : <Ionicons color="#ef4444" name="medkit" size={18} />}
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

            <Pressable onPress={() => void openHistory(animal)} style={[style.moveButton, { alignSelf: 'flex-start', backgroundColor: isDark ? 'rgba(134,239,172,0.14)' : '#eaf4ec', marginTop: 10 }]}>
              <Text style={[style.moveButtonText, { color: colors.primary }]}>{canAddEvolution ? 'Ver evolución y registrar atención' : 'Ver evolución veterinaria'}</Text>
            </Pressable>

            {animal.alta_pendiente_traslado ? (
              <View style={style.noticeBanner}>
                <Text style={style.noticeText}>Alta clínica registrada · esperando traslado físico del peón al corral</Text>
              </View>
            ) : canAddEvolution ? (
              <Pressable
                onPress={() => { setSelected(animal); setNotes(''); setError(''); }}
                style={[style.confirmButton, { backgroundColor: colors.primary, marginTop: 12 }]}
              >
                <Ionicons color="#ffffff" name="checkmark-done" size={16} style={{ marginRight: 6 }} />
                <Text style={style.confirmText}>Registrar alta médica y avisar al peón</Text>
              </Pressable>
            ) : null}
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
      <Modal animationType="fade" onRequestClose={() => setHistoryAnimal(null)} transparent visible={Boolean(historyAnimal)}>
        <View style={style.backdrop}>
          <View style={[style.modal, { backgroundColor: colors.bgCard, borderColor: colors.border, maxHeight: '92%' }]}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={[style.modalTitle, { color: colors.textMain }]}>Evolución veterinaria</Text>
              <Text style={[style.detail, { color: colors.textMuted }]}>{historyAnimal?.nombre || historyAnimal?.identificador} · {historyAnimal?.identificador}</Text>
              {historyError ? <Text style={style.errorText}>{historyError}</Text> : null}
              {historyLoading ? <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} /> : history.length ? history.map((record) => (
                <View key={record.id_registro} style={[style.card, { backgroundColor: colors.bgCardMuted, borderColor: colors.border, marginTop: 10, width: '100%' }]}>
                  <Text style={[style.title, { color: colors.textMain }]}>{record.tipo === 'tratamiento' ? 'Tratamiento' : record.tipo === 'nota' ? 'Nota veterinaria' : record.tipo === 'alta' ? 'Alta clínica' : record.tipo === 'estado_salud' ? 'Cambio de estado sanitario' : record.tipo === 'ingreso_enfermeria' ? 'Ingreso a enfermería' : record.tipo === 'movimiento' ? 'Traslado' : 'Reporte sanitario'} · {record.fecha.slice(0, 10)}</Text>
                  <Text style={[style.detail, { color: colors.textMuted }]}>{record.nombre_autor} {record.apellido_autor}</Text>
                  <Text style={[style.detail, { color: colors.textSecondary, marginTop: 7 }]}>{record.detalle}</Text>
                  {record.foto ? <Image resizeMode="cover" source={{ uri: record.foto }} style={style.evolutionPhoto} /> : null}
                </View>
              )) : !historyLoading ? <Text style={[style.detail, { color: colors.textMuted, marginTop: 12 }]}>Todavía no hay tratamientos ni notas registrados.</Text> : null}

              {canAddEvolution ? <View style={{ borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth, marginTop: 16, paddingTop: 12 }}>
                <Text style={[style.title, { color: colors.textMain }]}>Diagnóstico actual · {historyAnimal?.estado_salud.replaceAll('_', ' ')}</Text>
                <Text style={[style.detail, { color: colors.textMuted, marginTop: 4 }]}>El alta veterinaria actualiza el estado a sano. El animal permanece en enfermería hasta que el peón complete el traslado físico.</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 9 }}>
                  {(['enfermo', 'herido'] as const).map((status) => <Pressable key={status} onPress={() => setDiagnosis(status)} style={[style.destination, { backgroundColor: diagnosis === status ? colors.primary : colors.bgCardMuted, borderColor: diagnosis === status ? colors.primary : colors.border }]}><Text style={[style.destinationText, { color: diagnosis === status ? '#fff' : colors.textSecondary }]}>{status === 'enfermo' ? 'Enfermo' : 'Herido'}</Text></Pressable>)}
                </View>
                <Pressable disabled={diagnosisSaving} onPress={() => void saveDiagnosis()} style={[style.confirmButton, { backgroundColor: colors.primary, marginTop: 9 }]}><Text style={style.confirmText}>{diagnosisSaving ? 'Guardando…' : 'Guardar diagnóstico y avisar'}</Text></Pressable>
                <Text style={[style.title, { color: colors.textMain }]}>Agregar evolución</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 9 }}>
                  {(['tratamiento', 'nota'] as const).map((type) => <Pressable key={type} onPress={() => setRecordType(type)} style={[style.destination, { backgroundColor: recordType === type ? colors.primary : colors.bgCardMuted, borderColor: recordType === type ? colors.primary : colors.border }]}><Text style={[style.destinationText, { color: recordType === type ? '#fff' : colors.textSecondary }]}>{type === 'tratamiento' ? 'Tratamiento' : 'Nota'}</Text></Pressable>)}
                </View>
                <TextInput accessibilityLabel="Fecha del tratamiento o nota" onChangeText={setRecordDate} placeholder="Fecha · AAAA-MM-DD" placeholderTextColor={colors.textMuted} style={[style.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText, marginTop: 9 }]} value={recordDate} />
                <TextInput accessibilityLabel="Detalle de la evolución veterinaria" multiline onChangeText={setRecordDetail} placeholder="Tratamiento realizado, observaciones y evolución" placeholderTextColor={colors.textMuted} style={[style.notesInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText, minHeight: 88 }]} value={recordDetail} />
                <PhotoAttachment compact value={recordPhoto} onChange={setRecordPhoto} />
                <Pressable disabled={historySaving} onPress={() => void saveEvolution()} style={[style.confirmButton, { backgroundColor: colors.primary, marginTop: 12 }]}><Text style={style.confirmText}>{historySaving ? 'Guardando…' : 'Guardar en la evolución'}</Text></Pressable>
              </View> : null}
              <Pressable onPress={() => setHistoryAnimal(null)} style={[style.cancelButton, { alignSelf: 'flex-end', borderColor: colors.border, marginTop: 14 }]}><Text style={[style.cancelText, { color: colors.textMuted }]}>Cerrar</Text></Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </InventoryPage>
  );
}

function MatingServiceForm({ mother, animals, onBack, onCancel, onSaved }: { mother: AnimalRecord; animals: AnimalRecord[]; onBack: () => void; onCancel: () => void; onSaved: () => void }) {
  const { session } = useSession();
  const { colors } = useTheme();
  const [fatherSearch, setFatherSearch] = useState('');
  const [father, setFather] = useState<AnimalRecord | null>(null);
  const [fatherName, setFatherName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState('Monta natural');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const fatherMatches = useMemo(() => animals
    .filter((animal) => animal.activo && animal.id_animal !== mother.id_animal && animal.genero !== 'hembra')
    .filter((animal) => `${animal.identificador} ${animal.nombre ?? ''}`.toLocaleLowerCase('es').includes(fatherSearch.trim().toLocaleLowerCase('es')))
    .slice(0, 5), [animals, fatherSearch, mother.id_animal]);

  async function save(): Promise<void> {
    if (!session || (!father && !fatherName.trim()) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !method.trim()) {
      setError('Indicá el padre, la fecha y el método del servicio.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createMatingService(session, {
        id_madre: mother.id_animal,
        ...(father ? { id_padre: father.id_animal } : { padre_texto: fatherName.trim() }),
        fecha: date,
        metodo: method.trim(),
        observaciones: notes.trim() || undefined,
      });
      onSaved();
    } catch (cause) {
      setError(friendlyErrorMessage(cause, 'No se pudo registrar el servicio reproductivo.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <View>
      <Text style={[style.modalTitle, { color: colors.textMain }]}>Registrar servicio reproductivo</Text>
      <Text style={[style.detail, { color: colors.textMuted }]}>Madre seleccionada · {mother.nombre || mother.identificador}</Text>
      <Text style={[style.selectLabel, { color: colors.textMuted }]}>PADRE</Text>
      {father ? (
        <Pressable onPress={() => { setFather(null); setFatherSearch(''); }} style={[style.destination, { backgroundColor: colors.bgCardMuted, borderColor: colors.border }]}>
          <Text style={[style.destinationText, { color: colors.textMain }]}>{father.nombre || father.identificador} · Cambiar</Text>
        </Pressable>
      ) : (
        <>
          <TextInput
            accessibilityLabel="Buscar padre por nombre o identificador"
            onChangeText={(value) => { setFatherSearch(value); setFatherName(''); }}
            placeholder="Buscar padre de la estancia"
            placeholderTextColor={colors.textMuted}
            style={[style.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
            value={fatherSearch}
          />
          {fatherSearch ? fatherMatches.map((animal) => (
            <Pressable key={animal.id_animal} onPress={() => { setFather(animal); setFatherSearch(''); setFatherName(''); }} style={[style.destination, { backgroundColor: colors.bgCardMuted, borderColor: colors.border }]}>
              <Text style={[style.destinationText, { color: colors.textMain }]}>{animal.nombre || animal.identificador} · {animal.identificador}</Text>
            </Pressable>
          )) : null}
          <TextInput
            accessibilityLabel="Nombre o procedencia del padre externo"
            onChangeText={(value) => { setFatherName(value); setFatherSearch(''); }}
            placeholder="O nombre/procedencia del padre externo"
            placeholderTextColor={colors.textMuted}
            style={[style.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
            value={fatherName}
          />
        </>
      )}
      <TextInput accessibilityLabel="Fecha del servicio" onChangeText={setDate} placeholder="Fecha AAAA-MM-DD" placeholderTextColor={colors.textMuted} style={[style.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]} value={date} />
      <TextInput accessibilityLabel="Método reproductivo" onChangeText={setMethod} placeholder="Método (monta natural, inseminación…)" placeholderTextColor={colors.textMuted} style={[style.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]} value={method} />
      <TextInput accessibilityLabel="Observaciones del servicio" multiline onChangeText={setNotes} placeholder="Observaciones (opcional)" placeholderTextColor={colors.textMuted} style={[style.modalInput, style.notesInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]} value={notes} />
      {error ? <Text style={style.errorText}>{error}</Text> : null}
      <View style={style.matingActions}>
        <Pressable onPress={onBack} style={[style.matingActionButton, { borderColor: colors.border }]}><Text style={[style.cancelText, { color: colors.textMuted }]}>Volver a ficha</Text></Pressable>
        <Pressable onPress={onCancel} style={[style.matingActionButton, { borderColor: colors.border }]}><Text style={[style.cancelText, { color: colors.textMuted }]}>Cancelar</Text></Pressable>
        <Pressable disabled={saving} onPress={() => void save()} style={[style.matingActionButton, { backgroundColor: colors.primary, borderColor: colors.primary }, saving && { opacity: 0.6 }]}><Text style={style.confirmText}>{saving ? 'Guardando…' : 'Guardar servicio'}</Text></Pressable>
      </View>
    </View>
  );
}

function SpeciesFilterChip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ selected: active }} onPress={onPress} style={[style.speciesChip, { backgroundColor: active ? colors.primary : colors.bgCard, borderColor: active ? colors.primary : colors.border }]}>
      <Text style={[style.speciesChipText, { color: active ? '#ffffff' : colors.textSecondary }]}>{label}</Text>
    </Pressable>
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
  animalPhoto: { borderRadius: 12, height: 40, width: 40 },
  evolutionPhoto: { borderRadius: 10, height: 190, marginTop: 10, width: '100%' },
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
  speciesFilter: { marginBottom: 16 },
  speciesFilterLabel: { fontSize: 11, fontWeight: '700', marginBottom: 8 },
  speciesFilterOptions: { flexDirection: 'row', gap: 8, paddingRight: 4 },
  speciesChip: { borderRadius: 18, borderWidth: 1, minHeight: 34, justifyContent: 'center', paddingHorizontal: 14 },
  speciesChipText: { fontSize: 11, fontWeight: '700' },

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
  matingCtas: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  matingCta: { alignItems: 'center', borderRadius: 10, flexBasis: '48%', flexDirection: 'row', flexGrow: 1, gap: 8, justifyContent: 'center', minHeight: 44, paddingHorizontal: 14 },
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
    maxWidth: 440,
    padding: 22,
    width: '100%',
  },
  animalDetailScroll: {
    flexShrink: 1,
  },
  animalDetailModal: {
    maxWidth: 620,
  },
  animalDetailContent: {
    paddingBottom: 2,
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
  genderOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 8 },
  genderOption: { borderRadius: 9, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 9 },
  matingActions: { gap: 8, marginTop: 18 },
  matingActionButton: { alignItems: 'center', borderRadius: 10, borderWidth: 1, justifyContent: 'center', minHeight: 44, paddingHorizontal: 12 },
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
  successText: { color: '#2d6a4f', fontSize: 12, fontWeight: '700', marginBottom: 10 },
});

