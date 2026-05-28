// Yo muestro feedback visual (verde/rojo) en los inputs según si la validación es correcta o no
export const mostrarFeedback = (input, resultado) => {
  // Si no hay input o es un checkbox, no hago nada porque no necesito feedback visual
  if (!input || input.type === "checkbox") return;

  // Yo agrego o quito las clases de Bootstrap para mostrar el estado de validación
  input.classList.toggle("is-valid", resultado.valido);
  input.classList.toggle("is-invalid", !resultado.valido);

  // Yo busco el elemento de mensaje de error y actualizo su texto
  const mensaje = input.parentElement?.querySelector(".invalid-feedback");
  if (mensaje) mensaje.textContent = resultado.mensaje || "";
};

// Yo limpio todo el feedback visual del formulario cuando se resetea
export const limpiarFeedbackFormulario = (formulario) => {
  Array.from(formulario.elements).forEach((el) => {
    el.classList.remove("is-valid", "is-invalid");
  });
};
