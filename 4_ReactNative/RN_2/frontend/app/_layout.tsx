import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, useTheme } from "../src/theme/ThemeContext";

// Configura la navegación principal de ScanStock.
// Aplica el tema a la barra de estado y define las rutas principales y secundarias.
function Navigation() {
  const { colors, dark } = useTheme();
  return (
    <>
      <StatusBar style={dark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="producto-form" options={{ title: "Producto" }} />
        <Stack.Screen
          name="producto/[id]"
          options={{ title: "Detalle del producto" }}
        />
      </Stack>
    </>
  );
}

// Provee el tema guardado a todas las pantallas.
export default function RootLayout() {
  return (
    <ThemeProvider>
      <Navigation />
    </ThemeProvider>
  );
}
