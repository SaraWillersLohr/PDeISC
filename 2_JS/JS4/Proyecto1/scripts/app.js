import { inicializarTema } from "../Context/tema.js";
import { obtenerUsuariosConFetch, obtenerUsuariosConAxios } from "../modules/api.js";
import {
  mostrarEstado,
  renderizarUsuarios,
  validarUsuarios,
  actualizarPanelFlujo,
  actualizarMetodoActivo,
  mostrarVerificacionAxios,
} from "../modules/funciones.js";
import { renderPerfil, usuarioApiAPerfil } from "../modules/perfil.js";
import { initConsola, logConsola } from "../modules/consola.js";
import { initScrollTop } from "../modules/scrollTop.js";

// acá guardo los usuarios que recibo de la api
// después uso este array para mostrar, modificar o eliminar registros en pantalla
let usuarios = [];

// acá guardo el id del usuario que el usuario quiere eliminar
// lo necesito cuando confirman el modal, para saber cuál borrar del array
let idParaEliminar = null;

// acá marco la card seleccionada y muestro su perfil completo en el panel lateral
function seleccionarUsuario(usuario, elemento) {
  // saco la selección anterior de todas las cards
  document.querySelectorAll(".userhub-card-clickable.selected").forEach((card) => {
    card.classList.remove("selected");
  });
  elemento?.classList.add("selected");

  // convierto el objeto de la api al formato del panel perfil y lo muestro
  renderPerfil(usuarioApiAPerfil(usuario), document.getElementById("panel-perfil"));

  logConsola("CLICK", [
    `Usuario presionó la card de ${usuario.name}`,
    "Se ejecutó renderPerfil() con usuarioApiAPerfil()",
    "El panel derecho muestra nombre, apodo, email, teléfono, empresa, dirección, ciudad y sitio web",
  ]);
}

// acá abro el modal de confirmación antes de eliminar
// nunca borro directamente — siempre pido confirmación primero
function pedirConfirmacionEliminar(usuario) {
  idParaEliminar = usuario.id;

  // lleno el modal con el nombre y email del usuario a eliminar
  document.getElementById("modal-eliminar-nombre").textContent = usuario.name;
  document.getElementById("modal-eliminar-email").textContent = usuario.email;

  // muestro el modal usando Bootstrap
  const modal = new bootstrap.Modal(document.getElementById("modal-confirmar-eliminar"));
  modal.show();
}

// acá ejecuto la eliminación real cuando el usuario confirma en el modal
// filter() recorre el array y descarta solo el que tiene el id guardado
function confirmarEliminar() {
  if (idParaEliminar === null) return;

  const nombreEliminado = usuarios.find((u) => u.id === idParaEliminar)?.name || "Usuario";

  // filter crea un nuevo array sin el usuario eliminado
  usuarios = usuarios.filter((u) => u.id !== idParaEliminar);

  // cierro el modal
  const modal = bootstrap.Modal.getInstance(document.getElementById("modal-confirmar-eliminar"));
  modal?.hide();
  idParaEliminar = null;

  // actualizo el DOM con la lista nueva
  renderizarUsuarios(usuarios, document.getElementById("lista-usuarios"), seleccionarUsuario, pedirConfirmacionEliminar);
  document.getElementById("contador-usuarios").textContent = usuarios.length;

  // limpio el perfil porque el usuario eliminado ya no existe
  renderPerfil(null, document.getElementById("panel-perfil"));

  logConsola("DELETE", [
    `Se eliminó a ${nombreEliminado} del array`,
    "Se usó usuarios.filter(u => u.id !== idParaEliminar)",
    "Se volvió a ejecutar renderizarUsuarios() con el array actualizado",
    "NOTA: esta eliminación es solo en sesión, jsonplaceholder no borra datos reales",
  ]);
}

// acá proceso los datos recibidos: valido, actualizo estado y renderizo
function procesarUsuarios(datos, metodo, contenedor) {
  usuarios = datos;

  if (!validarUsuarios(usuarios)) {
    throw new Error("Los datos recibidos no tienen el formato esperado.");
  }

  actualizarMetodoActivo(metodo);
  actualizarPanelFlujo(metodo, usuarios.length);
  renderizarUsuarios(usuarios, contenedor, seleccionarUsuario, pedirConfirmacionEliminar);
}

// acá arranco la carga automática: primero fetch, después axios
// la diferencia principal entre los dos métodos está acá
async function cargarUsuarios() {
  const contenedor = document.getElementById("lista-usuarios");
  mostrarEstado("Cargando usuarios con fetch()...", "info");

  logConsola("FETCH", [
    "Se ejecutó fetch() contra jsonplaceholder.typicode.com/users",
    "Obteniendo datos de la API pública...",
  ]);
//
  try {
    // fetch es nativo del browser, hay que convertir la respuesta con .json()
    const datosFetch = await obtenerUsuariosConFetch();
    procesarUsuarios(datosFetch, "fetch()", contenedor);

    logConsola("FETCH", [
      "La respuesta JSON fue convertida con respuesta.json()",
      `Se guardaron ${datosFetch.length} usuarios en el array`,
      "Luego se ejecutó renderizarUsuarios() y se actualizaron las cards",
    ]);

    mostrarEstado("Datos cargados con fetch(). Verificando con axios...", "info");

    logConsola("AXIOS", [
      "Se ejecutó axios.get() con la misma URL",
      "Comparando la cantidad de registros con fetch...",
    ]);

    // axios hace la misma petición pero ya parsea JSON automáticamente en respuesta.data
    const datosAxios = await obtenerUsuariosConAxios();
    const cantidadCoincide = datosFetch.length === datosAxios.length;

    procesarUsuarios(datosAxios, "axios", contenedor);
    mostrarVerificacionAxios(cantidadCoincide);

    logConsola("AXIOS", [
      "Se ejecutó axios.get()",
      "La respuesta fue guardada en el array",
      cantidadCoincide
        ? "fetch y axios devolvieron la misma cantidad de usuarios"
        : "Los datos se actualizaron con la respuesta de axios",
      "Luego se renderizó el DOM con renderizarUsuarios()",
    ]);

    const mensaje = cantidadCoincide
      ? `${usuarios.length} usuarios — fetch y axios devolvieron la misma cantidad.`
      : `${usuarios.length} usuarios — datos actualizados con axios.`;

    mostrarEstado(mensaje, "exito");
  } catch (error) {
    mostrarEstado(`Error al cargar usuarios: ${error.message}`, "error");
    logConsola("INFO", [`Error: ${error.message}`]);
    renderizarUsuarios([], contenedor, seleccionarUsuario, pedirConfirmacionEliminar);
  }
}

function inicializarApp() {
  inicializarTema();
  initConsola("Explorer listo. Se cargará la API con fetch y axios...");
  initScrollTop();

  // cuando el usuario confirma el modal, ejecuto la eliminación real
  document.getElementById("btn-confirmar-eliminar")
    ?.addEventListener("click", confirmarEliminar);

  cargarUsuarios();
}

document.addEventListener("DOMContentLoaded", inicializarApp);
