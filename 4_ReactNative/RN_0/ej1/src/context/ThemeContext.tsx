import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { colors } from '../constants/colors';
import { AppearanceSettings, colorAccents, defaultAppearance, backgrounds } from '../constants/appearance';

type Mode = 'light' | 'dark';
type ThemeValue = {
  palette: typeof colors.light;
  isDark: boolean;
  toggleTheme: () => void;
  storageError: string | null;
  appearance: AppearanceSettings;
  applyAppearance: (settings: AppearanceSettings) => void;
};
const ThemeContext = createContext<ThemeValue | undefined>(undefined);
const STORAGE_KEY = '@ej1/theme';
const APPEARANCE_KEY = '@ej1/appearance';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemTheme = useColorScheme();
  const [mode, setMode] = useState<Mode>(systemTheme === 'dark' ? 'dark' : 'light');
  const [appearance, setAppearance] = useState(defaultAppearance);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const writes = useRef(Promise.resolve());

  // recupero el tema elegido antes de mostrar la aplicación
  useEffect(() => {
    let active = true;
    Promise.all([AsyncStorage.getItem(STORAGE_KEY), AsyncStorage.getItem(APPEARANCE_KEY)]).then(([savedMode, savedAppearance]) => {
      if (!active) return;
      if (savedMode === 'light' || savedMode === 'dark') setMode(savedMode);
      if (savedAppearance) {
        try {
          const parsed = JSON.parse(savedAppearance) as Partial<AppearanceSettings>;
          let validFont = defaultAppearance.font;
          if (parsed.font === 'Moderna' || parsed.font === 'Elegante' || parsed.font === 'Cursiva' || parsed.font === 'Monospace') {
            validFont = parsed.font;
          } else if (parsed.font === ('Georgia' as any)) {
            validFont = 'Elegante';
          } else if (parsed.font === ('Courier New' as any)) {
            validFont = 'Monospace';
          }
          setAppearance({ ...defaultAppearance, ...parsed, font: validFont });
        } catch {
          setAppearance(defaultAppearance);
        }
      }
    }).catch(() => {
      if (active) setStorageError('No se pudo recuperar el tema guardado.');
    }).finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  const applyAppearance = (settings: AppearanceSettings) => {
    setAppearance(settings);
    AsyncStorage.setItem(APPEARANCE_KEY, JSON.stringify(settings)).catch(() =>
      setStorageError('Los cambios se aplicaron, pero no se pudieron guardar.')
    );
  };

  const paletteColors = colorAccents[appearance.color];
  const palette = {
    ...colors[mode],
    background: backgrounds[appearance.background][mode],
    accent: mode === 'dark' ? paletteColors.dark : paletteColors.light,
    soft: mode === 'dark' ? paletteColors.softDark : paletteColors.softLight,
  };

  // guardo el tema elegido; respeto el orden aunque se cambie varias veces
  useEffect(() => {
    if (!ready) return;
    writes.current = writes.current.then(() => AsyncStorage.setItem(STORAGE_KEY, mode))
      .then(() => setStorageError(null))
      .catch(() => setStorageError('El tema cambió, pero no se pudo guardar.'));
  }, [mode, ready]);

  if (!ready) return null;
  return (
    <ThemeContext.Provider value={{ palette, isDark: mode === 'dark', appearance, applyAppearance,
      toggleTheme: () => setMode((previous) => previous === 'light' ? 'dark' : 'light'), storageError }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return context;
}
