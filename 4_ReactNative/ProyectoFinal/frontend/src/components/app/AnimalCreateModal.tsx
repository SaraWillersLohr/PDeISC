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

  useEffect(() => {
    if (!visible || !session) return;
    let active = true;
    listCatalog(session).then((catalog) => { if (active) { setSpecies(catalog.especies); setBreeds(catalog.razas); setSpeciesId(catalog.especies[0]?.id_especie ?? null); setBreedId(null); setCorralId(corrals[0]?.id_corral ?? null); } })
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
    if (!session || !identifier.trim() || !breedId || !corralId || (birth && !/^\d{4}-\d{2}-\d{2}$/.test(birth)) || (weight && (!Number.isFinite(Number(weight)) || Number(weight) <= 0))) {
      setMessage('Completá identificador, especie, raza y corral. Revisá fecha y peso.'); return;
    }
    setSaving(true); setMessage('');
    try {
      await createAnimal(session, { identificador: identifier.trim(), nombre: name.trim() || undefined, id_raza: breedId, id_corral: corralId, fecha_nacimiento: birth || undefined, peso_kg: weight ? Number(weight) : undefined });
      setIdentifier(''); setName(''); setBirth(''); setWeight(''); onCreated(); close();
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : 'No se pudo registrar el animal.'); }
    finally { setSaving(false); }
  }

  return <Modal animationType="fade" onRequestClose={close} transparent visible={visible}>
    <View style={s.backdrop}><View style={s.modal}><ScrollView keyboardShouldPersistTaps="handled"><Text style={s.title}>Agregar animal</Text>
      {loading ? <ActivityIndicator color={colors.green} /> : <>
        <Text style={s.label}>ESPECIE</Text><View style={s.options}>{species.map((item) => <Pressable key={item.id_especie} onPress={() => { setSpeciesId(item.id_especie); setBreedId(null); }} style={[s.option, speciesId === item.id_especie && s.selected]}><Text style={[s.optionText, speciesId === item.id_especie && s.selectedText]}>{item.nombre}</Text></Pressable>)}</View>
        <Text style={s.label}>RAZA</Text><View style={s.options}>{availableBreeds.map((item) => <Pressable key={item.id_raza} onPress={() => setBreedId(item.id_raza)} style={[s.option, breedId === item.id_raza && s.selected]}><Text style={[s.optionText, breedId === item.id_raza && s.selectedText]}>{item.nombre}</Text></Pressable>)}</View>
        <TextInput accessibilityLabel="Identificador" onChangeText={setIdentifier} placeholder="Identificador obligatorio" style={s.input} value={identifier} />
        <TextInput accessibilityLabel="Nombre" onChangeText={setName} placeholder="Nombre (opcional)" style={s.input} value={name} />
        <TextInput accessibilityLabel="Fecha de nacimiento" onChangeText={setBirth} placeholder="Nacimiento · AAAA-MM-DD (opcional)" style={s.input} value={birth} />
        <TextInput accessibilityLabel="Peso en kilogramos" keyboardType="decimal-pad" onChangeText={setWeight} placeholder="Peso en kg (opcional)" style={s.input} value={weight} />
        <Text style={s.label}>CORRAL ASIGNADO</Text><View style={s.options}>{corrals.filter((item) => !item.es_enfermeria).map((item) => <Pressable key={item.id_corral} onPress={() => setCorralId(item.id_corral)} style={[s.option, corralId === item.id_corral && s.selected]}><Text style={[s.optionText, corralId === item.id_corral && s.selectedText]}>{item.nombre} · {item.ocupacion}/{item.capacidad}</Text></Pressable>)}</View>
      </>}
      {message ? <Text style={s.error}>{message}</Text> : null}
      <View style={s.actions}><Pressable onPress={close} style={s.cancel}><Text style={s.cancelText}>Cancelar</Text></Pressable><Pressable disabled={saving || loading} onPress={() => void save()} style={[s.save, (saving || loading) && s.disabled]}><Text style={s.saveText}>{saving ? 'Guardando…' : 'Guardar animal'}</Text></Pressable></View>
    </ScrollView></View></View>
  </Modal>;
}

const s = StyleSheet.create({ backdrop: { alignItems: 'center', backgroundColor: 'rgba(20,35,25,0.5)', flex: 1, justifyContent: 'center', padding: 18 }, modal: { backgroundColor: colors.white, borderRadius: 18, maxHeight: '90%', padding: 18, width: '100%' }, title: { color: colors.ink, fontSize: 18, fontWeight: '800', marginBottom: 8 }, label: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 0.8, marginBottom: 7, marginTop: 13 }, options: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, option: { backgroundColor: colors.canvas, borderColor: colors.line, borderRadius: 9, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 }, selected: { backgroundColor: colors.green, borderColor: colors.green }, optionText: { color: colors.ink, fontSize: 10, fontWeight: '600' }, selectedText: { color: colors.white }, input: { backgroundColor: colors.canvas, borderColor: colors.line, borderRadius: 9, borderWidth: 1, color: colors.ink, fontSize: 11, height: 43, marginTop: 9, paddingHorizontal: 11 }, error: { color: colors.red, fontSize: 11, marginTop: 10 }, actions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end', marginTop: 16 }, cancel: { borderColor: colors.line, borderRadius: 9, borderWidth: 1, justifyContent: 'center', paddingHorizontal: 12 }, cancelText: { color: colors.muted, fontSize: 10, fontWeight: '700' }, save: { backgroundColor: colors.green, borderRadius: 9, justifyContent: 'center', paddingHorizontal: 13, paddingVertical: 11 }, saveText: { color: colors.white, fontSize: 10, fontWeight: '800' }, disabled: { opacity: 0.55 } });
