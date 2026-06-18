// ¡Hola! Hoy vamos a ordenar cosas con sort().
// Ojo con este método, porque por defecto ordena como texto. Si queremos ordenar números, ¡tenemos que pasarle una función de comparación!

import { boot } from "../../_shared/js/boot.js";
import { paintFlow } from "../../_shared/js/arrayDisplay.js";

// Arranco mi consola para ver cómo se mueven los elementos.
const log = boot("sort");

// Listas para ordenar.
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

// Referencias a los elementos del DOM.
const dom = {
  displayOriginal1: document.getElementById("displayOriginal1"),
  btnSortNums: document.getElementById("btnSortNums"),
  displayOriginal2: document.getElementById("displayOriginal2"),
  btnSortWords: document.getElementById("btnSortWords"),
  displayOriginal3: document.getElementById("displayOriginal3"),
  btnSortObj: document.getElementById("btnSortObj"),
  btnReset: document.getElementById("btnReset"),
};

// Función para mostrar el flujo del ordenamiento.
const flowSort = (el, antes, despues, op) => {
  paintFlow(el, {
    before: antes,
    operation: op,
    after: despues,
    note: "sort() modifica el mismo array (mutación).",
  });
};

// Actualizo la UI con el estado inicial.
const updateUI = () => {
  flowSort(dom.displayOriginal1, [...INICIAL_NUMEROS], numeros, "numeros.sort((a,b)=>a-b)");
  flowSort(dom.displayOriginal2, [...INICIAL_PALABRAS], palabras, "palabras.sort()");
  flowSort(dom.displayOriginal3, [...INICIAL_OBJETOS], objetos, "objetos.sort((a,b)=>a.edad-b.edad)");
};

// Caso 1: Ordeno números de menor a mayor. Uso (a, b) => a - b para que no falle.
dom.btnSortNums.onclick = () => {
  const antes = [...numeros];
  numeros.sort((a, b) => a - b);
  log(`sort() ordenó números: [${numeros.join(", ")}]`, "success");
  flowSort(dom.displayOriginal1, antes, numeros, "numeros.sort((a, b) => a - b)");
};

// Caso 2: Ordeno palabras alfabéticamente. Aquí el default funciona bien.
dom.btnSortWords.onclick = () => {
  const antes = [...palabras];
  palabras.sort();
  log(`sort() ordenó palabras alfabéticamente`, "success");
  flowSort(dom.displayOriginal2, antes, palabras, "palabras.sort()");
};

// Caso 3: Ordeno objetos (personas) por su edad.
dom.btnSortObj.onclick = () => {
  // Función antes que organiza esta parte del código.
  const antes = objetos.map((o) => ({ ...o }));
  objetos.sort((a, b) => a.edad - b.edad);
  log(`sort() ordenó objetos por edad`, "success");
  flowSort(dom.displayOriginal3, antes, objetos, "objetos.sort((a, b) => a.edad - b.edad)");
};

// Reseteo todo a los valores originales.
dom.btnReset.onclick = () => {
  numeros = [...INICIAL_NUMEROS];
  palabras = [...INICIAL_PALABRAS];
  objetos = [...INICIAL_OBJETOS];
  log("Reinicié sort()", "system");
  updateUI();
};

// Inicio la interfaz.
window.addEventListener("DOMContentLoaded", updateUI);