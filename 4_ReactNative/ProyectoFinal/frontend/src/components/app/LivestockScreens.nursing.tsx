// presento el seguimiento clínico y el alta veterinaria.
// muestro los inventarios de animales y corrales con datos del backend.
import { friendlyErrorMessage } from '../../services/apiErrors';
import { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { createVeterinaryRecord, dischargeAnimal, listNursingAnimals, listVeterinaryRecords, updateNursingHealthStatus, type NursingAnimalRecord, type VeterinaryRecord } from '../../services/livestockApi';
import { PhotoAttachment } from './PhotoAttachment';
import { InventoryPage , Empty } from './LivestockScreens.shared';
import { style } from './LivestockStyles';

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
