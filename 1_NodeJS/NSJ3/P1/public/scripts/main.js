import { uiLogger } from '../modules/logger.js';

document.addEventListener('DOMContentLoaded', () => {
    const btnClick = document.getElementById('btn-click');
    const btnHover = document.getElementById('btn-hover');
    const inputText = document.getElementById('input-text');
    const logId = 'log-container';

    // Evento Click
    btnClick.addEventListener('click', () => {
        uiLogger.log('Botón clickeado', logId);
    });

    // Evento Mouseover
    btnHover.addEventListener('mouseover', () => {
        uiLogger.log('Mouse sobre botón', logId);
    });

    // Evento Input
    inputText.addEventListener('input', (e) => {
        uiLogger.log(`Escribiendo: ${e.target.value}`, logId);
    });

    // Evento Focus
    inputText.addEventListener('focus', () => {
        uiLogger.log('Input enfocado', logId);
    });

    // Evento Blur
    inputText.addEventListener('blur', () => {
        uiLogger.log('Input perdió el foco', logId);
    });
});
