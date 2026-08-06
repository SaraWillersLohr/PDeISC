//app.js, archivo principal del frontend, contiene la lógica para manejar el formulario de registro de alumnos y la tabla de alumnos registrados
// Acá importo las funciones necesarias para inicializar el tema, el botón de volver arriba y las validaciones de los campos del formulario

import { inicializarTema } from "../context/tema.js";
import { inicializarVolverArriba } from "../context/volverArriba.js";
import {
  validarNombre,
  validarApellido,
  validarEdad,
} from "../validaciones/validaciones.js";
// Acá defino la base de la URL de la API para hacer las solicitudes al backend
const API_BASE = "/api";

// Acá convierto el resultado de validación en mensaje de error o éxito para mostrar en pantalla
//api esta en el backend, y el frontend hace fetch a la api para obtener los datos de los alumnos y mostrarlos en la tabla

//esta función recibe un objeto resultado que contiene dos propiedades: valido (booleano) y mensaje (string).
function obtenerMensajeCampo(resultado) {
  if (!resultado.valido) return { error: resultado.mensaje, exito: "" };
  return { error: "", exito: resultado.mensaje };
}

// Acá muestro el estado visual del campo: error (rojo), válido (verde) o neutro
function mostrarEstadoCampo(campoId, resultado) {
  const input = document.getElementById(campoId);
  const mensajeDiv = document.getElementById(`error-${campoId}`);
  const { error, exito } = obtenerMensajeCampo(resultado);

  input.classList.remove("input-error", "input-valid");
  mensajeDiv.classList.remove("mensaje-valido");
  mensajeDiv.textContent = "";

  if (error) {
    input.classList.add("input-error");
    mensajeDiv.textContent = error;
  } else if (input.value.trim() !== "") {
    input.classList.add("input-valid");
    mensajeDiv.classList.add("mensaje-valido");
    mensajeDiv.textContent = exito;
  }
}

// Acá limpio el estado visual de un campo después de resetear el formulario
function limpiarEstadoCampo(campoId) {
  const input = document.getElementById(campoId);
  const mensajeDiv = document.getElementById(`error-${campoId}`);
  input.classList.remove("input-error", "input-valid");
  mensajeDiv.classList.remove("mensaje-valido");
  mensajeDiv.textContent = "";
}

// Acá valido un campo en tiempo real mientras el usuario escribe
function validarCampoEnTiempoReal(campoId, validador) {
  const input = document.getElementById(campoId);
  input.addEventListener("input", () => {
    const resultado = validador(input.value);
    mostrarEstadoCampo(campoId, resultado);
  });
}

// Acá valido todos los campos antes de permitir el envío del formulario
function validarFormularioCompleto() {
  const resultadoNombre = validarNombre(
    document.getElementById("nombre").value,
  );
  const resultadoApellido = validarApellido(
    document.getElementById("apellido").value,
  );
  const resultadoEdad = validarEdad(document.getElementById("edad").value);

  mostrarEstadoCampo("nombre", resultadoNombre);
  mostrarEstadoCampo("apellido", resultadoApellido);
  mostrarEstadoCampo("edad", resultadoEdad);

  return (
    resultadoNombre.valido && resultadoApellido.valido && resultadoEdad.valido
  );
}

// Acá renderizo la tabla de alumnos con los datos recibidos de la API
function renderizarTabla(alumnos) {
  const tbody = document.getElementById("tabla-alumnos-body");
  const contador = document.getElementById("contador-alumnos");
  //contador.textContent muestra la cantidad de alumnos registrados en la tabla, y si es diferente de 1, agrega una "s" al final para indicar pluralidad. Si no hay alumnos, se muestra un mensaje indicando que no hay registros. Si hay alumnos, se genera dinámicamente el contenido de la tabla con los datos de cada alumno.

  contador.textContent = `${alumnos.length} alumno${alumnos.length !== 1 ? "s" : ""}`;

  if (alumnos.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" class="mensaje-vacio">No hay alumnos registrados.</td></tr>';
    return;
  }
  //muesra la tabla de alumnos
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

// Acá pido la lista de alumnos a la API con GET y actualizo la tabla
async function cargarAlumnos() {
  try {
    const respuesta = await fetch(`${API_BASE}/listar-alumnos`, {
      method: "GET",
    });

    if (!respuesta.ok) {
      throw new Error("Error al obtener alumnos");
    }

    const alumnos = await respuesta.json();
    renderizarTabla(alumnos);
  } catch (error) {
    renderizarTabla([]);
  }
}

// Acá envío los datos del formulario a la API para registrar un alumno nuevo
async function registrarAlumno(datos) {
  try {
    // Acá hago la solicitud POST a la API para registrar un nuevo alumno
    //fetch hace una solicitud HTTP al backend, enviando los datos del formulario en formato JSON.
    //la respuesta de la API se procesa para verificar si la operación fue exitosa o si hubo errores de validación, y se actualiza la tabla de alumnos en consecuencia.
    const respuesta = await fetch(`${API_BASE}/alumnos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      if (resultado.errores) {
        Object.entries(resultado.errores).forEach(([campo, msg]) => {
          mostrarEstadoCampo(campo, { valido: false, mensaje: msg });
        });
      }
      return;
    }

    document.getElementById("form-alumno").reset();
    ["nombre", "apellido", "edad"].forEach((id) => limpiarEstadoCampo(id));
    await cargarAlumnos();
  } catch (error) {
    // Error de conexión; el usuario puede reintentar
  }
}

// Acá configuro los eventos del formulario y la validación en tiempo real
function configurarFormulario() {
  validarCampoEnTiempoReal("nombre", validarNombre);
  validarCampoEnTiempoReal("apellido", validarApellido);
  validarCampoEnTiempoReal("edad", validarEdad);

  document
    .getElementById("form-alumno")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!validarFormularioCompleto()) {
        return;
      }

      const datos = {
        nombre: document.getElementById("nombre").value.trim(),
        apellido: document.getElementById("apellido").value.trim(),
        edad: Number(document.getElementById("edad").value),
      };

      await registrarAlumno(datos);
    });
}

// Acá inicio toda la aplicación cuando el DOM está listo
document.addEventListener("DOMContentLoaded", () => {
  inicializarTema();
  inicializarVolverArriba();
  configurarFormulario();
  cargarAlumnos();
});
