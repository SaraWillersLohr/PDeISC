export function analizarYMostrarURL(req) {
  const myUrl = new URL(req.url, `http://${req.headers.host}`);

  // muestro el analisis de la url en consola
  console.log("");
  console.log("Host:", myUrl.host);
  console.log("Pathname:", myUrl.pathname);
  console.log("Search:", myUrl.search);
  console.log("Query Params:", Object.fromEntries(myUrl.searchParams));

  return myUrl;
}
