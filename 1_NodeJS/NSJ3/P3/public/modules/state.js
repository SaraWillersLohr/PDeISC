// Comentarios claros: este archivo explica la lógica paso a paso.

/**
 * Gestor de Estado (State Manager)
 * Centraliza los datos de la aplicación (como el nombre del usuario o el tema) 
 * para que sea fácil consultarlos y actualizarlos desde cualquier parte.
 */
export const stateManager = {
    state: {
        name: '',
        theme: 'light',
        currentStep: 1
    },
    update(key, value) {
        this.state[key] = value;
    },
    get() {
        return { ...this.state };
    },
    reset() {
        this.state = { name: '', theme: 'light', currentStep: 1 };
    }
};
