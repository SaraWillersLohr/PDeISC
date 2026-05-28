/**
 * Módulo de Logger para la interfaz
 * Muestra mensajes de eventos en un contenedor de la página para que el usuario vea qué sucede.
 */
export const uiLogger = {
    log(message, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Limpiar el mensaje inicial si existe
        const initialMsg = container.querySelector('p');
        if (initialMsg && initialMsg.textContent.includes('Esperando')) {
            container.innerHTML = '';
        }

        const logItem = document.createElement('div');
        logItem.className = 'event-item';
        logItem.textContent = `[${new Date().toLocaleTimeString()}] Evento: ${message}`;
        
        container.prepend(logItem);
    }
};
