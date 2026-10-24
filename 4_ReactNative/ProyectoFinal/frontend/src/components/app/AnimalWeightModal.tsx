// guardo un pesaje desde la ficha del animal y actualizo el inventario.
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSession } from '../../context/SessionContext';
import { recordWeight } from '../../services/productionApi';
import type { AnimalRecord } from '../../services/livestockApi';

const green = '#214d35';

export function AnimalWeightModal({ animal, onClose, onSaved }: { animal: AnimalRecord | null; onClose: () => void; onSaved: () => void }) {
  const { session } = useSession(); const [weight, setWeight] = useState(''); const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  async function save(): Promise<void> {
    const value = Number(weight);
    if (!session || !animal || !Number.isFinite(value) || value <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) { setError('Ingresá un peso positivo y una fecha válida.'); return; }
    setSaving(true); setError('');
    try { await recordWeight(session, animal.id_animal, value, date); onSaved(); onClose(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo guardar el pesaje.'); }
    finally { setSaving(false); }
  }
  return <Modal animationType="fade" onRequestClose={onClose} transparent visible={Boolean(animal)}><View style={s.backdrop}><View style={s.card}><Text style={s.title}>Registrar pesaje</Text><Text style={s.copy}>{animal?.nombre || animal?.identificador}</Text><TextInput accessibilityLabel="Peso en kilogramos" keyboardType="decimal-pad" onChangeText={setWeight} placeholder="Peso en kg" style={s.input} value={weight} /><TextInput accessibilityLabel="Fecha del pesaje" onChangeText={setDate} placeholder="AAAA-MM-DD" style={s.input} value={date} />{error ? <Text style={s.error}>{error}</Text> : null}<View style={s.actions}><Pressable onPress={onClose} style={s.cancel}><Text style={s.cancelText}>Cancelar</Text></Pressable><Pressable disabled={saving} onPress={() => void save()} style={s.confirm}><Text style={s.confirmText}>{saving ? 'Guardando…' : 'Guardar pesaje'}</Text></Pressable></View></View></View></Modal>;
}

const s = StyleSheet.create({ backdrop: { alignItems: 'center', backgroundColor: 'rgba(20,35,25,.5)', flex: 1, justifyContent: 'center', padding: 20 }, card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, width: '100%' }, title: { color: '#202c23', fontSize: 17, fontWeight: '800' }, copy: { color: '#748076', fontSize: 11, marginTop: 6 }, input: { backgroundColor: '#f4f6f1', borderColor: '#e5eae3', borderRadius: 9, borderWidth: 1, color: '#202c23', height: 43, marginTop: 10, paddingHorizontal: 11 }, error: { color: '#a34b43', fontSize: 10, marginTop: 8 }, actions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end', marginTop: 14 }, cancel: { borderColor: '#e5eae3', borderRadius: 8, borderWidth: 1, justifyContent: 'center', paddingHorizontal: 11 }, cancelText: { color: '#748076', fontSize: 10, fontWeight: '700' }, confirm: { backgroundColor: green, borderRadius: 8, justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 10 }, confirmText: { color: '#fff', fontSize: 10, fontWeight: '700' } });
