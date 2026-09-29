import { StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { BackgroundName } from '../constants/appearance';

interface BackgroundDecorationProps {
  enabled?: boolean;
  type?: BackgroundName;
}

export function BackgroundDecoration({ enabled, type }: BackgroundDecorationProps) {
  const { palette, appearance } = useTheme();
  const currentBg = type ?? appearance.background;
  const isEnabled = enabled !== undefined ? enabled : currentBg !== 'Claro';

  if (!isEnabled || currentBg === 'Claro') return null;

  if (currentBg === 'Bruma') {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.brumaAura, styles.brumaTop, { backgroundColor: palette.soft }]} />
        <View style={[styles.brumaAura, styles.brumaBottom, { backgroundColor: palette.soft }]} />
      </View>
    );
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.wave, styles.topWave, { backgroundColor: palette.soft }]} />
      <View style={[styles.waveSecondary, styles.topWaveSecondary, { backgroundColor: palette.accent }]} />
      <View style={[styles.wave, styles.bottomWave, { backgroundColor: palette.soft }]} />
      <View style={[styles.waveSecondary, styles.bottomWaveSecondary, { backgroundColor: palette.accent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wave: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.5,
  },
  waveSecondary: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.12,
  },
  topWave: {
    top: -160,
    right: -100,
    transform: [{ scaleX: 1.3 }],
  },
  topWaveSecondary: {
    top: -90,
    right: -50,
  },
  bottomWave: {
    bottom: -170,
    left: -120,
    transform: [{ scaleY: 1.2 }],
  },
  bottomWaveSecondary: {
    bottom: -80,
    left: -40,
  },
  brumaAura: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    opacity: 0.45,
  },
  brumaTop: {
    top: -120,
    left: -80,
  },
  brumaBottom: {
    bottom: -140,
    right: -90,
  },
});

