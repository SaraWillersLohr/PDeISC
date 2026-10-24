// restrinjo las tareas y los registros reproductivos a los roles habilitados.
import { Router } from 'express';
import * as modules from '../controllers/modulesController.js';
import { requireAuthentication } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';

export const modulesRouter = Router();
modulesRouter.use(requireAuthentication);
modulesRouter.get('/tasks', requireRoles('administrador','peon'), modules.listTasks);
modulesRouter.post('/tasks', requireRoles('administrador'), modules.createTask);
modulesRouter.patch('/tasks/:id', requireRoles('administrador','peon'), modules.updateTask);
modulesRouter.get('/reproduction', requireRoles('administrador','dueno','peon'), modules.listReproduction);
modulesRouter.post('/reproduction/mating-services', requireRoles('administrador','dueno','peon'), modules.createMatingService);
modulesRouter.post('/reproduction/births', requireRoles('administrador','dueno','peon'), modules.createBirth);
modulesRouter.get('/events', requireRoles('administrador','dueno'), modules.listEvents);
