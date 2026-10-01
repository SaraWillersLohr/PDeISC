import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/theme';

type Props = { label: string; theme?: 'primary'; onPress: () => void };

export default function Button({ label, theme, onPress }: Props) {
  const isPrimary = theme === 'primary';
  const { colors } = useAppTheme();
  return (
    <View style={[styles.buttonContainer, isPrimary && { borderColor: colors.accent, borderWidth: 2 }]}>
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.button, { backgroundColor: isPrimary ? colors.accentSoft : colors.surface }, pressed && styles.pressed]}>
        {/* El icono queda separado para que el texto siga centrado en el botón. */}
        {isPrimary && <FontAwesome name="picture-o" size={18} color={colors.accent} style={styles.icon} />}
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: { width: '90%', maxWidth: 320, height: 60, marginHorizontal: 20, alignItems: 'center', justifyContent: 'center', padding: 3 },
  button: { borderRadius: 14, width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  pressed: { opacity: 0.72 },
  icon: { position: 'absolute', left: 22 },
  label: { width: '100%', textAlign: 'center', fontSize: 16, fontWeight: '600' },
});
