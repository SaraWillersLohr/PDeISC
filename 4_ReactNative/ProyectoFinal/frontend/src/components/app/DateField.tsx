// Comparto el selector móvil manteniendo el formato AAAA-MM-DD que recibe la API.
import { useState } from 'react';
import { Pressable, TextInput, View, Text, Platform, type TextInputProps } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { formatLocalDate } from '../../services/formValidation';

export function DateField({ showCalendarIcon, maximumDate, ...props }: TextInputProps & { showCalendarIcon?: boolean; maximumDate?: Date }) {
  const [open, setOpen] = useState(false);
  const parsed = new Date(`${props.value || ''}T12:00:00`);
  const pickerValue = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const iconColor = typeof props.placeholderTextColor === 'string' ? props.placeholderTextColor : '#214d35';
  return <View><Pressable accessibilityRole="button" accessibilityLabel={props.accessibilityLabel || props.placeholder || 'Elegir fecha'} disabled={props.editable === false} onPress={() => setOpen(true)}>
    <TextInput {...props} editable={false} pointerEvents="none" style={[props.style, showCalendarIcon && { paddingRight: 40 }]} />
    {showCalendarIcon ? (
      <View pointerEvents="none" style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}>
        <Ionicons name="calendar-outline" size={19} color={iconColor} />
      </View>
    ) : null}
  </Pressable>
    {open && <><DateTimePicker value={maximumDate && pickerValue > maximumDate ? maximumDate : pickerValue} maximumDate={maximumDate} mode="date" onChange={(_, date) => { if (Platform.OS === 'android') setOpen(false); if (date) props.onChangeText?.(formatLocalDate(date)); }} /><Pressable onPress={() => setOpen(false)}><Text>Cerrar calendario</Text></Pressable></>}
  </View>;
}
