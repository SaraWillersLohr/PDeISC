import { StyleSheet, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { BackgroundName } from "../constants/appearance";

// propiedades opcionales para controlar el fondo desde afuera
interface BackgroundDecorationProps {
  enabled?: boolean;
  type?: BackgroundName;
}

// componente para dibujar las formas decorativas de fondo (olas o bruma)
export function BackgroundDecoration({
  enabled,
  type,
}: BackgroundDecorationProps) {
  // Obtiene los colores y la apariencia actuales del tema.
  const { palette, appearance } = useTheme();
  // Elige el fondo recibido o, si no existe, el configurado en la app.
  const currentBg = type ?? appearance.background;
  // Decide si se deben mostrar las decoraciones.
  const isEnabled = enabled !== undefined ? enabled : currentBg !== "Claro";

  // si el estilo elegido es claro no mostramos ninguna decoracion
  if (!isEnabled || currentBg === "Claro") return null;

  // si el usuario eligio bruma mostramos resplandores suaves
  if (currentBg === "Bruma") {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View
          style={[
            styles.brumaAura,
            styles.brumaTop,
            { backgroundColor: palette.soft },
          ]}
        />
        <View
          style={[
            styles.brumaAura,
            styles.brumaBottom,
            { backgroundColor: palette.soft },
          ]}
        />
      </View>
    );
  }

  // si el usuario eligio olas mostramos curvas organicas en las esquinas
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View
        style={[styles.wave, styles.topWave, { backgroundColor: palette.soft }]}
      />
      <View
        style={[
          styles.waveSecondary,
          styles.topWaveSecondary,
          { backgroundColor: palette.accent },
        ]}
      />
      <View
        style={[
          styles.wave,
          styles.bottomWave,
          { backgroundColor: palette.soft },
        ]}
      />
      <View
        style={[
          styles.waveSecondary,
          styles.bottomWaveSecondary,
          { backgroundColor: palette.accent },
        ]}
      />
    </View>
  );
}

// estilos para el posicionamiento y redondeo de las formas de fondo
// Reúne las formas y posiciones decorativas del fondo.
const styles = StyleSheet.create({
  wave: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.5,
  },
  waveSecondary: {
    position: "absolute",
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
    position: "absolute",
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
