// TP 01 — push(): agrego al final y el array original cambia

import { boot } from "../../_shared/js/boot.js";
import { paintFlow } from "../../_shared/js/arrayDisplay.js";

const log = boot("push");

const FRUTAS_POOL = ["🍎 Manzana", "🍌 Banana", "🍇 Uva"];
const AMIGOS_POOL = ["Alex", "Marcos", "Lucía"];

let frutas = [];
let amigos = ["Juan"];
let numeros = [10];

const dom = {
  listaFrutas: document.getElementById("listaFrutas"),
  btnFrutas: document.getElementById("btnFrutas"),
  contFrutas: document.getElementById("contFrutas"),

  listaAmigos: document.getElementById("listaAmigos"),
  btnAmigos: document.getElementById("btnAmigos"),
  contAmigos: document.getElementById("contAmigos"),

  listaNums: document.getElementById("listaNums"),
  inputNum: document.getElementById("inputNum"),
  btnNum: document.getElementById("btnNum"),
  resNum: document.getElementById("resNum"),
  contNums: document.getElementById("contNums"),

  btnReset: document.getElementById("btnReset"),
};

const pintarFrutas = (antes, operacion) => {
  paintFlow(dom.listaFrutas, {
    before: antes,
    operation: operacion,
    after: [...frutas],
    note: "push() modifica el mismo array (mutación).",
  });
  if (dom.contFrutas) dom.contFrutas.textContent = `${frutas.length} ITEMS`;
};

const pintarAmigos = (antes, operacion) => {
  paintFlow(dom.listaAmigos, {
    before: antes,
    operation: operacion,
    after: [...amigos],
    note: "Parto de un array con un amigo y hago push de tres más.",
  });
  if (dom.contAmigos) dom.contAmigos.textContent = `${amigos.length} ITEMS`;
};

const pintarNums = (antes, operacion) => {
  paintFlow(dom.listaNums, {
    before: antes,
    operation: operacion,
    after: [...numeros],
    note: "Solo hago push si el número es mayor al último.",
  });
  if (dom.contNums) dom.contNums.textContent = `${numeros.length} ITEM${numeros.length === 1 ? "" : "S"}`;
};

const updateUI = () => {
  pintarFrutas([...frutas], frutas.length ? "estado actual" : 'push("🍎 Manzana", "🍌 Banana", "🍇 Uva")');
  pintarAmigos([...amigos], "estado actual");
  pintarNums([...numeros], "estado actual");

  dom.btnFrutas.disabled = frutas.length >= 3;
  dom.btnAmigos.disabled = amigos.length >= 4;
};

// 1. Array vacío → tres frutas con push
dom.btnFrutas.onclick = () => {
  if (frutas.length > 0) return;
  const antes = [];
  frutas.push(...FRUTAS_POOL);
  log(`push() agregó ${FRUTAS_POOL.length} frutas al final`, "success");
  pintarFrutas(antes, `push(${FRUTAS_POOL.map((f) => `"${f}"`).join(", ")})`);
  updateUI();
};

// 2. Array existente → tres amigos más
dom.btnAmigos.onclick = () => {
  if (amigos.length !== 1) return;
  const antes = [...amigos];
  amigos.push(...AMIGOS_POOL);
  log(`push() agregó "${AMIGOS_POOL.join('", "')}"`, "success");
  pintarAmigos(antes, `push("${AMIGOS_POOL.join('", "')}")`);
  updateUI();
};

// 3. Push condicional si es mayor al último
dom.btnNum.onclick = () => {
  const val = parseInt(dom.inputNum.value, 10);
  if (Number.isNaN(val)) return;

  const antes = [...numeros];
  const ultimo = numeros[numeros.length - 1];

  if (val > ultimo) {
    numeros.push(val);
    dom.resNum.className = "feedback-box feedback-success";
    dom.resNum.innerHTML = `<i class="fas fa-check me-2"></i>${val} &gt; ${ultimo} → agregado con push().`;
    log(`push(${val}) agregó el número (era mayor que ${ultimo})`, "success");
    pintarNums(antes, `push(${val})`);
  } else {
    dom.resNum.className = "feedback-box feedback-danger";
    dom.resNum.innerHTML = `<i class="fas fa-times me-2"></i>${val} no supera a ${ultimo}. No hice push.`;
    log(`push() no se ejecutó: ${val} no es mayor que ${ultimo}`, "warn");
    pintarNums(antes, `// sin push — ${val} ≤ ${ultimo}`);
  }

  dom.inputNum.value = "";
  if (dom.contNums) dom.contNums.textContent = `${numeros.length} ITEMS`;
};

dom.btnReset.onclick = () => {
  frutas = [];
  amigos = ["Juan"];
  numeros = [10];
  dom.resNum.className = "feedback-box feedback-waiting";
  dom.resNum.textContent = "Esperando número…";
  log("Reinicié los tres ejercicios", "system");
  updateUI();
};

window.addEventListener("DOMContentLoaded", updateUI);
