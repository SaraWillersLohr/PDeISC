// ¡Hola! Llegamos a splice(), el método "navaja suiza" de los arrays.
// Con splice podemos borrar, insertar o reemplazar elementos en cualquier posición.

import { boot } from "../../_shared/js/boot.js";
import { paintFlow } from "../../_shared/js/arrayDisplay.js";

// Arranco mi consola para ver las "cirugías" que le hacemos al array.
const log = boot("splice");

// Listas de ejemplo para experimentar.
const INICIAL_LETRAS = ["A", "B", "C", "D", "E", "F"];
const INICIAL_NOMBRES = ["Juan", "María", "Pedro"];
const INICIAL_REEMPLAZO = ["Item 1", "Item 2", "Item 3", "Item 4"];

let letras = [...INICIAL_LETRAS];
let nombres = [...INICIAL_NOMBRES];
let reemplazo = [...INICIAL_REEMPLAZO];

// Referencias a los elementos del DOM.
const dom = {
  listaLet: document.getElementById("listaLet"),
  btnLet: document.getElementById("btnLet"),
  listaNom: document.getElementById("listaNom"),
  inputNom: document.getElementById("inputNom"),
  btnNom: document.getElementById("btnNom"),
  listaRep: document.getElementById("listaRep"),
  btnRep: document.getElementById("btnRep"),
  btnReset: document.getElementById("btnReset"),
};

// Función para mostrar visualmente los cambios.
const flow = (el, antes, op, despues, nota) =>
  paintFlow(el, { before: antes, operation: op, after: despues, note: nota });

// Actualizo la interfaz con el estado actual.
const updateUI = () => {
  flow(dom.listaLet, [...letras], "splice(1, 2)", [...letras], "Borra 2 desde índice 1.");
  flow(dom.listaNom, [...nombres], 'splice(1, 0, "nuevo")', [...nombres]);
  flow(dom.listaRep, [...reemplazo], 'splice(1, 2, "🚀", "✨")', [...reemplazo]);
};

// Caso 1: Borro elementos. Desde la posición 1, quito 2 letras.
dom.btnLet.onclick = () => {
  if (letras.length <= 1) return;
  const antes = [...letras];
  const removidos = letras.splice(1, 2);
  log(`splice(1, 2) eliminó [${removidos.join(", ")}]`, "success");
  flow(dom.listaLet, antes, "letras.splice(1, 2)", [...letras]);
  dom.btnLet.disabled = true;
};

// Caso 2: Inserto sin borrar. Meto un nombre nuevo en la posición 1.
dom.btnNom.onclick = () => {
  const val = dom.inputNom.value.trim();
  if (!val) return;
  const antes = [...nombres];
  nombres.splice(1, 0, val);
  dom.inputNom.value = "";
  log(`splice(1, 0, "${val}") insertó sin borrar`, "success");
  flow(dom.listaNom, antes, `nombres.splice(1, 0, "${val}")`, [...nombres]);
};

// Caso 3: Reemplazo. Quito 2 elementos y meto 2 nuevos en su lugar.
dom.btnRep.onclick = () => {
  if (reemplazo.length <= 2) return;
  const antes = [...reemplazo];
  reemplazo.splice(1, 2, "🚀 NUEVO", "✨ NUEVO");
  log("splice(1, 2, …) reemplazó dos elementos", "success");
  flow(dom.listaRep, antes, 'reemplazo.splice(1, 2, "🚀 NUEVO", "✨ NUEVO")', [...reemplazo]);
  dom.btnRep.disabled = true;
};

// Vuelvo todo a como estaba al inicio.
dom.btnReset.onclick = () => {
  letras = [...INICIAL_LETRAS];
  nombres = [...INICIAL_NOMBRES];
  reemplazo = [...INICIAL_REEMPLAZO];
  dom.btnLet.disabled = false;
  dom.btnRep.disabled = false;
  dom.inputNom.value = "";
  log("Reinicié splice()", "system");
  updateUI();
};

// Inicio la UI.
window.addEventListener("DOMContentLoaded", updateUI);
