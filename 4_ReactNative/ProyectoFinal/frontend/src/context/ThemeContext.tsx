// comparto la paleta visual y guardo la preferencia de tema entre sesiones.
import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

export const agroPalette = {
  light: {
    bgCanvas: '#f4f6f1',
    bgCard: '#ffffff',
    bgCardMuted: '#edf3eb',
    bgSidebar: '#13281a',
    bgSidebarItem: 'transparent',
    bgSidebarItemActive: 'rgba(134, 239, 172, 0.14)',
    border: '#dce5da',
    borderLight: '#e9f0e7',
    borderFocus: '#2d6a4f',
    textMain: '#17271c',
    textSecondary: '#4c6151',
    textMuted: '#758879',
    primary: '#1c4630',
    primaryLight: '#2c6647',
    accentLime: '#86efac',
    accentGold: '#c28b34',
    accentGoldBg: '#fbf4e8',
    accentRed: '#a8473d',
    accentRedBg: '#faecea',
    accentBlue: '#3569a1',
    accentBlueBg: '#edf3fa',
    accentPurple: '#6a4d95',
    accentPurpleBg: '#f2effa',
    inputBg: '#ffffff',
    inputBorder: '#dce5da',
    inputText: '#17271c',
    statusDot: '#40916c',
  },
  dark: {
    bgCanvas: '#0e1811',
    bgCard: '#15241b',
    bgCardMuted: '#1b2f23',
    bgSidebar: '#0d1a11',
    bgSidebarItem: 'transparent',
    bgSidebarItemActive: 'rgba(134, 239, 172, 0.16)',
    border: '#23392b',
    borderLight: '#1b2e22',
    borderFocus: '#86efac',
    textMain: '#f0fdf4',
    textSecondary: '#a5bcaa',
    textMuted: '#738977',
    primary: '#2b6545',
    primaryLight: '#3d885e',
    accentLime: '#86efac',
    accentGold: '#e3a948',
    accentGoldBg: 'rgba(227, 169, 72, 0.15)',
    accentRed: '#e26b60',
    accentRedBg: 'rgba(226, 107, 96, 0.15)',
    accentBlue: '#5e96d9',
    accentBlueBg: 'rgba(94, 150, 217, 0.15)',
    accentPurple: '#a78bd6',
    accentPurpleBg: 'rgba(167, 139, 214, 0.15)',
    inputBg: '#122017',
    inputBorder: '#274230',
    inputText: '#f0fdf4',
    statusDot: '#52b788',
  },
} as const;

export type ThemeColors = { [K in keyof typeof agroPalette.light]: string };

type ThemeContextValue = {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
};

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  toggleTheme: () => undefined,
  colors: agroPalette.light,
});
const storageKey = 'estancia_app_theme';

export function ThemeProvider({ children }: React.PropsWithChildren) {
  const [isDark, setIsDark] = useState(false);

  // restauro la preferencia sin actualizar el estado si el componente ya se desmontó.
  useEffect(() => {
    let active = true;
    const restore = Platform.OS === 'web'
      ? Promise.resolve(globalThis.localStorage.getItem(storageKey))
      : SecureStore.getItemAsync(storageKey);
    void restore.then((value) => { if (active && value) setIsDark(value === 'dark'); }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  // cambio el tema de inmediato y persisto la opción según la plataforma.
  const toggleTheme = useCallback(() => {
    setIsDark((current) => {
      const next = !current;
      const save = Platform.OS === 'web'
        ? Promise.resolve(globalThis.localStorage.setItem(storageKey, next ? 'dark' : 'light'))
        : SecureStore.setItemAsync(storageKey, next ? 'dark' : 'light');
      void save.catch(() => undefined);
      return next;
    });
  }, []);

  const colors = useMemo(() => (isDark ? agroPalette.dark : agroPalette.light), [isDark]);
  const value = useMemo(() => ({ isDark, toggleTheme, colors }), [isDark, toggleTheme, colors]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() { return useContext(ThemeContext); }

