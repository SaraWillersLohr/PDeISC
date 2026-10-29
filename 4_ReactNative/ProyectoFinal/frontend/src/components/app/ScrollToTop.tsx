// ofrezco un acceso flotante para volver al inicio de cada pantalla larga.
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export function ScrollToTop({ visible, onPress }: { visible: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  if (!visible) return null;
  return (
    <Pressable
      accessibilityLabel="Volver arriba del todo"
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.button, { backgroundColor: colors.primary }]}
    >
      <Ionicons color="#fff" name="arrow-up" size={23} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 28,
    bottom: 22,
    elevation: 6,
    height: 54,
    justifyContent: 'center',
    position: 'absolute',
    right: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.24,
    shadowRadius: 5,
    width: 54,
    zIndex: 10,
  },
});
