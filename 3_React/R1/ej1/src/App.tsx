import { useEffect, useState } from "react";
import HolaMundo from "./components/HolaMundo";
import CambioTema from "./components/CambioTema";
//useEffect es un hook que permite ejecutar una función cuando el componente se monta o se actualiza.
// useState es un hook que permite crear un estado local en el componente.
//un hook es una función que permite usar el estado y otras características de React en componentes funcionales.
function App() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    document.body.classList.toggle("light", !darkMode);
  }, [darkMode]);

  return (
    <div className="app-shell">
      {/* encabezado con el nombre del ejercicio y el botón de tema */}
      <header className="header">
        <div>
          <h1>Hola Mundo</h1>
          <p>Ejercicio 1 — React + TypeScript</p>
        </div>
        <CambioTema darkMode={darkMode} setDarkMode={setDarkMode} />
      </header>

      <main className="main-content">
        <HolaMundo />
      </main>
    </div>
  );
}

export default App;
