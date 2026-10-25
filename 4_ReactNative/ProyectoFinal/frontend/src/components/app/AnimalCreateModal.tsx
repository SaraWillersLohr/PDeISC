// registro animales usando razas y corrales existentes en la organización.
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSession } from '../../context/SessionContext';
import { listCatalog, type Breed, type Species } from '../../services/organizationApi';
import { createAnimal, type CorralRecord } from '../../services/livestockApi';

const colors = { green: '#214d35', ink: '#202c23', muted: '#748076', line: '#e5eae3', canvas: '#f4f6f1', white: '#fff', pale: '#e8efe5', red: '#a34b43' };

export function AnimalCreateModal({ visible, corrals, onClose, onCreated }: { visible: boolean; corrals: CorralRecord[]; onClose: () => void; onCreated: () => void }) {
  const { session } = useSession();
  const [species, setSpecies] = useState<Species[]>([]); const [breeds, setBreeds] = useState<Breed[]>([]);
  const [speciesId, setSpeciesId] = useState<number | null>(null); const [breedId, setBreedId] = useState<number | null>(null); const [corralId, setCorralId] = useState<number | null>(null);
  const [identifier, setIdentifier] = useState(''); const [name, setName] = useState(''); const [birth, setBirth] = useState(''); const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [message, setMessage] = useState('');
  const availableBreeds = useMemo(() => breeds.filter((breed) => breed.id_especie === speciesId), [breeds, speciesId]);
  const availableCorrals = useMemo(() => corrals.filter((corral) => !corral.es_enfermeria && Number(corral.ocupacion) < Number(corral.capacidad)), [corrals]);

  useEffect(() => {
    if (!visible || !session) return;
    let active = true;
    listCatalog(session).then((catalog) => { if (active) { const firstSpecies = catalog.especies[0]; setSpecies(catalog.especies); setBreeds(catalog.razas); setSpeciesId(firstSpecies?.id_especie ?? null); setBreedId(catalog.razas.find((breed) => breed.id_especie === firstSpecies?.id_especie)?.id_raza ?? null); setCorralId(corrals.find((corral) => !corral.es_enfermeria && Number(corral.ocupacion) < Number(corral.capacidad))?.id_corral ?? null); } })
      .catch((cause: unknown) => { if (active) setMessage(cause instanceof Error ? cause.message : 'No se pudo cargar el catálogo.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [visible, session, corrals]);

  function close(): void {
    setLoading(true);
    setMessage('');
    onClose();
  }

  async function save(): Promise<void> {
    if (!session || !identifier.trim() || !breedId || !corralId || (birth && !isValidBirthDate(birth)) || (weight && (!Number.isFinite(Number(weight)) || Number(weight) <= 0))) {
      setMessage('Completá identificador, especie, raza y corral. Revisá que la fecha exista y que el peso sea mayor a cero.'); return;
    }
    setSaving(true); setMessage('');
    try {
      await createAnimal(session, { identificador: identifier.trim(), nombre: name.trim() || undefined, id_raza: breedId, id_corral: corralId, fecha_nacimiento: birth || undefined, peso_kg: weight ? Number(weight) : undefined });
      setIdentifier(''); setName(''); setBirth(''); setWeight(''); onCreated(); close();
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : 'No se pudo registrar el animal.'); }
    finally { setSaving(false); }
  }

  return <Modal animationType="fade" onRequestClose={close} transparent visible={visible}>
    <View style={s.backdrop}><View style={s.modal}><ScrollView keyboardShouldPersistTaps="handled"><Text style={s.title}>Agregar animal</Text><Text style={s.intro}>Completá la identificación y elegí su raza y ubicación inicial.</Text>
      {loading ? <ActivityIndicator color={colors.green} /> : <>
        <Text style={s.label}>IDENTIFICACIÓN</Text>
        <TextInput accessibilityLabel="Identificador o número de caravana, obligatorio" autoCapitalize="characters" maxLength={50} onChangeText={setIdentifier} placeholder="Caravana o identificador *" style={s.input} value={identifier} />
        <TextInput accessibilityLabel="Nombre o alias, opcional" onChangeText={setName} placeholder="Nombre o alias (opcional)" style={s.input} value={name} />
        <Text style={s.label}>ESPECIE Y RAZA</Text>
        {species.length ? <View style={s.options}>{species.map((item) => <Pressable accessibilityRole="button" accessibilityState={{ selected: speciesId === item.id_especie }} key={item.id_especie} onPress={() => { setSpeciesId(item.id_especie); setBreedId(breeds.find((breed) => breed.id_especie === item.id_especie)?.id_raza ?? null); }} style={[s.option, speciesId === item.id_especie && s.selected]}><Text style={[s.optionText, speciesId === item.id_especie && s.selectedText]}>{item.nombre}</Text></Pressable>)}</View> : <Text style={s.hint}>No hay especies cargadas. Primero agregá una en “Especies y razas”.</Text>}
        {availableBreeds.length ? <View style={s.options}>{availableBreeds.map((item) => <Pressable accessibilityRole="button" accessibilityState={{ selected: breedId === item.id_raza }} key={item.id_raza} onPress={() => setBreedId(item.id_raza)} style={[s.option, breedId === item.id_raza && s.selected]}><Text style={[s.optionText, breedId === item.id_raza && s.selectedText]}>{item.nombre}</Text></Pressable>)}</View> : <Text style={s.hint}>{speciesId ? 'Esta especie todavía no tiene razas. Agregá o proponé una desde “Especies y razas”.' : 'Elegí una especie para ver sus razas.'}</Text>}
        <Text style={s.label}>EDAD Y PESO</Text>
        <TextInput accessibilityLabel="Fecha de nacimiento aproximada u exacta" onChangeText={setBirth} placeholder="Fecha de nacimiento · AAAA-MM-DD (opcional)" style={s.input} value={birth} />
        <Text style={s.hint}>La edad se calcula a partir de la fecha de nacimiento.</Text>
        <TextInput accessibilityLabel="Peso en kilogramos, opcional" keyboardType="decimal-pad" onChangeText={setWeight} placeholder="Peso en kg (opcional)" style={s.input} value={weight} />
        <Text style={s.label}>UBICACIÓN INICIAL</Text>
        {availableCorrals.length ? <View style={s.options}>{availableCorrals.map((item) => <Pressable accessibilityRole="button" accessibilityState={{ selected: corralId === item.id_corral }} key={item.id_corral} onPress={() => setCorralId(item.id_corral)} style={[s.option, corralId === item.id_corral && s.selected]}><Text style={[s.optionText, corralId === item.id_corral && s.selectedText]}>{item.nombre} · {item.ocupacion}/{item.capacidad}</Text></Pressable>)}</View> : <Text style={s.hint}>No hay corrales generales con capacidad disponible. El animal se puede agregar cuando haya lugar.</Text>}
      </>}
      {message ? <Text style={s.error}>{message}</Text> : null}
      <View style={s.actions}><Pressable onPress={close} style={s.cancel}><Text style={s.cancelText}>Cancelar</Text></Pressable><Pressable disabled={saving || loading || availableCorrals.length === 0 || species.length === 0} onPress={() => void save()} style={[s.save, (saving || loading || availableCorrals.length === 0 || species.length === 0) && s.disabled]}><Text style={s.saveText}>{saving ? 'Guardando…' : 'Guardar animal'}</Text></Pressable></View>
    </ScrollView></View></View>
  </Modal>;
}

function isValidBirthDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return !Number.isNaN(date.getTime()) && date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && date <= today;
}

const s = StyleSheet.create({ backdrop: { alignItems: 'center', backgroundColor: 'rgba(20,35,25,0.5)', flex: 1, justifyContent: 'center', padding: 18 }, modal: { backgroundColor: colors.white, borderRadius: 18, maxHeight: '90%', maxWidth: 560, padding: 20, width: '100%' }, title: { color: colors.ink, fontSize: 19, fontWeight: '800', marginBottom: 4 }, intro: { color: colors.muted, fontSize: 11, lineHeight: 16, marginBottom: 6 }, label: { color: colors.green, fontSize: 9, fontWeight: '800', letterSpacing: 0.8, marginBottom: 7, marginTop: 16 }, hint: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 7 }, options: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, option: { backgroundColor: colors.canvas, borderColor: colors.line, borderRadius: 9, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 9 }, selected: { backgroundColor: colors.green, borderColor: colors.green }, optionText: { color: colors.ink, fontSize: 10, fontWeight: '600' }, selectedText: { color: colors.white }, input: { backgroundColor: colors.canvas, borderColor: colors.line, borderRadius: 9, borderWidth: 1, color: colors.ink, fontSize: 12, height: 44, marginTop: 8, paddingHorizontal: 11 }, error: { color: colors.red, fontSize: 11, marginTop: 10 }, actions: { borderTopColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 8, justifyContent: 'flex-end', marginTop: 18, paddingTop: 13 }, cancel: { borderColor: colors.line, borderRadius: 9, borderWidth: 1, justifyContent: 'center', paddingHorizontal: 13 }, cancelText: { color: colors.muted, fontSize: 10, fontWeight: '700' }, save: { backgroundColor: colors.green, borderRadius: 9, justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 11 }, saveText: { color: colors.white, fontSize: 10, fontWeight: '800' }, disabled: { opacity: 0.55 } });
