/**
 * Proyecto: 13 - sort() "Organizador Maestro" (Versión Académica)
 * Objetivo: Demostrar 3 casos de ordenamiento independientes.
 */

// --- DATOS INICIALES ---
const DATA_ALPHA = ["Sara", "Alex", "Marcos", "Lucía", "Javier"];
const DATA_NUM = [40, 100, 1, 5, 25];
const DATA_OBJ = [
  { nombre: "Sara", puntos: 2500, icono: "fa-user-ninja" },
  { nombre: "Alex", puntos: 3800, icono: "fa-user-astronaut" },
  { nombre: "Marcos", puntos: 1200, icono: "fa-user-tie" },
  { nombre: "Lucía", puntos: 4500, icono: "fa-user-nurse" },
  { nombre: "Javier", puntos: 3100, icono: "fa-user-gear" },
];

// --- ESTADOS ---
let arrayAlpha = [...DATA_ALPHA];
let arrayNum = [...DATA_NUM];
let arrayObj = [...DATA_OBJ];

// --- DOM ---
const dom = {
  contAlpha: document.getElementById("contAlpha"),
  contNum: document.getElementById("contNum"),
  contObj: document.getElementById("contObj"),
  btnAlphaAsc: document.getElementById("btnAlphaAsc"),
  btnAlphaDesc: document.getElementById("btnAlphaDesc"),
  btnNumAsc: document.getElementById("btnNumAsc"),
  btnNumDesc: document.getElementById("btnNumDesc"),
  btnObjSort: document.getElementById("btnObjSort"),
  btnReset: document.getElementById("btnReset"),
};

// --- RENDERERS ---

const renderAlpha = () => {
  dom.contAlpha.innerHTML = arrayAlpha
    .map(
      (n) => `
    <div class="item-card animate__animated animate__fadeIn">
      <span class="fw-bold">${n}</span>
    </div>
  `,
    )
    .join("");
};

const renderNum = () => {
  dom.contNum.innerHTML = arrayNum
    .map(
      (n) => `
    <div class="item-card animate__animated animate__fadeIn">
      <span class="fw-bold text-success">${n}</span>
    </div>
  `,
    )
    .join("");
};

const renderObj = () => {
  dom.contObj.innerHTML = arrayObj
    .map(
      (p, i) => `
    <div class="item-card animate__animated animate__fadeIn">
      <div class="d-flex align-items-center gap-3">
        <div class="posicion small">${i + 1}</div>
        <i class="fas ${p.icono} text-warning"></i>
        <span class="fw-bold">${p.nombre}</span>
      </div>
      <span class="badge bg-light text-dark">${p.puntos} pts</span>
    </div>
  `,
    )
    .join("");
};

// --- LÓGICA ---

dom.btnAlphaAsc.onclick = () => {
  // MÉTODO ARRAY: sort() - Alfabético Asc
  arrayAlpha.sort((a, b) => a.localeCompare(b));
  renderAlpha();
};

dom.btnAlphaDesc.onclick = () => {
  // MÉTODO ARRAY: sort() - Alfabético Desc
  arrayAlpha.sort((a, b) => b.localeCompare(a));
  renderAlpha();
};

dom.btnNumAsc.onclick = () => {
  // MÉTODO ARRAY: sort() - Numérico Asc (a - b)
  arrayNum.sort((a, b) => a - b);
  renderNum();
};

dom.btnNumDesc.onclick = () => {
  // MÉTODO ARRAY: sort() - Numérico Desc (b - a)
  arrayNum.sort((a, b) => b - a);
  renderNum();
};

dom.btnObjSort.onclick = () => {
  // MÉTODO ARRAY: sort() - Objetos por puntos desc
  arrayObj.sort((a, b) => b.puntos - a.puntos);
  renderObj();
};

dom.btnReset.onclick = () => {
  arrayAlpha = [...DATA_ALPHA];
  arrayNum = [...DATA_NUM];
  arrayObj = [...DATA_OBJ];
  init();
};

const init = () => {
  renderAlpha();
  renderNum();
  renderObj();
};

window.addEventListener("load", init);
