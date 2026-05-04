// proyecto 07_indexof

// los datos
const INICIAL_ANIMALES = ["gato", "perro", "pájaro", "conejo"];
const INICIAL_NUMEROS = [10, 25, 50, 75, 100];
const INICIAL_CIUDADES = ["Londres", "París", "Roma", "Madrid", "Berlín"];

// las variables
let animales = [...INICIAL_ANIMALES];
let numeros = [...INICIAL_NUMEROS];
let ciudades = [...INICIAL_CIUDADES];

// el html
const dom = {
  // Ejercicio 1
  displayOriginal1: document.getElementById("displayOriginal1"),
  btnSearchPerro: document.getElementById("btnSearchPerro"),
  resPerro: document.getElementById("resPerro"),

  // Ejercicio 2
  displayOriginal2: document.getElementById("displayOriginal2"),
  btnSearch50: document.getElementById("btnSearch50"),
  res50: document.getElementById("res50"),

  // Ejercicio 3
  displayOriginal3: document.getElementById("displayOriginal3"),
  btnSearchMadrid: document.getElementById("btnSearchMadrid"),
  resMadrid: document.getElementById("resMadrid"),

  // Global
  btnReset: document.getElementById("btnReset"),
};

// dibujar en pantalla

const renderArray = (arr, elementId) => {
  const container = dom[elementId];
  container.innerHTML = arr
    .map(
      (item, idx) => `
        <span class="array-item animate__animated animate__fadeIn" id="${elementId}-item-${idx}">
            ${item}
        </span>
    `,
    )
    .join("");
};

const updateUI = () => {
  renderArray(animales, "displayOriginal1");
  renderArray(numeros, "displayOriginal2");
  renderArray(ciudades, "displayOriginal3");
};

const highlightItem = (elementId, index, type) => {
  // Limpiar otros highlights del mismo contenedor
  const container = dom[elementId];
  container.querySelectorAll(".array-item").forEach((el) => {
    el.style.border = "1px solid rgba(0,0,0,0.05)";
    el.style.backgroundColor = "white";
  });

  if (index !== -1) {
    const item = document.getElementById(`${elementId}-item-${index}`);
    if (item) {
      item.style.borderColor = `var(--${type})`;
      item.style.backgroundColor = `var(--${type}-soft)`;
      item.classList.add("animate__animated", "animate__pulse");
    }
  }
};

// --- LÓGICA DE EJERCICIOS ---

// 1. Encuentra la posición de la palabra "perro" en un array
dom.btnSearchPerro.onclick = () => {
  // MÉTODO ARRAY: indexOf() - Ejercicio 1
  const idx = animales.indexOf("perro");

  highlightItem("displayOriginal1", idx, "primary");

  dom.resPerro.className =
    "feedback-box mt-3 feedback-success animate__animated animate__fadeIn";
  dom.resPerro.innerHTML = `<i class="fas fa-search me-2"></i>"perro" encontrado en el índice: <strong>${idx}</strong>`;

  dom.btnSearchPerro.disabled = true;
};

// 2. Verifica si el número 50 está en un array y en qué posición
dom.btnSearch50.onclick = () => {
  // MÉTODO ARRAY: indexOf() - Ejercicio 2
  const idx = numeros.indexOf(50);

  highlightItem("displayOriginal2", idx, "success");

  if (idx !== -1) {
    dom.res50.className =
      "feedback-box mt-3 feedback-success animate__animated animate__fadeIn";
    dom.res50.innerHTML = `<i class="fas fa-check-circle me-2"></i>El 50 existe en la posición: <strong>${idx}</strong>`;
  } else {
    dom.res50.className =
      "feedback-box mt-3 feedback-danger animate__animated animate__fadeIn";
    dom.res50.textContent = "El número 50 no está en el array.";
  }

  dom.btnSearch50.disabled = true;
};

// 3. Dado un array de ciudades, muestra el índice de "Madrid" o un mensaje si no está
dom.btnSearchMadrid.onclick = () => {
  // MÉTODO ARRAY: indexOf() - Ejercicio 3
  const idx = ciudades.indexOf("Madrid");

  highlightItem("displayOriginal3", idx, "warning");

  if (idx !== -1) {
    dom.resMadrid.className =
      "feedback-box mt-3 feedback-success animate__animated animate__fadeIn";
    dom.resMadrid.innerHTML = `<i class="fas fa-map-pin me-2"></i>Madrid se encuentra en el índice: <strong>${idx}</strong>`;
  } else {
    dom.resMadrid.className =
      "feedback-box mt-3 feedback-danger animate__animated animate__fadeIn";
    dom.resMadrid.textContent = "Madrid no se encuentra en la lista.";
  }

  dom.btnSearchMadrid.disabled = true;
};

// resetear

dom.btnReset.onclick = () => {
  animales = [...INICIAL_ANIMALES];
  numeros = [...INICIAL_NUMEROS];
  ciudades = [...INICIAL_CIUDADES];

  // Limpiar feedbacks
  [dom.resPerro, dom.res50, dom.resMadrid].forEach((el) => {
    el.className = "feedback-box mt-3 feedback-waiting";
    el.textContent = "Esperando...";
  });

  // Habilitar botones
  [dom.btnSearchPerro, dom.btnSearch50, dom.btnSearchMadrid].forEach(
    (btn) => (btn.disabled = false),
  );

  updateUI();
};

// inicio
window.addEventListener("DOMContentLoaded", updateUI);

