// Yo importo todas las funciones y clases que necesito de los módulos
import {
  validarNombreReal,
  validarEdad,
  validarEmail,
  validarAcompanantes,
} from "../modules/validations.js";
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
import {
  mostrarFeedback,
  limpiarFeedbackFormulario,
} from "../modules/feedback.js";

// Yo obtengo todas las referencias a los elementos del DOM que voy a usar
const formulario = document.getElementById("guestForm");
const botonEnviar = document.getElementById("submitBtn");
const checkTerminos = document.getElementById("termsCheck");
const contenedorLista = document.getElementById("guestList");
const panelMetodos = document.getElementById("methodsPanel");

// Yo inicializo la consola de eventos y el tema de la aplicación
const consola = new EventConsole("eventConsole");
initTheme();

// Yo mantengo la lista de invitados en memoria
let listaInvitados = [];

// Yo creo la función para borrar un invitado del listado
const borrarInvitado = (indice) => {
  listaInvitados.splice(indice, 1);
  dibujarInvitados(listaInvitados, contenedorLista, borrarInvitado, consola);
  mostrarToast("toastZone", "Invitado eliminado del listado", "success");
};

// Yo creo la función que valida todo el formulario completo
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

// Yo agrego el evento input para validar cada campo mientras el usuario escribe
formulario.addEventListener("input", (e) => {
  const input = e.target;
  if (input.type === "checkbox") return;

  let resultado = { valido: true, mensaje: "" };
  if (input.name === "nombre" || input.name === "apellido")
    resultado = validarNombreReal(input.value);
  else if (input.name === "edad") resultado = validarEdad(input.value);
  else if (input.name === "email") resultado = validarEmail(input.value);
  else if (input.name === "acompanantes")
    resultado = validarAcompanantes(input.value);

  mostrarFeedback(input, resultado);
  validarFormulario();
});

// Yo agrego el evento change al checkbox de términos para validar el formulario
checkTerminos.addEventListener("change", () => {
  validarFormulario();
  consola.log(
    checkTerminos.checked ? "Términos aceptados" : "Términos desmarcados",
  );
});

// Yo agrego el evento click al botón de limpiar consola
document
  .getElementById("clearConsole")
  ?.addEventListener("click", () => consola.limpiar());

// Yo manejo el envío del formulario para agregar un nuevo invitado
formulario.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validarFormulario()) {
    mostrarToast("toastZone", "Revisá los campos antes de confirmar", "error");
    consola.log("Validación fallida: formulario incompleto");
    return;
  }

  // Yo uso las 3 formas de leer el formulario que pide la consigna
  const lecturaId = leerConGetElementById(formulario);
  const lecturaQuery = leerConQuerySelector(formulario);
  const lecturaFormData = leerConFormData(formulario);

  // Yo renderizo los resultados de los diferentes métodos de lectura
  renderizarLecturaMetodos(panelMetodos, [
    lecturaId,
    lecturaQuery,
    {
      metodo: lecturaFormData.metodo,
      campo: "edad, email, entrada, acompañantes",
      valores: lecturaFormData.valores,
    },
  ]);

  // Yo creo el objeto con los datos del nuevo invitado
  const nuevoInvitado = {
    nombre: lecturaId.valor,
    apellido: lecturaQuery.valor,
    edad: lecturaFormData.valores.edad,
    email: lecturaFormData.valores.email,
    tipoEntrada: lecturaFormData.valores.tipoEntrada,
    acompanantes: lecturaFormData.valores.acompanantes,
    metodosUsados: "getElementById + querySelector + FormData",
  };

  // Yo agrego el invitado a la lista y actualizo la interfaz
  listaInvitados.push(nuevoInvitado);
  dibujarInvitados(listaInvitados, contenedorLista, borrarInvitado, consola);

  consola.log(
    `Usuario agregado: ${nuevoInvitado.nombre} ${nuevoInvitado.apellido}`,
  );
  consola.log(
    "Lectura con getElementById, querySelector y FormData completada",
  );
  mostrarToast(
    "toastZone",
    "Invitado confirmado sin recargar la página",
    "success",
  );

  // Yo limpio el formulario y el feedback visual
  formulario.reset();
  limpiarFeedbackFormulario(formulario);
  validarFormulario();
});

// Yo inicio la aplicación y muestro el estado inicial
consola.log("App iniciada: modo dinámico activo");
dibujarInvitados(listaInvitados, contenedorLista, borrarInvitado, consola);
