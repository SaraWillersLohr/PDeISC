// Yo centralizo las 3 formas de leer el formulario que pide la consigna 1
// Esto me permite demostrar diferentes métodos de acceso al DOM
export const leerConGetElementById = (formulario) => {
  // Yo uso getElementById para obtener el valor del campo nombre directamente del documento
  const nombre = document.getElementById("nombre")?.value.trim() || "";
  return { campo: "nombre", metodo: "getElementById", valor: nombre };
};

export const leerConQuerySelector = (formulario) => {
  // Yo uso querySelector sobre el formulario para buscar por atributo name
  const apellido =
    formulario.querySelector('[name="apellido"]')?.value.trim() || "";
  return { campo: "apellido", metodo: "querySelector", valor: apellido };
};

export const leerConFormData = (formulario) => {
  // Yo uso FormData para leer todos los campos del formulario de una sola vez
  // Es muy útil cuando hay muchos campos o cuando necesito enviar datos a un servidor
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

// Yo renderizo visualmente los resultados de los diferentes métodos de lectura
// Esto ayuda a entender cómo cada método obtiene los datos
export const renderizarLecturaMetodos = (contenedor, lecturas) => {
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
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