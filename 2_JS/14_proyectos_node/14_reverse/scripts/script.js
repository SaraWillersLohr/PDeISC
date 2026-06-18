// ¡Hola! Terminamos con reverse(), el método para dar vuelta un array.
// Al igual que sort(), este método modifica el array original (lo hace "in-place").

import { boot } from "../../_shared/js/boot.js";
import { paintFlow } from "../../_shared/js/arrayDisplay.js";

// Arranco mi consola para ver cómo invertimos el orden de las cosas.
const log = boot("reverse");

// Listas de ejemplo para dar vuelta.
const INICIAL_LETRAS = ["A", "B", "C", "D", "E"];
const INICIAL_NUMEROS = [1, 2, 3, 4, 5, 6];

let letras = [...INICIAL_LETRAS];
let numeros = [...INICIAL_NUMEROS];

// Referencias a los elementos del DOM.
const dom = {
  displayOriginal1: document.getElementById("displayOriginal1"),
  btnRevLetters: document.getElementById("btnRevLetters"),
  displayOriginal2: document.getElementById("displayOriginal2"),
  btnRevNums: document.getElementById("btnRevNums"),
  inputString: document.getElementById("inputString"),
  displayResult3: document.getElementById("displayResult3"),
  btnRevString: document.getElementById("btnRevString"),
  btnReset: document.getElementById("btnReset"),
};

// Función para mostrar visualmente cómo se invierte el array.
const flowRev = (el, antes, despues, op, nota) => {
  paintFlow(el, {
    before: antes,
    operation: op,
    after: despues,
    note: nota ?? "reverse() modifica el array original.",
  });
};

// Actualizo la UI con el estado inicial.
const updateUI = () => {
  flowRev(dom.displayOriginal1, [...INICIAL_LETRAS], letras, "letras.reverse()");
  flowRev(dom.displayOriginal2, [...INICIAL_NUMEROS], numeros, "numeros.reverse()");
};

// Caso 1: Invierto el orden de las letras.
dom.btnRevLetters.onclick = () => {
  const antes = [...letras];
  letras.reverse();
  log(`reverse() en letras → [${letras.join(", ")}]`, "success");
  flowRev(dom.displayOriginal1, antes, letras, "letras.reverse()");
};

// Caso 2: Invierto el orden de los números.
dom.btnRevNums.onclick = () => {
  const antes = [...numeros];
  numeros.reverse();
  log(`reverse() en números → [${numeros.join(", ")}]`, "success");
  flowRev(dom.displayOriginal2, antes, numeros, "numeros.reverse()");
};

// Caso 3: Revierto un texto (string). Como reverse() es para arrays, primero lo convierto en array y después lo vuelvo a unir.
dom.btnRevString.onclick = () => {
  const texto = dom.inputString.value;
  const chars = texto.split("");
  const antes = [...chars];
  const revertido = [...chars].reverse().join("");

  paintFlow(dom.displayResult3, {
    before: antes,
    operation: 'split("").reverse().join("")',
    after: revertido.split(""),
    note: `Texto invertido: "${revertido}"`,
  });
  log(`reverse() en caracteres → "${revertido}"`, "success");
};

// Reseteo todo para volver a invertir.
dom.btnReset.onclick = () => {
  letras = [...INICIAL_LETRAS];
  numeros = [...INICIAL_NUMEROS];
  dom.inputString.value = "Hola Mundo";
  log("Reinicié reverse()", "system");
  updateUI();
  paintFlow(dom.displayResult3, {
    before: "Hola Mundo".split(""),
    operation: "ejemplo inicial",
    after: [],
    note: "Probá revertir de nuevo.",
  });
};

// Inicio la interfaz.
window.addEventListener("DOMContentLoaded", updateUI);