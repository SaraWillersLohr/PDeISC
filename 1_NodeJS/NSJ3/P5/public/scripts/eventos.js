// Comentarios claros: este archivo explica la lógica paso a paso.

import { agregarLog } from "./consola.js";

const BLOQUES = {
  card: `<div class="inner-block card shadow-sm"><div class="card-body"><h5 class="card-title">Card</h5><p class="card-text fs-7 mb-0">Insertada con innerHTML.</p></div></div>`,
  alert: `<div class="inner-block alert alert-info border-0 mb-0">Alerta Bootstrap por innerHTML</div>`,
  table: `<div class="inner-block"><table class="table table-sm table-bordered mb-0"><thead><tr><th>Col</th><th>Valor</th></tr></thead><tbody><tr><td>A</td><td>1</td></tr><tr><td>B</td><td>2</td></tr></tbody></table></div>`,
  list: `<div class="inner-block"><ul class="list-group list-group-flush"><li class="list-group-item">Uno</li><li class="list-group-item">Dos</li><li class="list-group-item">Tres</li></ul></div>`,
  badge: `<div class="inner-block d-flex gap-2 flex-wrap"><span class="badge bg-primary">HTML</span><span class="badge bg-success">CSS</span><span class="badge bg-warning text-dark">JS</span></div>`
};

export function bindEventos() {
  document.querySelectorAll("[data-inner]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tipo = btn.dataset.inner;
      const zona = document.getElementById("inner-zone");
      // Si if (!zona || !BLOQUES[tipo]), entonces se ejecuta este bloque.
      if (!zona || !BLOQUES[tipo]) return;
      zona.insertAdjacentHTML("beforeend", BLOQUES[tipo]);
      agregarLog("innerHTML", `Agregado: ${tipo}`);
    });
  });

  document.getElementById("btn-clear-inner")?.addEventListener("click", () => {
    const zona = document.getElementById("inner-zone");
    // Si if (zona), entonces se ejecuta este bloque.
    if (zona) zona.innerHTML = "";
    agregarLog("innerHTML", "Zona limpiada");
  });
}
