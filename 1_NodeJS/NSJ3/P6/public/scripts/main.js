// Comentarios claros: este archivo explica la lógica paso a paso.

/* 
  Este archivo maneja el envío del formulario,
  mostrando errores o el resumen final.
*/
import { formValidator } from "../modules/form-validator.js";
import { resultRenderer } from "../modules/result-renderer.js";
import { Notificador } from "../modules/notifications.js";

document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("event-form");
  const seccionForm = document.getElementById("form-section");
  const seccionResultado = document.getElementById("result-section");
  const btnVolver = document.getElementById("btn-back");
  const btnEnviar = document.getElementById("btn-submit");

  // Función para borrar los mensajes de error anteriores
  const limpiarErrores = () => {
    document.querySelectorAll(".error").forEach(el => (el.textContent = ""));
  };

  // Función para mostrar los errores donde corresponden
  const mostrarErrores = (errores) => {
    for (const [campo, mensaje] of Object.entries(errores)) {
      const elError = document.getElementById(`err-${campo}`);
      // Si if (elError), entonces se ejecuta este bloque.
      if (elError) elError.textContent = mensaje;
    }
    Notificador.error("Revisá los campos marcados en rojo.");
  };

  // Cuando el usuario hace clic en "Inscribirme"
  formulario.addEventListener("submit", async (e) => {
    e.preventDefault(); // Evitamos que la página se recargue
    limpiarErrores();

    // Ponemos el botón en modo "espera"
    btnEnviar.disabled = true;
    const textoOriginal = btnEnviar.textContent;
    btnEnviar.textContent = "Verificando datos...";

    // Recogemos todos los datos del formulario
    const datosForm = new FormData(formulario);
    
    // Le pedimos al validador que los revise (incluye la API de nombres)
    const errores = await formValidator.validate(datosForm);

    // Si if (Object.keys(errores).length === 0), entonces se ejecuta este bloque.
    if (Object.keys(errores).length === 0) {
      // Si no hay errores, mostramos el resumen
      const datosFinales = Object.fromEntries(datosForm.entries());
      resultRenderer.render(datosFinales, "result-data");
      
      seccionForm.classList.add("hidden");
      seccionResultado.classList.remove("hidden");
      
      Notificador.exito("¡Te anotaste correctamente!");
    } else {
      // Si hay errores, los mostramos
      mostrarErrores(errores);
    }

    // Restauramos el botón
    btnEnviar.disabled = false;
    btnEnviar.textContent = textoOriginal;
  });

  // Botón para volver atrás y anotar a otra persona
  btnVolver.addEventListener("click", () => {
    seccionResultado.classList.add("hidden");
    seccionForm.classList.remove("hidden");
    formulario.reset();
    limpiarErrores();
    Notificador.mostrar("Formulario reiniciado");
  });
});
