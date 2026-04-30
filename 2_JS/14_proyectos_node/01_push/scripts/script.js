/**
 * Proyecto: 01 - push() "Adición Maestra" (Versión Académica Literal)
 * Objetivo: Demostrar 3 casos de uso de push() requeridos por la consigna.
 */

// --- DATOS INICIALES ---
const FRUTAS_POOL = [
  "🍎 Manzana",
  "🍌 Banana",
  "🍇 Uva",
  "🥝 Kiwi",
  "🍓 Frutilla",
  "🍊 Naranja",
];
const AMIGOS_POOL = ["Alex", "Marcos", "Lucía", "Elena", "Javier", "Sofía"];

// --- ESTADOS ---
let frutas = []; // 1. Array vacío
let amigos = ["Juan"]; // 2. Array existente
let numeros = [10]; // 3. Array de números

// --- DOM ---
const dom = {
  listaFrutas: document.getElementById("listaFrutas"),
  contFrutas: document.getElementById("contFrutas"),
  btnFrutas: document.getElementById("btnFrutas"),

  listaAmigos: document.getElementById("listaAmigos"),
  contAmigos: document.getElementById("contAmigos"),
  btnAmigos: document.getElementById("btnAmigos"),

  listaNums: document.getElementById("listaNums"),
  contNums: document.getElementById("contNums"),
  inputNum: document.getElementById("inputNum"),
  btnNum: document.getElementById("btnNum"),
  resNum: document.getElementById("resNum"),

  btnReset: document.getElementById("btnReset"),
};

// --- RENDERERS ---

const renderFrutas = () => {
  dom.listaFrutas.innerHTML = frutas
    .map(
      (f) => `
    <div class="item-card animate__animated animate__fadeInLeft">
      <span class="fw-bold">${f}</span>
    </div>
  `,
    )
    .join("");
  dom.contFrutas.textContent = `${frutas.length} ITEMS`;
};

const renderAmigos = () => {
  dom.listaAmigos.innerHTML = amigos
    .map(
      (a) => `
    <div class="item-card animate__animated animate__fadeInLeft">
      <div class="d-flex align-items-center gap-2">
        <i class="fas fa-user-circle text-success"></i>
        <span class="fw-bold">${a}</span>
      </div>
    </div>
  `,
    )
    .join("");
  dom.contAmigos.textContent = `${amigos.length} ITEMS`;
};

const renderNums = () => {
  dom.listaNums.innerHTML = numeros
    .map(
      (n) => `
    <div class="item-card animate__animated animate__fadeIn">
      <span class="badge bg-warning text-dark me-2">Num</span>
      <span class="fw-800">${n}</span>
    </div>
  `,
    )
    .reverse()
    .join(""); // Mostrar último arriba
  dom.contNums.textContent = `${numeros.length} ITEMS`;
};

// --- LÓGICA ---

// 1. Agregar 3 frutas al array vacío
dom.btnFrutas.onclick = () => {
  if (frutas.length >= 6) return;

  // Usamos push literal
  frutas.push(FRUTAS_POOL[0], FRUTAS_POOL[1], FRUTAS_POOL[2]);

  renderFrutas();
  dom.btnFrutas.disabled = true;
};

// 2. Agregar 3 amigos al array existente
dom.btnAmigos.onclick = () => {
  if (amigos.length > 1) return;

  // Usamos push literal
  amigos.push("Alex", "Marcos", "Lucía");

  renderAmigos();
  dom.btnAmigos.disabled = true;
};

// 3. Agregar número solo si es mayor al último
dom.btnNum.onclick = () => {
  const val = parseInt(dom.inputNum.value);
  if (isNaN(val)) return;

  const ultimo = numeros[numeros.length - 1];

  if (val > ultimo) {
    // MÉTODO ARRAY: push() condicional
    numeros.push(val);
    dom.resNum.innerHTML = `<span class="text-success">¡Agregado! ${val} > ${ultimo}</span>`;
    renderNums();
  } else {
    dom.resNum.innerHTML = `<span class="text-danger">Error: ${val} no es mayor a ${ultimo}</span>`;
  }
  dom.inputNum.value = "";
};

dom.btnReset.onclick = () => {
  frutas = [];
  amigos = ["Juan"];
  numeros = [10];
  dom.btnFrutas.disabled = false;
  dom.btnAmigos.disabled = false;
  dom.resNum.textContent = "";
  init();
};

const init = () => {
  renderFrutas();
  renderAmigos();
  renderNums();
};

window.addEventListener("load", init);
