// Archivo backend/src/server.ts: el arranque del servidor HTTP y la escucha en el puerto configurado. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
// arranque del servidor express
import "dotenv/config";
// inicia el servidor http de la api
import app from "./app";
// Configuración: PORT establece puerto HTTP en el que escucha el backend; modificá esta constante solo si querés cambiar esa regla para toda la aplicación.
const PORT = Number(process.env.PORT ?? 3001);

app.listen(PORT, () => {
  console.log(`[estancia-app] api escuchando en http://localhost:${PORT}`);
  console.log(`[estancia-app] health: http://localhost:${PORT}/api/health`);
});

