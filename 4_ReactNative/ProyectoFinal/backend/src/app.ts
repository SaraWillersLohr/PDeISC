// configuro express, cors, json y las rutas públicas de la api.
import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { authRouter } from './routes/authRoutes.js';
import { adminRouter } from './routes/adminRoutes.js';
import { livestockRouter } from './routes/livestockRoutes.js';

export const app = express();

app.use(cors({ origin: env.frontendOrigin }));
app.use(express.json());
app.get('/api/health', (_request, response) => response.status(200).json({ status: 'ok' }));
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api', livestockRouter);
