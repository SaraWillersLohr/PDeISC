// Yo importo todas las funciones y clases que necesito de los módulos
import {
  validarNombreReal,
  validarEdadYFecha,
  validarDocumento,
  validarTelefono,
  validarEmail,
  validarNacionalidad,
  validarHijos,
  validarSexo,
  validarEstadoCivil,
  validarFormularioCompleto,
  calcularEdadDesdeFecha,
} from "../modules/validations.js";
import { dibujarListaPersonas } from "../modules/render.js";
import { initTheme } from "../modules/theme.js";
import { mostrarToast } from "../modules/toast.js";
import {
  mostrarFeedback,
  limpiarFeedbackFormulario,
} from "../modules/feedback.js";
import {
  aplicarReglasPais,
  actualizarContadorTelefono,
  soloNumeros,
} from "../modules/uiPais.js";
import { obtenerConfigPais } from "../modules/paisConfig.js";

// Yo obtengo todas las referencias a los elementos del DOM que voy a usar
const formulario = document.getElementById("passengerForm");
const botonEnviar = document.getElementById("submitBtn");
const checkTerminos = document.getElementById("termsCheck");
const contenedorLista = document.getElementById("passengerList");
const bannerEstado = document.getElementById("saveStatus");
const selectHijos = document.getElementById("tieneHijos");
const inputCantHijos = document.getElementById("cantidadHijos");

initTheme();

// Yo cargo la lista de personas desde localStorage al iniciar
let listaPersonas = JSON.parse(localStorage.getItem("peopleList")) || [];

// Yo muestro el estado del guardado en el banner
const mostrarEstadoGuardado = (ok, mensaje) => {
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!bannerEstado) return;
  bannerEstado.className = `save-status glass-panel ${ok ? "is-ok" : "is-error"}`;
  bannerEstado.textContent = mensaje;
  bannerEstado.hidden = false;
};

// Yo actualizo el estado del botón de enviar según la validación
const actualizarBoton = () => {
  botonEnviar.disabled = !validarFormularioCompleto(formulario, checkTerminos);
};

// Yo comparo la edad con la fecha real usando el objeto Date
const revalidarEdadFecha = () => {
  const res = validarEdadYFecha(
    formulario.edad.value,
    formulario.fechaNac.value,
  );
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (res.valido) {
    mostrarFeedback(formulario.edad, res);
    mostrarFeedback(formulario.fechaNac, res);
    return;
  }
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (res.campo === "edad") {
    mostrarFeedback(formulario.edad, res);
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (formulario.fechaNac.value)
      mostrarFeedback(formulario.fechaNac, { valido: true, mensaje: "" });
  } else {
    mostrarFeedback(formulario.fechaNac, res);
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (formulario.edad.value !== "")
      mostrarFeedback(formulario.edad, { valido: true, mensaje: "" });
  }
};

// Yo creo la función para borrar una persona de la lista
const borrarPersona = (indice) => {
  listaPersonas.splice(indice, 1);
  localStorage.setItem("peopleList", JSON.stringify(listaPersonas));
  dibujarListaPersonas(listaPersonas, contenedorLista, borrarPersona);
  mostrarToast("toastZone", "Persona eliminada de localStorage", "success");
};

// Yo manejo el cambio en el select de hijos
selectHijos.addEventListener("change", () => {
  inputCantHijos.disabled = selectHijos.value === "no";
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (inputCantHijos.disabled) {
    inputCantHijos.value = "0";
    inputCantHijos.classList.remove("is-valid", "is-invalid");
  }
  actualizarBoton();
});

// Yo manejo el cambio de nacionalidad para aplicar las reglas del país
formulario.nacionalidad.addEventListener("change", () => {
  mostrarFeedback(
    formulario.nacionalidad,
    validarNacionalidad(formulario.nacionalidad.value),
  );
  aplicarReglasPais(formulario);
  actualizarBoton();
});

// Yo manejo el input del documento para validar y filtrar números
formulario.documento.addEventListener("input", () => {
  soloNumeros(formulario.documento);
  const pais = formulario.nacionalidad.value;
  mostrarFeedback(
    formulario.documento,
    validarDocumento(formulario.documento.value, pais),
  );
  actualizarBoton();
});

// Yo manejo el input del teléfono para validar y actualizar el contador
formulario.telefono.addEventListener("input", () => {
  soloNumeros(formulario.telefono);
  const pais = formulario.nacionalidad.value;
  const config = obtenerConfigPais(pais);
  actualizarContadorTelefono(
    formulario.telefono,
    config?.telefono.max || 15,
    document.getElementById("telefonoContador"),
  );
  mostrarFeedback(
    formulario.telefono,
    validarTelefono(formulario.telefono.value, pais),
  );
  actualizarBoton();
});

// Yo manejo el input general del formulario para validar campos
formulario.addEventListener("input", (e) => {
  const input = e.target;
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (["documento", "telefono", "nacionalidad"].includes(input.id)) return;

  let resultado = { valido: true, mensaje: "" };
  const pais = formulario.nacionalidad.value;

  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (input.id === "nombre" || input.id === "apellido")
    resultado = validarNombreReal(input.value);
  // Comprueba la siguiente condición y ejecuta este bloque cuando se cumpla.
else if (input.id === "email") resultado = validarEmail(input.value);
  // Comprueba la siguiente condición y ejecuta este bloque cuando se cumpla.
else if (input.id === "edad" || input.id === "fechaNac") {
    // Si el usuario ingresa la fecha, yo calculo automáticamente la edad
    if (input.id === "fechaNac" && input.value) {
      const edadCalculada = calcularEdadDesdeFecha(input.value);
      // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!isNaN(edadCalculada) && edadCalculada >= 0) {
        formulario.edad.value = edadCalculada;
      }
    }
    revalidarEdadFecha();
    actualizarBoton();
    return;
  } else if (input.id === "cantidadHijos") {
    resultado = validarHijos(selectHijos.value, input.value);
  }

  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (input.tagName === "INPUT" && input.type !== "checkbox") {
    mostrarFeedback(input, resultado);
  }
  actualizarBoton();
});

// Yo manejo el cambio de sexo
formulario.sexo.addEventListener("change", () => {
  mostrarFeedback(formulario.sexo, validarSexo(formulario.sexo.value));
  actualizarBoton();
});

// Yo manejo el cambio de estado civil
formulario.estadoCivil.addEventListener("change", () => {
  mostrarFeedback(
    formulario.estadoCivil,
    validarEstadoCivil(formulario.estadoCivil.value),
  );
  actualizarBoton();
});

// Yo manejo el cambio de términos
checkTerminos.addEventListener("change", actualizarBoton);

// Yo manejo el envío del formulario para guardar una nueva persona
formulario.addEventListener("submit", (e) => {
  e.preventDefault();

  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!validarFormularioCompleto(formulario, checkTerminos)) {
    mostrarEstadoGuardado(
      false,
      "Guardado incorrecto: revisá los campos marcados en rojo",
    );
    mostrarToast("toastZone", "No se pudo guardar el registro", "error");
    return;
  }

  const pais = formulario.nacionalidad.value;
  const config = obtenerConfigPais(pais);

  // Yo creo el objeto con los datos de la nueva persona
  const nuevaPersona = {
    nombre: formulario.nombre.value.trim(),
    apellido: formulario.apellido.value.trim(),
    edad: formulario.edad.value,
    fechaNac: formulario.fechaNac.value,
    sexo: formulario.sexo.value,
    documento: formulario.documento.value.trim(),
    estadoCivil: formulario.estadoCivil.value,
    nacionalidad: config.nombre,
    nacionalidadCodigo: pais,
    telefono: `${formulario.prefijoTelefono.value} ${formulario.telefono.value.trim()}`,
    email: formulario.email.value.trim(),
    hijos: selectHijos.value === "si" ? formulario.cantidadHijos.value : "0",
  };

  // Yo guardo la persona en localStorage
  listaPersonas.push(nuevaPersona);
  localStorage.setItem("peopleList", JSON.stringify(listaPersonas));

  // Yo actualizo la interfaz
  dibujarListaPersonas(listaPersonas, contenedorLista, borrarPersona);
  mostrarEstadoGuardado(
    true,
    `Guardado correcto: ${nuevaPersona.nombre} ${nuevaPersona.apellido} en localStorage`,
  );
  mostrarToast("toastZone", "Persona guardada con éxito", "success");

  // Yo limpio el formulario y reseteo el estado
  formulario.reset();
  inputCantHijos.disabled = true;
  inputCantHijos.value = "0";
  limpiarFeedbackFormulario(formulario);
  aplicarReglasPais(formulario);
  actualizarBoton();
});

// Yo inicio la aplicación cargando datos y aplicando reglas
dibujarListaPersonas(listaPersonas, contenedorLista, borrarPersona);
aplicarReglasPais(formulario);
actualizarBoton();
