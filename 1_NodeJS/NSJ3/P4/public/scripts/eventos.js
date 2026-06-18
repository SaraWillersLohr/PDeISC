// Comentarios claros: este archivo explica la lógica paso a paso.

import { agregarLog } from "./consola.js";
import { logAtributo } from "./ui.js";

const SITIOS = {
  google: { texto: "Google", href: "https://www.google.com" },
  github: { texto: "GitHub", href: "https://github.com" },
  mdn: { texto: "MDN", href: "https://developer.mozilla.org" },
  wiki: { texto: "Wikipedia", href: "https://www.wikipedia.org" },
  so: { texto: "Stack Overflow", href: "https://stackoverflow.com" }
};

export function bindEventos() {
  document.querySelectorAll("[data-create]").forEach((btn) => {
    btn.addEventListener("click", () => crearEnlace(btn.dataset.create));
  });
  document.getElementById("btn-modify-href")?.addEventListener("click", modificarHrefs);
}

function crearEnlace(key) {
  const sitio = SITIOS[key];
  const cont = document.getElementById("link-container");
  // Si if (!sitio || !cont), entonces se ejecuta este bloque.
  if (!sitio || !cont) return;

  const a = document.createElement("a");
  a.href = sitio.href;
  a.textContent = sitio.texto;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.className = "dynamic-link";
  cont.appendChild(a);

  document.getElementById("btn-modify-href").disabled = false;
  logAtributo(sitio.texto, "href", "(nuevo)", sitio.href);
  agregarLog("Nodos", `Se creó enlace: ${sitio.texto}`);
}

function modificarHrefs() {
  const nueva = "https://www.youtube.com";
  document.querySelectorAll("#link-container a").forEach((a) => {
    const ant = a.getAttribute("href");
    a.setAttribute("href", nueva);
    logAtributo(a.textContent, "href", ant, nueva);
  });
  agregarLog("Nodos", "Se modificó el href a YouTube");
}
