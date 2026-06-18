// Comentarios claros: este archivo explica la lógica paso a paso.

import { agregarLog } from "./consola.js";

export function bindEventos() {
  document.getElementById("btn-count-children")?.addEventListener("click", () => {
    const padre = document.getElementById("children-demo");
    const resultado = document.getElementById("children-result");
    // Si if (!padre || !resultado), entonces se ejecuta este bloque.
    if (!padre || !resultado) return;

    const cantidad = padre.children.length;
    resultado.innerHTML = `
      <p class="mb-1 fw-semibold text-main">Resultado</p>
      <p class="mb-0">El contenedor tiene <strong>${cantidad}</strong> hijos directos (<code>children.length</code>).</p>
    `;
    agregarLog("Hijos DOM", `Pulsado: el div tiene ${cantidad} hijos`);
  });
}
