// Yo muestro feedback visual con borde, mensaje e ícono ✓ / ✕ en los inputs
export const mostrarFeedback = (input, resultado) => {
  // Si no hay input o es un checkbox, no hago nada porque no necesito feedback visual
  if (!input || input.type === "checkbox") return;

  // Yo busco el wrapper del campo para aplicar estilos
  const wrap = input.closest(".field-wrap");
  // Yo agrego o quito las clases de Bootstrap para mostrar el estado de validación
  input.classList.toggle("is-valid", resultado.valido);
  input.classList.toggle("is-invalid", !resultado.valido);

  // Yo busco el elemento de mensaje de error y actualizo su texto
  const mensaje =
    wrap?.querySelector(".invalid-feedback") ||
    input.parentElement?.querySelector(".invalid-feedback");
  if (mensaje) mensaje.textContent = resultado.mensaje || "";

  // Yo actualizo el ícono visual (✓ para válido, ✕ para inválido)
  const icono = wrap?.querySelector(".field-icon");
  if (icono) {
    icono.textContent = resultado.valido ? "✓" : "✕";
    icono.classList.toggle("icon-ok", resultado.valido);
    icono.classList.toggle("icon-error", !resultado.valido);
    icono.classList.toggle("icon-empty", !input.value && !resultado.valido);
  }
};

// Yo limpio todo el feedback visual del formulario cuando se resetea
export const limpiarFeedbackFormulario = (formulario) => {
  // Yo limpio todos los íconos visuales
  formulario.querySelectorAll(".field-icon").forEach((icon) => {
    icon.textContent = "";
    icon.classList.remove("icon-ok", "icon-error");
    icon.classList.add("icon-empty");
  });
  // Yo limpio las clases de validación de todos los elementos
  Array.from(formulario.elements).forEach((el) =>
    el.classList.remove("is-valid", "is-invalid"),
  );
};
