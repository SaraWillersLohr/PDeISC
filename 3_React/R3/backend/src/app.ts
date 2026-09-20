import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { testConnection } from './config/database';
import authRoutes from './routes/authRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

// middlewares globales
app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json());

// health check — confirma que la api y la db están activas
app.get('/api/health', async (_req: Request, res: Response) => {
  const dbOk = await testConnection();
  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? 'ok' : 'degraded',
    service: 'estancia-app-api',
    database: dbOk ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// rutas de autenticación y gestión de usuarios
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/dashboard', dashboardRoutes);

// manejador global de errores
app.use(errorHandler);

export default app;
