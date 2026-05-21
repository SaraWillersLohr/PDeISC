// TP 14 — reverse(): invierto el orden in-place

import { boot } from "/_shared/js/boot.js";
import { paintFlow } from "/_shared/js/arrayDisplay.js";

const log = boot("reverse");

const INICIAL_LETRAS = ["A", "B", "C", "D", "E"];
const INICIAL_NUMEROS = [1, 2, 3, 4, 5, 6];

let letras = [...INICIAL_LETRAS];
let numeros = [...INICIAL_NUMEROS];

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

const flowRev = (el, antes, despues, op, nota) => {
  paintFlow(el, {
    before: antes,
    operation: op,
    after: despues,
    note: nota ?? "reverse() modifica el array original.",
  });
};

const updateUI = () => {
  flowRev(dom.displayOriginal1, [...INICIAL_LETRAS], letras, "letras.reverse()");
  flowRev(dom.displayOriginal2, [...INICIAL_NUMEROS], numeros, "numeros.reverse()");
};

dom.btnRevLetters.onclick = () => {
  const antes = [...letras];
  letras.reverse();
  log(`reverse() en letras → [${letras.join(", ")}]`, "success");
  flowRev(dom.displayOriginal1, antes, letras, "letras.reverse()");
};

dom.btnRevNums.onclick = () => {
  const antes = [...numeros];
  numeros.reverse();
  log(`reverse() en números → [${numeros.join(", ")}]`, "success");
  flowRev(dom.displayOriginal2, antes, numeros, "numeros.reverse()");
};

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

window.addEventListener("DOMContentLoaded", updateUI);
