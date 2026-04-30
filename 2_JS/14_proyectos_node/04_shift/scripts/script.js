/**
 * Proyecto: 04 - shift() "Extracción del Inicio"
 * Objetivo: Demostrar shift() mediante 3 casos literales e independientes.
 */

// --- DATOS INICIALES ---
const INICIAL_ENTEROS = [10, 20, 30, 40, 50];
const INICIAL_MENSAJES = ["Hola", "¿Qué tal?", "Todo bien", "Adiós"];
const INICIAL_COLA = ["Carlos", "Marta", "Pedro", "Lucía"];

// --- ESTADO ---
let enteros = [...INICIAL_ENTEROS];
let mensajes = [...INICIAL_MENSAJES];
let cola = [...INICIAL_COLA];

// --- DOM ---
const dom = {
  // Ejercicio 1
  listaNum: document.getElementById("listaNum"),
  btnNum: document.getElementById("btnNum"),

  // Ejercicio 2
  listaMsg: document.getElementById("listaMsg"),
  btnMsg: document.getElementById("btnMsg"),

  // Ejercicio 3
  listaCola: document.getElementById("listaCola"),
  btnCola: document.getElementById("btnCola"),
  resCola: document.getElementById("resCola"),

  // Global
  btnReset: document.getElementById("btnReset"),
};

// --- RENDERERS ---

const renderArray = (arr, elementId) => {
  const container = dom[elementId];
  container.innerHTML = arr
    .map(
      (item) => `
        <span class="array-item animate__animated animate__fadeIn">
            ${item}
        </span>
    `,
    )
    .join("");
};

const updateUI = () => {
  renderArray(enteros, "listaNum");
  renderArray(mensajes, "listaMsg");
  renderArray(cola, "listaCola");

  // Deshabilitar botones si el array está vacío
  dom.btnNum.disabled = enteros.length === 0;
  dom.btnMsg.disabled = mensajes.length === 0;
  dom.btnCola.disabled = cola.length === 0;
};

// --- LÓGICA DE EJERCICIOS ---

// 1. Quita el primer número de un array de enteros
dom.btnNum.onclick = () => {
  if (enteros.length > 0) {
    // MÉTODO ARRAY: shift() - Ejercicio 1
    enteros.shift();
    updateUI();
  }
};

// 2. Elimina el primer mensaje de un array de mensajes de chat
dom.btnMsg.onclick = () => {
  if (mensajes.length > 0) {
    // MÉTODO ARRAY: shift() - Ejercicio 2
    mensajes.shift();
    updateUI();
  }
};

// 3. Usa shift() para simular una cola de atención al cliente
dom.btnCola.onclick = () => {
  if (cola.length > 0) {
    // MÉTODO ARRAY: shift() - Ejercicio 3
    const cliente = cola.shift();

    dom.resCola.className =
      "feedback-box mt-3 feedback-success animate__animated animate__bounceIn";
    dom.resCola.innerHTML = `<i class="fas fa-headset me-2"></i>Atendiendo a: <strong>${cliente}</strong>`;
    updateUI();
  }
};

// --- RESET ---

dom.btnReset.onclick = () => {
  enteros = [...INICIAL_ENTEROS];
  mensajes = [...INICIAL_MENSAJES];
  cola = [...INICIAL_COLA];

  dom.resCola.className = "feedback-box mt-3 feedback-waiting";
  dom.resCola.textContent = "Esperando...";

  updateUI();
};

// --- INIT ---
window.addEventListener("DOMContentLoaded", updateUI);
