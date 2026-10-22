// declaro las rutas públicas y protegidas de autenticación.
import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { requireAuthentication } from '../middleware/authMiddleware.js';

export const authRouter = Router();

authRouter.post('/login', authController.login);
authRouter.post('/refresh', authController.refresh);
authRouter.get('/me', requireAuthentication, authController.me);
