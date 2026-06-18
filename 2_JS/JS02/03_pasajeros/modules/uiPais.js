// Yo importo las funciones que necesito de otros módulos
import { obtenerConfigPais } from "./paisConfig.js";
import { validarDocumento, validarTelefono } from "./validations.js";
import { mostrarFeedback } from "./feedback.js";

// Yo actualizo el prefijo, límites y hints cuando cambia el país seleccionado
export const aplicarReglasPais = (formulario, consola) => {
  // Yo obtengo el código del país seleccionado y su configuración
  const codigo = formulario.nacionalidad.value;
  const config = obtenerConfigPais(codigo);
  const prefijo = formulario.prefijoTelefono;
  const telefono = formulario.telefono;
  const documento = formulario.documento;
  const hintDoc = document.getElementById("documentoHint");
  const hintTel = document.getElementById("telefonoHint");
  const contador = document.getElementById("telefonoContador");

  // Si no hay configuración, reseteo los valores
  if (!config) {
    prefijo.value = "";
    telefono.maxLength = 15;
    documento.maxLength = 11;
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (hintDoc)
      hintDoc.textContent =
        "Elegí nacionalidad para ver el formato del documento";
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (hintTel) hintTel.textContent = "";
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (contador) contador.textContent = "";
    return;
  }

  // Yo aplico las reglas del país seleccionado
  prefijo.value = config.prefijo;
  telefono.maxLength = config.telefono.max;
  documento.maxLength = config.documento.max;

  // Yo actualizo los mensajes de ayuda (hints)
  if (hintDoc) hintDoc.textContent = config.documento.mensaje;
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (hintTel) hintTel.textContent = config.telefono.mensaje;
  actualizarContadorTelefono(telefono, config.telefono.max, contador);

  // Yo valido los campos con las nuevas reglas del país
  mostrarFeedback(documento, validarDocumento(documento.value, codigo));
  mostrarFeedback(telefono, validarTelefono(telefono.value, codigo));
  consola?.log(`Nacionalidad: ${config.nombre} → prefijo ${config.prefijo}`);
};

// Yo actualizo el contador de dígitos del teléfono en tiempo real
export const actualizarContadorTelefono = (input, max, contadorEl) => {
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!contadorEl) return;
  const len = input.value.replace(/\D/g, "").length;
  contadorEl.textContent = `${len} / ${max} dígitos`;
  contadorEl.classList.toggle("text-danger", len > max);
};

// Yo filtro el input para permitir solo números
export const soloNumeros = (input) => {
  const limpio = input.value.replace(/\D/g, "");
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (input.value !== limpio) input.value = limpio;
};