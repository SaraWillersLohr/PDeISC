import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/theme';

type Props = { isVisible: boolean; onClose: () => void; children: React.ReactNode };

export default function EmojiPicker({ isVisible, onClose, children }: Props) {
  const { colors } = useAppTheme();
  return (
    <Modal animationType="slide" transparent visible={isVisible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close sticker picker" />
        <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.titleRow, { backgroundColor: colors.elevated }]}>
            <Text style={[styles.title, { color: colors.text }]}>Choose a sticker</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Close sticker picker" onPress={onClose} hitSlop={10}>
              <MaterialIcons name="close" color={colors.muted} size={24} />
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({ overlay: { flex: 1, justifyContent: 'flex-end' }, backdrop: { ...StyleSheet.absoluteFill }, sheet: { height: '32%', minHeight: 240, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, padding: 16 }, titleRow: { height: 48, borderRadius: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }, title: { fontSize: 16, fontWeight: '600' } });
