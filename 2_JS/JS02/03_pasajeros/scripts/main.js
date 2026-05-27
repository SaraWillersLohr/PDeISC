import {
  validarNombreReal,
  validarEdadYFecha,
  validarDocumento,
  validarTelefono,
  validarEmail,
  validarNacionalidad,
  validarHijos,
  validarSexo,
  validarEstadoCivil,
  validarFormularioCompleto,
  calcularEdadDesdeFecha,
} from "../modules/validations.js";
import { dibujarListaPersonas } from "../modules/render.js";
import { initTheme } from "../modules/theme.js";
import { EventConsole } from "../modules/eventConsole.js";
import { mostrarToast } from "../modules/toast.js";
import { mostrarFeedback, limpiarFeedbackFormulario } from "../modules/feedback.js";
import { aplicarReglasPais, actualizarContadorTelefono, soloNumeros } from "../modules/uiPais.js";
import { obtenerConfigPais } from "../modules/paisConfig.js";

const formulario = document.getElementById("passengerForm");
const botonEnviar = document.getElementById("submitBtn");
const checkTerminos = document.getElementById("termsCheck");
const contenedorLista = document.getElementById("passengerList");
const bannerEstado = document.getElementById("saveStatus");
const selectHijos = document.getElementById("tieneHijos");
const inputCantHijos = document.getElementById("cantidadHijos");

const consola = new EventConsole("eventConsole");
initTheme();

let listaPersonas = JSON.parse(localStorage.getItem("peopleList")) || [];

const mostrarEstadoGuardado = (ok, mensaje) => {
  if (!bannerEstado) return;
  bannerEstado.className = `save-status glass-panel ${ok ? "is-ok" : "is-error"}`;
  bannerEstado.textContent = mensaje;
  bannerEstado.hidden = false;
};

const actualizarBoton = () => {
  botonEnviar.disabled = !validarFormularioCompleto(formulario, checkTerminos);
};

// comparo edad con fecha real usando Date
const revalidarEdadFecha = () => {
  const res = validarEdadYFecha(formulario.edad.value, formulario.fechaNac.value);
  if (res.valido) {
    mostrarFeedback(formulario.edad, res);
    mostrarFeedback(formulario.fechaNac, res);
    return;
  }
  if (res.campo === "edad") {
    mostrarFeedback(formulario.edad, res);
    if (formulario.fechaNac.value) mostrarFeedback(formulario.fechaNac, { valido: true, mensaje: "" });
  } else {
    mostrarFeedback(formulario.fechaNac, res);
    if (formulario.edad.value !== "") mostrarFeedback(formulario.edad, { valido: true, mensaje: "" });
  }
};

const borrarPersona = (indice) => {
  const persona = listaPersonas[indice];
  listaPersonas.splice(indice, 1);
  localStorage.setItem("peopleList", JSON.stringify(listaPersonas));
  dibujarListaPersonas(listaPersonas, contenedorLista, borrarPersona, consola);
  consola.log(`Registro eliminado: ${persona.nombre} ${persona.apellido}`);
  mostrarToast("toastZone", "Persona eliminada de localStorage", "success");
};

selectHijos.addEventListener("change", () => {
  inputCantHijos.disabled = selectHijos.value === "no";
  if (inputCantHijos.disabled) {
    inputCantHijos.value = "0";
    inputCantHijos.classList.remove("is-valid", "is-invalid");
  }
  actualizarBoton();
});

formulario.nacionalidad.addEventListener("change", () => {
  mostrarFeedback(formulario.nacionalidad, validarNacionalidad(formulario.nacionalidad.value));
  aplicarReglasPais(formulario, consola);
  actualizarBoton();
});

formulario.documento.addEventListener("input", () => {
  soloNumeros(formulario.documento);
  const pais = formulario.nacionalidad.value;
  mostrarFeedback(formulario.documento, validarDocumento(formulario.documento.value, pais));
  actualizarBoton();
});

formulario.telefono.addEventListener("input", () => {
  soloNumeros(formulario.telefono);
  const pais = formulario.nacionalidad.value;
  const config = obtenerConfigPais(pais);
  actualizarContadorTelefono(formulario.telefono, config?.telefono.max || 15, document.getElementById("telefonoContador"));
  mostrarFeedback(formulario.telefono, validarTelefono(formulario.telefono.value, pais));
  actualizarBoton();
});

formulario.addEventListener("input", (e) => {
  const input = e.target;
  if (["documento", "telefono", "nacionalidad"].includes(input.id)) return;

  let resultado = { valido: true, mensaje: "" };
  const pais = formulario.nacionalidad.value;

  if (input.id === "nombre" || input.id === "apellido") resultado = validarNombreReal(input.value);
  else if (input.id === "email") resultado = validarEmail(input.value);
  else if (input.id === "edad" || input.id === "fechaNac") {
    if (input.id === "fechaNac" && input.value) {
      const edadCalculada = calcularEdadDesdeFecha(input.value);
      if (!isNaN(edadCalculada) && edadCalculada >= 0) {
        formulario.edad.value = edadCalculada;
      }
    }
    revalidarEdadFecha();
    actualizarBoton();
    return;
  } else if (input.id === "cantidadHijos") {
    resultado = validarHijos(selectHijos.value, input.value);
  }

  if (input.tagName === "INPUT" && input.type !== "checkbox") {
    mostrarFeedback(input, resultado);
  }
  actualizarBoton();
});

formulario.sexo.addEventListener("change", () => {
  mostrarFeedback(formulario.sexo, validarSexo(formulario.sexo.value));
  actualizarBoton();
});

formulario.estadoCivil.addEventListener("change", () => {
  mostrarFeedback(formulario.estadoCivil, validarEstadoCivil(formulario.estadoCivil.value));
  actualizarBoton();
});

checkTerminos.addEventListener("change", actualizarBoton);
document.getElementById("clearConsole")?.addEventListener("click", () => consola.limpiar());

formulario.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!validarFormularioCompleto(formulario, checkTerminos)) {
    mostrarEstadoGuardado(false, "Guardado incorrecto: revisá los campos marcados en rojo");
    mostrarToast("toastZone", "No se pudo guardar el registro", "error");
    consola.log("Validación fallida: guardado cancelado");
    return;
  }

  const pais = formulario.nacionalidad.value;
  const config = obtenerConfigPais(pais);

  const nuevaPersona = {
    nombre: formulario.nombre.value.trim(),
    apellido: formulario.apellido.value.trim(),
    edad: formulario.edad.value,
    fechaNac: formulario.fechaNac.value,
    sexo: formulario.sexo.value,
    documento: formulario.documento.value.trim(),
    estadoCivil: formulario.estadoCivil.value,
    nacionalidad: config.nombre,
    nacionalidadCodigo: pais,
    telefono: `${formulario.prefijoTelefono.value} ${formulario.telefono.value.trim()}`,
    email: formulario.email.value.trim(),
    hijos: selectHijos.value === "si" ? formulario.cantidadHijos.value : "0",
  };

  listaPersonas.push(nuevaPersona);
  localStorage.setItem("peopleList", JSON.stringify(listaPersonas));

  dibujarListaPersonas(listaPersonas, contenedorLista, borrarPersona, consola);
  mostrarEstadoGuardado(true, `Guardado correcto: ${nuevaPersona.nombre} ${nuevaPersona.apellido} en localStorage`);
  mostrarToast("toastZone", "Persona guardada con éxito", "success");
  consola.log(`Datos guardados en localStorage (${listaPersonas.length} registros)`);

  formulario.reset();
  inputCantHijos.disabled = true;
  inputCantHijos.value = "0";
  limpiarFeedbackFormulario(formulario);
  aplicarReglasPais(formulario, consola);
  actualizarBoton();
});

consola.log("Datos cargados desde localStorage al iniciar");
dibujarListaPersonas(listaPersonas, contenedorLista, borrarPersona, consola);
aplicarReglasPais(formulario, consola);
actualizarBoton();
