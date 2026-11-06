// El navegador conserva su calendario propio también en pantallas pequeñas.
import { createElement, type MouseEvent } from 'react';
import { StyleSheet, type TextInputProps } from 'react-native';

export function DateField(props: TextInputProps & { showCalendarIcon?: boolean }) {
  function openCalendar(event: MouseEvent<HTMLInputElement>): void {
    try { event.currentTarget.showPicker?.(); }
    catch { /* El control nativo queda disponible si el navegador no permite abrirlo por código. */ }
  }

  return createElement('input', {
    type: 'date',
    value: props.value || '',
    'aria-label': props.accessibilityLabel || props.placeholder,
    onClick: props.showCalendarIcon ? openCalendar : undefined,
    onChange: (event: { target: { value: string } }) => props.onChangeText?.(event.target.value),
    style: { ...StyleSheet.flatten(props.style), boxSizing: 'border-box', width: '100%', minWidth: 0 },
    disabled: props.editable === false,
  });
}
