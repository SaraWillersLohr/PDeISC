// TP 13 — sort(): ordeno IN-PLACE (cuidado con números)

import { boot } from "../../_shared/js/boot.js";
import { paintFlow } from "../../_shared/js/arrayDisplay.js";

const log = boot("sort");

const INICIAL_NUMEROS = [40, 100, 1, 5, 25, 10];
const INICIAL_PALABRAS = ["Zapato", "Avión", "Mesa", "Lápiz", "Cuaderno"];
const INICIAL_OBJETOS = [
  { nombre: "Ana", edad: 25 },
  { nombre: "Leo", edad: 18 },
  { nombre: "Sonia", edad: 40 },
  { nombre: "Beto", edad: 32 },
];

let numeros = [...INICIAL_NUMEROS];
let palabras = [...INICIAL_PALABRAS];
let objetos = [...INICIAL_OBJETOS];

const dom = {
  displayOriginal1: document.getElementById("displayOriginal1"),
  btnSortNums: document.getElementById("btnSortNums"),
  displayOriginal2: document.getElementById("displayOriginal2"),
  btnSortWords: document.getElementById("btnSortWords"),
  displayOriginal3: document.getElementById("displayOriginal3"),
  btnSortObj: document.getElementById("btnSortObj"),
  btnReset: document.getElementById("btnReset"),
};

const flowSort = (el, antes, despues, op) => {
  paintFlow(el, {
    before: antes,
    operation: op,
    after: despues,
    note: "sort() modifica el mismo array (mutación).",
  });
};

const updateUI = () => {
  flowSort(dom.displayOriginal1, [...INICIAL_NUMEROS], numeros, "numeros.sort((a,b)=>a-b)");
  flowSort(dom.displayOriginal2, [...INICIAL_PALABRAS], palabras, "palabras.sort()");
  flowSort(dom.displayOriginal3, [...INICIAL_OBJETOS], objetos, "objetos.sort((a,b)=>a.edad-b.edad)");
};

dom.btnSortNums.onclick = () => {
  const antes = [...numeros];
  numeros.sort((a, b) => a - b);
  log(`sort() ordenó números: [${numeros.join(", ")}]`, "success");
  flowSort(dom.displayOriginal1, antes, numeros, "numeros.sort((a, b) => a - b)");
};

dom.btnSortWords.onclick = () => {
  const antes = [...palabras];
  palabras.sort();
  log(`sort() ordenó palabras alfabéticamente`, "success");
  flowSort(dom.displayOriginal2, antes, palabras, "palabras.sort()");
};

dom.btnSortObj.onclick = () => {
  const antes = objetos.map((o) => ({ ...o }));
  objetos.sort((a, b) => a.edad - b.edad);
  log(`sort() ordenó objetos por edad`, "success");
  flowSort(dom.displayOriginal3, antes, objetos, "objetos.sort((a, b) => a.edad - b.edad)");
};

dom.btnReset.onclick = () => {
  numeros = [...INICIAL_NUMEROS];
  palabras = [...INICIAL_PALABRAS];
  objetos = [...INICIAL_OBJETOS];
  log("Reinicié sort()", "system");
  updateUI();
};

window.addEventListener("DOMContentLoaded", updateUI);
