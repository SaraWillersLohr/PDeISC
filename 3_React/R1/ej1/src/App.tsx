import { useEffect, useState } from "react";
import HolaMundo from "./components/HolaMundo";
import CambioTema from "./components/CambioTema";

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
