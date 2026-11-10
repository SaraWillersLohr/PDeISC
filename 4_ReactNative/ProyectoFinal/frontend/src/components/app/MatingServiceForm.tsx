import { FieldError, useFieldErrors } from '../FieldError';
import { dateFieldError, personNameError } from '../../services/formValidation';
import { DateField } from './DateField';
// formulario para registrar un servicio reproductivo.
import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { friendlyErrorMessage } from '../../services/apiErrors';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { createMatingService } from '../../services/modulesApi';
import type { AnimalRecord } from '../../services/livestockApi';
import { style } from './LivestockStyles';
export function MatingServiceForm({ mother, animals, onBack, onSaved }: { mother: AnimalRecord; animals: AnimalRecord[]; onBack: () => void; onSaved: () => void }) {
  const { session } = useSession();
  const form = useFieldErrors();
  const { colors } = useTheme();
  const [fatherSearch, setFatherSearch] = useState('');
  const [father, setFather] = useState<AnimalRecord | null>(null);
  const [fatherName, setFatherName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState('Monta natural');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const fatherMatches = useMemo(() => animals
    .filter((animal) => animal.activo && animal.id_animal !== mother.id_animal && animal.genero !== 'hembra')
    .filter((animal) => `${animal.identificador} ${animal.nombre ?? ''}`.toLocaleLowerCase('es').includes(fatherSearch.trim().toLocaleLowerCase('es')))
    .slice(0, 5), [animals, fatherSearch, mother.id_animal]);

  async function save(): Promise<void> {
    if (!session) return;
    if (!form.validate({
      mother: !mother.activo && 'La madre está inactiva. Elegí una madre activa.',
      father: father ? !animals.some((item) => item.id_animal === father.id_animal && item.activo) && 'El padre está inactivo. Elegí otro animal.' : !fatherName.trim() ? 'Elegí un padre registrado o ingresá el nombre del padre externo.' : personNameError(fatherName, 'el nombre del padre', 120),
      date: dateFieldError(date) || (mother.fecha_nacimiento && date < mother.fecha_nacimiento.slice(0, 10) && 'La fecha del servicio no puede ser anterior al nacimiento de la madre.'),
      method: !method.trim() ? 'Ingresá el método reproductivo.' : method.length > 60 && 'El método admite hasta 60 caracteres.',
      notes: notes.length > 500 && 'Las observaciones admiten hasta 500 caracteres.',
    })) return;
    setSaving(true);
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
      form.serverError(friendlyErrorMessage(cause, 'No se pudo registrar el servicio reproductivo.'), [['father', /padre|macho/i], ['mother', /madre|hembra/i], ['date', /fecha/i], ['method', /método|metodo/i], ['notes', /observaci/i]]);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View>
      <Text style={[style.modalTitle, { color: colors.textMain }]}>Registrar servicio reproductivo</Text>
      <Text style={[style.detail, { color: colors.textMuted }]}>Madre seleccionada · {mother.nombre || mother.identificador}</Text>
      <FieldError message={form.fields.mother} />
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
            <Pressable key={animal.id_animal} onPress={() => { form.clear('father'); setFather(animal); setFatherSearch(''); setFatherName(''); }} style={[style.destination, { backgroundColor: colors.bgCardMuted, borderColor: colors.border }]}>
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
      <FieldError message={form.fields.father} />
      <DateField accessibilityLabel="Fecha del servicio" onChangeText={form.change('date', setDate)} placeholder="Fecha AAAA-MM-DD" placeholderTextColor={colors.textMuted} style={[style.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]} value={date} /><FieldError message={form.fields.date} />
      <TextInput accessibilityLabel="Método reproductivo" onChangeText={form.change('method', setMethod)} placeholder="Método (monta natural, inseminación…)" placeholderTextColor={colors.textMuted} style={[style.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]} value={method} /><FieldError message={form.fields.method} />
      <TextInput accessibilityLabel="Observaciones del servicio" multiline onChangeText={form.change('notes', setNotes)} placeholder="Observaciones (opcional)" placeholderTextColor={colors.textMuted} style={[style.modalInput, style.notesInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]} value={notes} /><FieldError message={form.fields.notes} />
      <FieldError message={form.fields.submit} />
      <View style={style.matingActions}>
        {/* Guardar es la primera acción. Volver conserva el contexto de la ficha. */}
        <Pressable disabled={saving} onPress={() => void save()} style={[style.matingActionButton, { backgroundColor: colors.primary, borderColor: colors.primary }, saving && { opacity: 0.6 }]}><Text style={style.confirmText}>{saving ? 'Guardando…' : 'Guardar servicio'}</Text></Pressable>
        <Pressable onPress={onBack} style={[style.matingActionButton, { borderColor: colors.border }]}><Text style={[style.cancelText, { color: colors.textMuted }]}>Volver a ficha</Text></Pressable>
      </View>
    </View>
  );
}
