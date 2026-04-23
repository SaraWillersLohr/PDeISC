import { nodeManager } from "../modules/nodes.js";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("link-container");
  const log = document.getElementById("event-log");
  const btnModify = document.getElementById("btn-modify-all");
  const btnStyle = document.getElementById("btn-change-style");

  const logChange = (message) => {
    if (log.innerHTML.includes("Esperando")) log.innerHTML = "";
    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.innerHTML = `[${new Date().toLocaleTimeString()}] ${message}`;
    log.prepend(entry);
  };

  const sites = [
    { name: "Google", url: "https://google.com" },
    { name: "GitHub", url: "https://github.com" },
    { name: "MDN Web Docs", url: "https://developer.mozilla.org" },
    { name: "Wikipedia", url: "https://wikipedia.org" },
    { name: "StackOverflow", url: "https://stackoverflow.com" },
  ];

  sites.forEach((site, index) => {
    const btn = document.getElementById(`btn-create-${index + 1}`);
    btn.addEventListener("click", () => {
      const a = nodeManager.createAnchor(site.name, site.url);
      container.appendChild(a);
      logChange(
        `Nodo <span class="highlight">&lt;a&gt;</span> creado: <span class="value">${site.name}</span> apuntando a <span class="value">${site.url}</span>`,
      );

      // Habilitar botones de modificación
      if (container.children.length > 0) {
        btnModify.disabled = false;
        btnStyle.disabled = false;
      }
    });
  });

  btnModify.addEventListener("click", () => {
    const links = container.querySelectorAll("a");
    const newUrl = "https://youtube.com";

    links.forEach((a) => {
      const { oldValue } = nodeManager.modifyAttribute(a, "href", newUrl);
      logChange(
        `Atributo <span class="highlight">href</span> modificado en "${a.textContent}": <span class="value">${oldValue}</span> &rarr; <span class="value">${newUrl}</span>`,
      );
    });
  });

  btnStyle.addEventListener("click", () => {
    const links = container.querySelectorAll("a");
    links.forEach((a) => {
      const newTarget = a.target === "_blank" ? "_self" : "_blank";
      nodeManager.modifyAttribute(a, "target", newTarget);
      logChange(
        `Atributo <span class="highlight">target</span> modificado en "${a.textContent}" a <span class="value">${newTarget}</span>`,
      );
      a.style.border = "2px solid red";
    });
  });
});
