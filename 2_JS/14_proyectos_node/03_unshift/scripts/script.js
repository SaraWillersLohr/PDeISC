/**
 * Proyecto: 03 - unshift() "Prioridad Maestra" (Versión Académica Literal)
 * Objetivo: Demostrar 3 casos de uso de unshift() requeridos por la consigna.
 */

// --- DATOS INICIALES ---
const COLORES_POOL = [
  "#ff5d73",
  "#5b7cfa",
  "#22c55e",
  "#f59e0b",
  "#a855f7",
  "#7dd3fc",
];

// --- ESTADOS ---
let colores = []; // 1. Array vacío
let tareas = ["Comprar pan", "Estudiar JS"]; // 2. Array de tareas
let usuarios = ["Admin", "Moderador"]; // 3. Array de usuarios conectados

// --- DOM ---
const dom = {
  listaCol: document.getElementById("listaCol"),
  contCol: document.getElementById("contCol"),
  btnCol: document.getElementById("btnCol"),

  listaTask: document.getElementById("listaTask"),
  contTask: document.getElementById("contTask"),
  inputTask: document.getElementById("inputTask"),
  btnTask: document.getElementById("btnTask"),

  listaUser: document.getElementById("listaUser"),
  contUser: document.getElementById("contUser"),
  inputUser: document.getElementById("inputUser"),
  btnUser: document.getElementById("btnUser"),

  btnReset: document.getElementById("btnReset"),
};

// --- RENDERERS ---

const renderColores = () => {
  dom.listaCol.innerHTML = colores
    .map(
      (c) => `
    <div class="animate__animated animate__fadeInDown" style="width: 40px; height: 40px; border-radius: 10px; background: ${c}; box-shadow: 0 4px 10px rgba(0,0,0,0.1);"></div>
  `,
    )
    .join("");
  dom.contCol.textContent = `${colores.length} ITEMS`;
};

const renderTareas = () => {
  dom.listaTask.innerHTML = tareas
    .map(
      (t, i) => `
    <div class="item-prioridad ${i === 0 && t.includes("URGENTE") ? "item-urgente" : ""} animate__animated animate__fadeInDown">
      <div class="d-flex align-items-center gap-2">
        <i class="fas ${t.includes("URGENTE") ? "fa-bolt text-danger" : "fa-check-circle text-primary"}"></i>
        <span class="fw-bold small">${t}</span>
      </div>
    </div>
  `,
    )
    .join("");
  dom.contTask.textContent = `${tareas.length} ITEMS`;
};

const renderUsers = () => {
  dom.listaUser.innerHTML = usuarios
    .map(
      (u, i) => `
    <div class="item-card animate__animated animate__fadeInDown">
      <div class="d-flex align-items-center gap-2">
        <div class="icon-wrapper bg-success bg-opacity-10 text-success" style="width: 30px; height: 30px; font-size: 0.8rem;">
          <i class="fas fa-user"></i>
        </div>
        <span class="fw-bold small">${u}</span>
        ${i === 0 ? '<span class="badge bg-success ms-auto" style="font-size: 0.6rem;">NUEVO</span>' : ""}
      </div>
    </div>
  `,
    )
    .join("");
  dom.contUser.textContent = `${usuarios.length} ITEMS`;
};

// --- LÓGICA ---

// 1. Agregar 3 colores al principio
dom.btnCol.onclick = () => {
  if (colores.length > 0) return;

  // MÉTODO ARRAY: unshift() literal
  colores.unshift(COLORES_POOL[0], COLORES_POOL[1], COLORES_POOL[2]);

  renderColores();
  dom.btnCol.disabled = true;
};

// 2. Agregar tarea urgente al principio
dom.btnTask.onclick = () => {
  const val = dom.inputTask.value.trim();
  if (!val) return;

  // MÉTODO ARRAY: unshift() literal
  tareas.unshift(`[URGENTE] ${val}`);

  dom.inputTask.value = "";
  renderTareas();
};

// 3. Insertar usuario al principio
dom.btnUser.onclick = () => {
  const val = dom.inputUser.value.trim();
  if (!val) return;

  // MÉTODO ARRAY: unshift() literal
  usuarios.unshift(val);

  dom.inputUser.value = "";
  renderUsers();
};

dom.btnReset.onclick = () => {
  colores = [];
  tareas = ["Comprar pan", "Estudiar JS"];
  usuarios = ["Admin", "Moderador"];
  dom.btnCol.disabled = false;
  init();
};

const init = () => {
  renderColores();
  renderTareas();
  renderUsers();
};

window.addEventListener("load", init);
