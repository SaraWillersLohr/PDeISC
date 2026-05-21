import { obtenerConfigPais } from "./paisConfig.js";
import { validarDocumento, validarTelefono } from "./validations.js";
import { mostrarFeedback } from "./feedback.js";

// actualizo prefijo, límites y hints cuando cambia el país
export const aplicarReglasPais = (formulario, consola) => {
  const codigo = formulario.nacionalidad.value;
  const config = obtenerConfigPais(codigo);
  const prefijo = formulario.prefijoTelefono;
  const telefono = formulario.telefono;
  const documento = formulario.documento;
  const hintDoc = document.getElementById("documentoHint");
  const hintTel = document.getElementById("telefonoHint");
  const contador = document.getElementById("telefonoContador");

  if (!config) {
    prefijo.value = "";
    telefono.maxLength = 15;
    documento.maxLength = 11;
    if (hintDoc) hintDoc.textContent = "Elegí nacionalidad para ver el formato del documento";
    if (hintTel) hintTel.textContent = "";
    if (contador) contador.textContent = "";
    return;
  }

  prefijo.value = config.prefijo;
  telefono.maxLength = config.telefono.max;
  documento.maxLength = config.documento.max;

  if (hintDoc) hintDoc.textContent = config.documento.mensaje;
  if (hintTel) hintTel.textContent = config.telefono.mensaje;
  actualizarContadorTelefono(telefono, config.telefono.max, contador);

  mostrarFeedback(documento, validarDocumento(documento.value, codigo));
  mostrarFeedback(telefono, validarTelefono(telefono.value, codigo));
  consola?.log(`Nacionalidad: ${config.nombre} → prefijo ${config.prefijo}`);
};

export const actualizarContadorTelefono = (input, max, contadorEl) => {
  if (!contadorEl) return;
  const len = input.value.replace(/\D/g, "").length;
  contadorEl.textContent = `${len} / ${max} dígitos`;
  contadorEl.classList.toggle("text-danger", len > max);
};

export const soloNumeros = (input) => {
  const limpio = input.value.replace(/\D/g, "");
  if (input.value !== limpio) input.value = limpio;
};
