import { inicializarTema } from "../Context/tema.js";
import { obtenerUsuariosConFetch, obtenerUsuariosConAxios } from "../modules/api.js";
import {
  filtrarPorNombre,
  renderizarTablaNombres,
  mostrarEstado,
  actualizarPanelFlujo,
  actualizarMetodoActivo,
  mostrarVerificacionAxios,
} from "../modules/funciones.js";
import { renderPerfil, usuarioApiAPerfil } from "../modules/perfil.js";
import { initConsola, logConsola } from "../modules/consola.js";
import { initScrollTop } from "../modules/scrollTop.js";

// acá guardo todos los usuarios que traje de la api
let usuarios = [];

function seleccionarUsuario(usuario, fila) {
  document.querySelectorAll(".userhub-row-clickable.selected").forEach((row) => {
    row.classList.remove("selected");
  });
  fila?.classList.add("selected");

  renderPerfil(usuarioApiAPerfil(usuario), document.getElementById("panel-perfil"));

  logConsola("CLICK", [
    `Usuario presionó el resultado: ${usuario.name}`,
    "Se ejecutó renderPerfil() con usuarioApiAPerfil()",
    "El panel derecho muestra el perfil completo sin datos técnicos",
  ]);
}

function actualizarResultados() {
  const busqueda = document.getElementById("input-buscar").value;
  const filtrados = filtrarPorNombre(usuarios, busqueda);

  if (busqueda.trim()) {
    logConsola("FILTER", [
      "Evento input detectado",
      `Buscando coincidencias en name y username con "${busqueda.trim()}"`,
      `Quedaron ${filtrados.length} coincidencias en el array`,
      "Luego se actualizó la tabla con renderizarTablaNombres()",
    ]);
  }

  renderizarTablaNombres(filtrados, document.getElementById("tabla-resultados"), seleccionarUsuario);
  document.getElementById("contador-resultados").textContent = filtrados.length;
}

async function cargarUsuarios() {
  document.getElementById("verificacion-axios")?.classList.add("d-none");
  mostrarEstado("Cargando usuarios con fetch()...", "info");

  logConsola("FETCH", [
    "Se ejecutó fetch() contra jsonplaceholder.typicode.com/users",
    "Obteniendo datos para el buscador...",
  ]);

  try {
    const datosFetch = await obtenerUsuariosConFetch();

    if (!Array.isArray(datosFetch) || datosFetch.length === 0) {
      throw new Error("No se recibieron usuarios válidos.");
    }

    usuarios = datosFetch;
    actualizarMetodoActivo("fetch()");
    actualizarPanelFlujo("fetch()", usuarios.length);

    logConsola("FETCH", [
      "La respuesta JSON se guardó en el array usuarios",
      `Se cargaron ${datosFetch.length} usuarios con fetch()`,
      "Validando los mismos datos con axios.get()...",
    ]);

    mostrarEstado("Datos cargados con fetch(). Verificando con axios...", "info");

    logConsola("AXIOS", [
      "Se ejecutó axios.get() con la misma URL",
      "Comparando la cantidad de registros con fetch...",
    ]);

    const datosAxios = await obtenerUsuariosConAxios();

    if (datosFetch.length !== datosAxios.length) {
      throw new Error("fetch y axios devolvieron cantidades distintas.");
    }

    usuarios = datosFetch;
    actualizarMetodoActivo("axios");
    actualizarPanelFlujo("axios", usuarios.length);
    mostrarVerificacionAxios(true);

    logConsola("AXIOS", [
      "Se ejecutó axios.get()",
      "La respuesta fue guardada en el array",
      "fetch y axios devolvieron la misma cantidad de usuarios",
      "El array quedó listo para filtrar con filter() por nombre o apodo",
    ]);

    document.getElementById("contador-total").textContent = usuarios.length;
    actualizarResultados();
    mostrarEstado(
      `${usuarios.length} usuarios — fetch y axios devolvieron la misma cantidad.`,
      "exito"
    );
  } catch (error) {
    mostrarEstado(`Error al cargar usuarios: ${error.message}`, "error");
    logConsola("INFO", [`Error: ${error.message}`]);
  }
}

function inicializarApp() {
  inicializarTema();
  initConsola("Search listo. Los datos se cargan con fetch y se validan con axios...");
  initScrollTop();

  document.getElementById("input-buscar").addEventListener("input", actualizarResultados);

  cargarUsuarios();
}

document.addEventListener("DOMContentLoaded", inicializarApp);
