import { Pressable, StyleSheet, Text } from "react-native";
import { useAppTheme } from "../theme/useAppTheme";

// Ofrece el cambio de tema con una etiqueta que anuncia la acción disponible.
export function ThemeToggle() {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const action = isDark ? "claro" : "oscuro";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Activar modo ${action}`}
      onPress={toggleTheme}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.paper, borderColor: colors.line, opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <Text style={[styles.label, { color: colors.ink }]}>
        {isDark ? "☀  Modo claro" : "☾  Modo oscuro"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 42, alignSelf: "flex-start", justifyContent: "center", paddingHorizontal: 14, borderWidth: 1, borderRadius: 13 },
  label: { fontSize: 13, fontWeight: "800" },
});
