import { FieldError, useFieldErrors } from '../FieldError';
import { dateFieldError, personNameError, animalBirthError } from '../../services/formValidation';
import { FormDialog } from '../FormDialog';
import { AppSectionIcon } from './AppSectionIcon';
import { DateField } from './DateField';
// muestro la ficha ganadera y sus operaciones desde el inventario.
// muestro los inventarios de animales y corrales con datos del backend.
import { friendlyErrorMessage } from '../../services/apiErrors';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSession } from '../../context/SessionContext';
import { useLiveChanges } from '../../context/LiveChangesContext';
import { useTheme } from '../../context/ThemeContext';
import { deactivateAnimal, listAnimals, listCorrals, moveAnimal, updateAnimal, type AnimalGender, type AnimalRecord, type CorralRecord } from '../../services/livestockApi';
import { reportAnimal } from '../../services/productionApi';
import { listCatalog } from '../../services/organizationApi';
import { AnimalCreateModal } from './AnimalCreateModal';
import { AnimalWeightModal } from './AnimalWeightModal';
import { BirthForm } from './BirthForm';
import { PhotoAttachment } from './PhotoAttachment';
import { InventoryPage , SpeciesFilterChip , formatAnimalAge , Empty } from './LivestockScreens.shared';
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
  const editForm = useFieldErrors();
  const moveForm = useFieldErrors();
  const illnessForm = useFieldErrors();
  const deathForm = useFieldErrors();
  const revision = useLiveChanges();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 860;

  const storedRole = session?.usuario.rol.toLowerCase();
  const role = storedRole;
  const canMove = role === 'peon';
  const canWeigh = role === 'peon';
  const canEdit = role === 'dueno' || role === 'peon';
  const ownerCanDeactivate = role === 'dueno';

  const [rows, setRows] = useState<AnimalRecord[]>([]);
  const [catalogSpecies, setCatalogSpecies] = useState<string[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState('Todas');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [corrals, setCorrals] = useState<CorralRecord[]>([]);
  const [moving, setMoving] = useState<AnimalRecord | null>(null);
  const [destination, setDestination] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<AnimalRecord | null>(null);
  const [openedAnimal, setViewing] = useState<AnimalRecord | null>(null);
  const viewing = openedAnimal ? rows.find((animal) => animal.id_animal === openedAnimal.id_animal) ?? { ...openedAnimal, activo: 0 } : null;
  const [deactivating, setDeactivating] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState<'venta' | 'muerte' | 'otro'>('venta');
  const [deactivationDetail, setDeactivationDetail] = useState('');
  const [deactivatingBusy, setDeactivatingBusy] = useState(false);
  const [deathPhoto, setDeathPhoto] = useState<string | null>(null);
  const [reportingIllness, setReportingIllness] = useState(false);
  const [illnessNotes, setIllnessNotes] = useState('');
  const [illnessCorralId, setIllnessCorralId] = useState<number | null>(null);
  const [illnessSaving, setIllnessSaving] = useState(false);
  const [registeringMating, setRegisteringMating] = useState(false);
  const [registeringBirth, setRegisteringBirth] = useState(false);
  const [serviceNotice, setServiceNotice] = useState('');
  const [creating, setCreating] = useState(false);
  const [weighing, setWeighing] = useState<AnimalRecord | null>(null);
  const [editName, setEditName] = useState('');
  const [editIdentifier, setEditIdentifier] = useState('');
  const [editBirth, setEditBirth] = useState('');
  const [editGender, setEditGender] = useState<AnimalGender>('no_especificado');
  const [corralError, setCorralError] = useState('');

  const load = useCallback(async () => {
    if (!session) return;
    setError(''); setCorralError('');
    const [animalsResult, corralsResult] = await Promise.allSettled([listAnimals(session), listCorrals(session)]);
    if (animalsResult.status === 'fulfilled') setRows(animalsResult.value);
    else { setError(friendlyErrorMessage(animalsResult.reason, 'No se pudo cargar el inventario de animales.')); }
    if (corralsResult.status === 'fulfilled') setCorrals(corralsResult.value);
    else { setCorrals([]); setCorralError(friendlyErrorMessage(corralsResult.reason, 'No se pudieron cargar los corrales.')); }
    setLoading(false); setRefreshing(false);
  }, [session]);

  useEffect(() => {
    if (!session) return;
    let active = true;
    Promise.allSettled([listAnimals(session), listCorrals(session)]).then(([animalsResult, corralsResult]) => {
      if (!active) return;
      setError(''); setCorralError('');
      if (animalsResult.status === 'fulfilled') setRows(animalsResult.value);
      else { setError(friendlyErrorMessage(animalsResult.reason, 'No se pudo cargar el inventario de animales.')); }
      if (corralsResult.status === 'fulfilled') setCorrals(corralsResult.value);
      else { setCorrals([]); setCorralError(friendlyErrorMessage(corralsResult.reason, 'No se pudieron cargar los corrales.')); }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session, revision]);

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
  }, [session, revision]);

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
      {serviceNotice ? <Text accessibilityLiveRegion="polite" style={style.successText}>{serviceNotice}</Text> : null}

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
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Ver ficha de ${animal.nombre || animal.identificador}`}
              onPress={() => { setServiceNotice(''); setViewing(animal); setRegisteringMating(false); setRegisteringBirth(false); }}
              style={({ pressed }) => [StyleSheet.absoluteFill, { zIndex: 1, borderRadius: 16 }, pressed && { backgroundColor: 'rgba(45,106,79,0.08)' }]}
            />
            <View style={style.row}>
              <View style={[style.badge, { backgroundColor: isDark ? 'rgba(134,239,172,0.14)' : '#e8f5ed' }]}>
                {animal.foto ? <Image source={{ uri: animal.foto }} style={style.animalPhoto} /> : <AppSectionIcon color={isDark ? '#86efac' : '#2d6a4f'} name="horseshoe" size={18} />}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[style.title, { color: colors.textMain }]}>{animal.nombre || animal.identificador}</Text>
                <Text style={[style.detail, { color: colors.textMuted }]}>{animal.identificador} · {animal.especie} {animal.raza} · {genderLabel(animal.genero)}</Text>
              </View>
              <View style={[style.statePill, !animal.activo ? { backgroundColor: colors.bgCardMuted } : animal.estado_salud === 'sano' ? style.stateHealthy : style.stateAlert]}>
                <Text style={[style.stateText, !animal.activo ? { color: colors.textMuted } : animal.estado_salud === 'sano' ? style.stateTextHealthy : style.stateTextAlert]}>
                  {animal.activo ? animal.estado_salud.replaceAll('_', ' ') : 'Inactivo'}
                </Text>
              </View>
              <Ionicons color={colors.textMuted} name="chevron-forward" size={17} />
            </View>

            <View style={[style.divider, { backgroundColor: colors.borderLight }]} />

            <View pointerEvents="box-none" style={[style.row, { zIndex: 2, flexWrap: 'wrap' }]}>
              <View pointerEvents="none" style={{ flexBasis: 130, flexGrow: 1, flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons color={colors.textMuted} name="location-outline" size={14} />
                <Text style={[style.detail, { color: colors.textSecondary, flexShrink: 1 }]}>
                  {animal.corral}  ·  {animal.peso_kg == null ? 'Sin peso' : `${animal.peso_kg} kg`}
                </Text>
              </View>
              {canEdit && Boolean(animal.activo) ? (
                <Pressable onPress={() => { setEditing(animal); setEditName(animal.nombre ?? ''); setEditIdentifier(animal.identificador); setEditBirth(animal.fecha_nacimiento?.slice(0, 10) ?? ''); setEditGender(animal.genero); editForm.clear(); }} style={[style.moveButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#edf4ec' }]}>
                  <Text style={[style.moveButtonText, { color: colors.primary }]}>Editar</Text>
                </Pressable>
              ) : null}
              {canWeigh && Boolean(animal.activo) ? (
                <Pressable onPress={() => setWeighing(animal)} style={[style.moveButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#edf4ec' }]}>
                  <Text style={[style.moveButtonText, { color: colors.primary }]}>Pesar</Text>
                </Pressable>
              ) : null}
              {canMove && Boolean(animal.activo) ? (
                <Pressable onPress={() => { setMoving(animal); setDestination(null); moveForm.clear(); }} style={[style.moveButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#edf4ec' }]}>
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
                <Text style={style.noticeText}>Alta veterinaria lista · usá Mover para elegir el corral de destino</Text>
              </View>
            ) : null}
          </View>
        ))}
      </View>

      {!loading && !error && filtered.length === 0 ? (
        <Empty
          title={query || selectedSpecies !== 'Todas' ? 'No encontramos animales' : 'No hay animales activos'}
          text={query || selectedSpecies !== 'Todas' ? 'Probá cambiar la especie o buscar por identificador, nombre, raza o corral.' : 'Los animales activos de la estancia aparecerán acá.'}
        />
      ) : null}

      {/* Edit Modal */}
      <Modal animationType="fade" onRequestClose={() => setEditing(null)} transparent visible={Boolean(editing)}>
        <View style={style.backdrop}>
          <FormDialog style={[style.modal, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[style.modalTitle, { color: colors.textMain }]}>Editar ficha del animal</Text>
            <TextInput
              accessibilityLabel="Nombre"
              onChangeText={editForm.change('name', setEditName)}
              placeholder="Nombre"
              placeholderTextColor={colors.textMuted}
              style={[style.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
              value={editName}
            /><FieldError message={editForm.fields.name} />
            <TextInput
              accessibilityLabel="Identificador"
              onChangeText={editForm.change('identifier', setEditIdentifier)}
              placeholder="Identificador"
              placeholderTextColor={colors.textMuted}
              style={[style.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
              value={editIdentifier}
            /><FieldError message={editForm.fields.identifier} />
            <DateField
              accessibilityLabel="Fecha de nacimiento"
              maximumDate={new Date()}
              onChangeText={editForm.change('birth', setEditBirth)}
              placeholder="Fecha de nacimiento"
              placeholderTextColor={colors.textMuted}
              showCalendarIcon
              style={[style.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
              value={editBirth}
            /><FieldError message={editForm.fields.birth} />
            <Text style={[style.selectLabel, { color: colors.textMuted }]}>GÉNERO</Text>
            <View style={style.genderOptions}>
              {genderOptions.map((option) => {
                const active = editGender === option.value;
                return <Pressable accessibilityRole="radio" accessibilityState={{ selected: active }} key={option.value} onPress={() => { setEditGender(option.value); editForm.clear('gender'); }} style={[style.genderOption, { backgroundColor: active ? colors.primary : colors.bgCardMuted, borderColor: active ? colors.primary : colors.border }]}><Text style={[style.destinationText, { color: active ? '#ffffff' : colors.textSecondary }]}>{option.label}</Text></Pressable>;
              })}
            </View>
            <FieldError message={editForm.fields.gender} /><FieldError message={editForm.fields.submit} />
            <View style={style.modalActions}>
              <Pressable onPress={() => void persistAnimal()} style={[style.confirmButton, { backgroundColor: colors.primary }]}>
                <Text style={style.confirmText}>Guardar cambios</Text>
              </Pressable>
              <Pressable onPress={() => setEditing(null)} style={[style.cancelButton, { borderColor: colors.border }]}>
                <Text style={[style.cancelText, { color: colors.textMuted }]}>Cancelar</Text>
              </Pressable>
            </View>
          </FormDialog>
        </View>
      </Modal>

      {/* View Details Modal */}
      <Modal animationType="fade" onRequestClose={() => { setViewing(null); setRegisteringMating(false); setRegisteringBirth(false); setDeactivating(false); setReportingIllness(false); }} transparent visible={Boolean(viewing)}>
        <View style={style.backdrop}>
          <FormDialog key={reportingIllness ? "illness" : deactivating ? "deactivation" : registeringMating ? "mating" : registeringBirth ? "birth" : "details"} style={[style.modal, style.animalDetailModal, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            {reportingIllness && viewing?.activo ? (
              <>
                <Text style={[style.modalTitle, { color: colors.textMain }]}>Reportar enfermedad</Text>
                <Text style={[style.detail, { color: colors.textSecondary, marginBottom: 12 }]}>{viewing.nombre || viewing.identificador} · se registrará el problema y el traslado físico a enfermería.</Text>
                <Text style={[style.selectLabel, { color: colors.textMuted }]}>CORRAL DE ENFERMERÍA</Text>
                <View style={style.genderOptions}>
                  {corrals.filter((corral) => corral.es_enfermeria && (corral.id_corral === viewing.id_corral || Number(corral.ocupacion) < Number(corral.capacidad))).map((corral) => <Pressable key={corral.id_corral} accessibilityRole="radio" accessibilityState={{ selected: illnessCorralId === corral.id_corral }} onPress={() => { setIllnessCorralId(corral.id_corral); illnessForm.clear('corral'); }} style={[style.genderOption, { backgroundColor: illnessCorralId === corral.id_corral ? colors.primary : colors.bgCardMuted, borderColor: illnessCorralId === corral.id_corral ? colors.primary : colors.border }]}><Text style={[style.destinationText, { color: illnessCorralId === corral.id_corral ? '#fff' : colors.textSecondary }]}>{corral.nombre} · {corral.ocupacion}/{corral.capacidad}</Text></Pressable>)}
                </View>
                {!corrals.some((corral) => corral.es_enfermeria && (corral.id_corral === viewing.id_corral || Number(corral.ocupacion) < Number(corral.capacidad))) ? <Text style={[style.detail, { color: '#b42318' }]}>No hay lugar disponible en enfermería.</Text> : null}
                <FieldError message={illnessForm.fields.corral} /><TextInput accessibilityLabel="Observaciones de enfermedad" maxLength={500} multiline onChangeText={illnessForm.change('notes', setIllnessNotes)} placeholder="Síntomas u observaciones (opcional)" placeholderTextColor={colors.textMuted} style={[style.modalInput, style.notesInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]} value={illnessNotes} /><FieldError message={illnessForm.fields.notes} />
                <FieldError message={illnessForm.fields.submit} />
                <View style={style.modalActions}>
                  <Pressable disabled={illnessSaving} onPress={() => void submitIllnessReport()} style={[style.confirmButton, { backgroundColor: colors.primary }, (illnessSaving) && style.disabledButton]}><Text style={style.confirmText}>{illnessSaving ? 'Guardando…' : 'Reportar e ingresar'}</Text></Pressable>
                  <Pressable disabled={illnessSaving} onPress={() => setReportingIllness(false)} style={[style.cancelButton, { borderColor: colors.border }]}><Text style={[style.cancelText, { color: colors.textMuted }]}>Volver</Text></Pressable>
                </View>
              </>
            ) : deactivating && viewing?.activo ? (
              <>
                <Text style={[style.modalTitle, { color: colors.textMain }]}>{deactivationReason === 'muerte' ? `Notificar muerte · ${viewing.nombre || viewing.identificador}` : `Dar de baja ${viewing.nombre || viewing.identificador}`}</Text>
                <Text style={[style.detail, { color: colors.textSecondary, marginBottom: 12 }]}>{deactivationReason === 'muerte' ? ownerCanDeactivate ? 'La muerte quedará registrada y la ficha se conservará.' : 'La muerte quedará notificada para revisión administrativa y la ficha se conservará.' : 'El animal dejará de aparecer en el inventario activo. Su ficha y su historial se conservarán.'}</Text>
                {ownerCanDeactivate && deactivationReason !== 'muerte' ? <><Text style={[style.selectLabel, { color: colors.textMuted }]}>MOTIVO</Text><View style={style.genderOptions}>{(['venta', 'otro'] as const).map((reason) => <Pressable key={reason} accessibilityRole="radio" accessibilityState={{ selected: deactivationReason === reason }} onPress={() => setDeactivationReason(reason)} style={[style.genderOption, { backgroundColor: deactivationReason === reason ? colors.primary : colors.bgCardMuted, borderColor: deactivationReason === reason ? colors.primary : colors.border }]}><Text style={[style.destinationText, { color: deactivationReason === reason ? '#fff' : colors.textSecondary }]}>{reason === 'otro' ? 'Otro' : 'Venta'}</Text></Pressable>)}</View></> : <Text style={[style.selectLabel, { color: colors.textMuted }]}>NOTIFICACIÓN DE MUERTE</Text>}
                <TextInput accessibilityLabel="Detalle opcional de la baja o muerte" maxLength={500} multiline onChangeText={deathForm.change('detail', setDeactivationDetail)} placeholder="Detalle u observaciones (opcional)" placeholderTextColor={colors.textMuted} style={[style.modalInput, style.notesInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]} value={deactivationDetail} /><FieldError message={deathForm.fields.detail} />
                {deactivationReason === 'muerte' ? <>
                  <PhotoAttachment value={deathPhoto} onChange={(value) => { setDeathPhoto(value); deathForm.clear('photo'); }} /><FieldError message={deathForm.fields.photo} />
                </> : null}
                <FieldError message={deathForm.fields.submit} />
                <View style={style.modalActions}>
                  <Pressable disabled={deactivatingBusy} onPress={() => void confirmDeactivation()} style={[style.confirmButton, { backgroundColor: '#dc2626' }, deactivatingBusy && style.disabledButton]}><Text style={style.confirmText}>{deactivatingBusy ? 'Guardando…' : deactivationReason === 'muerte' ? ownerCanDeactivate ? 'Confirmar muerte' : 'Notificar muerte' : 'Confirmar baja'}</Text></Pressable>
                  <Pressable disabled={deactivatingBusy} onPress={() => setDeactivating(false)} style={[style.cancelButton, { borderColor: colors.border }]}><Text style={[style.cancelText, { color: colors.textMuted }]}>Volver</Text></Pressable>
                </View>
              </>
            ) : registeringMating && viewing?.activo ? (
                <MatingServiceForm
                  animals={rows}
                  mother={viewing}
                  onBack={() => setRegisteringMating(false)}
                  onSaved={() => { setServiceNotice('Servicio reproductivo registrado.'); setRegisteringMating(false); }}
                />
            ) : registeringBirth && viewing?.activo ? (
              <>
                <BirthForm
                  embedded
                  initialMother={openedAnimal ?? undefined}
                  onSaved={() => { setServiceNotice('Nacimiento registrado.'); setRegisteringBirth(false); void load(); }}
                />
                <View style={style.matingActions}>
                  <Pressable onPress={() => setRegisteringBirth(false)} style={[style.matingActionButton, { borderColor: colors.border }]}>
                    <Text style={[style.cancelText, { color: colors.textMuted }]}>Volver a ficha</Text>
                  </Pressable>
                </View>
              </>
            ) : (

              <>
                <Text style={[style.modalTitle, { color: colors.textMain }]}>{viewing?.nombre || 'Ficha del animal'}</Text>
                {serviceNotice ? <Text accessibilityLiveRegion="polite" style={style.successText}>{serviceNotice}</Text> : null}
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
                    <Text style={style.noticeText}>Alta veterinaria registrada. Ya podés trasladar al animal desde la opción Mover.</Text>
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
                  <Pressable onPress={() => { const currentNursing = corrals.find((corral) => corral.id_corral === viewing.id_corral && corral.es_enfermeria); const availableNursing = corrals.find((corral) => corral.es_enfermeria && Number(corral.ocupacion) < Number(corral.capacidad)); setIllnessCorralId(currentNursing?.id_corral ?? availableNursing?.id_corral ?? null); setIllnessNotes(''); illnessForm.clear(); setReportingIllness(true); }} style={[style.matingCta, { backgroundColor: '#a8473d' }]}>
                    <Ionicons color="#ffffff" name="medkit-outline" size={16} /><Text style={style.confirmText}>Reportar enfermedad e ingresar a enfermería</Text>
                  </Pressable>
                  {!ownerCanDeactivate ? <Pressable onPress={() => { setDeactivationReason('muerte'); setDeactivationDetail(''); setDeathPhoto(null); deathForm.clear(); setDeactivating(true); }} style={[style.matingCta, { backgroundColor: '#dc2626' }]}>
                    <Ionicons color="#ffffff" name="heart-dislike-outline" size={16} /><Text style={style.confirmText}>Notificar muerte</Text>
                  </Pressable> : null}
                </View> : null}
                {viewing?.activo && ownerCanDeactivate ? (
                  <View style={style.matingCtas}>
                    <Pressable onPress={() => { setDeactivationReason('venta'); setDeactivationDetail(''); setDeathPhoto(null); deathForm.clear(); setDeactivating(true); }} style={[style.matingCta, { backgroundColor: '#dc2626' }]}><Ionicons color="#ffffff" name="trash-outline" size={16} /><Text style={style.confirmText}>Borrar animal</Text></Pressable>
                    <Pressable onPress={() => { setDeactivationReason('muerte'); setDeactivationDetail(''); setDeathPhoto(null); deathForm.clear(); setDeactivating(true); }} style={[style.matingCta, { backgroundColor: '#a83232' }]}><Ionicons color="#ffffff" name="heart-dislike-outline" size={16} /><Text style={style.confirmText}>Notificar muerte</Text></Pressable>
                  </View>
                ) : null}
                <View style={style.modalActions}>
              <Pressable onPress={() => setViewing(null)} style={[style.confirmButton, { backgroundColor: colors.primary }]}>
                    <Text style={style.confirmText}>Cerrar ficha</Text>
                  </Pressable>
                </View>
              </>
            )}
          </FormDialog>
        </View>
      </Modal>

      {/* Move Animal Modal */}
      <Modal animationType="fade" onRequestClose={() => { if (!saving) setMoving(null); }} transparent visible={Boolean(moving)}>
        <View style={style.backdrop}>
          <FormDialog style={[style.modal, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[style.modalTitle, { color: colors.textMain }]}>Mover animal</Text>
            <Text style={[style.detail, { color: colors.textMuted }]}>
              {moving?.nombre || moving?.identificador} · ubicación actual: {moving?.corral}
            </Text>
            {corrals.find((corral) => corral.id_corral === moving?.id_corral)?.es_enfermeria ? (
              <View style={style.noticeBanner}>
                <Text style={style.noticeText}>{moving?.alta_pendiente_traslado ? 'Alta veterinaria registrada. Elegí el corral de destino para completar la salida de enfermería.' : 'El veterinario debe registrar el alta antes de trasladar al animal fuera de enfermería.'}</Text>
              </View>
            ) : null}
            <Text style={[style.selectLabel, { color: colors.textMuted }]}>SELECCIONÁ EL CORRAL DE DESTINO</Text>
              {corrals
              .filter((corral) => corral.id_corral !== moving?.id_corral && Number(corral.ocupacion) < Number(corral.capacidad))
              .map((corral) => (
                <Pressable
                  key={corral.id_corral}
                  onPress={() => { setDestination(corral.id_corral); moveForm.clear('corral'); }}
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
            <FieldError message={moveForm.fields.corral} /><FieldError message={moveForm.fields.submit} />
            {/* El movimiento común también completa el traslado posterior al alta; no hay un paso separado en la ficha. */}
            <View style={style.modalActions}>
              <Pressable accessibilityRole="button" disabled={saving} onPress={() => void saveMovement()} style={[style.confirmButton, { backgroundColor: colors.primary }, saving && style.disabledButton]}>
                <Text style={style.confirmText}>{saving ? 'Guardando…' : 'Mover animal'}</Text>
              </Pressable>
              <Pressable disabled={saving} onPress={() => setMoving(null)} style={[style.cancelButton, { borderColor: colors.border }]}>
                <Text style={[style.cancelText, { color: colors.textMuted }]}>Cancelar</Text>
              </Pressable>
            </View>
          </FormDialog>
        </View>
      </Modal>

      <AnimalCreateModal visible={creating} corrals={corrals} onClose={() => setCreating(false)} onCreated={() => { setServiceNotice('Animal agregado.'); setLoading(true); void load(); }} />
      <AnimalWeightModal animal={weighing} onClose={() => setWeighing(null)} onSaved={(notice) => { setServiceNotice(notice); setLoading(true); void load(); }} />
    </InventoryPage>
  );

  async function saveMovement(): Promise<void> {
    if (!session || !moving || saving) return;
    if (!moveForm.validate({ corral: !destination && 'Elegí el corral de destino.' })) return;
    if (!destination) return;
    setSaving(true); moveForm.clear();
    try {
      const result = await moveAnimal(session, moving.id_animal, destination);
      if (result.estado === 'pendiente') setServiceNotice(`Traslado guardado en el dispositivo. ${result.mensaje}`);
      setMoving(null); setLoading(true); await load();
    }
    catch (cause) { moveForm.serverError(friendlyErrorMessage(cause, 'No se pudo registrar el traslado.'), [['corral', /corral|capacidad|lugar|enfermería|enfermeria/i]]); }
    finally { setSaving(false); }
  }

  async function persistAnimal(): Promise<void> {
    if (!session || !editing) return;
    if (!editForm.validate({
      identifier: !editIdentifier.trim() ? 'Ingresá el identificador.' : editIdentifier.trim().length > 50 && 'El identificador admite hasta 50 caracteres.',
      name: editName.trim() && personNameError(editName, 'el nombre'),
      birth: dateFieldError(editBirth.trim(), false, true) || animalBirthError(editBirth.trim(), editing.especie),
      gender: !editGender && 'Elegí el género del animal.',
    })) return;
    try {
      await updateAnimal(session, editing, { nombre: editName.trim(), identificador: editIdentifier.trim(), fecha_nacimiento: editBirth.trim(), genero: editGender });
      setEditing(null); setLoading(true); await load();
    } catch (cause) {
      editForm.serverError(friendlyErrorMessage(cause, 'No se pudo guardar la ficha.'), [['identifier', /identificador|caravana/i], ['name', /nombre/i], ['birth', /fecha|nacimiento/i], ['gender', /género|genero/i]]);
    }
  }

  async function confirmDeactivation(): Promise<void> {
    if (!session || !viewing) return;
    if (!deathForm.validate({ detail: deactivationDetail.length > 500 && 'El detalle admite hasta 500 caracteres.' })) return;
    setDeactivatingBusy(true); deathForm.clear();
    try {
      if (deactivationReason === 'muerte' && !ownerCanDeactivate) {
        const now = new Date(); const fecha = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const result = await reportAnimal(session, 'muerte', { id_animal: viewing.id_animal, fecha, motivo: deactivationDetail.trim() || undefined, foto: deathPhoto ?? undefined });
        setServiceNotice(result.estado === 'pendiente'
          ? `Muerte guardada en el dispositivo. Al sincronizar se dará de baja operativa y quedará pendiente de revisión administrativa. ${result.mensaje}`
          : 'Muerte notificada. La baja operativa quedó registrada y espera revisión administrativa.');
      } else {
        await deactivateAnimal(session, viewing.id_animal, deactivationReason, deactivationDetail.trim(), deactivationReason === 'muerte' ? { foto: deathPhoto ?? undefined } : undefined);
        setServiceNotice(deactivationReason === 'muerte' ? 'Muerte registrada y confirmada.' : 'Animal dado de baja; se conservó su ficha e historial.');
      }
      setViewing(null); setDeactivating(false); setLoading(true); await load();
    } catch (cause) { deathForm.serverError(friendlyErrorMessage(cause, 'No se pudo guardar la baja o notificación.'), [['detail', /motivo|detalle|observaci|caracter/i], ['photo', /foto|imagen/i]]); }
    finally { setDeactivatingBusy(false); }
  }

  async function submitIllnessReport(): Promise<void> {
    if (!session || !viewing) return;
    if (!illnessForm.validate({
      corral: !illnessCorralId && 'Elegí un corral de enfermería con lugar disponible.',
      notes: illnessNotes.length > 500 && 'Las observaciones admiten hasta 500 caracteres.',
    })) return;
    if (!illnessCorralId) return;
    const now = new Date(); const fecha = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    setIllnessSaving(true); illnessForm.clear();
    try {
      const result = await reportAnimal(session, 'sanitario', { id_animal: viewing.id_animal, fecha, motivo: illnessNotes.trim() || undefined, id_corral_destino: illnessCorralId });
      setServiceNotice(result.estado === 'pendiente' ? `Reporte sanitario guardado en el dispositivo. ${result.mensaje}` : 'Enfermedad registrada y animal ingresado a enfermería.');
      setViewing(null); setReportingIllness(false); setLoading(true); await load();
    } catch (cause) { illnessForm.serverError(friendlyErrorMessage(cause, 'No se pudo ingresar el animal a enfermería.'), [['corral', /corral|capacidad|lugar|destino/i], ['notes', /observaci|motivo|caracter/i]]); }
    finally { setIllnessSaving(false); }
  }


}
