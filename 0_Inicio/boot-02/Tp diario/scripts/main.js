/**
 * Scripts principales del sitio
 * Organiza la inicialización de módulos y eventos globales
 */

import {
  validarNombre,
  validarEmail,
  calcularEdad,
  validarEdad,
} from "./validaciones.js";
import { cargarIndicadores } from "./indicadores.js";
import { iniciarTicker } from "./ticker.js";

document.addEventListener("DOMContentLoaded", () => {
  // ─── INICIALIZACIÓN DE MÓDULOS ───
  cargarIndicadores("economicos-data");
  iniciarTicker("ticker-text");

  // ─── NAVEGACIÓN Y MENÚ ───
  const header = document.querySelector(".header");
  const iconMenu = document.getElementById("iconMenu");
  const btnMenuMobile = document.getElementById("btnMenuMobile");
  const navLinks = document.querySelectorAll(".nav-link");
  const body = document.body;

  // Sticky Header Effect
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 50);
  });

  // Menú Mobile Toggle
  if (btnMenuMobile) {
    btnMenuMobile.addEventListener("click", () => {
      setTimeout(() => {
        const isExpanded =
          btnMenuMobile.getAttribute("aria-expanded") === "true";
        iconMenu.classList.replace(
          isExpanded ? "bi-list" : "bi-x-lg",
          isExpanded ? "bi-x-lg" : "bi-list",
        );
        body.classList.toggle("menu-open", isExpanded);
      }, 10);
    });
  }

  // Cierre automático de menú al clickear link
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const navbarCollapse = document.getElementById("navbarNav");
      if (navbarCollapse && navbarCollapse.classList.contains("show")) {
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        if (bsCollapse) bsCollapse.hide();
        iconMenu.classList.replace("bi-x-lg", "bi-list");
        body.classList.remove("menu-open");
      }
    });
  });

  // ─── FORMULARIO DE CONTACTO (DINÁMICO Y REAL-TIME) ───
  const contactoForm = document.getElementById("contactoForm");
  if (contactoForm) {
    const inputs = {
      nombre: document.getElementById("nombre"),
      email: document.getElementById("email"),
      fechaNac: document.getElementById("fechaNac"),
      edad: document.getElementById("edad"),
      asunto: document.getElementById("asunto"),
      dynamicSelect: document.getElementById("dynamicSelect"),
      archivo: document.getElementById("archivo"),
    };

    const errors = {
      nombre: document.getElementById("errorNombre"),
      email: document.getElementById("errorEmail"),
      fechaNac: document.getElementById("errorFechaNac"),
      asunto: document.getElementById("errorAsunto"),
      dynamic: document.getElementById("errorDynamic"),
    };

    // Helper para mostrar/limpiar errores visuales
    const updateError = (field, message) => {
      const errorEl = errors[field];
      const inputEl = inputs[field];
      if (!errorEl || !inputEl) return;

      if (message) {
        errorEl.textContent = message;
        errorEl.style.display = "block";
        inputEl.classList.add("is-invalid");
      } else {
        errorEl.textContent = "";
        errorEl.style.display = "none";
        inputEl.classList.remove("is-invalid");
        inputEl.classList.add("is-valid");
      }
    };

    // Validaciones en tiempo real (on input)
    inputs.nombre.addEventListener("input", () =>
      updateError("nombre", validarNombre(inputs.nombre.value)),
    );
    inputs.email.addEventListener("input", () =>
      updateError("email", validarEmail(inputs.email.value)),
    );

    inputs.fechaNac.addEventListener("change", () => {
      const edadCalculada = calcularEdad(inputs.fechaNac.value);
      inputs.edad.value = edadCalculada > 0 ? edadCalculada : "";
      updateError("fechaNac", validarEdad(edadCalculada));
    });

    // Lógica de Asunto Dinámico
    const opcionesDinamicas = {
      publicidad: {
        label: "Seleccioná el tipo de propuesta",
        options: [
          "Banner en portada",
          "Nota patrocinada",
          "Publicidad lateral",
          "Campaña semanal",
          "Colaboración comercial",
        ],
      },
      tip: {
        label: "¿Qué tipo de noticia desea compartir?",
        options: [
          "Política",
          "Deportes",
          "Tecnología",
          "Economía",
          "Espectáculos",
          "Suceso local",
          "Evento importante",
        ],
      },
      correccion: {
        label: "¿Qué desea corregir?",
        options: [
          "Error ortográfico",
          "Información incorrecta",
          "Fecha equivocada",
          "Imagen incorrecta",
          "Link roto",
          "Autor incorrecto",
        ],
      },
      consulta: {
        label: "¿Sobre qué tema es la consulta?",
        options: [
          "Suscripciones",
          "Cuenta de usuario",
          "Contacto comercial",
          "Problemas técnicos",
          "Navegación del sitio",
          "Información institucional",
        ],
      },
    };

    inputs.asunto.addEventListener("change", function () {
      const data = opcionesDinamicas[this.value];
      const dynamicContainer = document.getElementById("dynamicContainer");
      const dynamicLabel = document.getElementById("dynamicLabel");
      const fileContainer = document.getElementById("fileContainer");

      if (data) {
        dynamicLabel.textContent = data.label;
        inputs.dynamicSelect.innerHTML =
          '<option value="" disabled selected>Seleccioná una opción</option>';
        data.options.forEach((opt) => {
          const el = document.createElement("option");
          el.value = opt.toLowerCase().replace(/\s+/g, "-");
          el.textContent = opt;
          inputs.dynamicSelect.appendChild(el);
        });
        dynamicContainer.classList.remove("d-none");
        fileContainer.classList.remove("d-none");
        updateError("asunto", null);
      }
    });

    // Botón Quitar Archivo
    const btnRemoveFile = document.getElementById("btnRemoveFile");
    inputs.archivo.addEventListener("change", function () {
      btnRemoveFile.classList.toggle("d-none", !this.files.length);
    });
    btnRemoveFile.addEventListener("click", () => {
      inputs.archivo.value = "";
      btnRemoveFile.classList.add("d-none");
    });

    // Envío final
    contactoForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Re-validar todo antes de enviar
      const errNombre = validarNombre(inputs.nombre.value);
      const errEmail = validarEmail(inputs.email.value);
      const errEdad = validarEdad(calcularEdad(inputs.fechaNac.value));

      updateError("nombre", errNombre);
      updateError("email", errEmail);
      updateError("fechaNac", errEdad);
      if (!inputs.asunto.value) updateError("asunto", "Seleccioná un asunto.");
      if (inputs.asunto.value && !inputs.dynamicSelect.value)
        updateError("dynamic", "Campo obligatorio.");

      if (
        errNombre ||
        errEmail ||
        errEdad ||
        !inputs.asunto.value ||
        (inputs.asunto.value && !inputs.dynamicSelect.value)
      ) {
        return;
      }

      // Éxito
      const successMsg = document.getElementById("successMsg");
      successMsg.classList.remove("d-none");
      this.reset();
      document.getElementById("dynamicContainer").classList.add("d-none");
      document.getElementById("fileContainer").classList.add("d-none");
      setTimeout(() => successMsg.classList.add("d-none"), 5000);
    });
  }

  // ─── BOTÓN IR ARRIBA ───
  const btnScrollTop = document.getElementById("btnScrollTop");
  if (btnScrollTop) {
    window.addEventListener("scroll", () => {
      btnScrollTop.classList.toggle("show", window.scrollY > 400);
    });
    btnScrollTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});
