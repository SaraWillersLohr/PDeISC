import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { isVisible: boolean; onClose: () => void; children: React.ReactNode };

export default function EmojiPicker({ isVisible, onClose, children }: Props) {
  return (
    <Modal animationType="slide" transparent visible={isVisible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close sticker picker" />
        <View style={styles.sheet}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Choose a sticker</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Close sticker picker" onPress={onClose} hitSlop={10}>
              <MaterialIcons name="close" color="#fff" size={24} />
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({ overlay: { flex: 1, justifyContent: 'flex-end' }, backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.5)' }, sheet: { height: '32%', minHeight: 240, backgroundColor: '#25292e', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 }, titleRow: { height: 48, backgroundColor: '#464c55', borderRadius: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }, title: { color: '#fff', fontSize: 16, fontWeight: '600' } });
