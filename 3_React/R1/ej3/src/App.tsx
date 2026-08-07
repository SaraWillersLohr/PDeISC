import { useState, useEffect } from "react";

import Counter from "./components/Counter.tsx";

import { Moon, Sun } from "lucide-react";

function App() {

    // guarda si el modo oscuro está activo
    const [modoOscuro, setModoOscuro] = useState(false);

    // carga el tema guardado cuando inicia la aplicación
    useEffect(() => {

        const temaGuardado = localStorage.getItem("tema");

        if (temaGuardado === "oscuro") {

            setModoOscuro(true);

        }

    }, []);

    // guarda el tema cada vez que cambia
    useEffect(() => {

        localStorage.setItem("tema", modoOscuro ? "oscuro" : "claro");

    }, [modoOscuro]);

    // cambia entre modo claro y oscuro
    function cambiarTema() {

        setModoOscuro(!modoOscuro);

    }

    return (

        <div className={modoOscuro ? "app dark" : "app light"}>

            {/* encabezado */}

            <header className="header">

                <div>

                    <h1>Contador React</h1>

                    <p>
                        Ejercicio 3 - React + TypeScript
                    </p>

                </div>

                {/* botón para cambiar el tema */}

                <button
                    className="theme-button"
                    onClick={cambiarTema}
                    title="Cambiar tema"
                >

                    {
                        modoOscuro
                            ? <Sun size={22} />
                            : <Moon size={22} />
                    }

                </button>

            </header>

            {/* contenido principal */}

            <main className="main-content">

                <Counter />

            </main>

        </div>

    );

}

export default App;
