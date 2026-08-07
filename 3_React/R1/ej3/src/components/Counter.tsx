import { useState } from "react";
import { TriangleAlert } from "lucide-react";

import CounterDisplay from "./CounterDisplay";
import CounterButtons from "./CounterButtons";

function Counter() {

    // guarda el valor actual del contador
    const [contador, setContador] = useState(0);

    // aumenta el contador
    function incrementar() {

        setContador(contador + 1);

    }

    // disminuye el contador
    function disminuir() {

        if (contador > 0) {

            setContador(contador - 1);

        }

    }

    // vuelve el contador a cero
    function reiniciar() {

        setContador(0);

    }

    return (

        <section className="counter-card">

            {/* título */}

            <h2>Mi contador</h2>

            <p>
                Utilizando <strong>useState</strong> para administrar el estado.
            </p>

            {/* muestra el valor */}

            <CounterDisplay
                contador={contador}
            />

            {/* botones */}

            <CounterButtons
                contador={contador}
                incrementar={incrementar}
                disminuir={disminuir}
                reiniciar={reiniciar}
            />

            {/* mensaje cuando llega al mínimo */}

            {

                contador === 0 && (

                    <div className="mensaje-card">

                        <TriangleAlert size={18} />

                        <span>El contador ya se encuentra en el valor mínimo.</span>

                    </div>

                )

            }

        </section>

    );

}

export default Counter;
