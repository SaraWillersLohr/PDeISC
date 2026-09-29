import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackgroundDecoration } from '../components/BackgroundDecoration';
import { ThemeButton } from '../components/ThemeButton';
import {
  AppearanceSettings,
  backgrounds,
  colorOptions,
  fontOptions,
  getFontFamily,
  getFontStyle,
  TextSize,
  textSizes,
} from '../constants/appearance';
import { useTheme } from '../context/ThemeContext';

export function StylesScreen() {
  const { palette, appearance, applyAppearance, storageError } = useTheme();
  const [showTop, setShowTop] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  const updateSetting = <K extends keyof AppearanceSettings>(
    key: K,
    value: AppearanceSettings[K]
  ) => {
    applyAppearance({ ...appearance, [key]: value });
  };

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <BackgroundDecoration />
      <ScrollView
        ref={scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingLeft: Math.max(20, insets.left),
            paddingRight: Math.max(20, insets.right),
            paddingTop: Math.max(24, insets.top),
          },
        ]}
        onScroll={({ nativeEvent }) =>
          setShowTop(
            nativeEvent.contentSize.height > nativeEvent.layoutMeasurement.height + 1 &&
              nativeEvent.contentOffset.y > 80
          )
        }
        scrollEventThrottle={16}
      >
        {/* Encabezado principal */}
        <View style={styles.heading}>
          <View style={{ flex: 1 }}>
            <Text accessibilityRole="header" style={[styles.title, { color: palette.text }]}>
              Estilos
            </Text>
            <Text style={[styles.subtitle, { color: palette.secondary }]}>
              Personalizá tu app con cambios en tiempo real
            </Text>
          </View>
          <ThemeButton />
        </View>

        {/* Tarjeta de Vista Previa en Vivo */}
        <View
          style={[
            styles.previewCard,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}
        >
          <View style={styles.previewHeader}>
            <View style={[styles.previewBadge, { backgroundColor: palette.soft }]}>
              <Ionicons name="sparkles" size={13} color={palette.accent} />
              <Text style={[styles.previewBadgeText, { color: palette.accent }]}>
                VISTA PREVIA EN VIVO
              </Text>
            </View>
            <Text style={[styles.liveHint, { color: palette.secondary }]}>
              Cambios instantáneos
            </Text>
          </View>

          <View style={styles.previewBody}>
            <Text
              accessibilityRole="header"
              style={[
                {
                  color: palette.text,
                  fontSize: sizeValue(appearance.textSize),
                  fontFamily: getFontFamily(appearance.font),
                  textAlign: 'center',
                },
                getFontStyle(appearance.font),
              ]}
            >
              Hola Mundo
            </Text>
          </View>
        </View>

        {/* Sección: Tema de Colores */}
        <View
          style={[
            styles.card,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: palette.soft }]}>
              <Ionicons name="color-palette" size={18} color={palette.accent} />
            </View>
            <View>
              <Text style={[styles.cardTitle, { color: palette.text }]}>
                Paleta de color
              </Text>
              <Text style={[styles.cardHint, { color: palette.secondary }]}>
                Acento principal de la interfaz
              </Text>
            </View>
          </View>

          <View style={styles.colorsGrid}>
            {colorOptions.map(({ name, color }) => {
              const selected = appearance.color === name;
              return (
                <Pressable
                  key={name}
                  accessibilityRole="button"
                  accessibilityLabel={name}
                  accessibilityState={{ selected }}
                  onPress={() => updateSetting('color', name)}
                  style={({ pressed }) => [
                    styles.colorItem,
                    {
                      transform: [{ scale: pressed ? 0.93 : 1 }],
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.colorRing,
                      {
                        borderColor: selected ? color : 'transparent',
                        backgroundColor: selected ? `${color}15` : 'transparent',
                      },
                    ]}
                  >
                    <View style={[styles.colorDot, { backgroundColor: color }]}>
                      {selected && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.colorLabel,
                      {
                        color: selected ? palette.accent : palette.secondary,
                        fontWeight: selected ? '700' : '500',
                      },
                    ]}
                  >
                    {name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Sección: Tipografía */}
        <View
          style={[
            styles.card,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: palette.soft }]}>
              <Ionicons name="text" size={18} color={palette.accent} />
            </View>
            <View>
              <Text style={[styles.cardTitle, { color: palette.text }]}>Tipografía</Text>
              <Text style={[styles.cardHint, { color: palette.secondary }]}>
                Fuente del texto principal
              </Text>
            </View>
          </View>

          <View style={styles.fontsList}>
            {fontOptions.map((font) => {
              const selected = appearance.font === font.value;
              const optionFontFamily = getFontFamily(font.value);
              const optionFontStyle = getFontStyle(font.value);

              return (
                <Pressable
                  key={font.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => updateSetting('font', font.value)}
                  style={({ pressed }) => [
                    styles.fontCard,
                    {
                      borderColor: selected ? palette.accent : palette.border,
                      backgroundColor: selected ? palette.soft : 'transparent',
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <View style={styles.fontCardLeft}>
                    <Text
                      style={[
                        styles.fontSample,
                        {
                          fontFamily: optionFontFamily,
                          color: selected ? palette.accent : palette.text,
                        },
                        optionFontStyle,
                      ]}
                    >
                      Aa
                    </Text>
                    <View>
                      <Text
                        style={[
                          styles.fontName,
                          {
                            color: palette.text,
                            fontWeight: selected ? '700' : '600',
                          },
                        ]}
                      >
                        {font.label}
                      </Text>
                      <Text style={[styles.fontType, { color: palette.secondary }]}>
                        {font.description}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.checkCircle,
                      {
                        borderColor: selected ? palette.accent : palette.border,
                        backgroundColor: selected ? palette.accent : 'transparent',
                      },
                    ]}
                  >
                    {selected && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Sección: Tamaño de Texto */}
        <View
          style={[
            styles.card,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: palette.soft }]}>
              <Ionicons name="resize" size={18} color={palette.accent} />
            </View>
            <View>
              <Text style={[styles.cardTitle, { color: palette.text }]}>
                Tamaño del texto
              </Text>
              <Text style={[styles.cardHint, { color: palette.secondary }]}>
                Ajuste de escala para el saludo
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.segmentContainer,
              { backgroundColor: palette.background, borderColor: palette.border },
            ]}
          >
            {textSizes.map(({ label, value }) => {
              const selected = appearance.textSize === label;
              return (
                <Pressable
                  key={label}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => updateSetting('textSize', label as TextSize)}
                  style={({ pressed }) => [
                    styles.segmentButton,
                    selected && {
                      backgroundColor: palette.accent,
                      shadowColor: palette.accent,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 3,
                    },
                    { opacity: pressed ? 0.75 : 1 },
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.segmentText,
                      {
                        color: selected ? '#FFFFFF' : palette.secondary,
                        fontWeight: selected ? '700' : '600',
                      },
                    ]}
                  >
                    {label} ({value}px)
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Sección: Fondo Visual */}
        <View
          style={[
            styles.card,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: palette.soft }]}>
              <Ionicons name="image" size={18} color={palette.accent} />
            </View>
            <View>
              <Text style={[styles.cardTitle, { color: palette.text }]}>
                Fondo y ambientación
              </Text>
              <Text style={[styles.cardHint, { color: palette.secondary }]}>
                Patrón visual de las pantallas
              </Text>
            </View>
          </View>

          <View style={styles.bgGrid}>
            {(['Claro', 'Bruma', 'Olas'] as const).map((name) => {
              const selected = appearance.background === name;
              return (
                <Pressable
                  key={name}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => updateSetting('background', name)}
                  style={({ pressed }) => [
                    styles.bgCard,
                    {
                      borderColor: selected ? palette.accent : palette.border,
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.bgCanvas,
                      {
                        backgroundColor: backgrounds[name].light,
                      },
                    ]}
                  >
                    {name === 'Olas' && (
                      <View
                        style={[
                          styles.previewWave,
                          { backgroundColor: palette.accent },
                        ]}
                      />
                    )}
                    {name === 'Bruma' && (
                      <View
                        style={[
                          styles.previewBruma,
                          { backgroundColor: palette.soft },
                        ]}
                      />
                    )}
                    {name === 'Claro' && (
                      <Ionicons
                        name="sunny-outline"
                        size={22}
                        color={palette.secondary}
                        style={{ opacity: 0.6 }}
                      />
                    )}

                    {selected && (
                      <View
                        style={[
                          styles.bgSelectedBadge,
                          { backgroundColor: palette.accent },
                        ]}
                      >
                        <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                      </View>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.bgLabel,
                      {
                        color: selected ? palette.accent : palette.text,
                        fontWeight: selected ? '700' : '600',
                      },
                    ]}
                  >
                    {name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {storageError && (
          <View style={[styles.errorBanner, { backgroundColor: palette.soft }]}>
            <Ionicons name="alert-circle" size={18} color={palette.accent} />
            <Text style={[styles.errorText, { color: palette.text }]}>
              {storageError}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Botón flotante para subir */}
      {showTop && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver arriba"
          onPress={() => scroll.current?.scrollTo({ y: 0, animated: true })}
          style={({ pressed }) => [
            styles.floating,
            {
              right: Math.max(24, insets.right),
              backgroundColor: palette.accent,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Ionicons name="arrow-up" size={22} color="#FFFFFF" />
        </Pressable>
      )}
    </View>
  );
}

function sizeValue(size: TextSize) {
  return textSizes.find((option) => option.label === size)?.value ?? 42;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingBottom: 40,
    gap: 16,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  previewCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  previewBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  liveHint: {
    fontSize: 12,
    fontWeight: '500',
  },
  previewBody: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  cardHint: {
    fontSize: 13,
    marginTop: 2,
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  colorItem: {
    alignItems: 'center',
    width: '30%',
    minWidth: 80,
    gap: 6,
    paddingVertical: 4,
  },
  colorRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorLabel: {
    fontSize: 13,
    textAlign: 'center',
  },
  fontsList: {
    gap: 10,
  },
  fontCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  fontCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  fontSample: {
    fontSize: 22,
    fontWeight: '700',
    width: 34,
  },
  fontName: {
    fontSize: 15,
  },
  fontType: {
    fontSize: 12,
    marginTop: 2,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  segmentText: {
    fontSize: 13,
  },
  bgGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  bgCard: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 8,
  },
  bgCanvas: {
    width: '100%',
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  previewWave: {
    position: 'absolute',
    width: 80,
    height: 40,
    borderRadius: 30,
    bottom: -15,
    left: -10,
    opacity: 0.6,
    transform: [{ rotate: '-15deg' }],
  },
  previewBruma: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    top: 5,
    right: 5,
    opacity: 0.8,
  },
  bgSelectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgLabel: {
    fontSize: 13,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
  },
  floating: {
    position: 'absolute',
    bottom: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
});

