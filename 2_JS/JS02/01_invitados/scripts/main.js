// Traigo las funciones de validación en español
import { validarNombreReal, validarEdad } from "../modules/validations.js";
import { dibujarInvitados } from "../modules/render.js";

// Obtengo los elementos del HTML
const formulario = document.getElementById("guestForm");
const botonEnviar = document.getElementById("submitBtn");
const checkTerminos = document.getElementById("termsCheck");
const contenedorLista = document.getElementById("guestList");

// Array para manejar la lista de invitados
let listaInvitados = [];

/**
 * Función para eliminar un invitado y actualizar la vista
 */
const borrarInvitado = (indice) => {
  listaInvitados.splice(indice, 1);
  dibujarInvitados(listaInvitados, contenedorLista, borrarInvitado);
};

/**
 * Muestra el feedback visual (verde/rojo) en los campos
 */
const mostrarFeedback = (input, resultado) => {
  input.classList.toggle("is-valid", resultado.valido);
  input.classList.toggle("is-invalid", !resultado.valido);

  const mensajeError = input.parentElement.querySelector(".invalid-feedback");
  if (mensajeError) {
    mensajeError.textContent = resultado.mensaje || "";
  }
};

/**
 * Valida si el formulario completo es correcto
 */
const validarFormulario = () => {
  const nombreValido = validarNombreReal(formulario.nombre.value).valido;
  const apellidoValido = validarNombreReal(formulario.apellido.value).valido;
  const edadValida = validarEdad(formulario.edad.value, 18, 99).valido;
  const terminosAceptados = checkTerminos.checked;

  botonEnviar.disabled = !(nombreValido && apellidoValido && edadValida && terminosAceptados);
};

// Validaciones dinámicas mientras se escribe
formulario.addEventListener("input", (e) => {
  const input = e.target;
  let resultado = { valido: true, mensaje: "" };

  if (input.name === "nombre" || input.name === "apellido") {
    resultado = validarNombreReal(input.value);
  } else if (input.name === "edad") {
    resultado = validarEdad(input.value, 18, 99);
  }

  if (input.tagName === "INPUT" && input.type !== "checkbox") {
    mostrarFeedback(input, resultado);
  }

  validarFormulario();
});

checkTerminos.addEventListener("change", validarFormulario);

// Manejo del envío del formulario
formulario.addEventListener("submit", (e) => {
  e.preventDefault();

  // DEMOSTRACIÓN DE LAS 3 FORMAS DE LEER FORMULARIOS (Consigna 1)
  
  // Forma 1: FormData (Objeto)
  const datos = new FormData(formulario);
  const nombre = datos.get("nombre");

  // Forma 2: Acceso directo por name (Propiedad)
  const apellido = formulario.apellido.value;

  // Forma 3: Por nombre de elemento (DOM Clásico)
  const edad = document.getElementsByName("edad")[0].value;

  const nuevoInvitado = {
    nombre: nombre,
    apellido: apellido,
    edad: edad,
    tipoEntrada: formulario.tipoEntrada.value,
    acompanantes: formulario.acompanantes.value,
  };

  listaInvitados.push(nuevoInvitado);
  dibujarInvitados(listaInvitados, contenedorLista, borrarInvitado);
  
  formulario.reset();

  // Limpiar estilos visuales
  Array.from(formulario.elements).forEach((el) => {
    el.classList.remove("is-valid", "is-invalid");
  });

  validarFormulario();
});
