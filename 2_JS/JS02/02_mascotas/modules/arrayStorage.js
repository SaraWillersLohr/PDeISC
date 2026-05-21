// distintas formas de guardar en el array (se ve en pantalla)
export const METODOS_ARRAY = {
  push: {
    etiqueta: "push()",
    descripcion: "Agrega al final del array",
    aplicar: (lista, dato) => {
      const copia = [...lista];
      copia.push(dato);
      return { lista: copia, detalle: "push(dato) → nuevo elemento al final" };
    },
  },
  unshift: {
    etiqueta: "unshift()",
    descripcion: "Agrega al inicio del array",
    aplicar: (lista, dato) => {
      const copia = [...lista];
      copia.unshift(dato);
      return { lista: copia, detalle: "unshift(dato) → nuevo elemento al inicio" };
    },
  },
  spread: {
    etiqueta: "spread [...arr, dato]",
    descripcion: "Crea un array nuevo con spread",
    aplicar: (lista, dato) => {
      const copia = [...lista, dato];
      return { lista: copia, detalle: "[...lista, dato] → copia inmutable al final" };
    },
  },
  concat: {
    etiqueta: "concat()",
    descripcion: "Concatena sin mutar el original",
    aplicar: (lista, dato) => {
      const copia = lista.concat(dato);
      return { lista: copia, detalle: "lista.concat(dato) → unión al final" };
    },
  },
};

export const renderizarEstadoArray = (contenedor, lista, info) => {
  if (!contenedor) return;
  contenedor.innerHTML = `
    <div class="array-block">
      <p class="array-label">Método usado</p>
      <p class="array-method">${info.metodo} — ${info.detalle}</p>
    </div>
    <div class="array-block">
      <p class="array-label">Cantidad de registros</p>
      <p class="array-count">${lista.length}</p>
    </div>
    <pre class="array-pre" aria-label="Estado del array">${JSON.stringify(lista, null, 2)}</pre>
  `;
};
