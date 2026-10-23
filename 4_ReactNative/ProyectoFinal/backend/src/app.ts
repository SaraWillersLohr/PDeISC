// configuro express, cors, json y las rutas públicas de la api.
import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { authRouter } from './routes/authRoutes.js';
import { adminRouter } from './routes/adminRoutes.js';
import { livestockRouter } from './routes/livestockRoutes.js';

export const app = express();

const allowedOrigins = env.frontendOrigin.split(',').map((origin) => origin.trim()).filter(Boolean);
app.use(cors({ origin: (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) callback(null, true);
  else callback(new Error('origen no permitido por CORS'));
} }));
app.use(express.json());
app.get('/api/health', (_request, response) => response.status(200).json({ status: 'ok' }));
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api', livestockRouter);
