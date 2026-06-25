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

// acá guardo los datos que recibí de la api
let usuarios = [];

function seleccionarUsuario(usuario, elemento) {
  document.querySelectorAll(".userhub-card-clickable.selected").forEach((card) => {
    card.classList.remove("selected");
  });
  elemento?.classList.add("selected");

  renderPerfil(usuarioApiAPerfil(usuario), document.getElementById("panel-perfil"));

  logConsola("CLICK", [
    `Usuario presionó la card de ${usuario.name}`,
    "Se ejecutó renderPerfil() con usuarioApiAPerfil()",
    "El panel derecho muestra nombre, apodo, email, teléfono, empresa, dirección, ciudad y sitio web",
  ]);
}

function procesarUsuarios(datos, metodo, contenedor) {
  usuarios = datos;

  if (!validarUsuarios(usuarios)) {
    throw new Error("Los datos recibidos no tienen el formato esperado.");
  }

  actualizarMetodoActivo(metodo);
  actualizarPanelFlujo(metodo, usuarios.length);
  renderizarUsuarios(usuarios, contenedor, seleccionarUsuario);
}

// acá arranco la carga automática: primero fetch, después axios
async function cargarUsuarios() {
  const contenedor = document.getElementById("lista-usuarios");
  mostrarEstado("Cargando usuarios con fetch()...", "info");

  logConsola("FETCH", [
    "Se ejecutó fetch() contra jsonplaceholder.typicode.com/users",
    "Obteniendo datos de la API pública...",
  ]);

  try {
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
    renderizarUsuarios([], contenedor);
  }
}

function inicializarApp() {
  inicializarTema();
  initConsola("Explorer listo. Se cargará la API con fetch y axios...");
  initScrollTop();
  cargarUsuarios();
}

document.addEventListener("DOMContentLoaded", inicializarApp);
