import { createContext, createElement, useContext, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { darkColors, lightColors, type AppColors } from "./colors";

type ThemeContextValue = {
  colors: AppColors;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Comparte el tema seleccionado entre todas las rutas de la aplicación.
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [selectedTheme, setSelectedTheme] = useState<"system" | "light" | "dark">("system");
  const isDark = selectedTheme === "system" ? systemScheme === "dark" : selectedTheme === "dark";
  const value = {
    colors: isDark ? darkColors : lightColors,
    isDark,
    toggleTheme: () => setSelectedTheme(isDark ? "light" : "dark"),
  };

  return createElement(ThemeContext.Provider, { value }, children);
}

// Mantiene las pantallas, la navegación y los controles con el mismo tema.
export function useAppTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error("useAppTheme debe usarse dentro de AppThemeProvider.");
  return theme;
}
