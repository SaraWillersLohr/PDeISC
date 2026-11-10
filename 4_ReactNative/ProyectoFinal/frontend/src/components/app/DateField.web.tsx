// El navegador conserva su calendario propio también en pantallas pequeñas.
import { createElement, type MouseEvent } from 'react';
import { StyleSheet, type TextInputProps } from 'react-native';
import { formatLocalDate } from '../../services/formValidation';

export function DateField(props: TextInputProps & { showCalendarIcon?: boolean; maximumDate?: Date }) {
  function openCalendar(event: MouseEvent<HTMLInputElement>): void {
    try { event.currentTarget.showPicker?.(); }
    catch { /* El control nativo queda disponible si el navegador no permite abrirlo por código. */ }
  }

  const max = props.maximumDate;
  // Los estilos de RN usan ejes; el input HTML necesita propiedades CSS reales.
  const fieldStyle = StyleSheet.flatten(props.style) ?? {};
  const { paddingHorizontal, paddingVertical, marginHorizontal, marginVertical, ...cssStyle } = fieldStyle;
  return createElement('input', {
    type: 'date',
    value: props.value || '',
    max: max ? formatLocalDate(max) : undefined,
    'aria-label': props.accessibilityLabel || props.placeholder,
    onClick: props.showCalendarIcon ? openCalendar : undefined,
    onChange: (event: { target: { value: string } }) => props.onChangeText?.(event.target.value),
    style: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      fontSize: 16, borderStyle: 'solid', borderRadius: 12,
      paddingLeft: paddingHorizontal, paddingRight: paddingHorizontal,
      paddingTop: paddingVertical, paddingBottom: paddingVertical,
      marginLeft: marginHorizontal, marginRight: marginHorizontal,
      marginTop: marginVertical, marginBottom: marginVertical,
      ...cssStyle, boxSizing: 'border-box', width: '100%', minWidth: 0,
    },
    disabled: props.editable === false,
  });
}
