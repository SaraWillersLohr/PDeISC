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
// sobre este array corro el filter() cada vez que el usuario escribe
let usuarios = [];

// acá guardo el id del usuario que se quiere eliminar
// lo necesito cuando confirman el modal para saber cuál borrar
let idParaEliminar = null;

// acá marco la fila seleccionada y muestro el perfil completo en el panel lateral
function seleccionarUsuario(usuario, fila) {
  document.querySelectorAll(".userhub-row-clickable.selected").forEach((row) => {
    row.classList.remove("selected");
  });
  fila?.classList.add("selected");

  // llevo los datos del usuario de la api al formato del panel de perfil
  renderPerfil(usuarioApiAPerfil(usuario), document.getElementById("panel-perfil"));

  logConsola("CLICK", [
    `Usuario presionó el resultado: ${usuario.name}`,
    "Se ejecutó renderPerfil() con usuarioApiAPerfil()",
    "El panel derecho muestra el perfil completo sin datos técnicos",
  ]);
}

// acá abro el modal de confirmación antes de eliminar
// no elimino directo — siempre muestro el modal con nombre y email
function pedirConfirmacionEliminar(usuario) {
  idParaEliminar = usuario.id;

  document.getElementById("modal-eliminar-nombre").textContent = usuario.name;
  document.getElementById("modal-eliminar-email").textContent = usuario.email;

  const modal = new bootstrap.Modal(document.getElementById("modal-confirmar-eliminar"));
  modal.show();
}

// acá ejecuto la eliminación cuando el usuario confirma
// filter() crea un nuevo array sin el usuario que tiene el id guardado
function confirmarEliminar() {
  if (idParaEliminar === null) return;

  const nombreEliminado = usuarios.find((u) => u.id === idParaEliminar)?.name || "Usuario";

  // filter descarta el usuario con el id guardado y devuelve el resto
  usuarios = usuarios.filter((u) => u.id !== idParaEliminar);

  const modal = bootstrap.Modal.getInstance(document.getElementById("modal-confirmar-eliminar"));
  modal?.hide();
  idParaEliminar = null;

  // re-filtro según lo que haya escrito el usuario en el input de búsqueda
  actualizarResultados();

  // limpio el perfil porque el usuario ya no existe en el array
  renderPerfil(null, document.getElementById("panel-perfil"));

  logConsola("DELETE", [
    `Se eliminó a ${nombreEliminado} del array`,
    "Se usó usuarios.filter(u => u.id !== idParaEliminar)",
    "Se volvió a ejecutar renderizarTablaNombres() con el array actualizado",
    "NOTA: jsonplaceholder no elimina datos reales, esto es solo en sesión",
  ]);
}

// acá corro el filtro y actualizo la tabla cada vez que cambia el input
// también se llama después de eliminar para refrescar la vista
function actualizarResultados() {
  const busqueda = document.getElementById("input-buscar").value;

  // filtrarPorNombre busca en name y en username usando toLowerCase()
  const filtrados = filtrarPorNombre(usuarios, busqueda);

  if (busqueda.trim()) {
    logConsola("FILTER", [
      "Evento input detectado",
      `Buscando coincidencias en name y username con "${busqueda.trim()}"`,
      `Quedaron ${filtrados.length} coincidencias en el array`,
      "Luego se actualizó la tabla con renderizarTablaNombres()",
    ]);
  }

  renderizarTablaNombres(
    filtrados,
    document.getElementById("tabla-resultados"),
    seleccionarUsuario,
    pedirConfirmacionEliminar
  );
  document.getElementById("contador-resultados").textContent = filtrados.length;
}

// acá traigo los datos de la api con fetch y luego los valido con axios
async function cargarUsuarios() {
  document.getElementById("verificacion-axios")?.classList.add("d-none");
  mostrarEstado("Cargando usuarios con fetch()...", "info");

  logConsola("FETCH", [
    "Se ejecutó fetch() contra jsonplaceholder.typicode.com/users",
    "Obteniendo datos para el buscador...",
  ]);

  try {
    // fetch nativo: hay que convertir la respuesta a JSON manualmente
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

    // axios: la respuesta ya viene en respuesta.data, sin necesidad de .json()
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

    // muestro todos los usuarios al inicio, sin filtro activo
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

  // escucho el input: cada letra que escribe actualiza la tabla en tiempo real
  document.getElementById("input-buscar").addEventListener("input", actualizarResultados);

  // cuando confirman el modal, ejecuto la eliminación real
  document.getElementById("btn-confirmar-eliminar")
    ?.addEventListener("click", confirmarEliminar);

  cargarUsuarios();
}

document.addEventListener("DOMContentLoaded", inicializarApp);
