import { createContext } from 'react';

// define qué información va a tener el contexto
export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// el contexto se crea acá para que ThemeProvider y useTheme puedan importarlo sin problemas
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
