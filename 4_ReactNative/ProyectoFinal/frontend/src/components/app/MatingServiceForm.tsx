// formulario para registrar un servicio reproductivo.
import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { friendlyErrorMessage } from '../../services/apiErrors';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { createMatingService } from '../../services/modulesApi';
import type { AnimalRecord } from '../../services/livestockApi';
import { style } from './LivestockStyles';
export function MatingServiceForm({ mother, animals, onBack, onCancel, onSaved }: { mother: AnimalRecord; animals: AnimalRecord[]; onBack: () => void; onCancel: () => void; onSaved: () => void }) {
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
