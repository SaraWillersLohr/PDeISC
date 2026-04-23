/**
 * Módulo para registrar eventos en la interfaz de usuario de forma segura.
 */
export const uiLogger = {
    log(message, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Limpiar el mensaje inicial si existe
        if (container.querySelector('p') && container.children.length === 1) {
            container.innerHTML = '';
        }

        const logItem = document.createElement('div');
        logItem.className = 'event-item';
        
        // Uso seguro de textContent para evitar vulnerabilidades XSS
        logItem.textContent = `Evento: ${message} - ${new Date().toLocaleTimeString()}`;
        
        container.prepend(logItem);
    }
};
