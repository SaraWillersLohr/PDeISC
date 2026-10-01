import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/theme';

export default function AboutScreen() {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.accent }]}>StickerSmash</Text>
      <Text style={[styles.text, { color: colors.text }]}>Choose a photo, add an emoji sticker, and save your creation.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#25292e', justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 12 },
  text: { fontSize: 18, lineHeight: 26, textAlign: 'center', maxWidth: 420 },
});
