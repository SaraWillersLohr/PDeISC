import { FieldError, useFieldErrors } from '../FieldError';
import { dateFieldError, personNameError, animalBirthError } from '../../services/formValidation';
import { FormDialog } from '../FormDialog';
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

const colors = { green: '#214d35', ink: '#202c23', muted: '#748076', line: '#e5eae3', canvas: '#f4f6f1', white: '#fff', pale: '#e8efe5', red: '#a34b43' };
const genderOptions: { value: AnimalGender; label: string }[] = [
  { value: 'hembra', label: 'Hembra' },
  { value: 'macho', label: 'Macho' },
  { value: 'no_especificado', label: 'No especificado' },
];

export function AnimalCreateModal({ visible, corrals, onClose, onCreated }: { visible: boolean; corrals: CorralRecord[]; onClose: () => void; onCreated: () => void }) {
  const { session } = useSession();
  const form = useFieldErrors();
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
    setMessage(''); form.clear();
    setGender(null);
    setCorralId(null);
    onClose();
  }

  async function save(): Promise<void> {
    if (!session) return;
    const selectedSpecies = species.find((item) => item.id_especie === speciesId)?.nombre ?? '';
    if (!form.validate({
      identifier: !identifier.trim() ? 'Ingresá el identificador o caravana.' : identifier.trim().length > 50 && 'El identificador admite hasta 50 caracteres.',
      name: name.trim() && personNameError(name, 'el nombre'),
      gender: !gender && 'Elegí el género del animal.',
      species: !speciesId && 'Elegí la especie.',
      breed: !breedId && 'Elegí la raza.',
      corral: !corralId ? 'Elegí el corral inicial.' : !availableCorrals.some((item) => item.id_corral === corralId) && 'El corral ya no tiene lugar. Elegí otro.',
      birth: dateFieldError(birth, false, true) || animalBirthError(birth, selectedSpecies),
      weight: weight !== '' && (!Number.isFinite(Number(weight)) || Number(weight) <= 0) && 'El peso debe ser un número mayor a cero.',
    })) return;
    if (!gender || !breedId || !corralId) return;
    setSaving(true); setMessage('');
    try {
      await createAnimal(session, { identificador: identifier.trim(), nombre: name.trim() || undefined, foto: photo, genero: gender, id_raza: breedId, id_corral: corralId, fecha_nacimiento: birth || undefined, peso_kg: weight ? Number(weight) : undefined });
      setIdentifier(''); setName(''); setBirth(''); setWeight(''); setPhoto(null); setGender(null); onCreated(); close();
    } catch (cause) { form.serverError(friendlyErrorMessage(cause, 'No se pudo registrar el animal.'), [['identifier', /identificador|caravana/i], ['name', /nombre/i], ['birth', /fecha|nacimiento/i], ['corral', /corral|capacidad|lugar/i], ['breed', /raza/i], ['gender', /género|genero/i], ['weight', /peso/i], ['photo', /foto|imagen/i]]); }
    finally { setSaving(false); }
  }

  return <Modal animationType="fade" onRequestClose={close} transparent visible={visible}>
    <View style={s.backdrop}><FormDialog style={s.modal}><Text style={s.title}>Agregar animal</Text><Text style={s.intro}>Completá la identificación y elegí su raza y ubicación inicial. Los campos con * son obligatorios.</Text>
      {loading ? <ActivityIndicator color={colors.green} /> : <>
        <Text style={s.label}>IDENTIFICACIÓN</Text>
        <TextInput accessibilityLabel="Identificador o número de caravana, obligatorio" autoCapitalize="characters" maxLength={50} onChangeText={form.change('identifier', setIdentifier)} placeholder="Caravana o identificador *" style={s.input} value={identifier} /><FieldError message={form.fields.identifier} />
        <TextInput accessibilityLabel="Nombre o alias, opcional" onChangeText={form.change('name', setName)} placeholder="Nombre o alias (opcional)" style={s.input} value={name} /><FieldError message={form.fields.name} />
        <PhotoAttachment value={photo} onChange={(value) => { setPhoto(value); form.clear('photo'); }} /><FieldError message={form.fields.photo} />
        <Text style={s.label}>GÉNERO *</Text>
        <View style={s.options}>{genderOptions.map((item) => <Pressable accessibilityRole="radio" accessibilityState={{ selected: gender === item.value }} key={item.value} onPress={() => { setGender(item.value); form.clear('gender'); }} style={[s.option, gender === item.value && s.selected]}><Text style={[s.optionText, gender === item.value && s.selectedText]}>{item.label}</Text></Pressable>)}</View>
        <FieldError message={form.fields.gender} /><Text style={s.label}>ESPECIE Y RAZA</Text>
        {species.length ? <AnimalOptions label="Especie" options={species.map(item => ({ id: item.id_especie, label: item.nombre }))} value={speciesId} onChange={id => { form.clear('species'); form.clear('breed'); setSpeciesId(id); setBreedId(breeds.find(item => item.id_especie === id)?.id_raza ?? null); }} /> : <Text style={s.hint}>No hay especies cargadas. Primero agregá una en “Especies y razas”.</Text>}
        <FieldError message={form.fields.species} />
        {availableBreeds.length ? <AnimalOptions key={speciesId} label="Raza" options={availableBreeds.map(item => ({ id: item.id_raza, label: item.nombre }))} value={breedId} onChange={id => { setBreedId(id); form.clear('breed'); }} /> : <Text style={s.hint}>{speciesId ? 'Esta especie todavía no tiene razas. Agregá o proponé una desde “Especies y razas”.' : 'Elegí una especie para ver sus razas.'}</Text>}
        <FieldError message={form.fields.breed} />
        <Text style={s.label}>EDAD Y PESO</Text>
        <DateField accessibilityLabel="Fecha de nacimiento aproximada u exacta" maximumDate={new Date()} onChangeText={form.change('birth', setBirth)} placeholder="Fecha de nacimiento (opcional)" showCalendarIcon style={s.input} value={birth} /><FieldError message={form.fields.birth} />
        <Text style={s.hint}>La edad se calcula a partir de la fecha de nacimiento.</Text>
        <TextInput accessibilityLabel="Peso en kilogramos, opcional" keyboardType="decimal-pad" onChangeText={form.change('weight', setWeight)} placeholder="Peso en kg (opcional)" style={s.input} value={weight} /><FieldError message={form.fields.weight} />
        <Text style={s.label}>UBICACIÓN INICIAL</Text>
        {availableCorrals.length ? <AnimalOptions label="Corral inicial" options={availableCorrals.map(item => ({ id: item.id_corral, label: `${item.nombre} · ${item.ocupacion}/${item.capacidad} animales` }))} value={corralId} onChange={id => { setCorralId(id); form.clear('corral'); }} /> : <Text style={s.hint}>No hay corrales generales con capacidad disponible. El animal se puede agregar cuando haya lugar.</Text>}
        <FieldError message={form.fields.corral} />
      </>}
      <FieldError message={form.fields.submit} />
      {message ? <Text style={s.error}>{message}</Text> : null}
      <View style={s.actions}><Pressable disabled={saving || loading} onPress={() => void save()} style={[s.save, (saving || loading) && s.disabled]}><Text style={s.saveText}>{saving ? 'Guardando…' : 'Guardar animal'}</Text></Pressable><Pressable onPress={close} style={s.cancel}><Text style={s.cancelText}>Cancelar</Text></Pressable></View>
    </FormDialog></View>
  </Modal>;
}


function AnimalOptions({ label, options, value, onChange }: { label: string; options: { id: number; label: string }[]; value: number | null; onChange: (id: number) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const filtered = options.filter(item => normalize(item.label).includes(normalize(query)));
  const many = options.length > 5;
  const selected = options.find(item => item.id === value);
  return <View style={{ marginTop: 12 }}>
    <Text style={s.fieldLabel}>{label}</Text>
    {many ? <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${selected?.label ?? 'Sin seleccionar'}`} accessibilityState={{ expanded: open }} onPress={() => { setOpen(!open); setQuery(''); }} style={s.selector}>
      <Text style={[s.optionText, { flex: 1 }]}>{selected?.label ?? `Seleccionar ${label.toLowerCase()}`}</Text><Text style={s.optionText}>{open ? 'Cerrar ▲' : 'Elegir ▼'}</Text>
    </Pressable> : null}
    {(!many || open) ? <View style={many ? s.selectionPanel : undefined}>
      {many ? <TextInput accessibilityLabel={`Buscar ${label.toLowerCase()}`} placeholder={`Buscar ${label.toLowerCase()}…`} value={query} onChangeText={setQuery} style={s.input} autoCapitalize="none" /> : null}
      <View style={s.options}>{filtered.map(item => <Pressable key={item.id} accessibilityRole="radio" accessibilityState={{ selected: value === item.id }} onPress={() => { onChange(item.id); setOpen(false); setQuery(''); }} style={[s.option, many && { width: '100%' }, value === item.id && s.selected]}><Text style={[s.optionText, value === item.id && s.selectedText]}>{value === item.id ? '✓ ' : ''}{item.label}</Text></Pressable>)}</View>
      {!filtered.length ? <Text style={s.hint}>No encontramos coincidencias. Probá con otro nombre.</Text> : null}
    </View> : null}
  </View>;
}

const s = StyleSheet.create({ fieldLabel: { color: colors.ink, fontSize: 14, fontWeight: '600', marginBottom: 8 }, selector: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, padding: 12, borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: colors.canvas }, selectionPanel: { gap: 12, padding: 12, borderWidth: 1, borderColor: colors.line, borderRadius: 9, marginTop: 8 }, backdrop: { alignItems: 'center', backgroundColor: 'rgba(20,35,25,0.5)', flex: 1, justifyContent: 'center', padding: 18 }, modal: { backgroundColor: colors.white, borderRadius: 18, maxWidth: 560, padding: 20, width: '100%' }, title: { color: colors.ink, fontSize: 24, fontWeight: '800', marginBottom: 4 }, intro: { color: colors.muted, fontSize: 14, lineHeight: 21, marginBottom: 6 }, label: { color: colors.green, fontSize: 13, fontWeight: '800', letterSpacing: 0.8, marginBottom: 7, marginTop: 24 }, hint: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 7 }, options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }, option: { backgroundColor: colors.canvas, borderColor: colors.line, borderRadius: 9, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 12 }, selected: { backgroundColor: colors.green, borderColor: colors.green }, optionText: { color: colors.ink, fontSize: 14, fontWeight: '600' }, selectedText: { color: colors.white }, input: { backgroundColor: colors.canvas, borderColor: colors.line, borderRadius: 9, borderWidth: 1, color: colors.ink, fontSize: 16, minHeight: 48, marginTop: 8, paddingHorizontal: 11 }, error: { color: colors.red, fontSize: 14, marginTop: 10 }, actions: { borderTopColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-end', marginTop: 18, paddingTop: 13 }, cancel: { borderColor: colors.line, borderRadius: 9, borderWidth: 1, justifyContent: 'center', paddingHorizontal: 13 }, cancelText: { color: colors.muted, fontSize: 14, fontWeight: '700' }, save: { backgroundColor: colors.green, borderRadius: 9, justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 14 }, saveText: { color: colors.white, fontSize: 14, fontWeight: '800' }, disabled: { opacity: 0.55 } });
