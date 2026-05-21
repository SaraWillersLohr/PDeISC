import { validarNombreReal, validarEdad, validarEmail, validarAcompanantes } from "../modules/validations.js";
import { dibujarInvitados } from "../modules/render.js";
import {
  leerConGetElementById,
  leerConQuerySelector,
  leerConFormData,
  renderizarLecturaMetodos,
} from "../modules/formReaders.js";
import { initTheme } from "../modules/theme.js";
import { EventConsole } from "../modules/eventConsole.js";
import { mostrarToast } from "../modules/toast.js";
import { mostrarFeedback, limpiarFeedbackFormulario } from "../modules/feedback.js";

const formulario = document.getElementById("guestForm");
const botonEnviar = document.getElementById("submitBtn");
const checkTerminos = document.getElementById("termsCheck");
const contenedorLista = document.getElementById("guestList");
const panelMetodos = document.getElementById("methodsPanel");

const consola = new EventConsole("eventConsole");
initTheme();

let listaInvitados = [];

const borrarInvitado = (indice) => {
  listaInvitados.splice(indice, 1);
  dibujarInvitados(listaInvitados, contenedorLista, borrarInvitado, consola);
  mostrarToast("toastZone", "Invitado eliminado del listado", "success");
};

const validarFormulario = () => {
  const ok =
    validarNombreReal(formulario.nombre.value).valido &&
    validarNombreReal(formulario.apellido.value).valido &&
    validarEdad(formulario.edad.value).valido &&
    validarEmail(formulario.email.value).valido &&
    validarAcompanantes(formulario.acompanantes.value).valido &&
    checkTerminos.checked;

  botonEnviar.disabled = !ok;
  return ok;
};

formulario.addEventListener("input", (e) => {
  const input = e.target;
  if (input.type === "checkbox") return;

  let resultado = { valido: true, mensaje: "" };
  if (input.name === "nombre" || input.name === "apellido") resultado = validarNombreReal(input.value);
  else if (input.name === "edad") resultado = validarEdad(input.value);
  else if (input.name === "email") resultado = validarEmail(input.value);
  else if (input.name === "acompanantes") resultado = validarAcompanantes(input.value);

  mostrarFeedback(input, resultado);
  validarFormulario();
});

checkTerminos.addEventListener("change", () => {
  validarFormulario();
  consola.log(checkTerminos.checked ? "Términos aceptados" : "Términos desmarcados");
});

document.getElementById("clearConsole")?.addEventListener("click", () => consola.limpiar());

formulario.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validarFormulario()) {
    mostrarToast("toastZone", "Revisá los campos antes de confirmar", "error");
    consola.log("Validación fallida: formulario incompleto");
    return;
  }

  // las 3 formas pedidas en la consigna
  const lecturaId = leerConGetElementById(formulario);
  const lecturaQuery = leerConQuerySelector(formulario);
  const lecturaFormData = leerConFormData(formulario);

  renderizarLecturaMetodos(panelMetodos, [
    lecturaId,
    lecturaQuery,
    { metodo: lecturaFormData.metodo, campo: "edad, email, entrada, acompañantes", valores: lecturaFormData.valores },
  ]);

  const nuevoInvitado = {
    nombre: lecturaId.valor,
    apellido: lecturaQuery.valor,
    edad: lecturaFormData.valores.edad,
    email: lecturaFormData.valores.email,
    tipoEntrada: lecturaFormData.valores.tipoEntrada,
    acompanantes: lecturaFormData.valores.acompanantes,
    metodosUsados: "getElementById + querySelector + FormData",
  };

  listaInvitados.push(nuevoInvitado);
  dibujarInvitados(listaInvitados, contenedorLista, borrarInvitado, consola);

  consola.log(`Usuario agregado: ${nuevoInvitado.nombre} ${nuevoInvitado.apellido}`);
  consola.log("Lectura con getElementById, querySelector y FormData completada");
  mostrarToast("toastZone", "Invitado confirmado sin recargar la página", "success");

  formulario.reset();
  limpiarFeedbackFormulario(formulario);
  validarFormulario();
});

consola.log("App iniciada: modo dinámico activo");
dibujarInvitados(listaInvitados, contenedorLista, borrarInvitado, consola);
