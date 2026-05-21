// TP 07 — indexOf(): busco la posición (o -1)

import { boot } from "/_shared/js/boot.js";
import { paintFlow, renderBadges } from "/_shared/js/arrayDisplay.js";

const log = boot("indexOf");

const INICIAL_ANIMALES = ["gato", "perro", "pájaro", "conejo"];
const INICIAL_NUMEROS = [10, 25, 50, 75, 100];
const INICIAL_CIUDADES = ["Londres", "París", "Roma", "Madrid", "Berlín"];

let animales = [...INICIAL_ANIMALES];
let numeros = [...INICIAL_NUMEROS];
let ciudades = [...INICIAL_CIUDADES];

const dom = {
  displayOriginal1: document.getElementById("displayOriginal1"),
  btnSearchPerro: document.getElementById("btnSearchPerro"),
  resPerro: document.getElementById("resPerro"),
  displayOriginal2: document.getElementById("displayOriginal2"),
  btnSearch50: document.getElementById("btnSearch50"),
  res50: document.getElementById("res50"),
  displayOriginal3: document.getElementById("displayOriginal3"),
  btnSearchMadrid: document.getElementById("btnSearchMadrid"),
  resMadrid: document.getElementById("resMadrid"),
  btnReset: document.getElementById("btnReset"),
};

const pintarBusqueda = (container, arr, busqueda, indice, resEl) => {
  paintFlow(container, {
    before: arr,
    operation: `indexOf("${busqueda}") → ${indice}`,
    after: arr,
    note: indice === -1 ? "No está en el array." : `Encontrado en índice ${indice}. El array NO cambia.`,
  });

  const badges = container.querySelector('[data-role="after-badges"]');
  if (badges && indice >= 0) {
    renderBadges(badges, arr, { highlightLast: false });
    const badge = badges.querySelector(`[data-idx="${indice}"]`);
    if (badge) badge.classList.add("array-badge--highlight");
  }

  if (resEl) {
    resEl.className = `feedback-box ${indice >= 0 ? "feedback-success" : "feedback-danger"}`;
    resEl.innerHTML =
      indice >= 0
        ? `<i class="fas fa-search me-2"></i>Índice: <strong>${indice}</strong>`
        : `<i class="fas fa-times me-2"></i>No encontrado (devuelve -1)`;
  }
};

const updateUI = () => {
  paintFlow(dom.displayOriginal1, {
    before: animales,
    operation: 'animales.indexOf("perro")',
    after: animales,
    note: "Array sin modificar.",
  });
  paintFlow(dom.displayOriginal2, {
    before: numeros,
    operation: "numeros.indexOf(50)",
    after: numeros,
  });
  paintFlow(dom.displayOriginal3, {
    before: ciudades,
    operation: 'ciudades.indexOf("Madrid")',
    after: ciudades,
  });
};

dom.btnSearchPerro.onclick = () => {
  const idx = animales.indexOf("perro");
  log(`indexOf("perro") → ${idx}`, idx >= 0 ? "success" : "warn");
  pintarBusqueda(dom.displayOriginal1, animales, "perro", idx, dom.resPerro);
  dom.btnSearchPerro.disabled = true;
};

dom.btnSearch50.onclick = () => {
  const idx = numeros.indexOf(50);
  log(`indexOf(50) → ${idx}`, idx >= 0 ? "success" : "warn");
  pintarBusqueda(dom.displayOriginal2, numeros, "50", idx, dom.res50);
  dom.btnSearch50.disabled = true;
};

dom.btnSearchMadrid.onclick = () => {
  const idx = ciudades.indexOf("Madrid");
  log(`indexOf("Madrid") → ${idx}`, idx >= 0 ? "success" : "warn");
  pintarBusqueda(dom.displayOriginal3, ciudades, "Madrid", idx, dom.resMadrid);
  dom.btnSearchMadrid.disabled = true;
};

dom.btnReset.onclick = () => {
  animales = [...INICIAL_ANIMALES];
  numeros = [...INICIAL_NUMEROS];
  ciudades = [...INICIAL_CIUDADES];
  [dom.resPerro, dom.res50, dom.resMadrid].forEach((el) => {
    el.className = "feedback-box feedback-waiting";
    el.textContent = "Esperando…";
  });
  [dom.btnSearchPerro, dom.btnSearch50, dom.btnSearchMadrid].forEach((b) => (b.disabled = false));
  log("Reinicié indexOf()", "system");
  updateUI();
};

window.addEventListener("DOMContentLoaded", updateUI);
