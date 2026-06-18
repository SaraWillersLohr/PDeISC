// Comentarios claros: este archivo explica la lógica paso a paso.

/* 
  Este archivo maneja el paso a paso del registro 
  y los cambios de tema (claro/oscuro).
*/
import { validator } from "../modules/validator.js";
import { stateManager } from "../modules/state.js";
import { Notificador } from "../modules/notifications.js";

document.addEventListener("DOMContentLoaded", () => {
  const steps = document.querySelectorAll(".step");
  const indicator = document.getElementById("step-indicator");
  const summaryContent = document.getElementById("summary-content");

  // Función para refrescar la vista según el paso en el que estamos
  const refrescarPantalla = () => {
    const estado = stateManager.get();
    
    // Mostramos solo el paso actual
    steps.forEach((step, idx) => {
      step.classList.toggle("active", idx + 1 === estado.currentStep);
    });

    // Actualizamos el texto de arriba
    if (estado.currentStep <= 3) {
      indicator.textContent = `Paso ${estado.currentStep} de 3`;
    } else {
      indicator.textContent = "¡Todo listo!";
    }

    // Cambiamos el look de la página si eligieron modo oscuro
    if (estado.theme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }

    // Si llegamos al final, mostramos el resumen
    if (estado.currentStep === 3) {
      dibujarResumen();
    }
  };

  const dibujarResumen = () => {
    const estado = stateManager.get();
    summaryContent.innerHTML = "";
    
    const datos = [
      { etiqueta: "Nombre", valor: estado.name },
      { etiqueta: "Tema", valor: estado.theme === "light" ? "Claro" : "Oscuro" }
    ];

    datos.forEach(item => {
      const p = document.createElement("p");
      p.innerHTML = `<strong>${item.etiqueta}:</strong> ${item.valor}`;
      summaryContent.appendChild(p);
    });
  };

  // --- Botón para contar elementos hijos ---
  const btnContar = document.getElementById("btn-count-children");
  const contenedorHijos = document.getElementById("children-demo");
  const resultadoHijos = document.getElementById("children-result");

  btnContar.addEventListener("click", () => {
    const cantidad = contenedorHijos.children.length;
    resultadoHijos.textContent = `Este cuadro tiene ${cantidad} etiquetas adentro.`;
    Notificador.mostrar(`Contamos ${cantidad} elementos.`);
  });

  // --- Botones del Paso 1 ---
  document.getElementById("next-1").addEventListener("click", async () => {
    const inputNombre = document.getElementById("name");
    const spanError = document.getElementById("error-name");
    const btnSig = document.getElementById("next-1");
    
    btnSig.disabled = true;
    btnSig.textContent = "Validando...";
    
    // Le preguntamos a la API si el nombre es real
    const validacion = await validator.isRealName(inputNombre.value);
    
    // Si if (validacion.valid), entonces se ejecuta este bloque.
    if (validacion.valid) {
      stateManager.update("name", inputNombre.value);
      stateManager.update("currentStep", 2);
      spanError.textContent = "";
      Notificador.exito("¡Nombre verificado!");
      refrescarPantalla();
    } else {
      spanError.textContent = validacion.message;
      Notificador.error("Revisa tu nombre");
    }
    
    btnSig.disabled = false;
    btnSig.textContent = "Siguiente";
  });

  // --- Botones del Paso 2 ---
  document.getElementById("prev-2").addEventListener("click", () => {
    stateManager.update("currentStep", 1);
    refrescarPantalla();
  });

  document.getElementById("next-2").addEventListener("click", () => {
    const selectTema = document.getElementById("theme");
    stateManager.update("theme", selectTema.value);
    stateManager.update("currentStep", 3);
    Notificador.mostrar("Tema guardado");
    refrescarPantalla();
  });

  // --- Botones del Paso 3 ---
  document.getElementById("prev-3").addEventListener("click", () => {
    stateManager.update("currentStep", 2);
    refrescarPantalla();
  });

  document.getElementById("finish").addEventListener("click", () => {
    stateManager.update("currentStep", 4);
    Notificador.exito("¡Registro completado con éxito!");
    refrescarPantalla();
  });

  // Botón para volver a empezar
  document.getElementById("restart").addEventListener("click", () => {
    stateManager.reset();
    document.getElementById("name").value = "";
    document.getElementById("theme").value = "light";
    refrescarPantalla();
  });

  // Iniciamos la vista
  refrescarPantalla();
});
