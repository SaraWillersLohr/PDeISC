import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type ThemeToggleProps = {
  variant?: 'sidebar' | 'compact' | 'pill';
};

export function ThemeToggle({ variant = 'sidebar' }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  if (variant === 'compact') {
    return (
      <Pressable
        accessibilityLabel={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        accessibilityRole="switch"
        accessibilityState={{ checked: isDark }}
        onPress={toggleTheme}
        style={[styles.compactPill, isDark ? styles.compactPillDark : styles.compactPillLight]}
      >
        <View style={[styles.compactIconCircle, !isDark && styles.compactActiveLight]}>
          <Ionicons color={!isDark ? '#d97706' : '#738977'} name="sunny" size={14} />
        </View>
        <View style={[styles.compactIconCircle, isDark && styles.compactActiveDark]}>
          <Ionicons color={isDark ? '#38bdf8' : '#738977'} name="moon" size={14} />
        </View>
      </Pressable>
    );
  }

  if (variant === 'pill') {
    return (
      <Pressable
        accessibilityLabel={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        accessibilityRole="switch"
        accessibilityState={{ checked: isDark }}
        onPress={toggleTheme}
        style={[styles.pillButton, isDark ? styles.pillButtonDark : styles.pillButtonLight]}
      >
        <View style={[styles.pillIconWrap, { backgroundColor: isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(245, 158, 11, 0.2)' }]}>
          <Ionicons color={isDark ? '#38bdf8' : '#d97706'} name={isDark ? 'moon' : 'sunny'} size={15} />
        </View>
        <Text style={[styles.pillText, isDark ? styles.pillTextDark : styles.pillTextLight]}>
          {isDark ? 'Modo Oscuro' : 'Modo Claro'}
        </Text>
      </Pressable>
    );
  }

  // default 'sidebar' variant
  return (
    <Pressable
      accessibilityLabel={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      accessibilityRole="switch"
      accessibilityState={{ checked: isDark }}
      onPress={toggleTheme}
      style={({ pressed }) => [
        styles.sidebarCard,
        isDark ? styles.sidebarCardDark : styles.sidebarCardLight,
        pressed && styles.sidebarCardPressed,
      ]}
    >
      <View style={styles.sidebarHeader}>
        <View style={[styles.glowBadge, { backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(245, 158, 11, 0.18)' }]}>
          <Ionicons
            color={isDark ? '#38bdf8' : '#eab308'}
            name={isDark ? 'moon' : 'sunny'}
            size={16}
          />
        </View>
        <View style={styles.labelCol}>
          <Text style={styles.eyebrow}>TEMA VISUAL</Text>
          <Text style={styles.mainTitle}>{isDark ? 'Modo Noche' : 'Modo Campo'}</Text>
        </View>

        {/* Visual Switch Track */}
        <View style={[styles.switchTrack, isDark ? styles.switchTrackDark : styles.switchTrackLight]}>
          <View
            style={[
              styles.switchThumb,
              isDark ? styles.switchThumbDark : styles.switchThumbLight,
            ]}
          >
            <Ionicons
              color={isDark ? '#0f172a' : '#78350f'}
              name={isDark ? 'moon' : 'sunny'}
              size={11}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Compact dual icon pill
  compactPill: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 3,
    padding: 3,
  },
  compactPillLight: {
    backgroundColor: '#edf2ea',
    borderColor: '#d6e2d3',
  },
  compactPillDark: {
    backgroundColor: '#122017',
    borderColor: '#243a2b',
  },
  compactIconCircle: {
    alignItems: 'center',
    borderRadius: 14,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  compactActiveLight: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
  },
  compactActiveDark: {
    backgroundColor: '#1d3424',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },

  // Pill button with text
  pillButton: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pillButtonLight: {
    backgroundColor: '#ffffff',
    borderColor: '#dce5da',
  },
  pillButtonDark: {
    backgroundColor: '#15241b',
    borderColor: '#23392b',
  },
  pillIconWrap: {
    alignItems: 'center',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pillTextLight: {
    color: '#1e4832',
  },
  pillTextDark: {
    color: '#86efac',
  },

  // Sidebar card switch
  sidebarCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 4,
    marginVertical: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sidebarCardLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  sidebarCardDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderColor: 'rgba(134, 239, 172, 0.16)',
  },
  sidebarCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  sidebarHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  glowBadge: {
    alignItems: 'center',
    borderRadius: 10,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  labelCol: {
    flex: 1,
  },
  eyebrow: {
    color: '#829986',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  mainTitle: {
    color: '#f0fdf4',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  switchTrack: {
    borderRadius: 14,
    borderWidth: 1,
    height: 22,
    justifyContent: 'center',
    paddingHorizontal: 2,
    width: 40,
  },
  switchTrackLight: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  switchTrackDark: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
    borderColor: 'rgba(56, 189, 248, 0.45)',
  },
  switchThumb: {
    alignItems: 'center',
    borderRadius: 8,
    height: 16,
    justifyContent: 'center',
    width: 16,
  },
  switchThumbLight: {
    backgroundColor: '#fef08a',
  },
  switchThumbDark: {
    backgroundColor: '#7dd3fc',
  },
});
