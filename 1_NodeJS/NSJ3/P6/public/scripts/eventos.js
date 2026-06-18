// Comentarios claros: este archivo explica la lógica paso a paso.

import { agregarLog } from "./consola.js";
import {
  validarFormulario,
  esNombreValido,
  esEmailValido,
  esEdadValida,
  marcarCampo,
  marcarBloqueTerminos,
  ocultarFeedbackTerminos,
  validarTerminosAceptados
} from "./validaciones.js";
import { abrirModalTerminos } from "./terminos.js";

export function bindEventos() {
  const form = document.getElementById("registro-form");
  // Si if (!form), entonces se ejecuta este bloque.
  if (!form) return;

  form.querySelector("#reg-nombre")?.addEventListener("input", (e) => {
    const v = esNombreValido(e.target.value);
    marcarCampo(e.target, v.ok, v.msg, "err-nombre");
  });

  form.querySelector("#reg-email")?.addEventListener("input", (e) => {
    const v = esEmailValido(e.target.value);
    marcarCampo(e.target, v.ok, v.msg, "err-email");
  });

  form.querySelector("#reg-edad")?.addEventListener("input", (e) => {
    const v = esEdadValida(e.target.value);
    marcarCampo(e.target, v.ok, v.msg, "err-edad");
  });

  // Cuando marca/desmarca el checkbox, actualizo el estado visual
  const checkboxTerminos = form.querySelector("#reg-terminos");
  checkboxTerminos?.addEventListener("change", () => {
    // Si if (validarTerminosAceptados()), entonces se ejecuta este bloque.
    if (validarTerminosAceptados()) {
      marcarBloqueTerminos(true);
      agregarLog("Términos", "Checkbox de aceptación marcado");
    } else {
      ocultarFeedbackTerminos();
      document.getElementById("terms-block")?.classList.remove("is-valid-terms", "is-invalid-terms");
      document.getElementById("err-terminos").textContent = "";
    }
  });

  // Si hace click en el label del checkbox sin querer abrir modal, solo togglea
  // (los links tienen data-open-terminos y abren el modal aparte)

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const resultado = document.getElementById("registro-resultado");
    const errores = validarFormulario(form);

    // Si no aceptó términos, muestro feedback y abro el modal para ayudar
    if (errores.terminos) {
      agregarLog("Formulario", "Intento de registro sin aceptar términos");
      abrirModalTerminos();
      return;
    }

    // Si if (Object.keys(errores).length > 0), entonces se ejecuta este bloque.
    if (Object.keys(errores).length > 0) {
      agregarLog("Formulario", "Envío con errores en otros campos");
      return;
    }

    const datos = {
      nombre: form.querySelector("#reg-nombre").value.trim(),
      genero: form.querySelector('input[name="reg-genero"]:checked').value,
      pais: form.querySelector("#reg-pais").value,
      terminos: "Aceptados",
      edad: form.querySelector("#reg-edad").value,
      email: form.querySelector("#reg-email").value.trim()
    };

    resultado.innerHTML = `
      <h2 class="h6 fw-bold text-main mb-3"><i class="bi bi-check-circle-fill text-success me-1"></i> Registro completado</h2>
      <ul class="list-group list-group-flush">
        <li class="list-group-item bg-transparent px-0"><strong>Nombre:</strong> ${datos.nombre}</li>
        <li class="list-group-item bg-transparent px-0"><strong>Género:</strong> ${datos.genero}</li>
        <li class="list-group-item bg-transparent px-0"><strong>País:</strong> ${datos.pais}</li>
        <li class="list-group-item bg-transparent px-0"><strong>Términos:</strong> ${datos.terminos}</li>
        <li class="list-group-item bg-transparent px-0"><strong>Edad:</strong> ${datos.edad}</li>
        <li class="list-group-item bg-transparent px-0"><strong>Email:</strong> ${datos.email}</li>
      </ul>
    `;
    agregarLog("Formulario", `Registro OK: ${datos.nombre}`);
  });
}
