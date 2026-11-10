import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode, type RefObject, type ComponentRef } from 'react';
import { ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export type FieldErrors = Record<string, string>;
type ErrorRules = Record<string, string | false | null | undefined>;
type ServerField = [field: string, pattern: RegExp];
export const RevealFieldErrorContext = createContext<((field: ComponentRef<typeof View>) => void) | null>(null);

// Reutilizo el desplazamiento al primer error en páginas y en ventanas de formulario.
export function FieldErrorContent({ children, scrollRef, style }: { children: ReactNode; scrollRef: RefObject<ComponentRef<typeof ScrollView> | null>; style?: StyleProp<ViewStyle> }) {
  const content = useRef<ComponentRef<typeof View>>(null);
  const revealFrame = useRef<number | null>(null);
  const revealError = useCallback((field: ComponentRef<typeof View>) => {
    if (revealFrame.current !== null) return;
    revealFrame.current = requestAnimationFrame(() => {
      revealFrame.current = null;
      if (!content.current) return;
      field.measureLayout(content.current, (_x, y) => scrollRef.current?.scrollTo({ y: Math.max(0, y - 72), animated: true }), () => undefined);
    });
  }, [scrollRef]);
  useEffect(() => () => {
    if (revealFrame.current !== null) cancelAnimationFrame(revealFrame.current);
  }, []);

  return <RevealFieldErrorContext.Provider value={revealError}><View ref={content} collapsable={false} style={style}>{children}</View></RevealFieldErrorContext.Provider>;
}

// Cada formulario valida todos sus campos y conserva los mensajes junto al dato correspondiente.
export function useFieldErrors() {
  const [fields, setFields] = useState<FieldErrors>({});

  function validate(rules: ErrorRules): boolean {
    const errors: FieldErrors = {};
    for (const [field, message] of Object.entries(rules)) if (message) errors[field] = message;
    setFields(errors);
    return Object.keys(errors).length === 0;
  }

  // Solo asigno un error del servidor a un campo si el mensaje identifica ese dato.
  function serverError(message: string, mappings: ServerField[]): void {
    const field = mappings.find(([, pattern]) => pattern.test(message))?.[0] ?? 'submit';
    setFields({ [field]: message });
  }

  function clear(field?: string): void {
    if (!field) { setFields({}); return; }
    setFields((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  // Al editar el dato, retiro el mensaje anterior y lo vuelvo a comprobar al guardar.
  function change(field: string, setter: (value: string) => void): (value: string) => void {
    return (value) => { setter(value); clear(field); };
  }

  return { fields, validate, serverError, clear, change };
}

// El texto puede ocupar varias líneas sin desbordar el ancho del formulario.
export function FieldError({ message }: { message?: string }) {
  const { isDark } = useTheme();
  const reveal = useContext(RevealFieldErrorContext);
  const field = useRef<ComponentRef<typeof View>>(null);
  useEffect(() => {
    if (message && field.current) reveal?.(field.current);
  }, [message, reveal]);

  return message ? (
    <View ref={field} collapsable={false}>
      <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.error, isDark && { color: '#ff9a91' }]}>{message}</Text>
    </View>
  ) : null;
}

const styles = StyleSheet.create({
  error: { color: '#c93636', flexShrink: 1, fontSize: 13, lineHeight: 19, marginTop: 5, marginBottom: 4 },
});
