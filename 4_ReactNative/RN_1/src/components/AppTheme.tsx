// Comparte el modo de color elegido en el panel para que las tarjetas y formularios usen la misma paleta.
import { createContext, useContext, type ReactNode } from 'react';

const DarkModeContext = createContext(false);

// Esta función aplica el modo oscuro a todas las vistas internas que están dentro del panel.
export function AppTheme({ dark, children }: { dark: boolean; children: ReactNode }) {
  return <DarkModeContext.Provider value={dark}>{children}</DarkModeContext.Provider>;
}

// Esta función permite a los componentes compartidos leer el modo visual activo.
export function useAppDarkMode(): boolean {
  return useContext(DarkModeContext);
}
