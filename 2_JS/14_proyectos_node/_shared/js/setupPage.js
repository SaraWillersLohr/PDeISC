import { getMethodMeta } from "./methodMeta.js";
import { initTheme } from "./theme.js";

/** Armo el layout común: banner del método, toggle de tema, consola */
export function setupPage(methodId) {
  const meta = getMethodMeta(methodId);
  injectThemeToggle();
  injectMethodBanner(meta);
  ensureConsolePlaceholder();
  initTheme();
  document.body.classList.add("tp-ready");
}

function injectThemeToggle() {
  if (document.getElementById("themeToggle")) return;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.id = "themeToggle";
  btn.className = "theme-toggle glass-panel";
  btn.innerHTML = '<i class="fas fa-moon"></i><span class="theme-toggle__label">Oscuro</span>';
  document.body.appendChild(btn);
}

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

function ensureConsolePlaceholder() {
  if (document.getElementById("eventConsole")) return;
  const placeholder = document.createElement("div");
  placeholder.id = "eventConsoleMount";
  document.body.appendChild(placeholder);
}
