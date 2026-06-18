// ¡Hola! Hoy vamos a jugar con slice().
// A diferencia de splice(), este método no toca el array original. Solo le saca una "foto" o copia a una parte.

import { boot } from "../../_shared/js/boot.js";
import { paintFlow, formatArrayLiteral } from "../../_shared/js/arrayDisplay.js";

// Arranco mi consola para ver qué pedazos de array vamos copiando.
const log = boot("slice");

// Datos originales que NO van a cambiar.
const NUMEROS_DATA = [10, 20, 30, 40, 50];
const PELICULAS_DATA = ["Matrix", "Avatar", "Inception", "Batman", "Joker", "Titanic"];
const LETRAS_DATA = ["A", "B", "C", "D", "E", "F"];

const numOriginal = [...NUMEROS_DATA];
const pelOriginal = [...PELICULAS_DATA];
const letOriginal = [...LETRAS_DATA];

// Aquí guardaremos las copias resultantes.
let numCopia = [];
let pelCopia = [];
let letCopia = [];

// Mis referencias al DOM.
const dom = {
  listaNum: document.getElementById("listaNum"),
  contNum: document.getElementById("contNum"),
  btnNum: document.getElementById("btnNum"),
  listaPel: document.getElementById("listaPel"),
  contPel: document.getElementById("contPel"),
  btnPel: document.getElementById("btnPel"),
  listaUlt: document.getElementById("listaUlt"),
  contUlt: document.getElementById("contUlt"),
  btnUlt: document.getElementById("btnUlt"),
  btnReset: document.getElementById("btnReset"),
};

// Función para mostrar el flujo de la copia sin alterar el original.
const flowCopia = (el, original, copia, operacion) => {
  paintFlow(el, {
    before: original,
    operation: operacion,
    after: copia,
    note: `Original intacto: ${formatArrayLiteral(original)}`,
  });
};

// Actualizo la interfaz con las copias actuales.
const updateUI = () => {
  flowCopia(dom.listaNum, numOriginal, numCopia, "numOriginal.slice(0, 3)");
  flowCopia(dom.listaPel, pelOriginal, pelCopia, "pelOriginal.slice(2, 5)");
  flowCopia(dom.listaUlt, letOriginal, letCopia, "letOriginal.slice(-3)");
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (dom.contNum) dom.contNum.textContent = `${numCopia.length} ITEMS`;
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (dom.contPel) dom.contPel.textContent = `${pelCopia.length} ITEMS`;
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (dom.contUlt) dom.contUlt.textContent = `${letCopia.length} ITEMS`;
};

// Caso 1: Copio los primeros 3 números.
dom.btnNum.onclick = () => {
  numCopia = numOriginal.slice(0, 3);
  log(`slice(0, 3) copió ${numCopia.length} números`, "success");
  dom.btnNum.disabled = true;
  updateUI();
};

// Caso 2: Copio un rango intermedio de películas (del índice 2 al 5, sin incluir el 5).
dom.btnPel.onclick = () => {
  pelCopia = pelOriginal.slice(2, 5);
  log(`slice(2, 5) copió ${pelCopia.length} películas`, "success");
  dom.btnPel.disabled = true;
  updateUI();
};

// Caso 3: Uso un índice negativo para copiar los últimos 3 elementos. ¡Súper útil!
dom.btnUlt.onclick = () => {
  letCopia = letOriginal.slice(-3);
  log(`slice(-3) copió los últimos ${letCopia.length} elementos`, "success");
  dom.btnUlt.disabled = true;
  updateUI();
};

// Limpio las copias para volver a empezar.
dom.btnReset.onclick = () => {
  numCopia = [];
  pelCopia = [];
  letCopia = [];
  dom.btnNum.disabled = false;
  dom.btnPel.disabled = false;
  dom.btnUlt.disabled = false;
  log("Reinicié slice()", "system");
  updateUI();
};

// Inicio la UI al cargar.
window.addEventListener("DOMContentLoaded", updateUI);