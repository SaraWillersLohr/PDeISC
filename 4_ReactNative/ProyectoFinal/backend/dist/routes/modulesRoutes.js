// restrinjo las tareas y los registros reproductivos a los roles habilitados.
import { Router } from 'express';
import * as modules from '../controllers/modulesController.js';
import { requireAuthentication } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
export const modulesRouter = Router();
modulesRouter.use(requireAuthentication);
modulesRouter.get('/tasks', requireRoles('administrador', 'peon'), asyncHandler(modules.listTasks));
modulesRouter.post('/tasks', requireRoles('administrador'), asyncHandler(modules.createTask));
modulesRouter.patch('/tasks/:id', requireRoles('administrador', 'peon'), asyncHandler(modules.updateTask));
modulesRouter.get('/reproduction', requireRoles('administrador', 'dueno', 'peon'), asyncHandler(modules.listReproduction));
modulesRouter.post('/reproduction/mating-services', requireRoles('dueno', 'peon'), asyncHandler(modules.createMatingService));
modulesRouter.post('/reproduction/mating-services/:id/confirm-pregnancy', requireRoles('dueno', 'peon'), asyncHandler(modules.confirmPregnancy));
modulesRouter.post('/reproduction/births', requireRoles('dueno', 'peon'), asyncHandler(modules.createBirth));
modulesRouter.delete('/reproduction/mating-services/:id', requireRoles('dueno'), asyncHandler(modules.deleteMatingService));
modulesRouter.delete('/reproduction/births/:id', requireRoles('dueno'), asyncHandler(modules.deleteBirthRecord));
modulesRouter.get('/events', requireRoles('administrador', 'dueno'), asyncHandler(modules.listEvents));
