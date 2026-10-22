// Archivo backend/src/app.ts: la configuración de Express, CORS y montaje de rutas de la API. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
// configura middlewares y rutas de la api
import express, { Application, Request, Response } from "express";
import cors from "cors";
import { testConnection } from "./config/database";
import authRoutes from "./routes/authRoutes";
import usuarioRoutes from "./routes/usuarioRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import corralRoutes from "./routes/corralRoutes";
import especieRoutes from "./routes/especieRoutes";
import animalRoutes from "./routes/animalRoutes";
import tratamientoRoutes from "./routes/tratamientoRoutes";
import notificacionRoutes from "./routes/notificacionRoutes";
import reproduccionRoutes from "./routes/reproduccionRoutes";
import { errorHandler } from "./middleware/errorHandler";

const app: Application = express();

// middlewares globales. Expo Web suele usar localhost:8081; las apps nativas
// no envían Origin, por eso también se permiten solicitudes sin ese header.
const allowedOrigins = new Set([
  // Expo Web local defaults remain enabled even if .env has an older Vite origin.
  "http://localhost:8081",
  "http://127.0.0.1:8081",
  "http://localhost:5173",
  ...(process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
]);
app.use(cors({
  // Esta función implementa la operación «origin» del módulo de app. Recibe origin, callback como entrada.
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
}));
app.use(express.json());

// health check � confirma que la api y la db est�n activas
app.get("/api/health", async (_req: Request, res: Response) => {
  const dbOk = await testConnection();
  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? "ok" : "degraded",
    service: "estancia-app-api",
    database: dbOk ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// rutas de autenticaci�n y m�dulos
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/corrales", corralRoutes);
app.use("/api/especies", especieRoutes);
app.use("/api/animales", animalRoutes);
app.use("/api/tratamientos", tratamientoRoutes);
app.use("/api/notificaciones", notificacionRoutes);
app.use("/api/reproduccion", reproduccionRoutes);

// manejador global de errores
app.use(errorHandler);

export default app;

