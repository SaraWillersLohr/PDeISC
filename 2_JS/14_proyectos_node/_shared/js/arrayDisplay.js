/** Helpers para mostrar arrays en pantalla con estilo académico */

export function formatArrayLiteral(arr) {
  if (!Array.isArray(arr)) return String(arr);
  if (arr.length === 0) return "[]";

  const items = arr.map((item) => {
    if (item === null) return "null";
    if (typeof item === "object") {
      if (item.nombre !== undefined && item.edad !== undefined) {
        return `{ nombre: "${item.nombre}", edad: ${item.edad} }`;
      }
      if (item.nombre !== undefined && item.activo !== undefined) {
        return `{ nombre: "${item.nombre}", activo: ${item.activo} }`;
      }
      if (item.nombre !== undefined && item.precio !== undefined) {
        return `{ nombre: "${item.nombre}", precio: ${item.precio} }`;
      }
      return JSON.stringify(item);
    }
    if (typeof item === "string") return `"${item}"`;
    return String(item);
  });

  return `[${items.join(", ")}]`;
}

export function renderBadges(container, arr, { emptyText = "vacío", highlightLast = false } = {}) {
  if (!container) return;

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
 * Pinta bloque ANTES → OPERACIÓN → RESULTADO en un contenedor
 */
export function paintFlow(container, { before, operation, after, note = "" }) {
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

  const beforeBadges = container.querySelector('[data-role="before-badges"]');
  const afterBadges = container.querySelector('[data-role="after-badges"]');
  renderBadges(beforeBadges, beforeArr);
  renderBadges(afterBadges, afterArr);
}

/** Contenedor legacy: solo badges (lista simple) */
export function renderArrayIn(container, arr) {
  if (!container) return;
  container.className = (container.className || "") + " items-container";
  renderBadges(container, arr);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
