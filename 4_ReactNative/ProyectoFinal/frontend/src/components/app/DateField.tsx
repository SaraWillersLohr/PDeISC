// Comparto el selector móvil manteniendo el formato AAAA-MM-DD que recibe la API.
import { useState } from 'react';
import { Pressable, TextInput, View, Text, Platform, type TextInputProps } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
export function DateField(props: TextInputProps) {
  const [open, setOpen] = useState(false);
  const parsed = new Date(`${props.value || ''}T12:00:00`);
  return <View><Pressable accessibilityRole="button" accessibilityLabel={props.accessibilityLabel || props.placeholder || 'Elegir fecha'} onPress={() => setOpen(true)}><TextInput {...props} editable={false} pointerEvents="none" /></Pressable>
    {open && <><DateTimePicker value={Number.isNaN(parsed.getTime()) ? new Date() : parsed} mode="date" onChange={(_, date) => { if (Platform.OS === 'android') setOpen(false); if (date) props.onChangeText?.(`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`); }} /><Pressable onPress={() => setOpen(false)}><Text>Cerrar calendario</Text></Pressable></>}
  </View>;
}
