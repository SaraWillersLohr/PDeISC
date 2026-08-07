import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ThemeContext } from './themeContextObject';

interface ThemeProviderProps {
  children: ReactNode;
}

// provee el tema a toda la aplicación
export default function ThemeProvider({ children }: ThemeProviderProps) {
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
