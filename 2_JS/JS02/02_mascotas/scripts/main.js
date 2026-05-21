import {
  validarNombre,
  validarEmail,
  validarTelefono,
  validarEdad,
  validarMesa,
  validarAcompanantes,
  validarNotas,
} from "../modules/validations.js";
import { METODOS_ARRAY, renderizarEstadoArray } from "../modules/arrayStorage.js";
import { dibujarInvitados } from "../modules/render.js";
import { initTheme } from "../modules/theme.js";
import { EventConsole } from "../modules/eventConsole.js";
import { mostrarToast } from "../modules/toast.js";
import { mostrarFeedback, limpiarFeedbackFormulario } from "../modules/feedback.js";

const formulario = document.getElementById("guestForm");
const botonEnviar = document.getElementById("submitBtn");
const checkTerminos = document.getElementById("termsCheck");
const contenedorLista = document.getElementById("guestList");
const visorArray = document.getElementById("arrayViewer");
const selectMetodo = document.getElementById("metodoArray");

const consola = new EventConsole("eventConsole");
initTheme();

let listaInvitados = [];

const borrarInvitado = (indice) => {
  listaInvitados.splice(indice, 1);
  dibujarInvitados(listaInvitados, contenedorLista, borrarInvitado, consola);
  renderizarEstadoArray(visorArray, listaInvitados, {
    metodo: "splice()",
    detalle: `Se eliminó el índice ${indice}`,
  });
  mostrarToast("toastZone", "Invitado eliminado del array", "success");
};

const validarTodo = () => {
  const ok =
    validarNombre(formulario.nombre.value).valido &&
    validarNombre(formulario.apellido.value).valido &&
    validarEmail(formulario.email.value).valido &&
    validarTelefono(formulario.telefono.value).valido &&
    validarEdad(formulario.edad.value).valido &&
    validarMesa(formulario.mesa.value).valido &&
    validarAcompanantes(formulario.acompanantes.value).valido &&
    validarNotas(formulario.notas.value).valido &&
    checkTerminos.checked;

  botonEnviar.disabled = !ok;
  return ok;
};

const mapaValidadores = {
  nombre: validarNombre,
  apellido: validarNombre,
  email: validarEmail,
  telefono: validarTelefono,
  edad: validarEdad,
  mesa: validarMesa,
  acompanantes: validarAcompanantes,
  notas: validarNotas,
};

formulario.addEventListener("input", (e) => {
  const input = e.target;
  const validar = mapaValidadores[input.name];
  if (validar) mostrarFeedback(input, validar(input.value));
  validarTodo();
});

checkTerminos.addEventListener("change", validarTodo);
selectMetodo?.addEventListener("change", () => {
  consola.log(`Método seleccionado: ${selectMetodo.value}`);
});

document.getElementById("clearConsole")?.addEventListener("click", () => consola.limpiar());

formulario.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validarTodo()) {
    mostrarToast("toastZone", "Hay campos inválidos", "error");
    consola.log("Validación fallida: no se guardó en el array");
    return;
  }

  const metodoKey = selectMetodo.value;
  const estrategia = METODOS_ARRAY[metodoKey];
  if (!estrategia) return;

  const invitado = {
    nombre: formulario.nombre.value.trim(),
    apellido: formulario.apellido.value.trim(),
    email: formulario.email.value.trim(),
    telefono: formulario.telefono.value.trim(),
    edad: formulario.edad.value,
    mesa: formulario.mesa.value,
    menu: formulario.menu.value,
    tipoEntrada: formulario.tipoEntrada.value,
    acompanantes: formulario.acompanantes.value,
    notas: formulario.notas.value.trim(),
    metodoGuardado: estrategia.etiqueta,
  };

  const antes = listaInvitados.length;
  const resultado = estrategia.aplicar(listaInvitados, invitado);
  listaInvitados = resultado.lista;

  renderizarEstadoArray(visorArray, listaInvitados, {
    metodo: estrategia.etiqueta,
    detalle: resultado.detalle,
  });
  dibujarInvitados(listaInvitados, contenedorLista, borrarInvitado, consola);

  consola.log(`Array actualizado con ${estrategia.etiqueta} (${antes} → ${listaInvitados.length})`);
  consola.log(`Invitado agregado: ${invitado.nombre} ${invitado.apellido}`);
  mostrarToast("toastZone", `Guardado con ${estrategia.etiqueta}`, "success");

  formulario.reset();
  limpiarFeedbackFormulario(formulario);
  validarTodo();
});

renderizarEstadoArray(visorArray, listaInvitados, {
  metodo: "Estado inicial",
  detalle: "Array vacío — elegí un método y cargá un invitado",
});
consola.log("Proyecto 2 iniciado: arrays en pantalla activos");
dibujarInvitados(listaInvitados, contenedorLista, borrarInvitado, consola);
