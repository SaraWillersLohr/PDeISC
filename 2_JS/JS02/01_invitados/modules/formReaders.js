// acá centralizo las 3 formas de leer el formulario (consigna 1)
export const leerConGetElementById = (formulario) => {
  const nombre = document.getElementById("nombre")?.value.trim() || "";
  return { campo: "nombre", metodo: "getElementById", valor: nombre };
};

export const leerConQuerySelector = (formulario) => {
  const apellido = formulario.querySelector('[name="apellido"]')?.value.trim() || "";
  return { campo: "apellido", metodo: "querySelector", valor: apellido };
};

export const leerConFormData = (formulario) => {
  const datos = new FormData(formulario);
  return {
    metodo: "FormData",
    valores: {
      edad: datos.get("edad"),
      tipoEntrada: datos.get("tipoEntrada"),
      acompanantes: datos.get("acompanantes"),
      email: datos.get("email"),
    },
  };
};

export const renderizarLecturaMetodos = (contenedor, lecturas) => {
  if (!contenedor) return;
  contenedor.innerHTML = "";

  lecturas.forEach((item) => {
    const bloque = document.createElement("article");
    bloque.className = "method-card glass-panel";
    bloque.innerHTML = `
      <header class="method-card__head">
        <span class="method-badge">${item.metodo}</span>
        <strong>${item.campo || "varios campos"}</strong>
      </header>
      <p class="method-card__value">${item.valor ?? JSON.stringify(item.valores, null, 2)}</p>
    `;
    contenedor.appendChild(bloque);
  });
};
