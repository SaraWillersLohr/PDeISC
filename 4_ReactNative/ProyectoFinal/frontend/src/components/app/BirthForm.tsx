import { FieldError, useFieldErrors } from '../FieldError';
import { dateFieldError, personNameError, formatLocalDate } from '../../services/formValidation';
import { DateField } from './DateField';
// registro el nacimiento junto con la ficha de la cría y sus progenitores.
import { friendlyErrorMessage } from '../../services/apiErrors';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSession } from '../../context/SessionContext';
import { useLiveChanges } from '../../context/LiveChangesContext';
import { listCatalog, type Breed, type Species } from '../../services/organizationApi';
import { listAnimals, listCorrals, type AnimalGender, type AnimalRecord, type CorralRecord } from '../../services/livestockApi';
import { createBirth } from '../../services/modulesApi';
import { PhotoAttachment } from './PhotoAttachment';

const g = '#214d35';
const genderOptions: { value: AnimalGender; label: string }[] = [{ value: 'hembra', label: 'Hembra' }, { value: 'macho', label: 'Macho' }, { value: 'no_especificado', label: 'No especificado' }];
export function BirthForm({ onSaved, initialMother, embedded = false }: { onSaved: () => void; initialMother?: AnimalRecord; embedded?: boolean }) {
  const { session } = useSession(); const [animals, setAnimals] = useState<AnimalRecord[]>([]); const [corrals, setCorrals] = useState<CorralRecord[]>([]); const [species, setSpecies] = useState<Species[]>([]); const [breeds, setBreeds] = useState<Breed[]>([]);
  const revision = useLiveChanges();
  const form = useFieldErrors();
  const [motherSearch, setMotherSearch] = useState(''); const [fatherSearch, setFatherSearch] = useState(''); const [mother, setMother] = useState<AnimalRecord | null>(initialMother ?? null); const [father, setFather] = useState<AnimalRecord | null>(null); const [motherText, setMotherText] = useState(''); const [fatherText, setFatherText] = useState('');
  const [speciesId, setSpeciesId] = useState<number | null>(null); const [breedId, setBreedId] = useState<number | null>(null); const [corralId, setCorralId] = useState<number | null>(null);
  const [gender, setGender] = useState<AnimalGender>('no_especificado');
  const [photo, setPhoto] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState(''); const [name, setName] = useState(''); const [date, setDate] = useState(() => formatLocalDate(new Date())); const [notes, setNotes] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const filteredBreeds = useMemo(() => breeds.filter((item) => item.id_especie === speciesId), [breeds, speciesId]);
  const motherMatches = useMemo(() => animals.filter((item) => `${item.identificador} ${item.nombre ?? ''}`.toLowerCase().includes(motherSearch.toLowerCase())).slice(0, 5), [animals, motherSearch]);
  const fatherMatches = useMemo(() => animals.filter((item) => `${item.identificador} ${item.nombre ?? ''}`.toLowerCase().includes(fatherSearch.toLowerCase())).slice(0, 5), [animals, fatherSearch]);
  useEffect(() => {
    let active = true; if (!session) return () => { active = false; };
    Promise.all([listAnimals(session), listCorrals(session), listCatalog(session)]).then(([animalRows, corralRows, catalog]) => { if (active) { setAnimals(animalRows); setCorrals(corralRows.filter((row) => !row.es_enfermeria)); setSpecies(catalog.especies); setBreeds(catalog.razas); setSpeciesId((current) => current ?? catalog.especies[0]?.id_especie ?? null); setCorralId((current) => current ?? corralRows.find((row) => !row.es_enfermeria)?.id_corral ?? null); } })
      .catch((cause: unknown) => { if (active) setError(friendlyErrorMessage(cause, 'No se pudieron cargar animales y catálogo.')); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session, revision]);
  async function save(): Promise<void> {
    if (!session) return;
    if (!form.validate({
      identifier: !identifier.trim() ? 'Ingresá el identificador de la cría.' : identifier.trim().length > 50 && 'El identificador admite hasta 50 caracteres.',
      name: name.trim() && personNameError(name, 'el nombre de la cría'),
      date: dateFieldError(date) || (mother?.fecha_nacimiento && date < mother.fecha_nacimiento.slice(0, 10) && 'La fecha no puede ser anterior al nacimiento de la madre.'),
      species: !speciesId && 'Elegí la especie de la cría.',
      breed: !breedId && 'Elegí la raza de la cría.',
      corral: !corralId ? 'Elegí el corral de la cría.' : !corrals.some((item) => item.id_corral === corralId && item.ocupacion < item.capacidad) && 'El corral ya no tiene lugar. Elegí otro.',
      mother: mother ? !animals.some((item) => item.id_animal === mother.id_animal && item.activo) && 'La madre está inactiva. Elegí otro animal.' : !motherText.trim() ? 'Elegí la madre o ingresá su nombre y procedencia.' : personNameError(motherText, 'el nombre de la madre', 120),
      father: father ? !animals.some((item) => item.id_animal === father.id_animal && item.activo) && 'El padre está inactivo. Elegí otro animal.' : !fatherText.trim() ? 'Elegí el padre o ingresá su nombre y procedencia.' : personNameError(fatherText, 'el nombre del padre', 120),
      notes: notes.length > 500 && 'Las observaciones admiten hasta 500 caracteres.',
    })) return;
    if (!breedId || !corralId) return;
    setSaving(true); setError('');
    try { await createBirth(session, { identificador: identifier.trim(), nombre: name.trim() || undefined, foto: photo, genero: gender, id_raza: breedId, id_corral: corralId, fecha: date, ...(mother ? { id_madre: mother.id_animal } : { madre_texto: motherText.trim() }), ...(father ? { id_padre: father.id_animal } : { padre_texto: fatherText.trim() }), observaciones: notes.trim() || undefined }); setIdentifier(''); setName(''); setNotes(''); setPhoto(null); setMother(null); setFather(null); setMotherText(''); setFatherText(''); setGender('no_especificado'); setError('Nacimiento registrado.'); onSaved(); }
    catch (cause) { form.serverError(friendlyErrorMessage(cause, 'No se pudo guardar el nacimiento.'), [['identifier', /identificador|caravana/i], ['name', /nombre/i], ['date', /fecha/i], ['mother', /madre|hembra/i], ['father', /padre|macho/i], ['breed', /raza|especie/i], ['corral', /corral|capacidad/i], ['photo', /foto|imagen/i]]); }
    finally { setSaving(false); }
  }
  // El modal exterior ya aporta borde, espacio y desplazamiento.
  return <View style={!embedded && s.card}><Text style={s.title}>Registrar nacimiento</Text>{loading ? <ActivityIndicator color={g} /> : <>
    <TextInput onChangeText={form.change('identifier', setIdentifier)} placeholder="Identificador de la cría" style={s.input} value={identifier} /><FieldError message={form.fields.identifier} /><TextInput onChangeText={form.change('name', setName)} placeholder="Nombre (opcional)" style={s.input} value={name} /><FieldError message={form.fields.name} /><PhotoAttachment compact value={photo} onChange={(value) => { setPhoto(value); form.clear('photo'); }} /><FieldError message={form.fields.photo} /><DateField accessibilityLabel="Fecha de nacimiento de la cría" maximumDate={new Date()} onChangeText={form.change('date', setDate)} placeholder="Fecha de nacimiento" showCalendarIcon style={s.input} value={date} /><FieldError message={form.fields.date} />
    <Text style={s.label}>GÉNERO DE LA CRÍA</Text><View style={s.options}>{genderOptions.map((item) => <Pressable accessibilityRole="radio" accessibilityState={{ selected: gender === item.value }} key={item.value} onPress={() => setGender(item.value)} style={[s.option, gender === item.value && s.active]}><Text style={[s.optionText, gender === item.value && s.activeText]}>{item.label}</Text></Pressable>)}</View>
    <Text style={s.label}>ESPECIE Y RAZA</Text><View style={s.options}>{species.map((item) => <Pressable key={item.id_especie} onPress={() => { form.clear('species'); form.clear('breed'); setSpeciesId(item.id_especie); setBreedId(null); }} style={[s.option, speciesId === item.id_especie && s.active]}><Text style={[s.optionText, speciesId === item.id_especie && s.activeText]}>{item.nombre}</Text></Pressable>)}</View><FieldError message={form.fields.species} /><View style={s.options}>{filteredBreeds.map((item) => <Pressable key={item.id_raza} onPress={() => { setBreedId(item.id_raza); form.clear('breed'); }} style={[s.option, breedId === item.id_raza && s.active]}><Text style={[s.optionText, breedId === item.id_raza && s.activeText]}>{item.nombre}</Text></Pressable>)}</View>
    <FieldError message={form.fields.breed} /><Text style={s.label}>CORRAL DE LA CRÍA</Text><View style={s.options}>{corrals.map((item) => <Pressable key={item.id_corral} disabled={item.ocupacion >= item.capacidad} onPress={() => { setCorralId(item.id_corral); form.clear('corral'); }} style={[s.option, corralId === item.id_corral && s.active, item.ocupacion >= item.capacidad && s.disabled]}><Text style={[s.optionText, corralId === item.id_corral && s.activeText]}>{item.nombre} · {item.ocupacion}/{item.capacidad}</Text></Pressable>)}</View>
    <FieldError message={form.fields.corral} />
    <ParentInput label="MADRE" search={motherSearch} onSearch={setMotherSearch} selected={mother} matches={motherMatches} onSelect={(item) => { form.clear('mother'); setMother(item); setMotherSearch(''); setMotherText(''); }} textValue={motherText} onText={form.change('mother', setMotherText)} onUnknown={() => { setMother(null); setMotherSearch(''); }} /><FieldError message={form.fields.mother} />
    <ParentInput label="PADRE" search={fatherSearch} onSearch={setFatherSearch} selected={father} matches={fatherMatches} onSelect={(item) => { form.clear('father'); setFather(item); setFatherSearch(''); setFatherText(''); }} textValue={fatherText} onText={form.change('father', setFatherText)} onUnknown={() => { setFather(null); setFatherSearch(''); }} /><FieldError message={form.fields.father} />
    <TextInput onChangeText={form.change('notes', setNotes)} placeholder="Observaciones (opcional)" style={s.input} value={notes} /><FieldError message={form.fields.notes} />
  </>}<FieldError message={form.fields.submit} />{error ? <Text style={error.includes('registrado') ? s.success : s.error}>{error}</Text> : null}<Pressable disabled={loading || saving} onPress={() => void save()} style={[s.submit, (loading || saving) && s.disabled]}><Text style={s.submitText}>{saving ? 'Guardando…' : 'Guardar nacimiento'}</Text></Pressable></View>;
}

function ParentInput({ label, search, onSearch, selected, matches, onSelect, textValue, onText, onUnknown }: { label: string; search: string; onSearch: (value: string) => void; selected: AnimalRecord | null; matches: AnimalRecord[]; onSelect: (animal: AnimalRecord) => void; textValue: string; onText: (value: string) => void; onUnknown: () => void }) {
  return <View><Text style={s.label}>{label} · obligatorio</Text>{selected ? <Pressable onPress={onUnknown} style={s.option}><Text style={s.optionText}>{selected.nombre || selected.identificador} · cambiar</Text></Pressable> : <><TextInput onChangeText={onSearch} placeholder={`Buscar ${label.toLowerCase()} por nombre o identificador`} style={s.input} value={search} />{search ? matches.map((item) => <Pressable key={item.id_animal} onPress={() => onSelect(item)} style={s.match}><Text style={s.optionText}>{item.nombre || item.identificador} · {item.identificador}</Text></Pressable>) : null}<TextInput onChangeText={onText} placeholder={`Si no está registrada, nombre de ${label.toLowerCase()}`} style={s.input} value={textValue} /></>}</View>;
}

const s = StyleSheet.create({ card: { backgroundColor: '#fff', borderColor: '#e5eae3', borderRadius: 13, borderWidth: 1, marginBottom: 12, padding: 14 }, title: { color: '#202c23', fontSize: 13, fontWeight: '800' }, label: { color: '#748076', fontSize: 13, fontWeight: '800', marginBottom: 6, marginTop: 12 }, input: { backgroundColor: '#f4f6f1', borderColor: '#e5eae3', borderRadius: 8, borderWidth: 1, color: '#202c23', height: 42, marginTop: 8, paddingHorizontal: 10 }, options: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }, option: { backgroundColor: '#f4f6f1', borderColor: '#e5eae3', borderRadius: 8, borderWidth: 1, marginTop: 5, paddingHorizontal: 9, paddingVertical: 8 }, optionText: { color: '#435347', fontSize: 13, fontWeight: '600' }, active: { backgroundColor: g, borderColor: g }, activeText: { color: '#fff' }, disabled: { opacity: 0.45 }, match: { borderBottomColor: '#e5eae3', borderBottomWidth: 1, padding: 8 }, submit: { alignItems: 'center', backgroundColor: g, borderRadius: 9, marginTop: 12, padding: 11 }, submitText: { color: '#fff', fontSize: 13, fontWeight: '800' }, disabledButton: { opacity: 0.5 }, error: { color: '#a34b43', fontSize: 13, marginTop: 9 }, success: { color: g, fontSize: 13, marginTop: 9 } });
