/**
 * Proyecto: 14 - reverse() "Inversión Maestra" (Versión Académica)
 * Objetivo: Demostrar reverse() en 2 contextos independientes.
 */

// --- DATOS ---
const DATA_LETRAS = ["J", "A", "V", "A", "S", "C", "R", "I", "P", "T"];
const DATA_TASKS = ["Desayunar", "Programar", "Almorzar", "Entrenar", "Dormir"];

// --- ESTADOS ---
let letras = [...DATA_LETRAS];
let tasks = [...DATA_TASKS];

// --- DOM ---
const dom = {
  contLetras: document.getElementById('contLetras'),
  btnRevLet: document.getElementById('btnRevLet'),
  listaTask: document.getElementById('listaTask'),
  btnRevTask: document.getElementById('btnRevTask'),
  btnReset: document.getElementById('btnReset')
};

// --- RENDERERS ---

const renderLetras = () => {
  dom.contLetras.innerHTML = letras.map((l, i) => `
    <div class="letra-box animate__animated animate__zoomIn" style="animation-delay: ${i * 0.05}s">${l}</div>
  `).join('');
};

const renderTasks = () => {
  dom.listaTask.innerHTML = tasks.map((t, i) => `
    <div class="item-card animate__animated animate__fadeInRight">
      <span class="fw-bold">${t}</span>
      <small class="text-muted">Pos: ${i}</small>
    </div>
  `).join('');
};

// --- LÓGICA ---

dom.btnRevLet.onclick = () => {
  const boxes = dom.contLetras.querySelectorAll('.letra-box');
  boxes.forEach(b => b.classList.add('reversing'));
  setTimeout(() => {
    // MÉTODO ARRAY: reverse() - Ejercicio 1
    letras.reverse();
    renderLetras();
  }, 600);
};

dom.btnRevTask.onclick = () => {
  // MÉTODO ARRAY: reverse() - Ejercicio 2
  tasks.reverse();
  renderTasks();
};

dom.btnReset.onclick = () => {
  letras = [...DATA_LETRAS];
  tasks = [...DATA_TASKS];
  renderLetras();
  renderTasks();
};

// Init
window.addEventListener('load', () => {
  renderLetras();
  renderTasks();
});
