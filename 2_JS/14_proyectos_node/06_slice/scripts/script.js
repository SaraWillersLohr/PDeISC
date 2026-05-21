// TP 06 — slice(): copio un pedazo sin tocar el original

import { boot } from "../../_shared/js/boot.js";
import { paintFlow, formatArrayLiteral } from "../../_shared/js/arrayDisplay.js";

const log = boot("slice");

const NUMEROS_DATA = [10, 20, 30, 40, 50];
const PELICULAS_DATA = ["Matrix", "Avatar", "Inception", "Batman", "Joker", "Titanic"];
const LETRAS_DATA = ["A", "B", "C", "D", "E", "F"];

const numOriginal = [...NUMEROS_DATA];
const pelOriginal = [...PELICULAS_DATA];
const letOriginal = [...LETRAS_DATA];

let numCopia = [];
let pelCopia = [];
let letCopia = [];

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

const flowCopia = (el, original, copia, operacion) => {
  paintFlow(el, {
    before: original,
    operation: operacion,
    after: copia,
    note: `Original intacto: ${formatArrayLiteral(original)}`,
  });
};

const updateUI = () => {
  flowCopia(dom.listaNum, numOriginal, numCopia, "numOriginal.slice(0, 3)");
  flowCopia(dom.listaPel, pelOriginal, pelCopia, "pelOriginal.slice(2, 5)");
  flowCopia(dom.listaUlt, letOriginal, letCopia, "letOriginal.slice(-3)");
  if (dom.contNum) dom.contNum.textContent = `${numCopia.length} ITEMS`;
  if (dom.contPel) dom.contPel.textContent = `${pelCopia.length} ITEMS`;
  if (dom.contUlt) dom.contUlt.textContent = `${letCopia.length} ITEMS`;
};

dom.btnNum.onclick = () => {
  numCopia = numOriginal.slice(0, 3);
  log(`slice(0, 3) copió ${numCopia.length} números`, "success");
  dom.btnNum.disabled = true;
  updateUI();
};

dom.btnPel.onclick = () => {
  pelCopia = pelOriginal.slice(2, 5);
  log(`slice(2, 5) copió ${pelCopia.length} películas`, "success");
  dom.btnPel.disabled = true;
  updateUI();
};

dom.btnUlt.onclick = () => {
  letCopia = letOriginal.slice(-3);
  log(`slice(-3) copió los últimos ${letCopia.length} elementos`, "success");
  dom.btnUlt.disabled = true;
  updateUI();
};

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

window.addEventListener("DOMContentLoaded", updateUI);
