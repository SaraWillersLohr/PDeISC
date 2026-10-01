import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppTabs } from "./src/navigation/AppTabs";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";

// Coordina la barra de estado y la navegación principal.
function Main() {
  // Lee si el tema activo es oscuro para ajustar la barra del sistema.
  const { isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <AppTabs />
    </>
  );
}

// Envuelve la aplicación con los proveedores necesarios.
export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Main />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
