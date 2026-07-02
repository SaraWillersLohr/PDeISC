// Yo defino distintas formas de guardar datos en el array que se ven en pantalla
// Esto me permite demostrar diferentes métodos de manipulación de arrays
export const METODOS_ARRAY = {
  push: {
    etiqueta: "push()",
    descripcion: "Agrega al final del array",
    aplicar: (lista, dato) => {
      // Yo creo una copia del array y uso push para agregar al final
      const copia = [...lista];
      copia.push(dato);
      return { lista: copia, detalle: "push(dato) → nuevo elemento al final" };
    },
  },
  unshift: {
    etiqueta: "unshift()",
    descripcion: "Agrega al inicio del array",
    aplicar: (lista, dato) => {
      // Yo creo una copia y uso unshift para agregar al inicio
      const copia = [...lista];
      copia.unshift(dato);
      return {
        lista: copia,
        detalle: "unshift(dato) → nuevo elemento al inicio",
      };
    },
  },
  spread: {
    etiqueta: "spread [...arr, dato]",
    descripcion: "Crea un array nuevo con spread",
    aplicar: (lista, dato) => {
      // Yo uso el operador spread para crear una copia inmutable
      const copia = [...lista, dato];
      return {
        lista: copia,
        detalle: "[...lista, dato] → copia inmutable al final",
      };
    },
  },
  concat: {
    etiqueta: "concat()",
    descripcion: "Concatena sin mutar el original",
    aplicar: (lista, dato) => {
      // Yo uso concat para unir arrays sin mutar el original
      const copia = lista.concat(dato);
      return { lista: copia, detalle: "lista.concat(dato) → unión al final" };
    },
  },
};

// Yo renderizo el estado actual del array en pantalla para que se vea visualmente
export const renderizarEstadoArray = (contenedor, lista, info) => {
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!contenedor) return;

  const contadorArray = document.getElementById("arrayCount");
  if (contadorArray) contadorArray.textContent = String(lista.length);

  const nombresHtml = lista.length
    ? lista
        .map(
          (item, indice) =>
            `<li><span class="sidebar-name-index">${indice + 1}</span><span class="sidebar-name-text">${item.nombre} ${item.apellido}</span></li>`,
        )
        .join("")
    : '<li class="sidebar-names-empty">Sin nombres cargados todavía</li>';

  contenedor.innerHTML = `
    <div class="array-stats">
      <div class="array-stat">
        <span class="array-stat__label">Método usado</span>
        <span class="array-method-badge">${info.metodo}</span>
        <p class="array-stat__detail">${info.detalle}</p>
      </div>
      <div class="array-stat array-stat--count">
        <span class="array-stat__label">Total</span>
        <span class="array-stat__value">${lista.length}</span>
      </div>
    </div>

    <div class="array-names-zone">
      <p class="array-zone-title">Nombres en el array</p>
      <ul class="sidebar-names-list" aria-live="polite">${nombresHtml}</ul>
    </div>

    <details class="array-json-details">
      <summary class="array-json-summary">Ver JSON del array</summary>
      <pre class="array-pre" aria-label="Estado del array">${JSON.stringify(lista, null, 2)}</pre>
    </details>
  `;

  const listaNombres = contenedor.querySelector(".sidebar-names-list");
  if (listaNombres && lista.length) {
    listaNombres.scrollTop = listaNombres.scrollHeight;
  }
};