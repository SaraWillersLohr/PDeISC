import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BackgroundDecoration } from '../components/BackgroundDecoration';
import { getFontFamily, getFontStyle } from '../constants/appearance';
import { useTheme } from '../context/ThemeContext';

export function HomeScreen() {
  const { palette, appearance } = useTheme();
  const fontSize = appearance.textSize === 'Pequeño' ? 32 : appearance.textSize === 'Grande' ? 52 : 42;
  const fontStyle = getFontStyle(appearance.font);

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <BackgroundDecoration />
      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}
        >
          {/* Badge de bienvenida superior */}
          <View style={[styles.badge, { backgroundColor: palette.soft }]}>
            <Ionicons name="sparkles" size={14} color={palette.accent} />
            <Text style={[styles.badgeText, { color: palette.accent }]}>
              React Native + Expo
            </Text>
          </View>

          {/* Texto principal Hola Mundo */}
          <Text
            accessibilityRole="header"
            style={[
              styles.greeting,
              {
                color: palette.text,
                fontSize,
                fontFamily: getFontFamily(appearance.font),
                ...fontStyle,
              },
            ]}
          >
            Hola Mundo
          </Text>

          {/* Subtítulo limpio y sutil */}
          <Text style={[styles.subtitle, { color: palette.secondary }]}>
            Tu primer pantalla interactiva y estilizada
          </Text>

          {/* Píldoras con resumen de estilos activos */}
          <View style={styles.tagsContainer}>
            <View style={[styles.tag, { borderColor: palette.border }]}>
              <View style={[styles.colorDot, { backgroundColor: palette.accent }]} />
              <Text style={[styles.tagText, { color: palette.secondary }]}>
                {appearance.color}
              </Text>
            </View>
            <View style={[styles.tag, { borderColor: palette.border }]}>
              <Ionicons name="text-outline" size={12} color={palette.secondary} />
              <Text style={[styles.tagText, { color: palette.secondary }]}>
                {appearance.font}
              </Text>
            </View>
            <View style={[styles.tag, { borderColor: palette.border }]}>
              <Ionicons name="resize-outline" size={12} color={palette.secondary} />
              <Text style={[styles.tagText, { color: palette.secondary }]}>
                {appearance.textSize}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 32,
    borderWidth: 1.5,
    paddingVertical: 44,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
    gap: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  greeting: {
    textAlign: 'center',
    fontWeight: '800',
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

