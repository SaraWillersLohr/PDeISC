import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

type ThemeContextValue = { isDark: boolean; toggleTheme: () => void };
const ThemeContext = createContext<ThemeContextValue>({ isDark: false, toggleTheme: () => undefined });
const storageKey = 'estancia_app_theme';

export function ThemeProvider({ children }: React.PropsWithChildren) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    let active = true;
    const restore = Platform.OS === 'web'
      ? Promise.resolve(globalThis.localStorage.getItem(storageKey))
      : SecureStore.getItemAsync(storageKey);
    void restore.then((value) => { if (active && value) setIsDark(value === 'dark'); }).catch(() => undefined);
    return () => { active = false; };
  }, []);

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

  const value = useMemo(() => ({ isDark, toggleTheme }), [isDark, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() { return useContext(ThemeContext); }
