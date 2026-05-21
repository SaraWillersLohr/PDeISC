// Validaciones P6 — sin alerts
const REGEX_NOMBRE = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function limpiar(v) { return v ? String(v).trim() : ""; }

export function esNombreValido(nombre) {
  const l = limpiar(nombre);
  if (l.length < 2) return { ok: false, msg: "Mínimo 2 letras." };
  if (/\d/.test(l)) return { ok: false, msg: "Sin números en el nombre." };
  if (!REGEX_NOMBRE.test(l)) return { ok: false, msg: "Solo letras y espacios." };
  return { ok: true, msg: "" };
}

export function esEmailValido(email) {
  const l = limpiar(email);
  if (!l) return { ok: false, msg: "El correo es obligatorio." };
  if (!REGEX_EMAIL.test(l)) return { ok: false, msg: "Correo inválido." };
  return { ok: true, msg: "" };
}

export function esEdadValida(edad) {
  const n = Number(edad);
  if (limpiar(edad) === "") return { ok: false, msg: "La edad es obligatoria." };
  if (Number.isNaN(n)) return { ok: false, msg: "Debe ser un número." };
  if (n < 18 || n > 100) return { ok: false, msg: "Entre 18 y 100 años." };
  return { ok: true, msg: "" };
}

export function marcarCampo(input, ok, msg, idErr) {
  const span = document.getElementById(idErr);
  if (!input) return;
  input.classList.toggle("is-invalid", !ok);
  input.classList.toggle("is-valid", ok && limpiar(input.value) !== "");
  if (span) span.textContent = ok ? "" : msg;
}

// valido si aceptó los términos (checkbox obligatorio)
export function validarTerminosAceptados() {
  const checkbox = document.getElementById("reg-terminos");
  return checkbox?.checked === true;
}

// Feedback visual del bloque de términos (sin alert)
export function marcarBloqueTerminos(aceptado, mensaje = "") {
  const bloque = document.getElementById("terms-block");
  const feedback = document.getElementById("terms-feedback");
  const checkbox = document.getElementById("reg-terminos");
  const errSpan = document.getElementById("err-terminos");

  if (!bloque) return;

  bloque.classList.remove("is-invalid-terms", "is-valid-terms");
  checkbox?.classList.remove("is-invalid");

  if (aceptado) {
    bloque.classList.add("is-valid-terms");
    if (feedback) {
      feedback.className = "terms-feedback terms-feedback--ok is-visible";
      feedback.innerHTML = `<i class="bi bi-check-circle-fill flex-shrink-0"></i><span>${mensaje || "Aceptaste los Términos y Condiciones. Ya podés registrarte."}</span>`;
    }
    if (errSpan) errSpan.textContent = "";
  } else {
    bloque.classList.add("is-invalid-terms");
    checkbox?.classList.add("is-invalid");
    if (feedback) {
      feedback.className = "terms-feedback terms-feedback--error is-visible";
      feedback.innerHTML = `<i class="bi bi-exclamation-circle-fill flex-shrink-0"></i><span>${mensaje || "Tenés que leer y aceptar los Términos y Condiciones para registrarte."}</span>`;
    }
    if (errSpan) errSpan.textContent = mensaje || "Debés aceptar los términos.";
  }
}

export function ocultarFeedbackTerminos() {
  const feedback = document.getElementById("terms-feedback");
  if (feedback) {
    feedback.classList.remove("is-visible");
    feedback.innerHTML = "";
  }
}

export function validarFormulario(form) {
  const errores = {};
  const nombre = form.querySelector("#reg-nombre");
  const email = form.querySelector("#reg-email");
  const edad = form.querySelector("#reg-edad");
  const genero = form.querySelector('input[name="reg-genero"]:checked');
  const pais = form.querySelector("#reg-pais");

  const vN = esNombreValido(nombre?.value);
  marcarCampo(nombre, vN.ok, vN.msg, "err-nombre");
  if (!vN.ok) errores.nombre = vN.msg;

  const vE = esEmailValido(email?.value);
  marcarCampo(email, vE.ok, vE.msg, "err-email");
  if (!vE.ok) errores.email = vE.msg;

  const vEd = esEdadValida(edad?.value);
  marcarCampo(edad, vEd.ok, vEd.msg, "err-edad");
  if (!vEd.ok) errores.edad = vEd.msg;

  if (!genero) {
    errores.genero = "Elegí un género.";
    document.getElementById("err-genero").textContent = errores.genero;
  } else {
    document.getElementById("err-genero").textContent = "";
  }

  if (!pais?.value) {
    errores.pais = "Elegí un país.";
    marcarCampo(pais, false, errores.pais, "err-pais");
  } else {
    marcarCampo(pais, true, "", "err-pais");
  }

  // valido si aceptó los términos antes de permitir el submit
  if (!validarTerminosAceptados()) {
    errores.terminos = "Aceptá los Términos y Condiciones para continuar.";
    marcarBloqueTerminos(false, errores.terminos);
  } else {
    marcarBloqueTerminos(true);
  }

  return errores;
}
