/**
 * Proyecto: 04 - shift() "Extracción Maestra" (Versión Académica Literal)
 * Objetivo: Demostrar 3 casos de uso de shift() requeridos por la consigna.
 */

// --- DATOS INICIALES ---
const NUMEROS_DATA = [10, 20, 30, 40, 50];
const CHAT_DATA = [
  "Hola!",
  "¿Cómo estás?",
  "Todo bien por aquí",
  "Genial!",
  "Nos vemos.",
];
const COLA_DATA = [
  "Carlos Ruiz",
  "Marta Gómez",
  "Pedro Sanz",
  "Lucía Fernández",
];

// --- ESTADOS ---
let numeros = [...NUMEROS_DATA];
let mensajes = [...CHAT_DATA];
let cola = [...COLA_DATA];

// --- DOM ---
const dom = {
  listaNum: document.getElementById("listaNum"),
  contNum: document.getElementById("contNum"),
  btnNum: document.getElementById("btnNum"),

  listaMsg: document.getElementById("listaMsg"),
  contMsg: document.getElementById("contMsg"),
  btnMsg: document.getElementById("btnMsg"),

  listaCola: document.getElementById("listaCola"),
  contCola: document.getElementById("contCola"),
  btnCola: document.getElementById("btnCola"),
  resCola: document.getElementById("resCola"),

  btnReset: document.getElementById("btnReset"),
};

// --- RENDERERS ---

const renderNum = () => {
  dom.listaNum.innerHTML = numeros
    .map(
      (n, i) => `
    <div class="item-card animate__animated animate__fadeIn">
      <span class="badge bg-primary me-2">Index ${i}</span>
      <span class="fw-bold">${n}</span>
    </div>
  `,
    )
    .join("");
  dom.contNum.textContent = `${numeros.length} ITEMS`;
};

const renderMsg = () => {
  dom.listaMsg.innerHTML = mensajes
    .map(
      (m, i) => `
    <div class="item-card animate__animated animate__fadeInLeft">
      <div class="d-flex align-items-center gap-2">
        <i class="fas fa-comment-dots text-success"></i>
        <span class="small">${m}</span>
      </div>
    </div>
  `,
    )
    .join("");
  dom.contMsg.textContent = `${mensajes.length} ITEMS`;
};

const renderCola = () => {
  dom.listaCola.innerHTML = cola
    .map(
      (c, i) => `
    <div class="item-card animate__animated animate__fadeInRight">
      <div class="d-flex align-items-center gap-2">
        <div class="icon-wrapper bg-warning bg-opacity-10 text-warning" style="width: 30px; height: 30px; font-size: 0.8rem;">
          <i class="fas fa-user"></i>
        </div>
        <span class="fw-bold small">${c}</span>
        <span class="badge bg-light text-dark ms-auto" style="font-size: 0.6rem;">Pos ${i + 1}</span>
      </div>
    </div>
  `,
    )
    .join("");
  dom.contCola.textContent = `${cola.length} ITEMS`;
};

// --- LÓGICA ---

// 1. Quitar el primer número
dom.btnNum.onclick = () => {
  if (numeros.length === 0) return;

  // MÉTODO ARRAY: shift() literal
  numeros.shift();

  renderNum();
};

// 2. Eliminar el primer mensaje
dom.btnMsg.onclick = () => {
  if (mensajes.length === 0) return;

  // MÉTODO ARRAY: shift() literal
  mensajes.shift();

  renderMsg();
};

// 3. Simular cola de atención al cliente
dom.btnCola.onclick = () => {
  if (cola.length === 0) {
    dom.resCola.textContent = "¡No hay clientes en espera!";
    return;
  }

  // MÉTODO ARRAY: shift() literal
  const atendido = cola.shift();

  dom.resCola.innerHTML = `Llamando a: <span class="text-warning">${atendido}</span>`;
  renderCola();
};

dom.btnReset.onclick = () => {
  numeros = [...NUMEROS_DATA];
  mensajes = [...CHAT_DATA];
  cola = [...COLA_DATA];
  dom.resCola.textContent = "";
  init();
};

const init = () => {
  renderNum();
  renderMsg();
  renderCola();
};

window.addEventListener("load", init);
