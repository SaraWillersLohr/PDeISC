// Traigo las funciones de otros archivos para organizar mejor el código
import { validateRealName, validateAge } from "../modules/validations.js";
// Traigo lo necesario de otros JS
import { renderGuests } from "../modules/render.js";

// Obtengo los elementos del HTML para poder usarlos en JS
const form = document.getElementById("guestForm");
// Referencia al elemento del HTML
const submitBtn = document.getElementById("submitBtn");
// Obtengo el elemento principal por su ID
const termsCheck = document.getElementById("termsCheck");
// Referencia al elemento del HTML
const listContainer = document.getElementById("guestList");

/**
 * Lógica centralizada para mostrar feedback visual instantáneo
 */
const showFeedback = (input, result) => {
  // Cambio las clases de Bootstrap para mostrar si es válido o no
  input.classList.toggle("is-valid", result.valid);
  // Alterno la clase de Bootstrap
  input.classList.toggle("is-invalid", !result.valid);

  // Busco el mensaje debajo del input
  const feedback = input.parentElement.querySelector(".invalid-feedback");
  if (feedback) {
    feedback.textContent = result.msg || "";
    // Transición suave manual (Bootstrap ya tiene algunas por defecto)
    feedback.style.opacity = result.valid ? "0" : "1";
  }
};

// Esta función chequea que todo esté bien antes de habilitar el botón
const validateForm = () => {
  // Chequeo que los datos estén bien
  const isName = validateRealName(form.nombre.value).valid;
  // Esta función valida que el nombre sea real
  const isSurname = validateRealName(form.apellido.value).valid;
  // Chequeo que los datos estén bien
  const isAge = validateAge(form.edad.value, 18, 99).valid;
  const isTerms = termsCheck.checked;

  submitBtn.disabled = !(isName && isSurname && isAge && isTerms);
};

// Valido mientras el usuario escribe
form.addEventListener("input", (e) => {
  const input = e.target;
  let result = { valid: true, msg: "" };

  // Validaciones dinámicas por campo
  if (input.name === "nombre" || input.name === "apellido") {
    // Valido la información del usuario
    result = validateRealName(input.value);
  } else if (input.name === "edad") {
    // Chequeo que los datos ingresados sean correctos
    result = validateAge(input.value, 18, 99);
  }

  if (input.tagName === "INPUT" && input.type !== "checkbox") {
    showFeedback(input, result);
  }

  // Chequeo que los datos estén bien
  validateForm();
});

// Detectar el cambio en el checkbox de términos
// Esta parte se encarga de las validaciones
termsCheck.addEventListener("change", validateForm);

// Manejo el envío del formulario
// Escucho el submit del formulario
form.addEventListener("submit", (e) => {
  // Evito que se recargue la página sola
  e.preventDefault();

  // DEMOSTRACIÓN DE LAS 3 FORMAS DE LEER FORMULARIOS EN JS (Consigna 1)
// formdata sirve para leer los datos del formulario en forma de objeto
  // Forma 1: Usando FormData (muy moderna y cómoda para muchos campos)
  const formData = new FormData(form);
  const nombre = formData.get("nombre");

  // Forma 2: Acceso directo por name o id desde el formulario
  const apellido = form.apellido.value;
  //form directo sirve para leer los datos del formulario en forma de cadena
  // Forma 3: Usando document.getElementById (la clásica)
  const edad = document.getElementsByName("edad")[0].value;

  // El resto de los datos los saco normal
  const tipoEntrada = form.tipoEntrada.value;
  const acompanantes = form.acompanantes.value;

  const newGuest = {
    nombre: nombre,
    apellido: apellido,
    edad: edad,
    tipoEntrada: tipoEntrada,
    acompanantes: acompanantes,
  };

  // Renderizo nuevamente las cards
  renderGuests([newGuest], listContainer);

  // Reseteo el formulario después de guardar
  form.reset();

  // Limpio las clases de validación
  Array.from(form.elements).forEach((el) => {
    el.classList.remove("is-valid", "is-invalid");
  });

  // Chequeo que los datos estén bien
  validateForm();
});
