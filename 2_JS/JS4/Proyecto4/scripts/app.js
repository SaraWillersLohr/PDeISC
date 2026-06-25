import { inicializarTema } from "../Context/tema.js";
import {
  obtenerEmpleadosConFetch,
  obtenerEmpleadosConAxios,
  eliminarEmpleadoConFetch,
  eliminarEmpleadoConAxios,
} from "../modules/api.js";
import {
  calcularEstadisticas,
  renderizarEstadisticas,
  renderizarTablaEmpleados,
  mostrarEstado,
  actualizarMetodoActivo,
  mostrarVerificacionAxios,
} from "../modules/funciones.js";
import { renderPerfil, empleadoAPerfil } from "../modules/perfil.js";
import { initConsola, logConsola } from "../modules/consola.js";
import { initScrollTop } from "../modules/scrollTop.js";

// acá guardo el array de empleados que viene de mi api propia
// cuando elimino uno, recargo desde el servidor para tener el json actualizado
let empleados = [];

// acá guardo el objeto del empleado que el usuario quiere eliminar
// lo necesito cuando confirman el modal
let empleadoParaEliminar = null;

// acá marco la fila seleccionada y muestro el perfil en el panel lateral
function seleccionarEmpleado(empleado, fila) {
  document.querySelectorAll(".userhub-row-clickable.selected").forEach((row) => {
    row.classList.remove("selected");
  });
  fila?.classList.add("selected");

  // convierto el objeto empleado al formato del panel de perfil
  renderPerfil(empleadoAPerfil(empleado), document.getElementById("panel-perfil"));

  logConsola("CLICK", [
    `Usuario presionó empleado: ${empleado.nombre}`,
    "Se ejecutó renderPerfil() con empleadoAPerfil()",
    "El panel derecho muestra el perfil sin datos técnicos",
  ]);
}

// acá abro el modal de confirmación antes de eliminar
function pedirConfirmacionEliminar(empleado) {
  empleadoParaEliminar = empleado;

  document.getElementById("modal-eliminar-nombre").textContent = empleado.nombre;
  document.getElementById("modal-eliminar-email").textContent = empleado.email;

  const modal = new bootstrap.Modal(document.getElementById("modal-confirmar-eliminar"));
  modal.show();
}

// acá ejecuto la eliminación real cuando el usuario confirma
// a diferencia de P1 y P2, acá se hace un DELETE real a la API propia
// el servidor actualiza el archivo empleados.json y la eliminación persiste
async function confirmarEliminar() {
  if (!empleadoParaEliminar) return;

  const empleado = empleadoParaEliminar;
  const modal = bootstrap.Modal.getInstance(document.getElementById("modal-confirmar-eliminar"));
  modal?.hide();
  empleadoParaEliminar = null;

  mostrarEstado(`Eliminando a ${empleado.nombre}...`, "info");

  logConsola("DELETE", [
    `Se ejecutó fetch DELETE /api/empleados/${empleado.id}`,
    "El servidor busca el empleado en el JSON",
    "Usa filter() para removerlo y sobreescribe el archivo",
  ]);

  try {
    // primero intento con fetch DELETE
    await eliminarEmpleadoConFetch(empleado.id);

    logConsola("DELETE", [
      `fetch DELETE devolvió confirmación del servidor`,
      `${empleado.nombre} fue eliminado del archivo empleados.json`,
      "Actualizando la tabla con los datos actualizados...",
    ]);

    // actualizo el array local de inmediato para que la UI responda sin esperar
    empleados = empleados.filter((e) => e.id !== empleado.id);
    actualizarVista("fetch()");

    // limpio el perfil porque el empleado ya no existe
    renderPerfil(null, document.getElementById("panel-perfil"));

    mostrarEstado(`${empleado.nombre} eliminado correctamente.`, "exito");

    // también valido con axios que los datos del servidor coincidan
    logConsola("AXIOS", [
      `Se ejecutó axios.delete() para validar la eliminación de ${empleado.nombre}`,
    ]);

    await eliminarEmpleadoConAxios(empleado.id);
  } catch (error) {
    mostrarEstado(`Error al eliminar: ${error.message}`, "error");
    logConsola("INFO", [`Error al eliminar: ${error.message}`]);
  }
}

// acá actualizo la tabla y las estadísticas con los datos actuales del array
function actualizarVista(metodo) {
  const stats = calcularEstadisticas(empleados);

  // recalculo los stats porque cambió la cantidad de empleados
  renderizarEstadisticas(stats, document.getElementById("estadisticas"));
  renderizarTablaEmpleados(
    empleados,
    document.getElementById("tabla-empleados"),
    seleccionarEmpleado,
    pedirConfirmacionEliminar
  );
  document.getElementById("contador-empleados").textContent = empleados.length;

  const flujoMetodo = document.getElementById("flujo-metodo");
  if (flujoMetodo) {
    flujoMetodo.innerHTML = `<i class="bi bi-arrow-repeat"></i> ${metodo}`;
  }
}

// acá traigo los empleados de mi api con fetch y los valido con axios
async function cargarEmpleados(recarga = false) {
  document.getElementById("verificacion-axios")?.classList.add("d-none");
  mostrarEstado("Cargando empleados con fetch()...", "info");

  if (recarga) {
    logConsola("CLICK", ['Usuario presionó "Recargar API"']);
  }

  logConsola("FETCH", [
    "Se ejecutó fetch('/api/empleados')",
    "El backend Express lee empleados.json y responde JSON",
  ]);

  try {
    // fetch trae los empleados del servidor
    const datosFetch = await obtenerEmpleadosConFetch();
    empleados = datosFetch;
    actualizarMetodoActivo("fetch()");
    actualizarVista("fetch()");

    logConsola("FETCH", [
      `fetch devolvió ${datosFetch.length} empleados`,
      "Se guardaron en el array y se ejecutó renderizarTablaEmpleados()",
      "Validando los mismos datos con axios.get()...",
    ]);

    mostrarEstado("Datos cargados con fetch(). Verificando con axios...", "info");

    logConsola("AXIOS", [
      "Se ejecutó axios.get('/api/empleados')",
      "Comparando la cantidad de registros con fetch...",
    ]);

    // axios valida que los datos del servidor sean consistentes
    const datosAxios = await obtenerEmpleadosConAxios();

    if (datosFetch.length !== datosAxios.length) {
      throw new Error("fetch y axios devolvieron cantidades distintas.");
    }

    empleados = datosAxios;
    actualizarMetodoActivo("axios");
    actualizarVista("axios");
    mostrarVerificacionAxios(true);

    logConsola("AXIOS", [
      "Se ejecutó axios.get('/api/empleados')",
      "La respuesta fue guardada en el array",
      "fetch y axios devolvieron la misma cantidad de empleados",
      "Se recalculó calcularEstadisticas() y se actualizó el DOM",
    ]);

    mostrarEstado(
      `${empleados.length} empleados — fetch y axios devolvieron la misma cantidad.`,
      "exito"
    );
  } catch (error) {
    mostrarEstado(`Error: ${error.message}`, "error");
    logConsola("INFO", [`Error: ${error.message}`]);
  }
}

function inicializarApp() {
  inicializarTema();
  initConsola("Enterprise listo. Los datos se cargan con fetch y se validan con axios...");
  initScrollTop();

  document.getElementById("btn-recargar").addEventListener("click", () => cargarEmpleados(true));

  // cuando confirman el modal, ejecuto la eliminación real contra la api
  document.getElementById("btn-confirmar-eliminar")
    ?.addEventListener("click", confirmarEliminar);

  cargarEmpleados();
}

document.addEventListener("DOMContentLoaded", inicializarApp);
