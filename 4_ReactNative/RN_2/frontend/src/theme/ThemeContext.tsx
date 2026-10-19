import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

// Indica si la aplicación sigue el sistema o usa un tema elegido por la persona.
export type ThemeMode = "auto" | "claro" | "oscuro";
// Centraliza los colores para que todas las pantallas compartan la misma paleta.
export const palettes = {
  claro: {
    background: "#F4F7F5",
    card: "#FFFFFF",
    text: "#18221D",
    muted: "#63716A",
    primary: "#16834A",
    border: "#E0E8E3",
    danger: "#C83B3B",
    warning: "#C87912",
  },
  oscuro: {
    background: "#111915",
    card: "#1B2620",
    text: "#F1F5F2",
    muted: "#A4B2AA",
    primary: "#58C985",
    border: "#33443A",
    danger: "#F27676",
    warning: "#F0B759",
  },
};
// Expone el tipo común de los colores para evitar usar valores sin tipado.
export type ThemeColors = typeof palettes.claro;
// Guarda el modo actual, los colores elegidos y el tema efectivo para las pantallas.
const Context = createContext<{
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  colors: typeof palettes.claro;
  dark: boolean;
} | null>(null);
// Carga la preferencia persistida y elige la paleta efectiva.
export function ThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("auto");
  useEffect(() => {
    AsyncStorage.getItem("scanstock-theme")
      .then((v) => {
        if (v === "auto" || v === "claro" || v === "oscuro") setModeState(v);
      })
      .catch(() => undefined);
  }, []);
  const dark = mode === "oscuro" || (mode === "auto" && system === "dark");
  const value = useMemo(
    () => ({
      mode,
      dark,
      colors: dark ? palettes.oscuro : palettes.claro,
      setMode: (v: ThemeMode) => {
        setModeState(v);
        void AsyncStorage.setItem("scanstock-theme", v);
      },
    }),
    [mode, dark],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
// Da acceso sencillo a los colores en cada pantalla.
export function useTheme() {
  const value = useContext(Context);
  if (!value) throw new Error("ThemeProvider no está configurado.");
  return value;
}
