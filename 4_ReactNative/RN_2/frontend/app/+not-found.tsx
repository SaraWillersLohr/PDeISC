import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../src/theme/colors";

// Explica cómo regresar cuando se abre una ruta desconocida.
export default function NotFound() {
  return (
    <View style={styles.page}>
      <Text style={styles.title}>No encontramos esta pantalla.</Text>
      <Link href="/" style={styles.link}>Volver al catálogo</Link>
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
    backgroundColor: colors.background,
  },
  title: { color: colors.ink, fontSize: 20, fontWeight: "700" },
  link: { color: colors.accent, fontWeight: "700" },
});
