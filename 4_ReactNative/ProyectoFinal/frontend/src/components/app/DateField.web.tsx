// El navegador conserva su calendario propio también en pantallas pequeñas.
import { createElement } from 'react';
import { StyleSheet, type TextInputProps } from 'react-native';
export function DateField(props: TextInputProps) {
 return createElement('input', { type: 'date', value: props.value || '', 'aria-label': props.accessibilityLabel || props.placeholder, onChange: (event: { target: { value: string } }) => props.onChangeText?.(event.target.value), style: { ...StyleSheet.flatten(props.style), boxSizing: 'border-box', width: '100%', minWidth: 0 }, disabled: props.editable === false });
}
