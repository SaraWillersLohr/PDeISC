import { useState } from "react";
import { ProveedorTema, usarTema } from "./context/ThemeContext";
import Header from "./components/Header";
import UserForm from "./components/UserForm";
import WelcomeCard from "./components/WelcomeCard";
import Footer from "./components/Footer";

import "./styles/light.css";
import "./styles/dark.css";
import "./styles/app.css";

// componente interno que usa el contexto del tema
function Contenido() {
  const { tema } = usarTema();

  const [usuario, setUsuario] = useState("");
  const [mostrarBienvenida, setMostrarBienvenida] = useState(false);

  // guarda el nombre y muestra la tarjeta de bienvenida
  function guardarUsuario(nombre: string) {
    setUsuario(nombre);
    setMostrarBienvenida(true);
  }

  // vuelve al formulario para cambiar el nombre
  function volverAlFormulario() {
    setMostrarBienvenida(false);
    setUsuario("");
  }

  return (
    <div className={`app tema-${tema}`}>
      <Header />

      <main className="contenido-principal">
        {mostrarBienvenida ? (
          <WelcomeCard nombre={usuario} onCambiarNombre={volverAlFormulario} />
        ) : (
          <UserForm onEnviar={guardarUsuario} />
        )}
      </main>

      <Footer />
    </div>
  );
}

// componente raíz que envuelve todo con el proveedor de tema
function App() {
  return (
    <ProveedorTema>
      <Contenido />
    </ProveedorTema>
  );
}

export default App;
