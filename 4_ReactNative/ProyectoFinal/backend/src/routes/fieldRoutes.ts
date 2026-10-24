// protejo estadísticas y operaciones del campo según cada perfil.
import { Router } from 'express';
import * as field from '../controllers/fieldController.js';
import { requireAuthentication } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';

export const fieldRouter = Router();
fieldRouter.use(requireAuthentication);
fieldRouter.get('/dashboard', requireRoles('administrador', 'dueno'), field.dashboard);
fieldRouter.post('/animals/:id/weights', requireRoles('administrador', 'peon'), field.createWeight);
fieldRouter.post('/reports/:kind', requireRoles('administrador', 'peon'), field.createReport);
fieldRouter.get('/deaths', requireRoles('administrador'), field.reviewDeaths);
fieldRouter.patch('/deaths/:id/review', requireRoles('administrador'), field.reviewDeaths);
fieldRouter.get('/map/areas', requireRoles('administrador', 'dueno', 'peon'), field.mapAreas);
fieldRouter.put('/map/areas/:id', requireRoles('administrador', 'dueno'), field.saveMapArea);
