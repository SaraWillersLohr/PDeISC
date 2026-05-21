
//Módulo para el ticker de noticias rotativas


const noticiasTicker = [
    "Tensión energética: Irán pone en la mira refinerías clave.",
    "EE.UU. niega envío de tropas en medio de la crisis.",
    "Avanza el 'London Eye' porteño en Puerto Madero.",
    "Mercados expectantes: Sube el dólar blue en la apertura.",
    "Nueva cumbre climática: Líderes mundiales se reúnen en París."
];

let noticiaActual = 0;

export function iniciarTicker(elementId) {
    const tickerText = document.getElementById(elementId);
    if (!tickerText) return;

    tickerText.textContent = noticiasTicker[0];

    setInterval(() => {
        // Efecto desvanecimiento
        tickerText.classList.remove('fade-in');
        tickerText.classList.add('fade-out');

        setTimeout(() => {
            noticiaActual = (noticiaActual + 1) % noticiasTicker.length;
            tickerText.textContent = noticiasTicker[noticiaActual];
            
            tickerText.classList.remove('fade-out');
            tickerText.classList.add('fade-in');
        }, 500);
    }, 5000);
}
