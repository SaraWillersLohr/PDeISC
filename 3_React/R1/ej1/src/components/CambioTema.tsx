//componente de cambio de tema
import { FaMoon, FaSun } from "react-icons/fa";
import type { Dispatch, SetStateAction } from "react";

type CambioTemaProps = {
  darkMode: boolean;
  setDarkMode: Dispatch<SetStateAction<boolean>>;
};

function CambioTema({ darkMode, setDarkMode }: CambioTemaProps) {
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setDarkMode((previous) => !previous)}
      aria-label={`Activar modo ${darkMode ? "claro" : "oscuro"}`}
      title={`Modo ${darkMode ? "claro" : "oscuro"}`}
    >
      {darkMode ? <FaMoon aria-hidden="true" /> : <FaSun aria-hidden="true" />}
    </button>
  );
}

export default CambioTema;
