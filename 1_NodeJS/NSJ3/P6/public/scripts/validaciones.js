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

export function validarFormulario(form) {
  const errores = {};
  const nombre = form.querySelector("#reg-nombre");
  const email = form.querySelector("#reg-email");
  const edad = form.querySelector("#reg-edad");
  const genero = form.querySelector('input[name="reg-genero"]:checked');
  const pais = form.querySelector("#reg-pais");
  const terminos = form.querySelector("#reg-terminos");

  const vN = esNombreValido(nombre?.value);
  marcarCampo(nombre, vN.ok, vN.msg, "err-nombre");
  if (!vN.ok) errores.nombre = vN.msg;

  const vE = esEmailValido(email?.value);
  marcarCampo(email, vE.ok, vE.msg, "err-email");
  if (!vE.ok) errores.email = vE.msg;

  const vEd = esEdadValida(edad?.value);
  marcarCampo(edad, vEd.ok, vEd.msg, "err-edad");
  if (!vEd.ok) errores.edad = vEd.msg;

  if (!genero) { errores.genero = "Elegí un género."; document.getElementById("err-genero").textContent = errores.genero; }
  else document.getElementById("err-genero").textContent = "";

  if (!pais?.value) { errores.pais = "Elegí un país."; marcarCampo(pais, false, errores.pais, "err-pais"); }
  else marcarCampo(pais, true, "", "err-pais");

  if (!terminos?.checked) { errores.terminos = "Aceptá los términos."; document.getElementById("err-terminos").textContent = errores.terminos; }
  else document.getElementById("err-terminos").textContent = "";

  return errores;
}
