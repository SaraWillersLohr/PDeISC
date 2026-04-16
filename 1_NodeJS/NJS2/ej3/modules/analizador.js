export function analizarYMostrarURL(req) {
  const myUrl = new URL(req.url, `http://${req.headers.host}`);

  console.log("--- Tarea 3: Modulo URL (Analisis desde Modulo) ---");
  console.log("Host:", myUrl.host);
  console.log("Pathname:", myUrl.pathname);
  console.log("Search:", myUrl.search);
  console.log("Query Params:", Object.fromEntries(myUrl.searchParams));
  
  return myUrl;
}
