// protejo la sincronización y dejo los permisos de cada operación al controlador.
import { Router } from 'express';
import { synchronizeOperations } from '../controllers/syncController.js';
import { requireAuthentication } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
export const syncRouter = Router();
syncRouter.use(requireAuthentication);
syncRouter.post('/operations', requireRoles('administrador', 'dueno', 'peon', 'veterinario'), asyncHandler(synchronizeOperations));
