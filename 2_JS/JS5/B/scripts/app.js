import { inicializarTema } from "../context/tema.js";
import { inicializarVolverArriba } from "../context/volverArriba.js";

const API_URL = "http://localhost:3000/api/listar-alumnos";

let alumnosCompletos = [];
let metodoActual = "";

// Acá actualizo el badge que muestra qué método se usó (Fetch o Axios)
function mostrarMetodoActivo(metodo) {
  const badge = document.getElementById("metodo-activo");
  badge.style.display = "inline-block";
  badge.textContent = metodo;
  badge.className = `badge-metodo ${metodo === "Fetch" ? "badge-fetch" : "badge-axios"}`;
  metodoActual = metodo;
}

// Acá actualizo la explicación dinámica según la acción que se está realizando
function actualizarExplicacion(texto) {
  document.getElementById("texto-explicacion").textContent = texto;
}

// Acá renderizo la tabla de alumnos con los datos filtrados o completos
function renderizarTabla(alumnos) {
  const tbody = document.getElementById("tabla-alumnos-body");
  const contador = document.getElementById("contador-alumnos");

  contador.textContent = `${alumnos.length} alumno${alumnos.length !== 1 ? "s" : ""}`;

  if (alumnos.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" class="mensaje-vacio">No se encontraron alumnos.</td></tr>';
    return;
  }

  tbody.innerHTML = alumnos
    .map(
      (alumno) => `
    <tr>
      <td>${alumno.id}</td>
      <td>${alumno.nombre}</td>
      <td>${alumno.apellido}</td>
      <td>${alumno.edad}</td>
    </tr>
  `,
    )
    .join("");
}

// Acá filtro los alumnos por nombre o apellido según lo que escriba el usuario
function filtrarAlumnos(termino) {
  const busqueda = termino.toLowerCase().trim();

  if (!busqueda) {
    renderizarTabla(alumnosCompletos);
    return;
  }

  const filtrados = alumnosCompletos.filter(
    (alumno) =>
      alumno.nombre.toLowerCase().includes(busqueda) ||
      alumno.apellido.toLowerCase().includes(busqueda),
  );

  renderizarTabla(filtrados);
}

// Acá cargo los alumnos usando Fetch (API nativa del navegador)
async function cargarConFetch() {
  mostrarMetodoActivo("Fetch");
  actualizarExplicacion(
    "Fetch es la API nativa del navegador. Enviando GET a la API del Proyecto A...",
  );

  try {
    const respuesta = await fetch(API_URL, {
      method: "GET",
    });

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const datos = await respuesta.json();
    alumnosCompletos = datos;

    const termino = document.getElementById("buscador").value;
    if (termino) {
      filtrarAlumnos(termino);
    } else {
      renderizarTabla(alumnosCompletos);
    }

    actualizarExplicacion(
      `Fetch obtuvo ${datos.length} alumno(s) de la API. Los datos vienen de MySQL a través del Proyecto A.`,
    );
  } catch (error) {
    actualizarExplicacion(
      "No se pudo conectar con la API. Asegurate de que el Proyecto A esté activo en el puerto 3000.",
    );
  }
}

// Acá cargo los alumnos usando Axios (biblioteca externa)
async function cargarConAxios() {
  mostrarMetodoActivo("Axios");
  actualizarExplicacion(
    "Axios es una librería que simplifica las peticiones HTTP. Enviando GET a la API del Proyecto A...",
  );

  try {
    const respuesta = await axios.get(API_URL);

    alumnosCompletos = respuesta.data;

    const termino = document.getElementById("buscador").value;
    if (termino) {
      filtrarAlumnos(termino);
    } else {
      renderizarTabla(alumnosCompletos);
    }

    actualizarExplicacion(
      `Axios obtuvo ${respuesta.data.length} alumno(s) de la API. Axios convierte el JSON automáticamente en respuesta.data.`,
    );
  } catch (error) {
    actualizarExplicacion(
      "No se pudo conectar con la API. Asegurate de que el Proyecto A esté activo en el puerto 3000.",
    );
  }
}

// Acá configuro el buscador para filtrar en tiempo real mientras el usuario escribe
function configurarBuscador() {
  const inputBuscador = document.getElementById("buscador");

  inputBuscador.addEventListener("input", (e) => {
    if (alumnosCompletos.length === 0) {
      return;
    }
    filtrarAlumnos(e.target.value);
  });
}

// Acá configuro los botones de Fetch y Axios
function configurarBotones() {
  document
    .getElementById("btn-cargar-fetch")
    .addEventListener("click", cargarConFetch);
  document
    .getElementById("btn-cargar-axios")
    .addEventListener("click", cargarConAxios);
}

// Acá inicio toda la aplicación cuando el DOM está listo
document.addEventListener("DOMContentLoaded", () => {
  inicializarTema();
  inicializarVolverArriba();
  configurarBotones();
  configurarBuscador();
  cargarConFetch();
});
