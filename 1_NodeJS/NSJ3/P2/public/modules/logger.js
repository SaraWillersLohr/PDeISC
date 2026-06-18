// Comentarios claros: este archivo explica la lógica paso a paso.

/**
 * Módulo de Logger para la interfaz
 * Muestra mensajes de eventos en un contenedor de la página para que el usuario vea qué sucede.
 */
export const uiLogger = {
    log(message, containerId) {
        const container = document.getElementById(containerId);
        // Si if (!container), entonces se ejecuta este bloque.
        if (!container) return;

        // Limpiar el mensaje inicial si existe
        const initialMsg = container.querySelector('p');
        // Si if (initialMsg && initialMsg.textContent.includes('Esperando')), entonces se ejecuta este bloque.
        if (initialMsg && initialMsg.textContent.includes('Esperando')) {
            container.innerHTML = '';
        }

        const logItem = document.createElement('div');
        logItem.className = 'event-item';
        logItem.textContent = `[${new Date().toLocaleTimeString()}] Evento: ${message}`;
        
        container.prepend(logItem);
    }
};
