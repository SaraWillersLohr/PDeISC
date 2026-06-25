const MENSAJE_NOMBRE_INVALIDO = "El nombre ingresado no parece válido";
const VOCALES = /[aeiouáéíóúAEIOUÁÉÍÓÚ]/;

// acá valido que el nombre tenga un formato real
export function validarCampoNombre(nombre) {
  const texto = nombre.trim();

  if (!texto || texto.length < 3 || texto.length > 60) {
    return MENSAJE_NOMBRE_INVALIDO;
  }

  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ\s]+$/.test(texto)) {
    return MENSAJE_NOMBRE_INVALIDO;
  }

  const palabras = texto.split(/\s+/).filter(Boolean);
  if (palabras.length === 0 || palabras.some((p) => !VOCALES.test(p))) {
    return MENSAJE_NOMBRE_INVALIDO;
  }

  const sinEspacios = texto.replace(/\s/g, "");
  if (/(.)\1{2,}/i.test(sinEspacios)) {
    return MENSAJE_NOMBRE_INVALIDO;
  }

  return "";
}

export function validarCampoEmail(email) {
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !regexEmail.test(email.trim())) {
    return "Ingresá un email válido.";
  }
  return "";
}

export function validarFormulario(nombre, email) {
  const errores = {};
  const errNombre = validarCampoNombre(nombre);
  const errEmail = validarCampoEmail(email);

  if (errNombre) errores.nombre = errNombre;
  if (errEmail) errores.email = errEmail;

  return { valido: Object.keys(errores).length === 0, errores };
}

// acá pongo el input en rojo y el mensaje debajo si hay error
export function mostrarErrorCampo(campoId, errorId, mensaje) {
  const campo = document.getElementById(campoId);
  const error = document.getElementById(errorId);
  if (!campo || !error) return;

  if (mensaje) {
    campo.classList.add("is-invalid");
    campo.classList.remove("is-valid");
    error.textContent = mensaje;
  } else {
    campo.classList.remove("is-invalid");
    campo.classList.add("is-valid");
    error.textContent = "";
  }
}

export function limpiarErroresFormulario() {
  ["input-nombre", "input-email"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("is-invalid", "is-valid");
  });
  ["error-nombre", "error-email"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = "";
  });
}

// habilito o bloqueo los botones de envío según la validación
export function actualizarBotonesEnvio(habilitado) {
  document.getElementById("btn-enviar-fetch").disabled = !habilitado;
  document.getElementById("btn-enviar-axios").disabled = !habilitado;
}

// acá muestro la respuesta que devolvió la api después del POST
export function mostrarResultadoCreacion(resultado, metodo, contenedor) {
  if (!contenedor) return;

  const { enviado, respuesta } = resultado;

  contenedor.innerHTML = `
    <section class="userhub-panel userhub-register-result userhub-fade-in mt-4">
      <h2 class="h5 mb-3"><i class="bi bi-check-circle text-success"></i> Usuario enviado correctamente</h2>
      <div class="userhub-resultado-row">
        <span class="userhub-resultado-label">ID de respuesta</span>
        <span>${respuesta.id}</span>
      </div>
      <div class="userhub-resultado-row">
        <span class="userhub-resultado-label">Nombre</span>
        <span>${enviado.name}</span>
      </div>
      <div class="userhub-resultado-row">
        <span class="userhub-resultado-label">Email</span>
        <span>${enviado.email}</span>
      </div>
      <p class="text-muted small mt-3 mb-0">Enviado con ${metodo}</p>
    </section>`;
  contenedor.classList.remove("d-none");
}

export function mostrarEstado(mensaje, tipo = "info") {
  const el = document.getElementById("estado-carga");
  if (!el) return;
  el.className = `alert alert-${tipo === "error" ? "danger" : tipo === "exito" ? "success" : "info"}`;
  el.textContent = mensaje;
  el.classList.remove("d-none");
}

export function ocultarEstado() {
  document.getElementById("estado-carga")?.classList.add("d-none");
}
