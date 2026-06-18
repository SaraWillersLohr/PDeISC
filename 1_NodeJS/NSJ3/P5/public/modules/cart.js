// Comentarios claros: este archivo explica la lógica paso a paso.

/**
 * Gestor del Carrito de Compras
 * Mantiene la lista de productos seleccionados, permite agregar/quitar 
 * y calcula el total de la compra.
 */
export const cartManager = {
    items: [],
    
    addItem(product) {
        const existing = this.items.find(item => item.id === product.id);
        // Si if (existing), entonces se ejecuta este bloque.
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
