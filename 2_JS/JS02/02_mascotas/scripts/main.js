// Traigo las funciones de otros archivos para organizar mejor el código
import {
  validatePetText,
  validateAgeWeight,
  validateEmail,
} from "../modules/validations.js";

// Obtengo los elementos del HTML para poder usarlos en JS
const form = document.getElementById("petForm");
const submitBtn = document.getElementById("submitBtn");
const termsCheck = document.getElementById("termsCheck");
const vacunasSelect = document.getElementById("vacunas");
const cantVacunas = document.getElementById("cantidadVacunas");
const listContainer = document.getElementById("petList");

// Array para manejar los registros
let pets = [];

/**
 * Muestra el feedback visual dinámico
 */
const showFeedback = (input, result) => {
  input.classList.toggle("is-valid", result.valid);
  input.classList.toggle("is-invalid", !result.valid);

  let feedback = input.parentElement.querySelector(".invalid-feedback");
  if (!feedback) {
    feedback = document.createElement("div");
    feedback.className = "invalid-feedback";
    input.parentNode.appendChild(feedback);
  }
  feedback.textContent = result.msg || "";
};

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
  const isPetNameValid = validatePetText(form.nombreMascota.value).valid;
  const isRazaValid = validatePetText(form.raza.value).valid;
  const isDuenoValid = validatePetText(form.nombreDueno.value).valid;
  const isEmailValid = validateEmail(form.email.value).valid;
  const isAgeWeightValid = validateAgeWeight(
    form.especie.value,
    form.edad.value,
    form.peso.value,
  ).valid;
  const isTerms = termsCheck.checked;

  submitBtn.disabled = !(
    isPetNameValid &&
    isRazaValid &&
    isDuenoValid &&
    isEmailValid &&
    isAgeWeightValid &&
    isTerms
  );
};

// Reacciono a lo que el usuario tipea
form.addEventListener("input", (e) => {
  const input = e.target;
  let result = { valid: true, msg: "" };

  // Valido la entrada del usuario según el ID
  if (
    input.id === "nombreMascota" ||
    input.id === "raza" ||
    input.id === "nombreDueno"
  ) {
    result = validatePetText(input.value);
  } else if (input.id === "email") {
    result = validateEmail(input.value);
  } else if (
    input.id === "edad" ||
    input.id === "peso" ||
    input.id === "especie"
  ) {
    // Chequeo que los datos ingresados sean correctos para edad y peso
    result = validateAgeWeight(
      form.especie.value,
      form.edad.value,
      form.peso.value,
    );

    // Si cambiamos especie, actualizamos feedback de edad y peso
    if (input.id === "especie") {
      showFeedback(
        document.getElementById("edad"),
        result.field === "edad" ? result : { valid: true },
      );
      showFeedback(
        document.getElementById("peso"),
        result.field === "peso" ? result : { valid: true },
      );
      validateForm();
      return;
    }

    // Si el error es de un campo específico que no es el actual, no lo mostramos aquí
    if (!result.valid && result.field && result.field !== input.id) {
      result = { valid: true };
    }
  }

  if (input.tagName === "INPUT" && input.type !== "checkbox") {
    showFeedback(input, result);
  }

  validateForm();
});

// Esta parte se encarga de las validaciones
termsCheck.addEventListener("change", validateForm);

// Escucho el submit del formulario
form.addEventListener("submit", (e) => {
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
  pets.push(newPet);

  renderPets();
  form.reset();

  Array.from(form.elements).forEach((el) => {
    el.classList.remove("is-valid", "is-invalid");
  });

  alert("¡Mascota registrada correctamente!");
  validateForm();
});

// Función para dibujar las mascotas en el HTML
const renderPets = () => {
  // Limpio y dibujo el contenido nuevo en el HTML
  listContainer.innerHTML = "";

  if (pets.length === 0) {
    listContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted">No hay mascotas registradas aún.</p>
            </div>
        `;
    return;
  }

  // Recorro la lista de elementos para mostrarlos
  pets.forEach((pet, index) => {
    const col = document.createElement("div");
    col.className = "col-md-4 mb-4";
    col.innerHTML = `
            <div class="card h-100 p-3 shadow-sm border-0 rounded-3">
                <div class="d-flex align-items-center mb-2">
                    <span class="fs-4 me-2">🐾</span>
                    <h3 class="h5 mb-0">${pet.nombre}</h3>
                </div>
                <div class="mb-3">
                    <p class="small text-muted mb-1"><strong>Especie:</strong> ${pet.especie} (${pet.raza})</p>
                    <p class="small text-muted mb-1"><strong>Edad/Peso:</strong> ${pet.edad} años / ${pet.peso}kg</p>
                    <p class="small text-muted mb-0"><strong>Dueño:</strong> ${pet.dueno}</p>
                </div>
                <button class="btn btn-outline-danger btn-sm mt-auto w-100 py-2 fw-bold btn-delete" 
                        style="border-radius: 12px; border-width: 2px;">
                    ELIMINAR REGISTRO
                </button>
            </div>
        `;

    // Evento para eliminar mascota
    col.querySelector(".btn-delete").addEventListener("click", () => {
      if (confirm(`¿Eliminar a ${pet.nombre}?`)) {
        pets.splice(index, 1);
        renderPets();
      }
    });

    listContainer.appendChild(col);
  });
};
