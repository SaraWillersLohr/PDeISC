import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

type Props = {
  children: ReactNode;
  style: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function FormDialog({ children, style, contentContainerStyle }: Props) {
  return (
    // El cuadro crece hasta el contenido. El desplazamiento aparece al faltar altura.
    // En iOS compenso el teclado; Android usa el ajuste de ventana del sistema.
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
      <View accessibilityViewIsModal style={[styles.card, style]}>
        <ScrollView
          contentContainerStyle={contentContainerStyle}
          keyboardShouldPersistTaps="handled"
          style={styles.scroll}
        >
          {children}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: { alignItems: 'center', flex: 1, justifyContent: 'center', width: '100%' },
  card: { flexShrink: 1, maxHeight: '100%', minHeight: 0, overflow: 'hidden' },
  scroll: { flexGrow: 0, flexShrink: 1, minHeight: 0 },
});
