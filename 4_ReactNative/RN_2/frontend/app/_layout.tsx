import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import { AppThemeProvider, useAppTheme } from "../src/theme/useAppTheme";

// Define la navegación de la app y el color común de la barra de estado.
export default function RootLayout() {
  return (
    <AppThemeProvider>
      <RootNavigation />
    </AppThemeProvider>
  );
}

function RootNavigation() {
  const { colors, isDark } = useAppTheme();

  // Sincroniza el fondo del documento web con el tema activo de la aplicación.
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    document.documentElement.style.backgroundColor = colors.background;
    document.body.style.backgroundColor = colors.background;
  }, [colors.background, isDark]);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{
        headerStyle: { backgroundColor: colors.paper },
        headerTintColor: colors.ink,
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: colors.background },
      }}>
        {/* La ruta principal contiene el catálogo de funciones del dispositivo. */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Las fichas se abren encima del catálogo para facilitar el regreso. */}
        <Stack.Screen name="herramienta/[id]" options={{ title: "Demostración" }} />
      </Stack>
    </>
  );
}
