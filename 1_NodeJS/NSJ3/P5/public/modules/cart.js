export const cartManager = {
    items: [],
    
    addItem(product) {
        const existing = this.items.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }
        return [...this.items];
    },
    
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        return [...this.items];
    },
    
    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
};
