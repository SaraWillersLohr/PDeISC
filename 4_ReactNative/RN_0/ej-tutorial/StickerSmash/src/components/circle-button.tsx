import { Pressable, StyleSheet, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type Props = { onPress: () => void };

export default function CircleButton({ onPress }: Props) {
  return (
    <View style={styles.outer}>
      <Pressable accessibilityRole="button" accessibilityLabel="Add a sticker" onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <MaterialIcons name="add" size={38} color="#25292e" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({ outer: { borderWidth: 4, borderColor: '#ffd33d', borderRadius: 32 }, button: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }, pressed: { opacity: 0.7 } });
