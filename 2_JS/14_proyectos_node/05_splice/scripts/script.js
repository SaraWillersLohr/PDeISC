// proyecto 05_splice

// los datos
const INICIAL_LETRAS = ["A", "B", "C", "D", "E", "F"];
const INICIAL_NOMBRES = ["Juan", "María", "Pedro"];
const INICIAL_REEMPLAZO = ["Item 1", "Item 2", "Item 3", "Item 4"];

// las variables
let letras = [...INICIAL_LETRAS];
let nombres = [...INICIAL_NOMBRES];
let reemplazo = [...INICIAL_REEMPLAZO];

// el html
const dom = {
  // Ejercicio 1
  listaLet: document.getElementById("listaLet"),
  btnLet: document.getElementById("btnLet"),

  // Ejercicio 2
  listaNom: document.getElementById("listaNom"),
  inputNom: document.getElementById("inputNom"),
  btnNom: document.getElementById("btnNom"),

  // Ejercicio 3
  listaRep: document.getElementById("listaRep"),
  btnRep: document.getElementById("btnRep"),

  // Global
  btnReset: document.getElementById("btnReset"),
};

// dibujar en pantalla

const renderArray = (arr, elementId, isGrid = false) => {
  const container = dom[elementId];
  container.innerHTML = arr
    .map(
      (item, idx) => `
        <span class="array-item animate__animated animate__zoomIn ${isGrid ? "grid-item" : ""}">
            <small class="idx">${idx}</small>
            ${item}
        </span>
    `,
    )
    .join("");
};

const updateUI = () => {
  renderArray(letras, "listaLet", true);
  renderArray(nombres, "listaNom");
  renderArray(reemplazo, "listaRep");
};

// --- LÓGICA DE EJERCICIOS ---

// 1. Elimina dos elementos desde la posición 1 de un array de letras
dom.btnLet.onclick = () => {
  if (letras.length > 1) {
    // MÉTODO ARRAY: splice(inicio, cantidad) - Ejercicio 1
    letras.splice(1, 2);
    updateUI();
    dom.btnLet.disabled = true; // Deshabilitar después de la operación literal
  }
};

// 2. Inserta un nuevo nombre en la segunda posición sin eliminar nada
dom.btnNom.onclick = () => {
  const val = dom.inputNom.value.trim();
  if (!val) return;

  // MÉTODO ARRAY: splice(inicio, 0, nuevoItem) - Ejercicio 2
  nombres.splice(1, 0, val);

  dom.inputNom.value = "";
  updateUI();
};

// 3. Reemplaza dos elementos por otros nuevos desde una posición determinada
dom.btnRep.onclick = () => {
  if (reemplazo.length > 2) {
    // MÉTODO ARRAY: splice(inicio, cantidad, item1, item2) - Ejercicio 3
    reemplazo.splice(1, 2, "🚀 NUEVO", "✨ NUEVO");
    updateUI();
    dom.btnRep.disabled = true; // Deshabilitar después de la operación literal
  }
};

// resetear

dom.btnReset.onclick = () => {
  letras = [...INICIAL_LETRAS];
  nombres = [...INICIAL_NOMBRES];
  reemplazo = [...INICIAL_REEMPLAZO];

  dom.btnLet.disabled = false;
  dom.btnRep.disabled = false;
  dom.inputNom.value = "";

  updateUI();
};

// inicio
window.addEventListener("DOMContentLoaded", updateUI);

