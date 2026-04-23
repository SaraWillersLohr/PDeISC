import { renderer } from "../modules/renderer.js";
import { cartManager } from "../modules/cart.js";

document.addEventListener("DOMContentLoaded", async () => {
  const listId = "product-list";
  const cartId = "cart-items";
  const totalId = "cart-total";

  const onAddProduct = (product) => {
    const updatedItems = cartManager.addItem(product);
    renderer.renderCart(updatedItems, cartId, totalId, onRemoveProduct);
  };

  const onRemoveProduct = (productId) => {
    const updatedItems = cartManager.removeItem(productId);
    renderer.renderCart(updatedItems, cartId, totalId, onRemoveProduct);
  };

  // Cargar catálogo desde la API
  try {
    const response = await fetch("/api/products");
    if (!response.ok) throw new Error("Error al cargar productos");
    const products = await response.json();

    renderer.renderCatalog(products, listId, onAddProduct);
  } catch (error) {
    console.error(error);
    document.getElementById(listId).innerHTML =
      '<p class="error-text">No se pudo conectar con la tienda.</p>';
  }

  document.getElementById("btn-checkout").onclick = () => {
    if (cartManager.items.length > 0) {
      alert("¡Gracias por su compra! Total: $" + cartManager.getTotal());
      location.reload();
    } else {
      alert("El carrito está vacío.");
    }
  };
});
