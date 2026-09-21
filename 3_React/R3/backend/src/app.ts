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
import { errorHandler } from "./middleware/errorHandler";

const app: Application = express();

// middlewares globales
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
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

// manejador global de errores
app.use(errorHandler);

export default app;

