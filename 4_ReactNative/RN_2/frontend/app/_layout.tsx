import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "../src/theme/colors";

// Define la navegación de la app y el color común de la barra de estado.
export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
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
