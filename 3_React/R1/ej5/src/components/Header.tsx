import { Sun, Moon, UserCircle2 } from "lucide-react";
import { usarTema } from "../context/ThemeContext";

// muestra el título de la app y el botón para cambiar el tema
function Header() {
  const { tema, cambiarTema } = usarTema();

  return (
    <header className="header">
      <h1 className="header-titulo">
        <UserCircle2 size={26} />
        Registro de Usuario
      </h1>

      {/* botón fijo arriba a la derecha para cambiar entre claro y oscuro */}
      <button
        className="boton-tema"
        onClick={cambiarTema}
        aria-label="Cambiar tema"
        title={tema === "claro" ? "Activar modo oscuro" : "Activar modo claro"}
      >
        {tema === "claro" ? <Moon size={20} /> : <Sun size={20} />}
      </button>
    </header>
  );
}

export default Header;
