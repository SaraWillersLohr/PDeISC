import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type Tema = 'claro' | 'oscuro';

interface ThemeContextProps {
  tema: Tema;
  alternarTema: () => void;
}

// el contexto se comparte con la barra de navegación
// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext<ThemeContextProps>({
  tema: 'claro',
  alternarTema: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // leo el tema guardado o uso claro por defecto
  const [tema, setTema] = useState<Tema>(() => {
    const guardado = localStorage.getItem('tema');
    return guardado === 'oscuro' ? 'oscuro' : 'claro';
  });

  // aplico el tema al body cada vez que cambia
  useEffect(() => {
    localStorage.setItem('tema', tema);
    document.body.setAttribute('data-theme', tema);
  }, [tema]);

  // acá cambio entre modo claro y oscuro
  const alternarTema = () => {
    setTema((prev) => (prev === 'claro' ? 'oscuro' : 'claro'));
  };

  return (
    <ThemeContext.Provider value={{ tema, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  );
};
