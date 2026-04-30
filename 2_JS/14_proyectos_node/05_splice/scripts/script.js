/**
 * Proyecto: 05 - splice() "Manipulación Maestra" (Versión Académica Literal)
 * Objetivo: Demostrar 3 casos de uso de splice() requeridos por la consigna.
 */

// --- DATOS INICIALES ---
const LETRAS_DATA = ["A", "B", "C", "D", "E", "F"];
const NOMBRES_DATA = ["Juan", "María", "Pedro"];
const REEMPLAZO_DATA = ["Item 1", "Item 2", "Item 3", "Item 4"];

// --- ESTADOS ---
let letras = [...LETRAS_DATA];
let nombres = [...NOMBRES_DATA];
let reemplazo = [...REEMPLAZO_DATA];

// --- DOM ---
const dom = {
  listaLet: document.getElementById("listaLet"),
  contLet: document.getElementById("contLet"),
  btnLet: document.getElementById("btnLet"),

  listaNom: document.getElementById("listaNom"),
  contNom: document.getElementById("contNom"),
  inputNom: document.getElementById("inputNom"),
  btnNom: document.getElementById("btnNom"),

  listaRep: document.getElementById("listaRep"),
  contRep: document.getElementById("contRep"),
  btnRep: document.getElementById("btnRep"),

  btnReset: document.getElementById("btnReset"),
};

// --- RENDERERS ---

const renderLetras = () => {
  dom.listaLet.innerHTML = letras
    .map(
      (l, i) => `
    <div class="cuadro-mosaico animate__animated animate__zoomIn" style="background: var(--primary)">
      <span class="fw-bold">${l}</span>
      <small class="position-absolute top-0 start-0 m-1 text-white" style="font-size: 0.5rem;">${i}</small>
    </div>
  `,
    )
    .join("");
  dom.contLet.textContent = `${letras.length} ITEMS`;
};

const renderNombres = () => {
  dom.listaNom.innerHTML = nombres
    .map(
      (n, i) => `
    <div class="item-card animate__animated animate__fadeIn">
      <div class="d-flex align-items-center gap-2">
        <i class="fas fa-user text-success"></i>
        <span class="small fw-bold">${n}</span>
        <span class="badge bg-light text-dark ms-auto" style="font-size: 0.6rem;">Idx ${i}</span>
      </div>
    </div>
  `,
    )
    .join("");
  dom.contNom.textContent = `${nombres.length} ITEMS`;
};

const renderReemplazo = () => {
  dom.listaRep.innerHTML = reemplazo
    .map(
      (r, i) => `
    <div class="item-card animate__animated animate__fadeIn">
      <div class="d-flex align-items-center gap-2">
        <i class="fas ${r.includes("NUEVO") ? "fa-star text-warning" : "fa-circle text-muted"}"></i>
        <span class="small fw-bold ${r.includes("NUEVO") ? "text-warning" : ""}">${r}</span>
        <span class="badge bg-light text-dark ms-auto" style="font-size: 0.6rem;">Idx ${i}</span>
      </div>
    </div>
  `,
    )
    .join("");
  dom.contRep.textContent = `${reemplazo.length} ITEMS`;
};

// --- LÓGICA ---

// 1. Elimina dos elementos desde la posición 1
dom.btnLet.onclick = () => {
  if (letras.length < 2) return;

  // MÉTODO ARRAY: splice(index, deleteCount) literal
  letras.splice(1, 2);

  renderLetras();
  dom.btnLet.disabled = true;
};

// 2. Inserta un nuevo nombre en la segunda posición (índice 1) sin eliminar nada
dom.btnNom.onclick = () => {
  const val = dom.inputNom.value.trim();
  if (!val) return;

  // MÉTODO ARRAY: splice(index, 0, item) literal
  nombres.splice(1, 0, val);

  dom.inputNom.value = "";
  renderNombres();
};

// 3. Reemplaza dos elementos por otros nuevos desde una posición determinada (pos 1)
dom.btnRep.onclick = () => {
  if (reemplazo.length < 2) return;

  // MÉTODO ARRAY: splice(index, deleteCount, ...items) literal
  reemplazo.splice(1, 2, "NUEVO 1", "NUEVO 2");

  renderReemplazo();
  dom.btnRep.disabled = true;
};

dom.btnReset.onclick = () => {
  letras = [...LETRAS_DATA];
  nombres = [...NOMBRES_DATA];
  reemplazo = [...REEMPLAZO_DATA];
  dom.btnLet.disabled = false;
  dom.btnRep.disabled = false;
  init();
};

const init = () => {
  renderLetras();
  renderNombres();
  renderReemplazo();
};

window.addEventListener("load", init);
