import { FormDialog } from '../FormDialog';
import { animalBirthError } from '../../services/formValidation';
import { DateField } from './DateField';
// Separo opciones y permito envolver acciones en celulares.
// registro animales usando razas y corrales existentes en la organización.
import { friendlyErrorMessage } from '../../services/apiErrors';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSession } from '../../context/SessionContext';
import { listCatalog, type Breed, type Species } from '../../services/organizationApi';
import { createAnimal, type AnimalGender, type CorralRecord } from '../../services/livestockApi';
import { PhotoAttachment } from './PhotoAttachment';
import { isValidBirthDate } from './LivestockScreens.shared';

const colors = { green: '#214d35', ink: '#202c23', muted: '#748076', line: '#e5eae3', canvas: '#f4f6f1', white: '#fff', pale: '#e8efe5', red: '#a34b43' };
const genderOptions: { value: AnimalGender; label: string }[] = [
  { value: 'hembra', label: 'Hembra' },
  { value: 'macho', label: 'Macho' },
  { value: 'no_especificado', label: 'No especificado' },
];

export function AnimalCreateModal({ visible, corrals, onClose, onCreated }: { visible: boolean; corrals: CorralRecord[]; onClose: () => void; onCreated: () => void }) {
  const { session } = useSession();
  const [species, setSpecies] = useState<Species[]>([]); const [breeds, setBreeds] = useState<Breed[]>([]);
  const [speciesId, setSpeciesId] = useState<number | null>(null); const [breedId, setBreedId] = useState<number | null>(null); const [selectedCorralId, setCorralId] = useState<number | null>(null);
  const [gender, setGender] = useState<AnimalGender | null>(null);
  const [identifier, setIdentifier] = useState(''); const [name, setName] = useState(''); const [birth, setBirth] = useState(''); const [weight, setWeight] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [message, setMessage] = useState('');
  const availableBreeds = useMemo(() => breeds.filter((breed) => breed.id_especie === speciesId), [breeds, speciesId]);
  const availableCorrals = useMemo(() => corrals.filter((corral) => !corral.es_enfermeria && Number(corral.ocupacion) < Number(corral.capacidad)), [corrals]);
  const corralId = selectedCorralId ?? availableCorrals[0]?.id_corral ?? null;

  useEffect(() => {
    if (!visible || !session) return;
    let active = true;
    listCatalog(session).then((catalog) => { if (active) { const firstSpecies = catalog.especies[0]; setSpecies(catalog.especies); setBreeds(catalog.razas); setSpeciesId(firstSpecies?.id_especie ?? null); setBreedId(catalog.razas.find((breed) => breed.id_especie === firstSpecies?.id_especie)?.id_raza ?? null); } })
      .catch((cause: unknown) => { if (active) setMessage(friendlyErrorMessage(cause, 'No se pudo cargar el catálogo.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [visible, session]);

  function close(): void {
    setLoading(true);
    setMessage('');
    setGender(null);
    setCorralId(null);
    onClose();
  }

  async function save(): Promise<void> {
    if (birth && !isValidBirthDate(birth)) {
      setMessage('Elegí una fecha de nacimiento válida, de hoy o anterior.'); return;
    }
    if (!session || !identifier.trim() || !gender || !breedId || !corralId || (weight && (!Number.isFinite(Number(weight)) || Number(weight) <= 0))) {
      setMessage('Completá identificador, género, especie, raza y corral. Si ingresás un peso, debe ser mayor a cero.'); return;
    }
    if (!availableCorrals.some((corral) => corral.id_corral === corralId)) {
      setMessage('El corral seleccionado ya no está disponible. Elegí otro corral.'); return;
    }
    // Aplico el límite a la especie elegida sin cambiar el registro del animal.
    const ageError = animalBirthError(birth, species.find((item) => item.id_especie === speciesId)?.nombre ?? '');
    if (ageError) { setMessage(ageError); return; }
    setSaving(true); setMessage('');
    try {
      await createAnimal(session, { identificador: identifier.trim(), nombre: name.trim() || undefined, foto: photo, genero: gender, id_raza: breedId, id_corral: corralId, fecha_nacimiento: birth || undefined, peso_kg: weight ? Number(weight) : undefined });
      setIdentifier(''); setName(''); setBirth(''); setWeight(''); setPhoto(null); setGender(null); onCreated(); close();
    } catch (cause) { setMessage(friendlyErrorMessage(cause, 'No se pudo registrar el animal.')); }
    finally { setSaving(false); }
  }

  return <Modal animationType="fade" onRequestClose={close} transparent visible={visible}>
    <View style={s.backdrop}><FormDialog style={s.modal}><Text style={s.title}>Agregar animal</Text><Text style={s.intro}>Completá la identificación y elegí su raza y ubicación inicial.</Text>
      {loading ? <ActivityIndicator color={colors.green} /> : <>
        <Text style={s.label}>IDENTIFICACIÓN</Text>
        <TextInput accessibilityLabel="Identificador o número de caravana, obligatorio" autoCapitalize="characters" maxLength={50} onChangeText={setIdentifier} placeholder="Caravana o identificador *" style={s.input} value={identifier} />
        <TextInput accessibilityLabel="Nombre o alias, opcional" onChangeText={setName} placeholder="Nombre o alias (opcional)" style={s.input} value={name} />
        <PhotoAttachment value={photo} onChange={setPhoto} />
        <Text style={s.label}>GÉNERO *</Text>
        <View style={s.options}>{genderOptions.map((item) => <Pressable accessibilityRole="radio" accessibilityState={{ selected: gender === item.value }} key={item.value} onPress={() => setGender(item.value)} style={[s.option, gender === item.value && s.selected]}><Text style={[s.optionText, gender === item.value && s.selectedText]}>{item.label}</Text></Pressable>)}</View>
        <Text style={s.label}>ESPECIE Y RAZA</Text>
        {species.length ? <View style={s.options}>{species.map((item) => <Pressable accessibilityRole="button" accessibilityState={{ selected: speciesId === item.id_especie }} key={item.id_especie} onPress={() => { setSpeciesId(item.id_especie); setBreedId(breeds.find((breed) => breed.id_especie === item.id_especie)?.id_raza ?? null); }} style={[s.option, speciesId === item.id_especie && s.selected]}><Text style={[s.optionText, speciesId === item.id_especie && s.selectedText]}>{item.nombre}</Text></Pressable>)}</View> : <Text style={s.hint}>No hay especies cargadas. Primero agregá una en “Especies y razas”.</Text>}
        {availableBreeds.length ? <View style={s.options}>{availableBreeds.map((item) => <Pressable accessibilityRole="button" accessibilityState={{ selected: breedId === item.id_raza }} key={item.id_raza} onPress={() => setBreedId(item.id_raza)} style={[s.option, breedId === item.id_raza && s.selected]}><Text style={[s.optionText, breedId === item.id_raza && s.selectedText]}>{item.nombre}</Text></Pressable>)}</View> : <Text style={s.hint}>{speciesId ? 'Esta especie todavía no tiene razas. Agregá o proponé una desde “Especies y razas”.' : 'Elegí una especie para ver sus razas.'}</Text>}
        <Text style={s.label}>EDAD Y PESO</Text>
        <DateField accessibilityLabel="Fecha de nacimiento aproximada u exacta" maximumDate={new Date()} onChangeText={setBirth} placeholder="Fecha de nacimiento (opcional)" showCalendarIcon style={s.input} value={birth} />
        <Text style={s.hint}>La edad se calcula a partir de la fecha de nacimiento.</Text>
        <TextInput accessibilityLabel="Peso en kilogramos, opcional" keyboardType="decimal-pad" onChangeText={setWeight} placeholder="Peso en kg (opcional)" style={s.input} value={weight} />
        <Text style={s.label}>UBICACIÓN INICIAL</Text>
        {availableCorrals.length ? <View style={s.options}>{availableCorrals.map((item) => <Pressable accessibilityRole="button" accessibilityState={{ selected: corralId === item.id_corral }} key={item.id_corral} onPress={() => setCorralId(item.id_corral)} style={[s.option, corralId === item.id_corral && s.selected]}><Text style={[s.optionText, corralId === item.id_corral && s.selectedText]}>{item.nombre} · {item.ocupacion}/{item.capacidad}</Text></Pressable>)}</View> : <Text style={s.hint}>No hay corrales generales con capacidad disponible. El animal se puede agregar cuando haya lugar.</Text>}
      </>}
      {message ? <Text style={s.error}>{message}</Text> : null}
      <View style={s.actions}><Pressable disabled={saving || loading || !gender || availableCorrals.length === 0 || species.length === 0} onPress={() => void save()} style={[s.save, (saving || loading || !gender || availableCorrals.length === 0 || species.length === 0) && s.disabled]}><Text style={s.saveText}>{saving ? 'Guardando…' : 'Guardar animal'}</Text></Pressable><Pressable onPress={close} style={s.cancel}><Text style={s.cancelText}>Cancelar</Text></Pressable></View>
    </FormDialog></View>
  </Modal>;
}

const s = StyleSheet.create({ backdrop: { alignItems: 'center', backgroundColor: 'rgba(20,35,25,0.5)', flex: 1, justifyContent: 'center', padding: 18 }, modal: { backgroundColor: colors.white, borderRadius: 18, maxWidth: 560, padding: 20, width: '100%' }, title: { color: colors.ink, fontSize: 19, fontWeight: '800', marginBottom: 4 }, intro: { color: colors.muted, fontSize: 11, lineHeight: 16, marginBottom: 6 }, label: { color: colors.green, fontSize: 9, fontWeight: '800', letterSpacing: 0.8, marginBottom: 7, marginTop: 16 }, hint: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 7 }, options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }, option: { backgroundColor: colors.canvas, borderColor: colors.line, borderRadius: 9, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 9 }, selected: { backgroundColor: colors.green, borderColor: colors.green }, optionText: { color: colors.ink, fontSize: 10, fontWeight: '600' }, selectedText: { color: colors.white }, input: { backgroundColor: colors.canvas, borderColor: colors.line, borderRadius: 9, borderWidth: 1, color: colors.ink, fontSize: 12, height: 44, marginTop: 8, paddingHorizontal: 11 }, error: { color: colors.red, fontSize: 11, marginTop: 10 }, actions: { borderTopColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-end', marginTop: 18, paddingTop: 13 }, cancel: { borderColor: colors.line, borderRadius: 9, borderWidth: 1, justifyContent: 'center', paddingHorizontal: 13 }, cancelText: { color: colors.muted, fontSize: 10, fontWeight: '700' }, save: { backgroundColor: colors.green, borderRadius: 9, justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 11 }, saveText: { color: colors.white, fontSize: 10, fontWeight: '800' }, disabled: { opacity: 0.55 } });
