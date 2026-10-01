import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import { colors } from "../constants/colors";
import {
  AppearanceSettings,
  colorAccents,
  defaultAppearance,
  backgrounds,
} from "../constants/appearance";

// tipos y contexto para compartir el tema en toda la app
type Mode = "light" | "dark";
type ThemeValue = {
  palette: typeof colors.light;
  isDark: boolean;
  toggleTheme: () => void;
  storageError: string | null;
  appearance: AppearanceSettings;
  applyAppearance: (settings: AppearanceSettings) => void;
};
// Comparte los valores del tema entre los componentes de la aplicación.
const ThemeContext = createContext<ThemeValue | undefined>(undefined);
// Clave usada para guardar el modo claro u oscuro.
const STORAGE_KEY = "@ej1/theme";
// Clave usada para guardar las preferencias de apariencia.
const APPEARANCE_KEY = "@ej1/appearance";

// componente proveedor que envuelve la app y maneja el tema
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Lee el tema del dispositivo como valor inicial.
  const systemTheme = useColorScheme();
  // estado para saber si estamos en modo claro u oscuro
  const [mode, setMode] = useState<Mode>(
    systemTheme === "dark" ? "dark" : "light",
  );
  // estado con la configuracion visual activa (color, fuente, tamano, fondo)
  const [appearance, setAppearance] = useState(defaultAppearance);
  // estado para esperar a leer el almacenamiento antes de mostrar la pantalla
  const [ready, setReady] = useState(false);
  // estado para capturar cualquier error al guardar en asyncstorage
  const [storageError, setStorageError] = useState<string | null>(null);
  // Encadena las escrituras para guardarlas en el orden correcto.
  const writes = useRef(Promise.resolve());

  // efecto para recuperar el tema y estilos guardados previamente en el celular
  useEffect(
    /* Lee las preferencias guardadas al iniciar. */ () => {
      let active = true;
      Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(APPEARANCE_KEY),
      ])
        .then(
          /* Aplica las preferencias que se encontraron. */ ([
            savedMode,
            savedAppearance,
          ]) => {
            if (!active) return;
            if (savedMode === "light" || savedMode === "dark")
              setMode(savedMode);
            if (savedAppearance) {
              try {
                // Convierte el texto guardado en opciones de apariencia.
                const parsed = JSON.parse(
                  savedAppearance,
                ) as Partial<AppearanceSettings>;
                // Usa la fuente predeterminada si la guardada ya no es válida.
                let validFont = defaultAppearance.font;
                // verificacion para validar que la fuente guardada siga existiendo
                if (
                  parsed.font === "Moderna" ||
                  parsed.font === "Elegante" ||
                  parsed.font === "Cursiva" ||
                  parsed.font === "Monospace"
                ) {
                  validFont = parsed.font;
                } else if (parsed.font === ("Georgia" as any)) {
                  validFont = "Elegante";
                } else if (parsed.font === ("Courier New" as any)) {
                  validFont = "Monospace";
                }
                setAppearance({
                  ...defaultAppearance,
                  ...parsed,
                  font: validFont,
                });
              } catch {
                // Recupera la apariencia inicial si los datos no se pueden leer.
                setAppearance(defaultAppearance);
              }
            }
          },
        )
        .catch(
          /* Informa si no se pudieron leer las preferencias. */ () => {
            if (active)
              setStorageError("No se pudo recuperar el tema guardado.");
          },
        )
        .finally(
          /* Permite mostrar la app cuando termina la lectura. */ () => {
            if (active) setReady(true);
          },
        );
      return /* Evita actualizar el estado si el proveedor ya se desmontó. */ () => {
        active = false;
      };
    },
    [],
  );

  // funcion para aplicar estilos inmediatamente y guardarlos en el telefono
  // Actualiza la apariencia y guarda la nueva configuración.
  const applyAppearance = (settings: AppearanceSettings) => {
    setAppearance(settings);
    AsyncStorage.setItem(APPEARANCE_KEY, JSON.stringify(settings)).catch(
      /* Informa si falla el guardado. */ () =>
        setStorageError(
          "Los cambios se aplicaron, pero no se pudieron guardar.",
        ),
    );
  };

  // combinamos el modo claro u oscuro con el acento de color elegido
  // Busca los tonos del color de acento seleccionado.
  const paletteColors = colorAccents[appearance.color];
  // Combina los colores base con el fondo y acento elegidos.
  const palette = {
    ...colors[mode],
    background: backgrounds[appearance.background][mode],
    accent: mode === "dark" ? paletteColors.dark : paletteColors.light,
    soft: mode === "dark" ? paletteColors.softDark : paletteColors.softLight,
  };

  // efecto para guardar el modo claro u oscuro cada vez que se presiona el boton
  useEffect(
    /* Guarda el modo cuando cambia o termina la carga inicial. */ () => {
      if (!ready) return;
      writes.current = writes.current
        .then(
          /* Guarda el modo actual. */ () =>
            AsyncStorage.setItem(STORAGE_KEY, mode),
        )
        .then(
          /* Limpia el error si el guardado terminó bien. */ () =>
            setStorageError(null),
        )
        .catch(
          /* Informa si no se pudo guardar el modo. */ () =>
            setStorageError("El tema cambió, pero no se pudo guardar."),
        );
    },
    [mode, ready],
  );

  // si todavia no cargamos las preferencias no renderizamos para evitar parpadeos
  if (!ready) return null;

  // retornamos el proveedor con todas las funciones y valores del tema
  return (
    <ThemeContext.Provider
      value={{
        palette,
        isDark: mode === "dark",
        appearance,
        applyAppearance,
        toggleTheme: /* Alterna entre los modos claro y oscuro. */ () =>
          setMode(
            /* Calcula el modo contrario al actual. */ (previous) =>
              previous === "light" ? "dark" : "light",
          ),
        storageError,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// hook para usar el tema y los estilos en cualquier componente de forma simple
export function useTheme() {
  // Lee el contexto y permite usar sus valores desde un componente.
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return context;
}
