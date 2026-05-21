export const mostrarFeedback = (input, resultado) => {
  if (!input || input.type === "checkbox" || input.type === "radio") return;
  input.classList.toggle("is-valid", resultado.valido);
  input.classList.toggle("is-invalid", !resultado.valido);
  const mensaje = input.parentElement?.querySelector(".invalid-feedback");
  if (mensaje) mensaje.textContent = resultado.mensaje || "";
};

export const limpiarFeedbackFormulario = (formulario) => {
  Array.from(formulario.elements).forEach((el) => el.classList.remove("is-valid", "is-invalid"));
};
