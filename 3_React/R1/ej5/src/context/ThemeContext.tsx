import { createContext, useContext, useState } from "react";

// define los tipos que va a tener el contexto
interface TemaContextoTipo {
  tema: string;
  cambiarTema: () => void;
}

// crea el contexto con un valor por defecto vacío
const TemaContexto = createContext<TemaContextoTipo>({
  tema: "claro",
  cambiarTema: () => {},
});

// define las props del proveedor
interface ProveedorTemaProps {
  children: React.ReactNode;
}

// proveedor que envuelve toda la app y comparte el tema
function ProveedorTema({ children }: ProveedorTemaProps) {
  // lee el tema guardado en localStorage, o usa "claro" por defecto
  const [tema, setTema] = useState<string>(
    () => localStorage.getItem("tema") ?? "claro"
  );

  // cambia entre claro y oscuro y guarda la preferencia
  function cambiarTema() {
    const nuevoTema = tema === "claro" ? "oscuro" : "claro";
    setTema(nuevoTema);
    localStorage.setItem("tema", nuevoTema);
  }

  return (
    <TemaContexto.Provider value={{ tema, cambiarTema }}>
      {children}
    </TemaContexto.Provider>
  );
}

// hook simple para usar el contexto en cualquier componente
function usarTema() {
  return useContext(TemaContexto);
}

export { ProveedorTema, usarTema };
