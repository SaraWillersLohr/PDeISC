import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// define qué información va a tener el contexto
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// crea el contexto con un valor por defecto vacío
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

// provee el tema a toda la aplicación
export function ThemeProvider({ children }: ThemeProviderProps) {
  // lee el tema guardado en localStorage, o usa 'light' por defecto
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('tateti-theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  // cuando cambia el tema, lo guarda en localStorage y actualiza el atributo del html
  useEffect(() => {
    localStorage.setItem('tateti-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // cambia entre claro y oscuro
  function toggleTheme() {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// hook para usar el contexto en cualquier componente
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
}
