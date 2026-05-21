// feedback con borde, mensaje e ícono ✓ / ✕
export const mostrarFeedback = (input, resultado) => {
  if (!input || input.type === "checkbox") return;

  const wrap = input.closest(".field-wrap");
  input.classList.toggle("is-valid", resultado.valido);
  input.classList.toggle("is-invalid", !resultado.valido);

  const mensaje = wrap?.querySelector(".invalid-feedback") || input.parentElement?.querySelector(".invalid-feedback");
  if (mensaje) mensaje.textContent = resultado.mensaje || "";

  const icono = wrap?.querySelector(".field-icon");
  if (icono) {
    icono.textContent = resultado.valido ? "✓" : "✕";
    icono.classList.toggle("icon-ok", resultado.valido);
    icono.classList.toggle("icon-error", !resultado.valido);
    icono.classList.toggle("icon-empty", !input.value && !resultado.valido);
  }
};

export const limpiarFeedbackFormulario = (formulario) => {
  formulario.querySelectorAll(".field-icon").forEach((icon) => {
    icon.textContent = "";
    icon.classList.remove("icon-ok", "icon-error");
    icon.classList.add("icon-empty");
  });
  Array.from(formulario.elements).forEach((el) => el.classList.remove("is-valid", "is-invalid"));
};
