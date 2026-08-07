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
    <main className="app-shell">
      <CambioTema darkMode={darkMode} setDarkMode={setDarkMode} />
      <HolaMundo />
    </main>
  );
}

export default App;
