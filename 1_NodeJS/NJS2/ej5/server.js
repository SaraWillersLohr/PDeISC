import http from "http";
import fs from "fs";
import url from "url";
import path from "path";
import { fileURLToPath } from "url";
import { getMenu } from "./modules/menu.js";
import { getClimaMDP } from "../ej1/modules/clima.js";
import { sumar, restar, multiplicar, dividir } from "../ej1/modules/calculo.js";
import { convertirAMayusculas } from "../ej4/modules/texto.js";
import { analizarYMostrarURL } from "../ej3/modules/analizador.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// sirvo css y js estaticos para la estetica visual
const archivosEstaticos = {
  "/styles/light.css": {
    ruta: path.join(__dirname, "styles", "light.css"),
    tipo: "text/css; charset=utf-8",
  },
  "/styles/dark.css": {
    ruta: path.join(__dirname, "styles", "dark.css"),
    tipo: "text/css; charset=utf-8",
  },
  "/scripts/theme.js": {
    ruta: path.join(__dirname, "scripts", "theme.js"),
    tipo: "application/javascript; charset=utf-8",
  },
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  const archivo = archivosEstaticos[pathname];
  if (archivo) {
    fs.readFile(archivo.ruta, (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error leyendo archivo estatico");
        return;
      }
      res.writeHead(200, { "Content-Type": archivo.tipo });
      res.end(data);
    });
    return;
  }

  let fileName = "index.html";
  let contentToInject = "";

  if (pathname === "/ej1") {
    fileName = "ej1.html";
    const clima = await getClimaMDP();

    let climaHTML = "";
    if (clima.error) {
      climaHTML = `<div class="alert alert-danger">${clima.error}</div>`;
    } else {
      climaHTML = `
                <div class="card bg-primary text-white text-center p-4 shadow mb-4">
                    <h3 class="display-6">Clima API</h3>
                    <p class="mb-2 opacity-75">${clima.lugar}</p>
                    <div class="display-2 mb-2">${clima.temperatura}C</div>
                    <p class="h4 mb-0">Humedad: ${clima.humedad}% | Viento: ${clima.viento}km/h</p>
                </div>
            `;
    }

    const calcHTML = `
            <div class="card shadow-sm border-0">
                <div class="card-header bg-dark text-white fw-bold">Calculos Matematicos</div>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between">Suma (10+5) <span class="badge bg-success">${sumar(10, 5)}</span></li>
                    <li class="list-group-item d-flex justify-content-between">Resta (20-8) <span class="badge bg-danger">${restar(20, 8)}</span></li>
                    <li class="list-group-item d-flex justify-content-between">Multiplicar (4*7) <span class="badge bg-info text-dark">${multiplicar(4, 7)}</span></li>
                    <li class="list-group-item d-flex justify-content-between">Dividir (100/4) <span class="badge bg-primary">${dividir(100, 4)}</span></li>
                </ul>
            </div>
        `;

    contentToInject = climaHTML + calcHTML;
  } else if (pathname === "/ej2") {
    fileName = "ej2.html";
    contentToInject = `
            <div class="alert alert-success">
                <h4 class="alert-heading">File System & HTTP</h4>
                <p>Este ejercicio lee archivos locales. Actualmente estas viendo una version integrada en el portfolio.</p>
                <hr>
                <p class="mb-0 small">El archivo original se encuentra en <code>ej2/pages/index.html</code>.</p>
            </div>
        `;
  } else if (pathname === "/ej3") {
    fileName = "ej3.html";
    const myUrl = analizarYMostrarURL(req);
    contentToInject = `
            <div class="bg-dark text-success p-4 rounded-3 font-monospace small shadow">
                <p class="mb-1">--- Tarea 3: Modulo URL (Analisis Real) ---</p>
                <p class="mb-1">Host: ${myUrl.host}</p>
                <p class="mb-1">Pathname: ${myUrl.pathname}</p>
                <p class="mb-1">Search: ${myUrl.search || "ninguno"}</p>
                <p class="mb-0 text-white-50">// Revisa la terminal de Node para ver los logs en tiempo real.</p>
            </div>
            <div class="mt-4 alert alert-warning">En el ejercicio original la pantalla queda en blanco, pero aqui te mostramos el analisis que el modulo realiza.</div>
        `;
  } else if (pathname === "/ej4") {
    fileName = "ej4.html";
    const originalText = "hola mundo desde el portfolio!";
    const processed = convertirAMayusculas(originalText);
    contentToInject = `
            <div class="card border-0 bg-light p-4 shadow-sm">
                <p class="text-muted small mb-1">Original:</p>
                <p class="h5 mb-3">"${originalText}"</p>
                <hr>
                <p class="text-muted small mb-1">Procesado con <strong>upper-case</strong>:</p>
                <p class="display-6 text-primary fw-bold">"${processed}"</p>
            </div>
        `;
  } else if (pathname === "/acerca") {
    fileName = "acerca.html";
    contentToInject = `
            <div class="alert alert-info">
                <p class="mb-0">Este proyecto fue desarrollado utilizando Node.js, modulos ES6 y Bootstrap 5.</p>
            </div>
        `;
  } else if (pathname !== "/") {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
    return;
  }

  const filePath = path.join(__dirname, "pages", fileName);

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Error leyendo la pagina");
      return;
    }

    let html = data.replace("{{MENU}}", getMenu());
    html = html.replace("{{CONTENT}}", contentToInject);

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  });
});

const PORT = 3005;
server.listen(PORT, () => {
  console.log(`--- Tarea 5: Proyecto Final ---`);
  console.log(`Servidor Portfolio corriendo en http://localhost:${PORT}`);
});
