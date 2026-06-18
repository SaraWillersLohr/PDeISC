// Comentarios claros: este archivo explica la lógica paso a paso.

/** 
 * ¡Hola! Este archivo es mi caja de herramientas para mostrar los arrays en la pantalla.
 * Aquí definí varias funciones que me ayudan a que todo se vea lindo y ordenado.
 */

// Esta función me sirve para convertir un array en una cadena de texto que parezca código real.
export function formatArrayLiteral(arr) {
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!Array.isArray(arr)) return String(arr);
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (arr.length === 0) return "[]";

  // Función items que organiza esta parte del código.
  const items = arr.map((item) => {
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (item === null) return "null";
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (typeof item === "object") {
      // Si el objeto tiene nombre y edad, lo formateo de una forma especial.
      if (item.nombre !== undefined && item.edad !== undefined) {
        return `{ nombre: "${item.nombre}", edad: ${item.edad} }`;
      }
      // Lo mismo si tiene nombre y activo (para los usuarios).
      if (item.nombre !== undefined && item.activo !== undefined) {
        return `{ nombre: "${item.nombre}", activo: ${item.activo} }`;
      }
      // O si tiene nombre y precio (para el carrito).
      if (item.nombre !== undefined && item.precio !== undefined) {
        return `{ nombre: "${item.nombre}", precio: ${item.precio} }`;
      }
      return JSON.stringify(item);
    }
    // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (typeof item === "string") return `"${item}"`;
    return String(item);
  });

  return `[${items.join(", ")}]`;
}

// Con esta función dibujo esas "etiquetas" (badges) que ves en la página para cada elemento del array.
export function renderBadges(container, arr, { emptyText = "vacío", highlightLast = false } = {}) {
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!container) return;

  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!arr || arr.length === 0) {
    container.innerHTML = `<span class="array-empty">${emptyText}</span>`;
    return;
  }

  container.innerHTML = arr
    .map((item, idx) => {
      const label =
        typeof item === "object" && item !== null
          ? item.nombre ?? JSON.stringify(item)
          : String(item);
      const isLast = highlightLast && idx === arr.length - 1;
      return `<span class="array-badge ${isLast ? "array-badge--highlight" : ""}" data-idx="${idx}"><small class="array-badge__idx">[${idx}]</small><span class="array-badge__label">${escapeHtml(label)}</span></span>`;
    })
    .join("");
}

/**
 * ¡Esta es la función estrella! Pinta todo el flujo: cómo estaba el array ANTES, 
 * qué OPERACIÓN le hicimos y cómo quedó como RESULTADO.
 */
// Función function que ayuda a entender la lógica.
export function paintFlow(container, { before, operation, after, note = "" }) {
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!container) return;

  const beforeArr = Array.isArray(before) ? before : [];
  const afterArr = Array.isArray(after) ? after : [];

  container.className = "array-flow";
  container.innerHTML = `
    <div class="flow-step flow-step--before">
      <span class="flow-label">ANTES</span>
      <code class="flow-code">${formatArrayLiteral(beforeArr)}</code>
      <div class="flow-badges" data-role="before-badges"></div>
    </div>
    <div class="flow-arrow" aria-hidden="true"><i class="fas fa-arrow-down"></i></div>
    <div class="flow-step flow-step--op">
      <span class="flow-label">OPERACIÓN</span>
      <code class="flow-op-code">${escapeHtml(operation)}</code>
      ${note ? `<p class="flow-note">${escapeHtml(note)}</p>` : ""}
    </div>
    <div class="flow-arrow" aria-hidden="true"><i class="fas fa-arrow-down"></i></div>
    <div class="flow-step flow-step--after">
      <span class="flow-label">RESULTADO</span>
      <code class="flow-code flow-code--result">${formatArrayLiteral(afterArr)}</code>
      <div class="flow-badges" data-role="after-badges"></div>
    </div>
  `;

  // Después de armar el HTML, mando a renderizar los badges en cada paso.
  const beforeBadges = container.querySelector('[data-role="before-badges"]');
  const afterBadges = container.querySelector('[data-role="after-badges"]');
  renderBadges(beforeBadges, beforeArr);
  renderBadges(afterBadges, afterArr);
}

/** Una forma más simple de mostrar una lista, por si la necesito. */
// Función function que ayuda a entender la lógica.
export function renderArrayIn(container, arr) {
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!container) return;
  container.className = (container.className || "") + " items-container";
  renderBadges(container, arr);
}

// Una función interna para evitar que me rompan el HTML con caracteres raros.
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}