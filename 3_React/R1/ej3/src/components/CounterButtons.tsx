import {
    Minus,
    Plus,
    RotateCcw
} from "lucide-react";

interface CounterButtonsProps {

    contador: number;

    incrementar: () => void;

    disminuir: () => void;

    reiniciar: () => void;

}

function CounterButtons({

    contador,

    incrementar,

    disminuir,

    reiniciar,

}: CounterButtonsProps) {

    return (

        <div className="botones">

            {/* botón restar - circular */}

            <div className="boton-grupo">

                <button
                    className="btn-circular btn-restar"
                    onClick={disminuir}
                    disabled={contador === 0}
                    title="Restar"
                >
                    <Minus size={22} />
                </button>

                <span className="boton-label">Restar</span>

            </div>

            {/* botón reiniciar - destacado */}

            <div className="boton-grupo">

                <button
                    className="btn-reiniciar"
                    onClick={reiniciar}
                    title="Reiniciar"
                >
                    <RotateCcw size={18} />
                    Reiniciar
                </button>

                <span className="boton-label">Reiniciar</span>

            </div>

            {/* botón sumar - circular */}

            <div className="boton-grupo">

                <button
                    className="btn-circular btn-sumar"
                    onClick={incrementar}
                    title="Sumar"
                >
                    <Plus size={22} />
                </button>

                <span className="boton-label">Sumar</span>

            </div>

        </div>

    );

}

export default CounterButtons;
