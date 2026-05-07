// Traigo las funciones de otros archivos para organizar mejor el código
import { checkGender } from "../modules/genderApi.js";
import {
  validateRealName,
  validateDNI,
  validatePhone,
  validateEmail,
} from "../modules/validations.js";

// Obtengo los elementos del HTML para poder usarlos en JS
const form = document.getElementById("passengerForm");
const submitBtn = document.getElementById("submitBtn");
const termsCheck = document.getElementById("termsCheck");
const genderWarning = document.getElementById("genderWarning");
const listContainer = document.getElementById("passengerList");
const tieneHijosSelect = document.getElementById("tieneHijos");
const cantHijosInput = document.getElementById("cantidadHijos");

// Intento traer los datos del navegador (Consigna 3)
let people = JSON.parse(localStorage.getItem("peopleList")) || [];

/**
 * Muestra el feedback visual dinámico
 */
const showFeedback = (input, result) => {
  input.classList.toggle("is-valid", result.valid);
  input.classList.toggle("is-invalid", !result.valid);

  let feedback = input.nextElementSibling;
  if (!feedback || !feedback.classList.contains("invalid-feedback")) {
    feedback = document.createElement("div");
    feedback.className = "invalid-feedback";
    input.parentNode.appendChild(feedback);
  }
  feedback.textContent = result.msg || "";
};

// Habilitar/Deshabilitar campo de hijos
tieneHijosSelect.addEventListener("change", () => {
  cantHijosInput.disabled = tieneHijosSelect.value === "no";
  if (cantHijosInput.disabled) cantHijosInput.value = "0";
});

// Esta función chequea que todo esté bien antes de habilitar el botón
const validateForm = () => {
  const isNameValid = validateRealName(form.nombre.value).valid;
  const isSurnameValid = validateRealName(form.apellido.value).valid;
  const isDniValid = validateDNI(form.documento.value).valid;
  const isEmailValid = validateEmail(form.email.value).valid;
  const isTerms = termsCheck.checked;

  submitBtn.disabled = !(
    isNameValid &&
    isSurnameValid &&
    isDniValid &&
    isEmailValid &&
    isTerms
  );
};

// Reacciono a lo que el usuario tipea
form.addEventListener("input", async (e) => {
  const input = e.target;
  let result = { valid: true, msg: "" };

  if (
    input.id === "nombre" ||
    input.id === "apellido" ||
    input.id === "nacionalidad"
  ) {
    result = validateRealName(input.value);
  } else if (input.id === "documento") {
    result = validateDNI(input.value);
  } else if (input.id === "telefono") {
    result = validatePhone(input.value);
  } else if (input.id === "email") {
    result = validateEmail(input.value);
  }

  if (
    input.tagName === "INPUT" &&
    input.type !== "checkbox" &&
    input.type !== "date"
  ) {
    showFeedback(input, result);
  }

  // Gender API para el nombre
  if (input.id === "nombre" && input.value.length > 3 && result.valid) {
    const data = await checkGender(input.value);
    if (data && data.gender) {
      genderWarning.classList.toggle("hidden", data.gender === form.sexo.value);
    }
  }

  validateForm();
});

termsCheck.addEventListener("change", validateForm);

// Función para mostrar la lista de nombres almacenados
const renderPeopleList = () => {
  listContainer.innerHTML = "";
  if (people.length === 0) return;

  const title = document.createElement("h4");
  title.className = "col-12 mt-4 mb-3";
  title.textContent = "Personas Registradas (Nombres Completos):";
  listContainer.appendChild(title);

  people.forEach((p, index) => {
    const item = document.createElement("div");
    item.className = "col-md-6 mb-2";
    item.innerHTML = `
            <div class="p-3 bg-white shadow-sm rounded-3 border-start border-primary border-4">
                <strong>${p.nombre} ${p.apellido}</strong> - DNI: ${p.documento}
                <br><small class="text-muted">${p.email} | ${p.nacionalidad}</small>
            </div>
        `;
    listContainer.appendChild(item);
  });
};

// Manejo el envío del formulario
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const newPerson = {
    nombre: form.nombre.value,
    apellido: form.apellido.value,
    edad: form.edad.value,
    fechaNac: form.fechaNac.value,
    sexo: form.sexo.value,
    documento: form.documento.value,
    estadoCivil: form.estadoCivil.value,
    nacionalidad: form.nacionalidad.value,
    telefono: form.telefono.value,
    email: form.email.value,
    hijos: form.tieneHijos.value === "si" ? form.cantidadHijos.value : 0,
  };

  // Guardo el nuevo registro en el array
  people.push(newPerson);

  // Registro los datos en el storage local (Consigna 3)
  localStorage.setItem("peopleList", JSON.stringify(people));

  // Mostrar mensaje de éxito
  alert("¡Persona registrada correctamente en LocalStorage!");

  renderPeopleList();
  form.reset();

  Array.from(form.elements).forEach((el) => {
    el.classList.remove("is-valid", "is-invalid");
  });

  validateForm();
});

// Cargar la lista al iniciar
renderPeopleList();
