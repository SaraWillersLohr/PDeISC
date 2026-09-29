import { StyleSheet, Text, View } from 'react-native';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>StickerSmash</Text>
      <Text style={styles.text}>Choose a photo, add an emoji sticker, and save your creation.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#25292e', justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { color: '#ffd33d', fontSize: 28, fontWeight: '700', marginBottom: 12 },
  text: { color: '#fff', fontSize: 18, lineHeight: 26, textAlign: 'center', maxWidth: 420 },
});
