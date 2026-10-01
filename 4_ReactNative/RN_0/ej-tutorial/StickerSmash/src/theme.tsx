import { createContext, useContext, useMemo, useState } from 'react';

// Dos paletas pequeñas mantienen el mismo diseño legible en ambos modos.
const palettes = {
  light: { background: '#F7F4EF', surface: '#FFFFFF', elevated: '#EEE8E0', text: '#29363B', muted: '#667477', accent: '#B85F4B', accentSoft: '#F1DED7', border: '#E2D9CF', overlay: 'rgba(25, 35, 38, 0.45)' },
  dark: { background: '#20292D', surface: '#2B373B', elevated: '#3A484C', text: '#F5F0E8', muted: '#B8C2BF', accent: '#E5A08B', accentSoft: '#503A35', border: '#526064', overlay: 'rgba(0, 0, 0, 0.62)' },
};

type ThemeContextValue = { isDark: boolean; colors: (typeof palettes)['light']; toggleTheme: () => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);

// El estado único del proveedor hace que el cambio de modo afecte a toda la app.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const value = useMemo(() => ({ isDark, colors: isDark ? palettes.dark : palettes.light, toggleTheme: () => setIsDark((dark) => !dark) }), [isDark]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useAppTheme debe usarse dentro de ThemeProvider');
  return theme;
}
