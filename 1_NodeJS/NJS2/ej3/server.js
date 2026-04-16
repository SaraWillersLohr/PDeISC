import http from "http";
import { analizarYMostrarURL } from "./modules/analizador.js";

const server = http.createServer((req, res) => {
  analizarYMostrarURL(req);

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("");
});

const PORT = 3003;
server.listen(PORT, () => {
  console.log(`--- Tarea 3: Modulo URL ---`);
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  console.log(
    `Al visitar el enlace, la pagina aparecera en blanco, pero veras los datos aqui en la consola.`,
  );
});
