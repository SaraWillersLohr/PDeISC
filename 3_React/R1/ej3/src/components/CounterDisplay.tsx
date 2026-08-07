interface CounterDisplayProps {

    contador: number;

}

function CounterDisplay({

    contador,

}: CounterDisplayProps) {

    return (

        // círculo grande con el número
        <div className="contador">

            <span>{contador}</span>

        </div>

    );

}

export default CounterDisplay;
