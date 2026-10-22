import { Tabs } from "expo-router";
import { useAppTheme } from "../../src/theme/useAppTheme";

// Mantiene una sola pestaña principal porque el catálogo es la entrada de la app.
export default function CatalogTabs() {
  const { colors } = useAppTheme();

  return (
    <Tabs screenOptions={{
      headerStyle: { backgroundColor: colors.paper },
      headerTintColor: colors.ink,
      headerTitleStyle: { fontWeight: "700" },
      tabBarStyle: { display: "none" },
    }}>
      {/* Oculta la barra inferior: la navegación ocurre desde las tarjetas. */}
      <Tabs.Screen name="index" options={{ title: "Catálogo de funciones" }} />
    </Tabs>
  );
}
