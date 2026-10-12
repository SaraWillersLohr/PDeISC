// configura middlewares y rutas de la api
import express, { Application, Request, Response } from "express";
import cors from "cors";
import session from 'express-session';
import passport from 'passport';
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
import { configurePassport } from './config/passport';

const app: Application = express();
const sessionSecret = process.env.SESSION_SECRET;

if (process.env.NODE_ENV === 'production' && !sessionSecret) {
  throw new Error('SESSION_SECRET es obligatoria en producción');
}

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
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
}));
app.use(express.json());
app.use(session({
  secret: sessionSecret ?? 'solo-desarrollo-cambiar-en-produccion',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 10 * 60 * 1000,
  },
}));
app.use(passport.initialize());
configurePassport();

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

