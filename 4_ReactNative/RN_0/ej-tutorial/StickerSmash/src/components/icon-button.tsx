import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { icon: 'refresh' | 'save-alt'; label: string; onPress: () => void };

export default function IconButton({ icon, label, onPress }: Props) {
  return (
    <View style={styles.container}>
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <MaterialIcons name={icon} size={24} color="#fff" />
        <Text style={styles.label}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({ container: { width: 72, alignItems: 'center' }, button: { alignItems: 'center', padding: 8 }, pressed: { opacity: 0.65 }, label: { color: '#fff', marginTop: 4, fontSize: 12 } });
