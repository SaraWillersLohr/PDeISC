import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BackgroundDecoration } from '../components/BackgroundDecoration';
import { getFontFamily, getFontStyle, textSizes } from '../constants/appearance';
import { useTheme } from '../context/ThemeContext';

export function HomeScreen() {
  const { palette, appearance } = useTheme();
  const fontSize = textSizes.find((item) => item.label === appearance.textSize)?.value ?? 42;

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <BackgroundDecoration />
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={[
          styles.greeting,
          { color: palette.accent, fontSize, fontFamily: getFontFamily(appearance.font) },
          getFontStyle(appearance.font),
        ]}>Hola Mundo</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  greeting: { textAlign: 'center' },
});
