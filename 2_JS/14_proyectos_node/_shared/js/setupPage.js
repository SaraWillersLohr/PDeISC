/** 
 * ¡Hola! Este archivo es el decorador de mis páginas.
 * Se encarga de inyectar el banner del método, el botón de tema y preparar la consola.
 */

import { getMethodMeta } from "./methodMeta.js";
import { initTheme } from "./theme.js";

// Esta es la función principal que arma todo el "look and feel" común de los TPs.
export function setupPage(methodId) {
  const meta = getMethodMeta(methodId);
  injectThemeToggle();
  injectMethodBanner(meta);
  ensureConsolePlaceholder();
  initTheme();
  document.body.classList.add("tp-ready");
}

// Inyecto el botoncito para cambiar entre modo claro y oscuro.
function injectThemeToggle() {
  if (document.getElementById("themeToggle")) return;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.id = "themeToggle";
  btn.className = "theme-toggle glass-panel";
  btn.innerHTML = '<i class="fas fa-moon"></i><span class="theme-toggle__label">Oscuro</span>';
  document.body.appendChild(btn);
}

// Aquí armo el banner superior que te dice si el método muta el array o no.
function injectMethodBanner(meta) {
  const header = document.querySelector(".tp-header, header.text-center, header");
  if (!header || document.getElementById("methodBanner")) return;

  const mutateClass = meta.mutates ? "mutates-yes" : "mutates-no";
  const mutateText = meta.mutates
    ? '<i class="fas fa-pen"></i> Modifica el array original'
    : '<i class="fas fa-shield"></i> No modifica el original';

  const banner = document.createElement("div");
  banner.id = "methodBanner";
  banner.className = "method-banner glass-panel";
  banner.innerHTML = `
    <div class="method-banner__top">
      <span class="method-badge">${meta.title}</span>
      <span class="method-mutates ${mutateClass}">${mutateText}</span>
    </div>
    <p class="method-banner__summary">${meta.summary}</p>
    <p class="method-banner__hint"><i class="fas fa-lightbulb"></i> ${meta.hint}</p>
  `;

  header.insertAdjacentElement("afterend", banner);
}

// Me aseguro de que haya un lugar donde enganchar la consola de eventos.
function ensureConsolePlaceholder() {
  if (document.getElementById("eventConsole")) return;
  const placeholder = document.createElement("div");
  placeholder.id = "eventConsoleMount";
  document.body.appendChild(placeholder);
}
