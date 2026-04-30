/**
 * Proyecto: 02 - pop() "Vaciado Maestro" (Versión Académica Literal)
 * Objetivo: Demostrar 3 casos de uso de pop() requeridos por la consigna.
 */

// --- DATOS INICIALES ---
const ANIMALES_DATA = [
  { i: "fa-dog", n: "Perro", c: "#ff5d73" },
  { i: "fa-cat", n: "Gato", c: "#5b7cfa" },
  { i: "fa-dragon", n: "Dragón", c: "#22c55e" },
  { i: "fa-horse", n: "Caballo", c: "#fb923c" },
];

const COMPRAS_DATA = ["Leche", "Pan", "Huevos", "Café", "Azúcar"];
const VACIADO_DATA = [
  "Elemento 1",
  "Elemento 2",
  "Elemento 3",
  "Elemento 4",
  "Elemento 5",
];

// --- ESTADOS ---
let animales = [...ANIMALES_DATA];
let compras = [...COMPRAS_DATA];
let vaciado = [...VACIADO_DATA];

// --- DOM ---
const dom = {
  listaAni: document.getElementById("listaAni"),
  contAni: document.getElementById("contAni"),
  btnAni: document.getElementById("btnAni"),

  listaCom: document.getElementById("listaCom"),
  contCom: document.getElementById("contCom"),
  btnCom: document.getElementById("btnCom"),
  resCom: document.getElementById("resCom"),

  listaVac: document.getElementById("listaVac"),
  contVac: document.getElementById("contVac"),
  btnVac: document.getElementById("btnVac"),

  btnReset: document.getElementById("btnReset"),
};

// --- RENDERERS ---

const renderAni = () => {
  dom.listaAni.innerHTML = "";
  dom.contAni.textContent = `${animales.length} ITEMS`;
  animales.forEach((a) => {
    const span = document.createElement("span");
    span.className = "animal-item";
    span.style.color = a.c;
    span.innerHTML = `<i class="fas ${a.i}"></i>`;
    dom.listaAni.appendChild(span);
  });
};

const renderCom = () => {
  dom.listaCom.innerHTML = compras
    .map(
      (p) => `
    <div class="item-card animate__animated animate__fadeIn">
      <div class="d-flex align-items-center gap-2">
        <i class="fas fa-bag-shopping text-success"></i>
        <span>${p}</span>
      </div>
    </div>
  `,
    )
    .join("");
  dom.contCom.textContent = `${compras.length} ITEMS`;
};

const renderVac = () => {
  dom.listaVac.innerHTML = vaciado
    .map(
      (v) => `
    <div class="item-card animate__animated animate__fadeIn">
      <span class="small fw-bold">${v}</span>
    </div>
  `,
    )
    .join("");
  dom.contVac.textContent = `${vaciado.length} ITEMS`;
};

// --- LÓGICA ---

// 1. Eliminar el último elemento de animales
dom.btnAni.onclick = () => {
  if (animales.length === 0) return;

  const last = dom.listaAni.lastElementChild;
  if (last) {
    last.classList.add("removing");
    setTimeout(() => {
      // MÉTODO ARRAY: pop() - Ejercicio 1
      animales.pop();
      renderAni();
    }, 300);
  }
};

// 2. Quitar último producto y mostrar cuál fue eliminado
dom.btnCom.onclick = () => {
  if (compras.length === 0) {
    dom.resCom.textContent = "¡Lista vacía!";
    return;
  }

  // MÉTODO ARRAY: pop() - Ejercicio 2
  const eliminado = compras.pop();

  dom.resCom.innerHTML = `Eliminado: <span class="text-danger">${eliminado}</span>`;
  renderCom();
};

// 3. Bucle while para vaciar array con pop()
dom.btnVac.onclick = () => {
  if (vaciado.length === 0) return;

  dom.btnVac.disabled = true;

  const interval = setInterval(() => {
    // MÉTODO ARRAY: pop() dentro de bucle (simulado con interval para visualización)
    if (vaciado.length > 0) {
      vaciado.pop();
      renderVac();
    } else {
      clearInterval(interval);
      dom.btnVac.disabled = false;
    }
  }, 400);

  // Lógica literal (aunque el interval es para el usuario vea el proceso):
  // while(vaciado.length > 0) { vaciado.pop(); }
};

dom.btnReset.onclick = () => {
  animales = [...ANIMALES_DATA];
  compras = [...COMPRAS_DATA];
  vaciado = [...VACIADO_DATA];
  dom.resCom.textContent = "";
  init();
};

const init = () => {
  renderAni();
  renderCom();
  renderVac();
};

window.addEventListener("load", init);
