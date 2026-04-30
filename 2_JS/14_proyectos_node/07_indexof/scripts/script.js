/**
 * Proyecto: 07 - indexOf() "Localización Maestra" (Versión Académica)
 * Objetivo: Demostrar indexOf() en 2 contextos independientes.
 */

const DATA_LOC = [
  "Perro",
  "Gato",
  "Madrid",
  "Pizza",
  "Sushi",
  "JS",
  "Python",
  "100",
];
const DATA_DUP = ["🍎", "🍌", "🍎", "🍇", "🍌", "🍎"];

// --- ESTADOS ---
let localizador = [...DATA_LOC];
let duplicados = [...DATA_DUP];

// --- DOM ---
const dom = {
  inputLoc: document.getElementById("inputLoc"),
  listaLoc: document.getElementById("listaLoc"),
  resLoc: document.getElementById("resLoc"),
  contLoc: document.getElementById("contLoc"),
  listaDup: document.getElementById("listaDup"),
  resDup: document.getElementById("resDup"),
  contDup: document.getElementById("contDup"),
  btnReset: document.getElementById("btnReset"),
};

// --- RENDERERS ---

const renderLoc = () => {
  dom.listaLoc.innerHTML = localizador
    .map(
      (it) => `
    <div class="item-chip">${it}</div>
  `,
    )
    .join("");
  dom.contLoc.textContent = `${localizador.length} ITEMS`;
};

const renderDup = () => {
  dom.listaDup.innerHTML = duplicados
    .map(
      (it, i) => `
    <div class="item-chip clickable-chip" onclick="window.checkDup(${i})">${it}</div>
  `,
    )
    .join("");
  dom.contDup.textContent = `${duplicados.length} ITEMS`;
};

// --- LÓGICA ---

dom.inputLoc.addEventListener("input", (e) => {
  const val = e.target.value.trim();
  const chips = dom.listaLoc.querySelectorAll(".item-chip");
  chips.forEach((c) => c.classList.remove("highlight"));

  if (!val) {
    dom.resLoc.classList.add("d-none");
    return;
  }

  // MÉTODO ARRAY: indexOf() - Ejercicio 1
  const idx = localizador.indexOf(val);

  dom.resLoc.classList.remove("d-none");
  if (idx !== -1) {
    chips[idx].classList.add("highlight");
    dom.resLoc.innerHTML = `Encontrado en índice: <span class="badge-premium">${idx}</span>`;
    dom.resLoc.style.borderColor = "var(--primary)";
  } else {
    dom.resLoc.innerHTML = `No encontrado en el array.`;
    dom.resLoc.style.borderColor = "var(--danger)";
  }
});

window.checkDup = (i) => {
  const val = duplicados[i];
  // MÉTODO ARRAY: indexOf() vs lastIndexOf() - Ejercicio 2
  const first = duplicados.indexOf(val);
  const last = duplicados.lastIndexOf(val);

  if (first !== last) {
    dom.resDup.innerHTML = `"${val}" es DUPLICADO. <br><small>Primero: ${first} | Último: ${last}</small>`;
    dom.resDup.className =
      "p-3 bg-warning bg-opacity-10 rounded-4 text-center fw-bold text-warning animate__animated animate__pulse";
  } else {
    dom.resDup.innerHTML = `"${val}" es ÚNICO. <br><small>Índice: ${first}</small>`;
    dom.resDup.className =
      "p-3 bg-success bg-opacity-10 rounded-4 text-center fw-bold text-success";
  }
};

dom.btnReset.onclick = () => {
  dom.inputLoc.value = "";
  dom.resLoc.classList.add("d-none");
  dom.resDup.textContent = "Haz clic en un elemento";
  dom.resDup.className =
    "p-3 bg-light rounded-4 text-center fw-bold text-success";
  renderLoc();
  renderDup();
};

// Init
window.addEventListener("load", () => {
  renderLoc();
  renderDup();
});
