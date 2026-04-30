// proyecto 06_slice

// constantes
const NUMEROS_DATA = [10, 20, 30, 40, 50];
const PELICULAS_DATA = [
  "Matrix",
  "Avatar",
  "Inception",
  "Batman",
  "Joker",
  "Titanic",
];
const LETRAS_DATA = ["A", "B", "C", "D", "E", "F"];

// --- ESTADOS (Copiados para no mutar original) ---
let numOriginal = [...NUMEROS_DATA];
let pelOriginal = [...PELICULAS_DATA];
let letOriginal = [...LETRAS_DATA];

let numCopia = [];
let pelCopia = [];
let letCopia = [];

// elementos del html
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

// funciones para dibujar en pantalla

const renderNum = () => {
  dom.listaNum.innerHTML = numCopia
    .map(
      (n) => `
    <div class="item-card animate__animated animate__fadeIn">
      <span class="badge bg-primary me-2">Copy</span>
      <span class="fw-bold">${n}</span>
    </div>
  `,
    )
    .join("");
  dom.contNum.textContent = `${numCopia.length} ITEMS`;
};

const renderPel = () => {
  dom.listaPel.innerHTML = pelCopia
    .map(
      (p, i) => `
    <div class="item-card animate__animated animate__fadeIn">
      <div class="d-flex align-items-center gap-2">
        <i class="fas fa-clapperboard text-success"></i>
        <span class="small fw-bold">${p}</span>
      </div>
    </div>
  `,
    )
    .join("");
  dom.contPel.textContent = `${pelCopia.length} ITEMS`;
};

const renderUlt = () => {
  dom.listaUlt.innerHTML = letCopia
    .map(
      (l) => `
    <div class="item-card animate__animated animate__fadeIn">
      <span class="badge bg-warning text-dark me-2">Last</span>
      <span class="fw-bold">${l}</span>
    </div>
  `,
    )
    .join("");
  dom.contUlt.textContent = `${letCopia.length} ITEMS`;
};

// botones y logica

// 1. Copia los primeros 3 elementos
dom.btnNum.onclick = () => {
  // usamos el metodo  slice(start, end) literal
  numCopia = numOriginal.slice(0, 3);

  renderNum();
  dom.btnNum.disabled = true;
};

// 2. Copia parcial de películas desde pos 2 hasta la 4 (índice 2 al 5 exclusivo)
dom.btnPel.onclick = () => {
  // usamos el metodo  slice(2, 5) literal
  pelCopia = pelOriginal.slice(2, 5);

  renderPel();
  dom.btnPel.disabled = true;
};

// 3. Crea array nuevo con los últimos 3 elementos
dom.btnUlt.onclick = () => {
  // usamos el metodo  slice(-3) literal
  letCopia = letOriginal.slice(-3);

  renderUlt();
  dom.btnUlt.disabled = true;
};

dom.btnReset.onclick = () => {
  numCopia = [];
  pelCopia = [];
  letCopia = [];
  dom.btnNum.disabled = false;
  dom.btnPel.disabled = false;
  dom.btnUlt.disabled = false;
  init();
};

const init = () => {
  renderNum();
  renderPel();
  renderUlt();
};

window.addEventListener("load", init);
