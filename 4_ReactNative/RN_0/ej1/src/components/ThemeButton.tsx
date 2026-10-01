import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

// boton interactivo para alternar entre modo claro y modo oscuro
export function ThemeButton() {
  // recuperamos el estado del tema y la funcion para alternarlo
  const { isDark, palette, toggleTheme } = useTheme();

  return (
    // boton presionable con animacion de escala y opacidad
    <Pressable
      onPress={toggleTheme}
      accessibilityRole="button"
      accessibilityLabel={isDark ? "Activar modo claro" : "Activar modo oscuro"}
      hitSlop={8}
      style={
        /* Ajusta el aspecto mientras se mantiene presionado. */ ({
          pressed,
        }) => [
          styles.button,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
            opacity: pressed ? 0.75 : 1,
            transform: [{ scale: pressed ? 0.94 : 1 }],
          },
        ]
      }
    >
      {/* icono que cambia a sol en oscuro y luna en claro */}
      <Ionicons
        name={isDark ? "sunny" : "moon"}
        size={20}
        color={palette.accent}
      />
    </Pressable>
  );
}

// estilos para darle forma circular y sombra sutil al boton
// Reúne los estilos del botón circular del tema.
const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});
