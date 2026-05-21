// TP 11 — filter(): me quedo solo con los que cumplen la condición

import { boot } from "/_shared/js/boot.js";
import { paintFlow } from "/_shared/js/arrayDisplay.js";

const log = boot("filter");

const INICIAL_NUMEROS = [2, 15, 8, 20, 5, 12, 30];
const INICIAL_PALABRAS = ["sol", "planeta", "luz", "estrellas", "galaxia", "mar"];
const INICIAL_USUARIOS = [
  { nombre: "Ana", activo: true },
  { nombre: "Beto", activo: false },
  { nombre: "Carla", activo: true },
  { nombre: "Daniel", activo: false },
];

const numeros = [...INICIAL_NUMEROS];
const palabras = [...INICIAL_PALABRAS];
const usuarios = [...INICIAL_USUARIOS];

const dom = {
  displayOriginal1: document.getElementById("displayOriginal1"),
  displayResult1: document.getElementById("displayResult1"),
  btnFilterNums: document.getElementById("btnFilterNums"),
  displayOriginal2: document.getElementById("displayOriginal2"),
  displayResult2: document.getElementById("displayResult2"),
  btnFilterWords: document.getElementById("btnFilterWords"),
  displayOriginal3: document.getElementById("displayOriginal3"),
  displayResult3: document.getElementById("displayResult3"),
  btnFilterActive: document.getElementById("btnFilterActive"),
  btnReset: document.getElementById("btnReset"),
};

const flowFilter = (origEl, resEl, original, filtrados, operacion) => {
  paintFlow(origEl, {
    before: original,
    operation: operacion,
    after: original,
    note: "filter no toca el array original.",
  });
  paintFlow(resEl, {
    before: [],
    operation: "nuevo array filtrado",
    after: filtrados,
    note: `${filtrados.length} elemento(s) pasaron el filtro.`,
  });
};

const updateUI = () => {
  flowFilter(dom.displayOriginal1, dom.displayResult1, numeros, [], "numeros.filter(n => n > 10)");
  flowFilter(dom.displayOriginal2, dom.displayResult2, palabras, [], "palabras.filter(p => p.length > 5)");
  flowFilter(dom.displayOriginal3, dom.displayResult3, usuarios, [], "usuarios.filter(u => u.activo)");
};

dom.btnFilterNums.onclick = () => {
  const mayores = numeros.filter((n) => n > 10);
  log(`filter() dejó ${mayores.length} números (> 10)`, "success");
  flowFilter(dom.displayOriginal1, dom.displayResult1, numeros, mayores, "numeros.filter(n => n > 10)");
  dom.btnFilterNums.disabled = true;
};

dom.btnFilterWords.onclick = () => {
  const largas = palabras.filter((p) => p.length > 5);
  log(`filter() dejó ${largas.length} palabras largas`, "success");
  flowFilter(dom.displayOriginal2, dom.displayResult2, palabras, largas, "palabras.filter(p => p.length > 5)");
  dom.btnFilterWords.disabled = true;
};

dom.btnFilterActive.onclick = () => {
  const activos = usuarios.filter((u) => u.activo);
  log(`filter() dejó ${activos.length} usuarios activos`, "success");
  flowFilter(
    dom.displayOriginal3,
    dom.displayResult3,
    usuarios,
    activos,
    "usuarios.filter(u => u.activo)",
  );
  dom.btnFilterActive.disabled = true;
};

dom.btnReset.onclick = () => {
  dom.btnFilterNums.disabled = false;
  dom.btnFilterWords.disabled = false;
  dom.btnFilterActive.disabled = false;
  log("Reinicié filter()", "system");
  updateUI();
};

window.addEventListener("DOMContentLoaded", updateUI);
