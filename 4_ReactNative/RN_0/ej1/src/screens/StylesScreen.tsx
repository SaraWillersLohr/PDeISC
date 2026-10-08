import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackgroundDecoration } from '../components/BackgroundDecoration';
import { ThemeButton } from '../components/ThemeButton';
import {
  AppearanceSettings,
  backgrounds,
  colorAccents,
  colorOptions,
  fontOptions,
  getFontFamily,
  getFontStyle,
  TextSize,
  textSizes,
} from '../constants/appearance';
import { useTheme } from '../context/ThemeContext';

export function StylesScreen() {
  const { palette, appearance, applyAppearance, storageError, isDark } = useTheme();
  const [draft, setDraft] = useState(appearance);
  const [showFonts, setShowFonts] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const isDirty = JSON.stringify(draft) !== JSON.stringify(appearance);
  const fontSize = textSizes.find((item) => item.label === draft.textSize)?.value ?? 42;
  const draftColors = colorAccents[draft.color];
  const draftAccent = isDark ? draftColors.dark : draftColors.light;
  const draftSoft = isDark ? draftColors.softDark : draftColors.softLight;
  const draftBackground = backgrounds[draft.background][isDark ? 'dark' : 'light'];
  const draftPalette = { ...palette, accent: draftAccent, soft: draftSoft, background: draftBackground };

  const updateSetting = <K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  return (
    <View style={[styles.screen, { backgroundColor: draftPalette.background }]}>
      <BackgroundDecoration type={draft.background} accentColor={draftAccent} softColor={draftSoft} />
      <ScrollView
        ref={scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingLeft: Math.max(20, insets.left),
            paddingRight: Math.max(20, insets.right),
            paddingTop: Math.max(20, insets.top),
          },
        ]}
        onScroll={({ nativeEvent }) =>
          setShowTop(
            nativeEvent.contentSize.height > nativeEvent.layoutMeasurement.height + 1 &&
              nativeEvent.contentOffset.y > 80
          )
        }
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heading}>
          <View style={styles.headingText}>
            <Text accessibilityRole="header" style={[styles.title, { color: palette.text }]}>
              Estilos
            </Text>
            <Text style={[styles.subtitle, { color: palette.secondary }]}>
              Personalizá la apariencia de tu app
            </Text>
          </View>
          <ThemeButton />
        </View>

        <View style={[styles.preview, { backgroundColor: draftPalette.surface, borderColor: draftPalette.border }]}>
          <Text
            accessibilityRole="header"
            style={[
              styles.previewText,
              { color: draftAccent, fontSize, fontFamily: getFontFamily(draft.font) },
              getFontStyle(draft.font),
            ]}
          >
            Hola Mundo
          </Text>
        </View>

        {/* Sección: Tema de colores */}
        <View style={[styles.section, { backgroundColor: draftPalette.surface }]}>
          <View style={styles.sectionHeading}>
            <View style={[styles.iconContainer, { backgroundColor: draftSoft }]}>
              <Ionicons name="color-palette-outline" size={20} color={draftAccent} />
            </View>
            <View style={styles.settingText}>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>Tema de colores</Text>
              <Text style={[styles.settingHint, { color: palette.secondary }]}>Elegí el color de tu app</Text>
            </View>
          </View>
          <View style={styles.colorsRow}>
            {colorOptions.map(({ name, color }) => {
              const selected = draft.color === name;
              return (
                <Pressable
                  key={name}
                  accessibilityRole="button"
                  accessibilityLabel={name}
                  accessibilityState={{ selected }}
                  onPress={() => updateSetting('color', name)}
                  style={({ pressed }) => [styles.colorOption, { opacity: pressed ? 0.7 : 1 }]}
                >
                  <View style={[styles.colorRing, { borderColor: selected ? draftAccent : 'transparent' }]}>
                    <View style={[styles.colorDot, { backgroundColor: color }]}>
                      {selected && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.colorLabel,
                      {
                        color: selected ? draftAccent : palette.secondary,
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
        <View style={[styles.setting, { backgroundColor: draftPalette.surface }]}>
          <View style={styles.settingHeading}>
            <View style={[styles.iconContainer, { backgroundColor: draftSoft }]}>
              <Text style={[styles.settingIconText, { color: draftAccent }]}>Tt</Text>
            </View>
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: palette.text }]}>Tipografía</Text>
              <Text style={[styles.settingHint, { color: palette.secondary }]}>Elegí la fuente de tu app</Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: showFonts }}
            onPress={() => setShowFonts((open) => !open)}
            style={({ pressed }) => [
              styles.dropdown,
              {
                borderColor: palette.border,
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.dropdownValue,
                { color: palette.text, fontFamily: getFontFamily(draft.font) },
                getFontStyle(draft.font),
              ]}
            >
              {fontOptions.find((font) => font.value === draft.font)?.label}
            </Text>
            <Ionicons name={showFonts ? 'chevron-up' : 'chevron-down'} size={18} color={palette.secondary} />
          </Pressable>
          {showFonts && (
            <View style={[styles.fontOptions, { borderColor: palette.border }]}>
              {fontOptions.map((font) => {
                const selected = draft.font === font.value;
                return (
                  <Pressable
                    key={font.value}
                    onPress={() => {
                      updateSetting('font', font.value);
                      setShowFonts(false);
                    }}
                    style={({ pressed }) => [
                      styles.fontOption,
                      selected && { backgroundColor: draftSoft },
                      { opacity: pressed ? 0.7 : 1 },
                    ]}
                  >
                    <View style={styles.fontOptionInfo}>
                      <Text
                        style={[
                          styles.fontOptionLabel,
                          { color: palette.text, fontFamily: getFontFamily(font.value) },
                          getFontStyle(font.value),
                        ]}
                      >
                        {font.label}
                      </Text>
                      <Text style={[styles.fontOptionDesc, { color: palette.secondary }]}>
                        {font.description}
                      </Text>
                    </View>
                    {selected && <Ionicons name="checkmark" size={18} color={draftAccent} />}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Sección: Tamaño de texto */}
        <View style={[styles.setting, { backgroundColor: draftPalette.surface }]}>
          <View style={styles.settingHeading}>
            <View style={[styles.iconContainer, { backgroundColor: draftSoft }]}>
              <Text style={[styles.settingIconText, { color: draftAccent, fontSize: 16 }]}>aA</Text>
            </View>
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: palette.text }]}>Tamaño de texto</Text>
              <Text style={[styles.settingHint, { color: palette.secondary }]}>Ajustá el Hola Mundo</Text>
            </View>
          </View>
          <View style={[styles.segment, { backgroundColor: draftSoft }]}>
            {textSizes.map(({ label }) => {
              const selected = draft.textSize === label;
              return (
                <Pressable
                  key={label}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => updateSetting('textSize', label as TextSize)}
                  style={({ pressed }) => [
                    styles.segmentOption,
                    selected && {
                      backgroundColor: draftAccent,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.15,
                      shadowRadius: 2,
                      elevation: 2,
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
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Sección: Fondo */}
        <View style={[styles.setting, { backgroundColor: draftPalette.surface }]}>
          <View style={styles.settingHeading}>
            <View style={[styles.iconContainer, { backgroundColor: draftSoft }]}>
              <Ionicons name="image-outline" size={20} color={draftAccent} />
            </View>
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: palette.text }]}>Fondo</Text>
              <Text style={[styles.settingHint, { color: palette.secondary }]}>Elegí un estilo de fondo</Text>
            </View>
          </View>
          <View style={styles.backgrounds}>
            {(['Claro', 'Bruma', 'Olas'] as const).map((name) => {
              const selected = draft.background === name;
              return (
                <Pressable
                  key={name}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => updateSetting('background', name)}
                  style={({ pressed }) => [styles.backgroundOption, { opacity: pressed ? 0.75 : 1 }]}
                >
                  <View
                    style={[
                      styles.backgroundTile,
                      {
                        backgroundColor: backgrounds[name][isDark ? 'dark' : 'light'],
                        borderColor: selected ? draftAccent : palette.border,
                        borderWidth: selected ? 2.5 : 1,
                      },
                    ]}
                  >
                    {name === 'Bruma' && <View style={[styles.brumaShape, { backgroundColor: draftSoft }]} />}
                    {name === 'Olas' && <View style={[styles.waveShape, { backgroundColor: draftAccent }]} />}
                    {selected && (
                      <View style={[styles.check, { backgroundColor: draftAccent }]}>
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.backgroundLabel,
                      {
                        color: selected ? draftAccent : palette.secondary,
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

        {/* Botón Aplicar cambios */}
        <Pressable
          accessibilityRole="button"
          disabled={!isDirty}
          onPress={() => applyAppearance(draft)}
          style={({ pressed }) => [
            styles.applyButton,
            {
              backgroundColor: draftAccent,
              opacity: !isDirty ? 0.45 : pressed ? 0.8 : 1,
            },
          ]}
        >
          <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" />
          <Text style={styles.applyText}>Aplicar cambios</Text>
        </Pressable>

        {storageError && (
          <Text accessibilityLiveRegion="polite" style={[styles.errorText, { color: palette.secondary }]}>
            {storageError}
          </Text>
        )}
      </ScrollView>

      {/* Botón flotante para subir (posicionado por encima del botón de aplicar cambios para evitar solapamientos) */}
      {showTop && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver arriba"
          onPress={() => scroll.current?.scrollTo({ y: 0, animated: true })}
          style={({ pressed }) => [
            styles.floating,
            {
              right: Math.max(20, insets.right),
              backgroundColor: draftAccent,
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

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingBottom: 36,
    gap: 14,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  headingText: { flex: 1 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, marginTop: 2 },
  preview: {
    minHeight: 125,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  previewText: { textAlign: 'center' },
  section: {
    padding: 16,
    borderRadius: 20,
    gap: 14,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingIconText: {
    fontSize: 18,
    fontWeight: '800',
  },
  colorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  colorOption: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  colorRing: {
    width: 44,
    height: 44,
    borderWidth: 2.5,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  setting: {
    padding: 16,
    borderRadius: 20,
    gap: 14,
  },
  settingHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: { flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: '700' },
  settingHint: { fontSize: 12, marginTop: 2 },
  dropdown: {
    width: '100%',
    minHeight: 46,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  fontOptions: {
    borderTopWidth: 1,
    paddingTop: 8,
    gap: 4,
  },
  fontOption: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  fontOptionInfo: {
    flex: 1,
    gap: 2,
  },
  fontOptionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  fontOptionDesc: {
    fontSize: 11,
  },
  segment: {
    width: '100%',
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  segmentOption: {
    flex: 1,
    minHeight: 42,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  segmentText: {
    fontSize: 13,
  },
  backgrounds: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  backgroundOption: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  backgroundTile: {
    width: '100%',
    height: 60,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  brumaShape: {
    position: 'absolute',
    width: 48,
    height: 48,
    top: 6,
    left: 6,
    borderRadius: 24,
    opacity: 0.85,
  },
  waveShape: {
    position: 'absolute',
    width: 80,
    height: 36,
    bottom: -10,
    left: -8,
    borderRadius: 30,
    transform: [{ rotate: '-12deg' }],
  },
  check: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  applyButton: {
    minHeight: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  applyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 12,
    textAlign: 'center',
  },
  floating: {
    position: 'absolute',
    bottom: 96,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
});
