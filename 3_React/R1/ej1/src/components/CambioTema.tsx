//componente de cambio de tema
import { FaMoon, FaSun } from "react-icons/fa";
import type { Dispatch, SetStateAction } from "react";

//props es un objeto que contiene dos propiedades: darkMode y setDarkMode. darkMode es un booleano que indica si el modo oscuro está activado o no, y setDarkMode es una función que permite cambiar el estado de darkMode.
type CambioTemaProps = {
  darkMode: boolean;
  setDarkMode: Dispatch<SetStateAction<boolean>>;
};
//funcion que recibe las props y devuelve un botón que permite cambiar el tema de la aplicación. }
// El botón tiene un icono que cambia según el estado de darkMode, y un aria-label y title que indican el modo actual.
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
//los iconos son de react icons que se llaman al principio.
export default CambioTema;
