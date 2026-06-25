import { inicializarTema } from "../Context/tema.js";
import { obtenerEmpleadosConFetch, obtenerEmpleadosConAxios } from "../modules/api.js";
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
let empleados = [];

function seleccionarEmpleado(empleado, fila) {
  document.querySelectorAll(".userhub-row-clickable.selected").forEach((row) => {
    row.classList.remove("selected");
  });
  fila?.classList.add("selected");

  renderPerfil(empleadoAPerfil(empleado), document.getElementById("panel-perfil"));

  logConsola("CLICK", [
    `Usuario presionó empleado: ${empleado.nombre}`,
    "Se ejecutó renderPerfil() con empleadoAPerfil()",
    "El panel derecho muestra el perfil sin datos técnicos",
  ]);
}

function actualizarVista(metodo) {
  const stats = calcularEstadisticas(empleados);

  renderizarEstadisticas(stats, document.getElementById("estadisticas"));
  renderizarTablaEmpleados(empleados, document.getElementById("tabla-empleados"), seleccionarEmpleado);
  document.getElementById("contador-empleados").textContent = empleados.length;

  const flujoMetodo = document.getElementById("flujo-metodo");
  if (flujoMetodo) {
    flujoMetodo.innerHTML = `<i class="bi bi-arrow-repeat"></i> ${metodo}`;
  }
}

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
  cargarEmpleados();
}

document.addEventListener("DOMContentLoaded", inicializarApp);
