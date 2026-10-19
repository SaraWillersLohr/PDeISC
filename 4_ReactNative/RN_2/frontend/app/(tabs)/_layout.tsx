import { Tabs } from "expo-router";
import { useTheme } from "../../src/theme/ThemeContext";

// Presenta las secciones principales mediante navegación inferior.
export default function TabLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.card },
        tabBarActiveTintColor: colors.primary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Inicio", tabBarLabel: "Inicio" }}
      />
      <Tabs.Screen name="productos" options={{ title: "Productos" }} />
      <Tabs.Screen name="scanner" options={{ title: "Escáner" }} />
      <Tabs.Screen name="historial" options={{ title: "Historial" }} />
      <Tabs.Screen name="configuracion" options={{ title: "Ajustes" }} />
    </Tabs>
  );
}
