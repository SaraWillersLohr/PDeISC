// Archivo src/components/PrimaryButton.tsx: el botón primario reutilizable y sus estados de carga y disponibilidad. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

// Contrato de datos PrimaryButtonProps: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}
// Esta función renderiza el componente reutilizable PrimaryButton, usando sus props para mostrar estado y comunicar acciones al componente padre. Recibe label, onPress, loading = false, disabled = false como entrada.
export function PrimaryButton({ label, onPress, loading = false, disabled = false }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, (disabled || loading) && styles.disabled]}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 52, borderRadius: 999, backgroundColor: '#1a3020', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  pressed: { opacity: 0.86 },
  disabled: { opacity: 0.55 },
  label: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
