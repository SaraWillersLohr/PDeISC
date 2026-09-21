// arranque del servidor express
import dotenv from "dotenv";
// inicia el servidor http de la api
import app from "./app";

dotenv.config();

const PORT = Number(process.env.PORT ?? 3001);

app.listen(PORT, () => {
  console.log(`[estancia-app] api escuchando en http://localhost:${PORT}`);
  console.log(`[estancia-app] health: http://localhost:${PORT}/api/health`);
});

