export const renderer = {
  renderCatalog(products, containerId, onAdd) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    products.forEach((product) => {
      const card = document.createElement("div");
      card.className = "product-card";

      const title = document.createElement("h3");
      title.textContent = product.name;

      const category = document.createElement("p");
      category.textContent = product.category;
      category.className = "category-tag";

      const price = document.createElement("p");
      price.className = "product-price";
      price.textContent = `$${product.price}`;

      const addBtn = document.createElement("button");
      addBtn.textContent = "Añadir al Carrito";
      addBtn.className = "btn-add";
      addBtn.onclick = () => onAdd(product);

      card.appendChild(category);
      card.appendChild(title);
      card.appendChild(price);
      card.appendChild(addBtn);
      container.appendChild(card);
    });
  },

  renderCart(items, containerId, totalId, onRemove) {
    const container = document.getElementById(containerId);
    const totalContainer = document.getElementById(totalId);
    container.innerHTML = "";

    if (items.length === 0) {
      container.innerHTML = '<p class="empty-msg">Tu carrito está vacío.</p>';
      totalContainer.textContent = "$0";
      return;
    }

    let total = 0;
    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "cart-item";

      const info = document.createElement("span");
      info.textContent = `${item.name} (x${item.quantity})`;

      const price = document.createElement("span");
      price.textContent = `$${item.price * item.quantity}`;
      price.className = "item-price";

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "×";
      removeBtn.className = "btn-remove";
      removeBtn.onclick = () => onRemove(item.id);

      row.appendChild(info);
      row.appendChild(price);
      row.appendChild(removeBtn);
      container.appendChild(row);

      total += item.price * item.quantity;
    });

    totalContainer.textContent = `$${total}`;
  },
};
