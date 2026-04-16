import http from "http";

const server = http.createServer((req, res) => {
  const myUrl = new URL(req.url, `http://${req.headers.host}`);

  console.log("--- Tarea 3: Modulo URL (Servidor Escuchando) ---");
  console.log("Host:", myUrl.host);
  console.log("Pathname:", myUrl.pathname);
  console.log("Search:", myUrl.search);
  console.log("Query Params:", Object.fromEntries(myUrl.searchParams));

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
