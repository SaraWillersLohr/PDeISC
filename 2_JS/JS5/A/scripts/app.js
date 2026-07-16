import { inicializarTema } from '../context/tema.js';
import { inicializarVolverArriba } from '../context/volverArriba.js';
import { validarNombre, validarApellido, validarEdad } from '../validaciones/validaciones.js';

const API_BASE = '/api';

// Acá convierto el resultado de validación en mensaje de error o éxito para mostrar en pantalla
function obtenerMensajeCampo(resultado) {
  if (!resultado.valido) return { error: resultado.mensaje, exito: '' };
  return { error: '', exito: resultado.mensaje };
}

// Acá muestro el estado visual del campo: error (rojo), válido (verde) o neutro
function mostrarEstadoCampo(campoId, resultado) {
  const input = document.getElementById(campoId);
  const mensajeDiv = document.getElementById(`error-${campoId}`);
  const { error, exito } = obtenerMensajeCampo(resultado);

  input.classList.remove('input-error', 'input-valid');
  mensajeDiv.classList.remove('mensaje-valido');
  mensajeDiv.textContent = '';

  if (error) {
    input.classList.add('input-error');
    mensajeDiv.textContent = error;
  } else if (input.value.trim() !== '') {
    input.classList.add('input-valid');
    mensajeDiv.classList.add('mensaje-valido');
    mensajeDiv.textContent = exito;
  }
}

// Acá limpio el estado visual de un campo después de resetear el formulario
function limpiarEstadoCampo(campoId) {
  const input = document.getElementById(campoId);
  const mensajeDiv = document.getElementById(`error-${campoId}`);
  input.classList.remove('input-error', 'input-valid');
  mensajeDiv.classList.remove('mensaje-valido');
  mensajeDiv.textContent = '';
}

// Acá valido un campo en tiempo real mientras el usuario escribe
function validarCampoEnTiempoReal(campoId, validador) {
  const input = document.getElementById(campoId);
  input.addEventListener('input', () => {
    const resultado = validador(input.value);
    mostrarEstadoCampo(campoId, resultado);
  });
}

// Acá valido todos los campos antes de permitir el envío del formulario
function validarFormularioCompleto() {
  const resultadoNombre = validarNombre(document.getElementById('nombre').value);
  const resultadoApellido = validarApellido(document.getElementById('apellido').value);
  const resultadoEdad = validarEdad(document.getElementById('edad').value);

  mostrarEstadoCampo('nombre', resultadoNombre);
  mostrarEstadoCampo('apellido', resultadoApellido);
  mostrarEstadoCampo('edad', resultadoEdad);

  return resultadoNombre.valido && resultadoApellido.valido && resultadoEdad.valido;
}

// Acá renderizo la tabla de alumnos con los datos recibidos de la API
function renderizarTabla(alumnos) {
  const tbody = document.getElementById('tabla-alumnos-body');
  const contador = document.getElementById('contador-alumnos');

  contador.textContent = `${alumnos.length} alumno${alumnos.length !== 1 ? 's' : ''}`;

  if (alumnos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="mensaje-vacio">No hay alumnos registrados.</td></tr>';
    return;
  }

  tbody.innerHTML = alumnos.map(alumno => `
    <tr>
      <td>${alumno.id}</td>
      <td>${alumno.nombre}</td>
      <td>${alumno.apellido}</td>
      <td>${alumno.edad}</td>
    </tr>
  `).join('');
}

// Acá pido la lista de alumnos a la API con GET y actualizo la tabla
async function cargarAlumnos() {
  try {
    const respuesta = await fetch(`${API_BASE}/listar-alumnos`, {
      method: 'GET'
    });

    if (!respuesta.ok) {
      throw new Error('Error al obtener alumnos');
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
    const respuesta = await fetch(`${API_BASE}/alumnos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
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

    document.getElementById('form-alumno').reset();
    ['nombre', 'apellido', 'edad'].forEach(id => limpiarEstadoCampo(id));
    await cargarAlumnos();
  } catch (error) {
    // Error de conexión; el usuario puede reintentar
  }
}

// Acá configuro los eventos del formulario y la validación en tiempo real
function configurarFormulario() {
  validarCampoEnTiempoReal('nombre', validarNombre);
  validarCampoEnTiempoReal('apellido', validarApellido);
  validarCampoEnTiempoReal('edad', validarEdad);

  document.getElementById('form-alumno').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validarFormularioCompleto()) {
      return;
    }

    const datos = {
      nombre: document.getElementById('nombre').value.trim(),
      apellido: document.getElementById('apellido').value.trim(),
      edad: Number(document.getElementById('edad').value)
    };

    await registrarAlumno(datos);
  });
}

// Acá inicio toda la aplicación cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
  inicializarTema();
  inicializarVolverArriba();
  configurarFormulario();
  cargarAlumnos();
});
