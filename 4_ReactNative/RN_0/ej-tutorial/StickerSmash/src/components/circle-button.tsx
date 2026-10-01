import { Pressable, StyleSheet, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAppTheme } from '@/theme';

type Props = { onPress: () => void };

export default function CircleButton({ onPress }: Props) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.outer, { borderColor: colors.accent }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Add a sticker" onPress={onPress} style={({ pressed }) => [styles.button, { backgroundColor: colors.accentSoft }, pressed && styles.pressed]}>
        <MaterialIcons name="add" size={38} color={colors.accent} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({ outer: { borderWidth: 2, borderRadius: 32 }, button: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }, pressed: { opacity: 0.7 } });
