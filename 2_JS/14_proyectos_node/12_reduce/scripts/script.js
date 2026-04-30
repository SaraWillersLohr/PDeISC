/**
 * Proyecto: 12 - reduce() "Condensación Maestra" (Versión Académica)
 * Objetivo: Demostrar reduce() en 2 contextos independientes.
 */

// --- DATOS ---
const DATA_TOTAL = [
  { n: "MacBook", p: 1200 },
  { n: "iPhone", p: 900 },
  { n: "AirPods", p: 250 },
  { n: "Watch", p: 400 },
  { n: "Magic", p: 80 },
];

const DATA_AGR = [
  { n: "Prod 1", c: "Electrónica" },
  { n: "Prod 2", c: "Hogar" },
  { n: "Prod 3", c: "Electrónica" },
  { n: "Prod 4", c: "Hogar" },
  { n: "Prod 5", c: "Libros" },
  { n: "Prod 6", c: "Electrónica" },
];

// --- ESTADOS ---
let carrito = [...DATA_TOTAL];
let productos = [...DATA_AGR];

// --- DOM ---
const dom = {
  listaCar: document.getElementById("listaCar"),
  contCar: document.getElementById("contCar"),
  btnTotal: document.getElementById("btnTotal"),
  resTotal: document.getElementById("resTotal"),
  listaAgr: document.getElementById("listaAgr"),
  contAgr: document.getElementById("contAgr"),
  btnAgrupar: document.getElementById("btnAgrupar"),
  resAgr: document.getElementById("resAgr"),
  btnReset: document.getElementById("btnReset"),
};

// --- RENDERERS ---

const renderCar = () => {
  dom.listaCar.innerHTML = carrito
    .map(
      (it) => `
    <div class="carrito-item animate__animated animate__fadeIn">
      <span>${it.n}</span>
      <span class="text-primary">$${it.p}</span>
    </div>
  `,
    )
    .join("");
  dom.contCar.textContent = `${carrito.length} ITEMS`;
};

const renderAgr = () => {
  dom.listaAgr.innerHTML = productos
    .map(
      (it) => `
    <div class="item-card animate__animated animate__fadeIn">
      <span class="small fw-bold">${it.n}</span>
      <span class="badge bg-secondary small">${it.c}</span>
    </div>
  `,
    )
    .join("");
  dom.contAgr.textContent = `${productos.length} ITEMS`;
};

// --- LÓGICA ---

dom.btnTotal.onclick = () => {
  // MÉTODO ARRAY: reduce() - Ejercicio 1 (Acumulación numérica)
  const total = carrito.reduce((acc, curr) => acc + curr.p, 0);
  dom.resTotal.textContent = `$ ${total.toLocaleString()}`;
  dom.resTotal.classList.add("animate__animated", "animate__bounceIn");
};

dom.btnAgrupar.onclick = () => {
  // MÉTODO ARRAY: reduce() - Ejercicio 2 (Acumulación en objeto)
  const agrupado = productos.reduce((acc, curr) => {
    acc[curr.c] = (acc[curr.c] || 0) + 1;
    return acc;
  }, {});

  dom.resAgr.innerHTML = `<pre>${JSON.stringify(agrupado, null, 2)}</pre>`;
  dom.resAgr.classList.add("animate__animated", "animate__fadeIn");
};

dom.btnReset.onclick = () => {
  dom.resTotal.textContent = "$ 0";
  dom.resTotal.classList.remove("animate__animated", "animate__bounceIn");
  dom.resAgr.textContent = "Esperando proceso...";
  dom.resAgr.classList.remove("animate__animated", "animate__fadeIn");
  renderCar();
  renderAgr();
};

// Init
window.addEventListener("load", () => {
  renderCar();
  renderAgr();
});
