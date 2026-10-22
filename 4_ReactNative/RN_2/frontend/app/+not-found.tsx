import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../src/theme/useAppTheme";

// Explica cómo regresar cuando se abre una ruta desconocida.
export default function NotFound() {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.page, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.ink }]}>No encontramos esta pantalla.</Text>
      <Link href="/" style={[styles.link, { color: colors.accent }]}>Volver al catálogo</Link>
    </View>
  );
}
// Centraliza los estilos compartidos por este componente.
const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  title: { fontSize: 20, fontWeight: "700" },
  link: { fontWeight: "700" },
});
