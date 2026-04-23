import { renderer } from "../modules/renderer.js";
import { cartManager } from "../modules/cart.js";
import { Notificador } from "../modules/notifications.js";

// Esperamos a que la página cargue del todo
document.addEventListener("DOMContentLoaded", async () => {
  const listId = "product-list";
  const cartId = "cart-items";
  const totalId = "cart-total";

  // Función para cuando alguien hace clic en "Añadir"
  const onAddProduct = (product) => {
    const updatedItems = cartManager.addItem(product);
    renderer.renderCart(updatedItems, cartId, totalId, onRemoveProduct);
    Notificador.exito(`¡${product.name} al carrito!`);
  };

  // Función para sacar cosas del carrito
  const onRemoveProduct = (productId) => {
    const updatedItems = cartManager.removeItem(productId);
    renderer.renderCart(updatedItems, cartId, totalId, onRemoveProduct);
    Notificador.mostrar("Producto eliminado", "info");
  };

  // Traemos los productos desde nuestro servidor
  try {
    const response = await fetch("/api/products");
    if (!response.ok) throw new Error("No se pudo obtener la lista");
    const products = await response.json();
    
    // Los dibujamos en la pantalla
    renderer.renderCatalog(products, listId, onAddProduct);
  } catch (error) {
    console.error("Problema con la tienda:", error);
    document.getElementById(listId).innerHTML = '<p class="error-text">Ups, parece que la tienda está cerrada por ahora.</p>';
  }

  // Botón final de compra
  document.getElementById("btn-checkout").onclick = () => {
    if (cartManager.items.length > 0) {
      const total = cartManager.getTotal();
      Notificador.exito(`¡Compra lista! Pagaste $${total}. ¡Gracias!`);
      
      // Reiniciamos todo después de un ratito
      setTimeout(() => location.reload(), 3000);
    } else {
      Notificador.error("El carrito está vacío, ¡lleva algo!");
    }
  };
});
