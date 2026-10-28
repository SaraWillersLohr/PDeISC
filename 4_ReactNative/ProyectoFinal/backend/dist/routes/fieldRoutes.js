// protejo estadísticas y operaciones del campo según cada perfil.
import { Router } from 'express';
import * as field from '../controllers/fieldController.js';
import { requireAuthentication } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
export const fieldRouter = Router();
fieldRouter.use(requireAuthentication);
fieldRouter.get('/dashboard', requireRoles('administrador', 'dueno'), asyncHandler(field.dashboard));
fieldRouter.post('/animals/:id/weights', requireRoles('peon'), asyncHandler(field.createWeight));
fieldRouter.post('/reports/:kind', requireRoles('peon'), asyncHandler(field.createReport));
fieldRouter.get('/deaths', requireRoles('administrador'), asyncHandler(field.reviewDeaths));
fieldRouter.patch('/deaths/:id/review', requireRoles('administrador'), asyncHandler(field.reviewDeaths));
