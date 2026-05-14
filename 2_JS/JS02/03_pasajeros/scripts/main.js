// Importo las validaciones en español
import {
  validarNombreReal,
  validarEdadYFecha,
  validarDNI,
  validarTelefono,
  validarEmail,
  validarNacionalidad,
} from "../modules/validations.js";

// Obtengo los elementos del HTML
const formulario = document.getElementById("passengerForm");
const botonEnviar = document.getElementById("submitBtn");
const checkTerminos = document.getElementById("termsCheck");
const contenedorLista = document.getElementById("passengerList");
const selectHijos = document.getElementById("tieneHijos");
const inputCantHijos = document.getElementById("cantidadHijos");

// Cargo los datos desde LocalStorage (Consigna 3)
let listaPersonas = JSON.parse(localStorage.getItem("peopleList")) || [];

/**
 * Muestra el feedback visual (verde/rojo) dinámico
 */
const mostrarFeedback = (input, resultado) => {
  input.classList.toggle("is-valid", resultado.valido);
  input.classList.toggle("is-invalid", !resultado.valido);

  let mensajeError = input.parentElement.querySelector(".invalid-feedback");
  if (!mensajeError) {
    mensajeError = document.createElement("div");
    mensajeError.className = "invalid-feedback";
    input.parentNode.appendChild(mensajeError);
  }
  mensajeError.textContent = resultado.mensaje || "";
};

// Habilitar/Deshabilitar campo de hijos dinámicamente
selectHijos.addEventListener("change", () => {
  inputCantHijos.disabled = selectHijos.value === "no";
  if (inputCantHijos.disabled) {
    inputCantHijos.value = "0";
    inputCantHijos.classList.remove("is-valid", "is-invalid");
  }
});

/**
 * Chequea si el formulario es válido para habilitar el botón de envío
 */
const validarFormularioCompleto = () => {
  const nombreValido = validarNombreReal(formulario.nombre.value).valido;
  const apellidoValido = validarNombreReal(formulario.apellido.value).valido;
  const edadFechaValida = validarEdadYFecha(
    formulario.edad.value,
    formulario.fechaNac.value,
  ).valido;
  const dniValido = validarDNI(formulario.documento.value).valido;
  const emailValido = validarEmail(formulario.email.value).valido;
  const nacionalidadValida = validarNacionalidad(formulario.nacionalidad.value).valido;
  const terminosAceptados = checkTerminos.checked;

  botonEnviar.disabled = !(
    nombreValido &&
    apellidoValido &&
    edadFechaValida &&
    dniValido &&
    emailValido &&
    nacionalidadValida &&
    terminosAceptados
  );
};

// Validaciones en tiempo real mientras el usuario escribe
formulario.addEventListener("input", (e) => {
  const input = e.target;
  let resultado = { valido: true, mensaje: "" };

  if (input.id === "nombre" || input.id === "apellido") {
    resultado = validarNombreReal(input.value);
  } else if (input.id === "nacionalidad") {
    resultado = validarNacionalidad(input.value);
  } else if (input.id === "documento") {
    resultado = validarDNI(input.value);
  } else if (input.id === "telefono") {
    resultado = validarTelefono(input.value);
  } else if (input.id === "email") {
    resultado = validarEmail(input.value);
  } else if (input.id === "edad" || input.id === "fechaNac") {
    resultado = validarEdadYFecha(formulario.edad.value, formulario.fechaNac.value);

    // Sincronizar feedback visual entre ambos campos
    if (input.id === "fechaNac") {
      mostrarFeedback(
        document.getElementById("edad"),
        resultado.campo === "edad" ? resultado : { valido: true },
      );
    }

    if (!resultado.valido && resultado.campo && resultado.campo !== input.id) {
      resultado = { valido: true };
    }
  }

  if (input.tagName === "INPUT" && input.type !== "checkbox") {
    mostrarFeedback(input, resultado);
  }

  validarFormularioCompleto();
});

checkTerminos.addEventListener("change", validarFormularioCompleto);

/**
 * Dibuja la lista de personas almacenadas (Consigna 3)
 */
const dibujarListaPersonas = () => {
  contenedorLista.innerHTML = "";
  
  if (listaPersonas.length === 0) {
    contenedorLista.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted">No hay personas registradas en LocalStorage.</p>
            </div>
        `;
    return;
  }

  const titulo = document.createElement("h4");
  titulo.className = "col-12 mt-4 mb-3 h5 fw-bold text-uppercase";
  titulo.textContent = "Personas Registradas (LocalStorage):";
  contenedorLista.appendChild(titulo);

  listaPersonas.forEach((p, indice) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "col-md-6 mb-3";
    tarjeta.innerHTML = `
            <div class="card h-100 p-3 shadow-sm border-0 border-start border-primary border-4 bg-white">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="h6 mb-0 fw-bold">${p.nombre} ${p.apellido}</h5>
                    <span class="badge bg-light text-primary">${p.edad} años</span>
                </div>
                <div class="mb-3">
                    <small class="text-muted d-block">DNI: ${p.documento} | ${p.nacionalidad}</small>
                    <small class="text-muted d-block">${p.email}</small>
                    <small class="text-muted d-block">Hijos: ${p.hijos}</small>
                </div>
                <button class="btn btn-outline-danger btn-sm mt-auto w-100 py-2 fw-bold btn-borrar" 
                        style="border-radius: 12px; border-width: 2px;">
                    BORRAR REGISTRO
                </button>
            </div>
        `;

    // Borrar de LocalStorage
    tarjeta.querySelector(".btn-borrar").addEventListener("click", () => {
        listaPersonas.splice(indice, 1);
        localStorage.setItem("peopleList", JSON.stringify(listaPersonas));
        dibujarListaPersonas();
    });

    contenedorLista.appendChild(tarjeta);
  });
};

// Manejo el envío del formulario
formulario.addEventListener("submit", (e) => {
  e.preventDefault();

  const nuevaPersona = {
    nombre: formulario.nombre.value,
    apellido: formulario.apellido.value,
    edad: formulario.edad.value,
    fechaNac: formulario.fechaNac.value,
    sexo: formulario.sexo.value,
    documento: formulario.documento.value,
    estadoCivil: formulario.estadoCivil.value,
    nacionalidad: formulario.nacionalidad.value,
    telefono: formulario.telefono.value,
    email: formulario.email.value,
    hijos: formulario.tieneHijos.value === "si" ? formulario.cantidadHijos.value : 0,
  };

  listaPersonas.push(nuevaPersona);
  localStorage.setItem("peopleList", JSON.stringify(listaPersonas));

  dibujarListaPersonas();
  formulario.reset();

  // Limpiar clases de validación
  Array.from(formulario.elements).forEach((el) => {
    el.classList.remove("is-valid", "is-invalid");
  });

  validarFormularioCompleto();
});

// Dibujar lista al cargar la página
dibujarListaPersonas();
