// configuro express, cors, json y las rutas públicas de la api.
import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { authRouter } from './routes/authRoutes.js';
import { adminRouter } from './routes/adminRoutes.js';
import { livestockRouter } from './routes/livestockRoutes.js';
import { fieldRouter } from './routes/fieldRoutes.js';
import { organizationRouter } from './routes/organizationRoutes.js';
import { modulesRouter } from './routes/modulesRoutes.js';
import { syncRouter } from './routes/syncRoutes.js';
export const app = express();
const allowedOrigins = env.frontendOrigin.split(',').map((origin) => origin.trim()).filter(Boolean);
app.use(cors({ origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || (env.nodeEnv !== 'production' && isDevelopmentOrigin(origin)))
            callback(null, true);
        else
            callback(new Error('origen no permitido por CORS'));
    } }));
app.use(express.json({ limit: '5mb' }));
app.get('/api/health', (_request, response) => response.status(200).json({ status: 'ok' }));
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api', livestockRouter);
app.use('/api', fieldRouter);
app.use('/api/organization', organizationRouter);
app.use('/api', modulesRouter);
app.use('/api/sync', syncRouter);
// respondo de forma consistente incluso ante fallas de conexión no capturadas por un controlador.
app.use((error, _req, res, _next) => {
    if (res.headersSent)
        return;
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
    const unavailable = /^(ER_|ECONN|ETIMEDOUT|PROTOCOL|EHOST|ENET|QUEUE_LIMIT)/.test(code);
    if (unavailable) {
        res.status(503).json({ message: 'la base de datos no está disponible; intentá nuevamente en unos segundos' });
        return;
    }
    console.error('Error no controlado en una solicitud de API.');
    res.status(500).json({ message: 'no se pudo completar la solicitud' });
});
// acepto orígenes localhost y redes privadas solo durante desarrollo.
function isDevelopmentOrigin(origin) {
    try {
        const url = new URL(origin);
        if (url.protocol !== 'http:')
            return false;
        const host = url.hostname.toLowerCase();
        if (host === 'localhost' || host === '::1' || host === '[::1]')
            return true;
        const parts = host.split('.').map(Number);
        if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255))
            return false;
        return parts[0] === 10 || parts[0] === 192 && parts[1] === 168 || parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31;
    }
    catch {
        return false;
    }
}
