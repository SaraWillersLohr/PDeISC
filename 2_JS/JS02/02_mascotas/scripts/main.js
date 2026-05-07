// Traigo las funciones de otros archivos para organizar mejor el código
import { validatePetText, validateAgeWeight } from "../modules/validations.js";

// Obtengo los elementos del HTML para poder usarlos en JS
const form = document.getElementById("petForm");
// Busco el elemento en el DOM
const submitBtn = document.getElementById("submitBtn");
// Busco el elemento en el HTML para usarlo en JS
const termsCheck = document.getElementById("termsCheck");
// Busco el elemento en el DOM
const vacunasSelect = document.getElementById("vacunas");
const cantVacunas = document.getElementById("cantidadVacunas");
const listContainer = document.getElementById("petList");

/**
 * Muestra el feedback visual dinámico
 */
const showFeedback = (input, result) => {
  // Cambio las clases de Bootstrap para mostrar si es válido o no
  input.classList.toggle("is-valid", result.valid);
  // Cambio la clase para mostrar/ocultar
  input.classList.toggle("is-invalid", !result.valid);

  let feedback = input.nextElementSibling;
  if (!feedback || !feedback.classList.contains("invalid-feedback")) {
    feedback = document.createElement("div");
    feedback.className = "invalid-feedback";
    input.parentNode.appendChild(feedback);
  }
  feedback.textContent = result.msg || "";
};

// Control de habilitación del campo de cantidad de vacunas
// Reacciono al click del usuario
vacunasSelect.addEventListener("change", () => {
  cantVacunas.disabled = vacunasSelect.value === "no";
  if (cantVacunas.disabled) {
    cantVacunas.value = "";
    cantVacunas.classList.remove("is-valid", "is-invalid");
  }
});

// Esta función chequea que todo esté bien antes de habilitar el botón
const validateForm = () => {
  // Chequeo que los datos estén bien
  const isNameValid = validatePetText(form.nombreMascota.value).valid;
  // Chequeo que los datos ingresados sean correctos
  const isRazaValid = validatePetText(form.raza.value).valid;
  // Chequeo que los datos estén bien
  const isAgeWeightValid = validateAgeWeight(
    form.especie.value,
    form.edad.value,
    form.peso.value,
  ).valid;
  const isTerms = termsCheck.checked;

  submitBtn.disabled = !(
    isNameValid &&
    isRazaValid &&
    isAgeWeightValid &&
    isTerms
  );
};

// Escucho lo que entra por el input
// Reacciono a lo que el usuario tipea
form.addEventListener("input", (e) => {
  const input = e.target;
  let result = { valid: true, msg: "" };

  // Valido la entrada del usuario
  if (input.id === "nombreMascota" || input.id === "raza") {
    result = validatePetText(input.value);
  } else if (input.id === "edad" || input.id === "peso") {
    // Chequeo que los datos ingresados sean correctos
    result = validateAgeWeight(
      form.especie.value,
      form.edad.value,
      form.peso.value,
    );
    // Si el error es de un campo específico, solo mostramos en ese
    if (!result.valid && result.field && result.field !== input.id) {
      result = { valid: true }; // No marcamos error en el campo actual si no le corresponde
    }
  }

  if (input.tagName === "INPUT" && input.type !== "checkbox") {
    showFeedback(input, result);
  }

  // Valido la entrada del usuario
  validateForm();
});

// Valido la entrada del usuario
// Esta parte se encarga de las validaciones
termsCheck.addEventListener("change", validateForm);

// Array para manejar los registros
let pets = [];

// Manejo el envío del formulario
// Escucho el submit del formulario
form.addEventListener("submit", (e) => {
  // Evito que se recargue la página sola
  e.preventDefault();

  const newPet = {
    id: Date.now(),
    nombre: form.nombreMascota.value,
    especie: form.especie.value,
    raza: form.raza.value,
    edad: form.edad.value,
    peso: form.peso.value,
    dueno: form.nombreDueno.value,
    email: form.email.value,
    vacunas: form.vacunas.value,
  };

  // DEMOSTRACIÓN DE DIFERENTES MÉTODOS DE ALMACENAJE EN ARRAY (Consigna 2)

  // Método 1: .push() - Agrega al final (el más común)
  pets.push(newPet);

  // Método 2: .unshift() - Agregaría al principio (si quisiéramos)
  // pets.unshift(newPet);

  // Método 3: Asignación por índice (menos común pero válido)
  // pets[pets.length] = newPet;

  // Renderizo las cards recorriendo el array actualizado
  renderPets();

  // Reseteo el formulario después de guardar
  form.reset();

  // Limpio las clases de validación
  Array.from(form.elements).forEach((el) => {
    el.classList.remove("is-valid", "is-invalid");
  });

  // Esta parte se encarga de las validaciones
  validateForm();
});

// Función para dibujar las mascotas en el HTML
const renderPets = () => {
  // Limpio y dibujo el contenido nuevo en el HTML
  listContainer.innerHTML = "";

  // Recorro la lista de elementos para mostrarlos
  pets.forEach((pet) => {
    const petCard = `
            <div class="col-md-4">
                <div class="card p-3 shadow-sm border-0 rounded-3 h-100">
                    <div class="d-flex align-items-center mb-2">
                        <span class="fs-4 me-2">🐾</span>
                        <h3 class="h5 mb-0">${pet.nombre}</h3>
                    </div>
                    <p class="small text-muted mb-1"><strong>Especie:</strong> ${pet.especie}</p>
                    <p class="small text-muted mb-1"><strong>Raza:</strong> ${pet.raza}</p>
                    <p class="small text-muted mb-0"><strong>Dueño:</strong> ${pet.dueno}</p>
                </div>
            </div>
        `;
    // Agrego una nueva card al contenedor
    listContainer.innerHTML += petCard;
  });
};
