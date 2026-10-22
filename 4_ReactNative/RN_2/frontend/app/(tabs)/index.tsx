import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { ThemeToggle } from "../../src/components/ThemeToggle";
import { functions } from "../../src/data/functions";
import type { AppColors } from "../../src/theme/colors";
import { useAppTheme } from "../../src/theme/useAppTheme";

// Presenta el catálogo principal y ajusta la cantidad de columnas al ancho disponible.
export default function CatalogScreen() {
  const { width } = useWindowDimensions();
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const columns = width >= 1024 ? 3 : width >= 640 ? 2 : 1;
  const contentWidth = Math.min(width, 1180) - 40;
  const cardWidth = (contentWidth - 12 * (columns - 1)) / columns;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* La cabecera explica de inmediato el propósito educativo de la aplicación. */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <Text style={styles.kicker}>CATÁLOGO INTERACTIVO</Text>
          <ThemeToggle />
        </View>
        <Text style={styles.title}>Funciones del teléfono</Text>
        <Text style={styles.intro}>
          Explorá las herramientas de hardware de tu dispositivo. Abrí una ficha y probá cada función.
        </Text>
      </View>

      {/* Cada tarjeta conduce a una demostración real de la función indicada. */}
      <View style={styles.grid}>
        {functions.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`Probar ${item.title}`}
            onPress={() => router.push(`/herramienta/${item.id}`)}
            style={({ pressed }) => [
              styles.card,
              { width: cardWidth, opacity: pressed ? 0.82 : 1 },
            ]}
          >
            <View style={styles.cardTop}>
              <Text style={styles.icon}>{item.icon}</Text>
              <Text style={styles.category}>{item.category}</Text>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardText}>{item.summary}</Text>
            <Text style={styles.link}>Abrir demostración  →</Text>
          </Pressable>
        ))}
      </View>

      {/* El aviso informa que sensores y permisos varían según el modelo. */}
      <Text style={styles.footnote}>
        Algunas funciones dependen del hardware disponible y de los permisos que autorices.
      </Text>
    </ScrollView>
  );
}

// Mantiene una jerarquía visual clara y un espacio adaptable entre tarjetas.
function createStyles(colors: AppColors) {
  return StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 34, maxWidth: 1180, width: "100%", alignSelf: "center" },
  hero: { padding: 22, marginBottom: 20, borderRadius: 24, backgroundColor: colors.hero },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 },
  kicker: { color: colors.accent, fontWeight: "800", letterSpacing: 1.4, fontSize: 12 },
  title: { color: colors.ink, fontSize: 32, lineHeight: 39, fontWeight: "800", marginTop: 9 },
  intro: { color: colors.muted, fontSize: 15, lineHeight: 23, marginTop: 9, maxWidth: 650 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start", gap: 12 },
  card: { minHeight: 190, padding: 17, borderRadius: 19, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  icon: { fontSize: 28 },
  category: { color: colors.accent, fontSize: 10, fontWeight: "800", letterSpacing: 0.9, textAlign: "right", flexShrink: 1 },
  cardTitle: { color: colors.ink, fontSize: 17, fontWeight: "800" },
  cardText: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  link: { color: colors.accent, fontWeight: "800", fontSize: 13, marginTop: "auto", paddingTop: 16 },
  footnote: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 19 },
  });
}
