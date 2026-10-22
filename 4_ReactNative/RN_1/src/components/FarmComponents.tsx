// Archivo src/components/FarmComponents.tsx: reúne controles visuales compartidos por las pantallas de animales, corrales, campo y veterinaria.
import { useState, type ReactNode } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAppDarkMode } from './AppTheme';

// Contrato de datos FarmOption: enlaza el texto visible de una opción con el valor que la API espera.
export interface FarmOption {
  label: string;
  value: string | number;
}

// Esta función muestra el encabezado común de una sección ganadera con título y descripción.
export function FarmPageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const dark = useAppDarkMode();
  return <View style={styles.pageHeader}><Text style={[styles.pageTitle, dark && styles.darkText]}>{title}</Text><Text style={[styles.pageSubtitle, dark && styles.darkMuted]}>{subtitle}</Text></View>;
}

// Este componente presenta un botón nativo con variantes visuales y estado de carga/deshabilitado.
export function FarmButton({ label, onPress, kind = 'primary', disabled = false }: { label: string; onPress: () => void; kind?: 'primary' | 'secondary' | 'danger'; disabled?: boolean }) {
  const dark = useAppDarkMode();
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.button, styles[`button_${kind}`], dark && kind === 'secondary' && styles.darkSecondaryButton, dark && kind === 'danger' && styles.darkDangerButton, disabled && styles.buttonDisabled]}><Text style={[styles.buttonText, kind !== 'primary' && styles.buttonTextDark, dark && kind !== 'primary' && styles.darkAccentText]}>{label}</Text></Pressable>;
}

// Este componente dibuja una tarjeta legible que se adapta al ancho de celular o tablet.
export function FarmCard({ children }: { children: ReactNode }) {
  const dark = useAppDarkMode();
  return <View style={[styles.card, dark && styles.darkCard]}>{children}</View>;
}

// Este componente convierte una entrada de texto en un control etiquetado que mantiene un tamaño táctil cómodo.
export function FarmTextField({ label, value, onChangeText, placeholder, keyboardType, multiline = false }: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; keyboardType?: 'default' | 'numeric' | 'decimal-pad'; multiline?: boolean }) {
  const dark = useAppDarkMode();
  return <View style={styles.field}><Text style={[styles.fieldLabel, dark && styles.darkText]}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} keyboardType={keyboardType} multiline={multiline} textAlignVertical={multiline ? 'top' : 'center'} placeholderTextColor={dark ? '#b7c1b9' : '#8a9188'} style={[styles.input, dark && styles.darkField, multiline && styles.multiline]} /></View>;
}

// Este componente abre una lista modal de selección para usar catálogos sin depender de selectores web.
export function FarmPicker({ label, value, options, onChange, emptyLabel = 'Elegir…', disabled = false }: { label: string; value: string | number; options: FarmOption[]; onChange: (value: string | number) => void; emptyLabel?: string; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const dark = useAppDarkMode();
  const selected = options.find((option) => String(option.value) === String(value));
  return <View style={styles.field}>
    <Text style={[styles.fieldLabel, dark && styles.darkText]}>{label}</Text>
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={() => setOpen(true)} style={[styles.picker, dark && styles.darkField, disabled && styles.buttonDisabled]}><Text numberOfLines={1} style={[selected ? styles.pickerText : styles.placeholder, dark && (selected ? styles.darkText : styles.darkMuted)]}>{selected?.label ?? emptyLabel}</Text><Text style={[styles.pickerArrow, dark && styles.darkAccentText]}>⌄</Text></Pressable>
    <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={[styles.modalBackdrop, dark && styles.darkBackdrop]}><Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} accessibilityLabel="Cerrar opciones" /><View style={[styles.optionsCard, dark && styles.darkCard]}>
        <Text style={[styles.optionsTitle, dark && styles.darkText]}>{label}</Text>
        <FlatList data={options} keyExtractor={(option) => String(option.value)} keyboardShouldPersistTaps="handled" ListEmptyComponent={<Text style={[styles.empty, dark && styles.darkMuted]}>No hay opciones disponibles.</Text>} renderItem={({ item }) => <Pressable style={[styles.option, dark && styles.darkOption]} onPress={() => { onChange(item.value); setOpen(false); }}><Text style={[styles.optionText, dark && styles.darkText, String(item.value) === String(value) && styles.optionSelected, dark && String(item.value) === String(value) && styles.darkAccentText]}>{item.label}</Text></Pressable>} />
        <FarmButton label="Cerrar" kind="secondary" onPress={() => setOpen(false)} />
      </View></View>
    </Modal>
  </View>;
}

// Este componente ofrece una hoja modal desplazable para formularios que también deben funcionar con teclado móvil.
export function FarmModal({ visible, title, children, onClose }: { visible: boolean; title: string; children: ReactNode; onClose: () => void }) {
  const dark = useAppDarkMode();
  return <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}><View style={[styles.modalBackdrop, dark && styles.darkBackdrop]}><Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Cerrar formulario" /><View style={[styles.formSheet, dark && styles.darkCard]}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.formContent}><Text style={[styles.optionsTitle, dark && styles.darkText]}>{title}</Text>{children}</ScrollView></View></View></Modal>;
}

// Este componente explica por qué una lista o consulta todavía no tiene registros.
export function FarmEmpty({ label }: { label: string }) {
  const dark = useAppDarkMode();
  return <Text style={[styles.empty, dark && styles.darkMuted]}>{label}</Text>;
}

const styles = StyleSheet.create({
  pageHeader: { marginBottom: 18 }, pageTitle: { color: '#1a3020', fontSize: 23, fontWeight: '800' }, pageSubtitle: { color: '#6b756b', fontSize: 14, lineHeight: 20, marginTop: 5 }, darkText: { color: '#f0f4ef' }, darkMuted: { color: '#c5cec6' }, darkAccentText: { color: '#b8d7b5' }, darkCard: { backgroundColor: '#2b362e', borderColor: '#46544a' }, darkSecondaryButton: { backgroundColor: '#3a493d' }, darkDangerButton: { backgroundColor: '#563a35' }, darkField: { backgroundColor: '#354139', borderColor: '#536258', color: '#f0f4ef' }, darkBackdrop: { backgroundColor: 'rgba(8,14,10,0.72)' }, darkOption: { borderBottomColor: '#46544a' },
  button: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center', paddingHorizontal: 15, borderRadius: 10, marginTop: 10 }, button_primary: { backgroundColor: '#2d5a27' }, button_secondary: { backgroundColor: '#edf4eb' }, button_danger: { backgroundColor: '#fbefed' }, buttonDisabled: { opacity: 0.55 }, buttonText: { color: '#fff', fontWeight: '800' }, buttonTextDark: { color: '#315a3c' },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e5e9e4', padding: 16, marginBottom: 12, shadowColor: '#1a3020', shadowOpacity: 0.035, shadowRadius: 7, shadowOffset: { width: 0, height: 3 } },
  field: { width: '100%', marginTop: 10 }, fieldLabel: { color: '#344138', fontSize: 13, fontWeight: '700', marginBottom: 6 }, input: { minHeight: 47, borderWidth: 1, borderColor: '#dfe5df', borderRadius: 10, backgroundColor: '#fbfcfa', paddingHorizontal: 13, color: '#263329', fontSize: 15 }, multiline: { minHeight: 100, paddingTop: 12 }, picker: { minHeight: 47, paddingHorizontal: 13, borderWidth: 1, borderColor: '#dfe5df', borderRadius: 10, backgroundColor: '#fbfcfa', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, pickerText: { color: '#263329', fontSize: 15, flex: 1 }, placeholder: { color: '#8a9188', fontSize: 15, flex: 1 }, pickerArrow: { color: '#52765a', fontSize: 19, fontWeight: '800' },
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 18, backgroundColor: 'rgba(20,36,25,0.48)' }, optionsCard: { width: '100%', maxWidth: 500, maxHeight: '82%', borderRadius: 18, padding: 18, backgroundColor: '#fff' }, optionsTitle: { color: '#1a3020', fontSize: 20, fontWeight: '800', marginBottom: 12 }, option: { minHeight: 48, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#edf0eb', paddingHorizontal: 8 }, optionText: { color: '#36443a', fontSize: 15 }, optionSelected: { color: '#2d5a27', fontWeight: '800' }, formSheet: { width: '100%', maxWidth: 620, maxHeight: '90%', backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden' }, formContent: { padding: 20, paddingBottom: 28 }, empty: { textAlign: 'center', color: '#728075', paddingVertical: 24, lineHeight: 20 },
});
