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
