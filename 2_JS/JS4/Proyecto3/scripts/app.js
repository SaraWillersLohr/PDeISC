import { inicializarTema } from "../Context/tema.js";
import { crearUsuarioConFetch, crearUsuarioConAxios } from "../modules/api.js";
import {
  validarCampoNombre,
  validarCampoEmail,
  validarFormulario,
  mostrarErrorCampo,
  limpiarErroresFormulario,
  actualizarBotonesEnvio,
  mostrarResultadoCreacion,
  mostrarEstado,
  ocultarEstado,
} from "../modules/funciones.js";
import { renderPerfil } from "../modules/perfil.js";
import { initConsola, logConsola } from "../modules/consola.js";
import { initScrollTop } from "../modules/scrollTop.js";

// acá valido mientras el usuario escribe y bloqueo el envío si algo falla
function validarEnTiempoReal() {
  const nombre = document.getElementById("input-nombre").value;
  const email = document.getElementById("input-email").value;

  const errNombre = nombre.length > 0 ? validarCampoNombre(nombre) : "";
  const errEmail = email.length > 0 ? validarCampoEmail(email) : "";

  if (nombre.length > 0) mostrarErrorCampo("input-nombre", "error-nombre", errNombre);
  if (email.length > 0) mostrarErrorCampo("input-email", "error-email", errEmail);

  const { valido } = validarFormulario(nombre, email);
  actualizarBotonesEnvio(valido);
}

// acá mando los datos del formulario con fetch o axios
async function enviarUsuario(metodo) {
  limpiarErroresFormulario();

  const nombre = document.getElementById("input-nombre").value;
  const email = document.getElementById("input-email").value;
  const { valido, errores } = validarFormulario(nombre, email);

  if (!valido) {
    if (errores.nombre) mostrarErrorCampo("input-nombre", "error-nombre", errores.nombre);
    if (errores.email) mostrarErrorCampo("input-email", "error-email", errores.email);
    actualizarBotonesEnvio(false);

    logConsola("EVENT", [
      "El formulario no pasó validarFormulario()",
      "Revisá los mensajes debajo de cada input",
    ]);
    return;
  }

  const datos = { name: nombre.trim(), email: email.trim() };
  const btnFetch = document.getElementById("btn-enviar-fetch");
  const btnAxios = document.getElementById("btn-enviar-axios");

  btnFetch.disabled = true;
  btnAxios.disabled = true;
  mostrarEstado(`Enviando con ${metodo}...`, "info");

  const esAxios = metodo === "axios";

  logConsola("POST", [
    esAxios ? "Se ejecutó axios.post()" : "Se ejecutó fetch() POST",
    "Se armó el objeto { name, email } después de validarFormulario()",
    "La API simula la creación y devuelve un ID interno",
  ]);

  try {
    const resultado = esAxios
      ? await crearUsuarioConAxios(datos)
      : await crearUsuarioConFetch(datos);

    mostrarResultadoCreacion(resultado, metodo, document.getElementById("resultado-creacion"));

    renderPerfil(
      {
        nombre: resultado.enviado.name,
        email: resultado.enviado.email,
      },
      document.getElementById("panel-perfil")
    );

    logConsola("POST", [
      esAxios
        ? "axios.post() devolvió respuesta.data"
        : "fetch() convirtió la respuesta JSON",
      `ID interno recibido: ${resultado.respuesta.id}`,
      "Se ejecutó mostrarResultadoCreacion() y se actualizó el DOM",
    ]);

    mostrarEstado("Usuario enviado correctamente.", "exito");

    document.getElementById("form-usuario").reset();
    limpiarErroresFormulario();
    actualizarBotonesEnvio(false);
  } catch (error) {
    mostrarEstado(`Error: ${error.message}`, "error");
    logConsola("POST", [`Error al enviar: ${error.message}`]);
  } finally {
    validarEnTiempoReal();
  }
}

function inicializarApp() {
  inicializarTema();
  ocultarEstado();
  initConsola("Register listo. Completá el formulario y elegí fetch o axios...");
  initScrollTop();

  document.getElementById("input-nombre").addEventListener("input", validarEnTiempoReal);
  document.getElementById("input-email").addEventListener("input", validarEnTiempoReal);
  document.getElementById("form-usuario").addEventListener("submit", (e) => e.preventDefault());
  document.getElementById("btn-enviar-fetch").addEventListener("click", () => {
    logConsola("CLICK", ['Usuario presionó "Enviar con fetch()"']);
    enviarUsuario("fetch()");
  });
  document.getElementById("btn-enviar-axios").addEventListener("click", () => {
    logConsola("CLICK", ['Usuario presionó "Enviar con axios"']);
    enviarUsuario("axios");
  });
}

document.addEventListener("DOMContentLoaded", inicializarApp);
