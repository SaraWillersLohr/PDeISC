import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { label: string; theme?: 'primary'; onPress: () => void };

export default function Button({ label, theme, onPress }: Props) {
  const isPrimary = theme === 'primary';
  return (
    <View style={[styles.buttonContainer, isPrimary && styles.primaryBorder]}>
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.button, isPrimary ? styles.primaryButton : styles.secondaryButton, pressed && styles.pressed]}>
        {isPrimary && <FontAwesome name="picture-o" size={18} color="#25292e" style={styles.icon} />}
        <Text style={[styles.label, isPrimary && styles.primaryLabel]}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: { width: '90%', maxWidth: 320, height: 60, marginHorizontal: 20, alignItems: 'center', justifyContent: 'center', padding: 3 },
  primaryBorder: { borderWidth: 4, borderColor: '#ffd33d', borderRadius: 18 },
  button: { borderRadius: 10, width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  primaryButton: { backgroundColor: '#fff' },
  secondaryButton: { backgroundColor: '#25292e' },
  pressed: { opacity: 0.72 },
  icon: { paddingRight: 8 },
  label: { color: '#fff', fontSize: 16, fontWeight: '600' },
  primaryLabel: { color: '#25292e' },
});
