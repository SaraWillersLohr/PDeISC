// Yo importo todas las funciones y clases que necesito de los módulos
import {
  validarNombre,
  validarEmail,
  validarTelefono,
  validarEdad,
  validarMesa,
  validarAcompanantes,
  validarNotas,
} from "../modules/validations.js";
import {
  METODOS_ARRAY,
  renderizarEstadoArray,
} from "../modules/arrayStorage.js";
import { dibujarInvitados } from "../modules/render.js";
import { initTheme } from "../modules/theme.js";
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
const visorArray = document.getElementById("arrayViewer");
const selectMetodo = document.getElementById("metodoArray");

initTheme();

// Yo mantengo la lista de invitados en memoria
let listaInvitados = [];

// Yo creo la función para borrar un invitado del array
const borrarInvitado = (indice) => {
  listaInvitados.splice(indice, 1);
  dibujarInvitados(listaInvitados, contenedorLista, borrarInvitado);
  renderizarEstadoArray(visorArray, listaInvitados, {
    metodo: "splice()",
    detalle: `Se eliminó el índice ${indice}`,
  });
  mostrarToast("toastZone", "Invitado eliminado del array", "success");
};

// Yo creo la función que valida todo el formulario completo
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

// Yo creo un mapa de validadores para cada campo del formulario
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

// Yo agrego el evento input para validar cada campo mientras el usuario escribe
formulario.addEventListener("input", (e) => {
  const input = e.target;
  const validar = mapaValidadores[input.name];
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
  if (validar) mostrarFeedback(input, validar(input.value));
  validarTodo();
});

// Yo agrego el evento change al checkbox de términos para validar el formulario
checkTerminos.addEventListener("change", validarTodo);

// Yo manejo el envío del formulario para agregar un nuevo invitado al array
formulario.addEventListener("submit", (e) => {
  e.preventDefault();
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
  if (!validarTodo()) {
    mostrarToast("toastZone", "Hay campos inválidos", "error");
    return;
  }

  // Yo obtengo el método seleccionado y la estrategia correspondiente
  const metodoKey = selectMetodo.value;
  const estrategia = METODOS_ARRAY[metodoKey];
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
  if (!estrategia) return;

  // Yo creo el objeto con los datos del nuevo invitado
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

  // Yo aplico el método seleccionado para agregar al array
  const resultado = estrategia.aplicar(listaInvitados, invitado);
  listaInvitados = resultado.lista;

  // Yo renderizo el estado del array y la lista de invitados
  renderizarEstadoArray(visorArray, listaInvitados, {
    metodo: estrategia.etiqueta,
    detalle: resultado.detalle,
  });
  dibujarInvitados(listaInvitados, contenedorLista, borrarInvitado);

  mostrarToast("toastZone", `Guardado con ${estrategia.etiqueta}`, "success");

  // Yo limpio el formulario y el feedback visual
  formulario.reset();
  limpiarFeedbackFormulario(formulario);
  validarTodo();
});

// Yo inicio la aplicación mostrando el estado inicial del array
renderizarEstadoArray(visorArray, listaInvitados, {
  metodo: "Estado inicial",
  detalle: "Array vacío — elegí un método y cargá un invitado",
});
dibujarInvitados(listaInvitados, contenedorLista, borrarInvitado);
