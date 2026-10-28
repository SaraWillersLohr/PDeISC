// protejo las consultas de animales y corrales por sesión y rol vigente.
import { Router } from 'express';
import * as livestockController from '../controllers/livestockController.js';
import { requireAuthentication } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const livestockRouter = Router();
livestockRouter.use(requireAuthentication);
livestockRouter.get('/animals', requireRoles('administrador', 'dueno', 'peon'), asyncHandler(livestockController.listAnimals));
livestockRouter.post('/animals', requireRoles('dueno', 'peon'), asyncHandler(livestockController.createAnimal));
livestockRouter.get('/corrals', requireRoles('administrador', 'dueno', 'peon'), asyncHandler(livestockController.listCorrals));
livestockRouter.put('/animals/:id', requireRoles('dueno', 'peon'), asyncHandler(livestockController.updateAnimal));
livestockRouter.post('/animals/:id/deactivate', requireRoles('dueno'), asyncHandler(livestockController.deactivateAnimal));
livestockRouter.delete('/animals/:id', requireRoles('dueno'), asyncHandler(livestockController.permanentlyDeleteInactiveAnimal));
livestockRouter.post('/corrals', requireRoles('dueno'), asyncHandler(livestockController.createCorral));
livestockRouter.put('/corrals/:id', requireRoles('dueno'), asyncHandler(livestockController.updateCorral));
livestockRouter.delete('/corrals/:id', requireRoles('dueno'), asyncHandler(livestockController.deleteCorral));
livestockRouter.post('/animals/:id/movements', requireRoles('peon'), asyncHandler(livestockController.moveAnimal));
livestockRouter.get('/health/nursing', requireRoles('administrador', 'dueno', 'veterinario'), asyncHandler(livestockController.listNursingAnimals));
livestockRouter.get('/health/animals/:id/records', requireRoles('administrador', 'dueno', 'veterinario'), asyncHandler(livestockController.listVeterinaryRecords));
livestockRouter.post('/health/animals/:id/records', requireRoles('veterinario'), asyncHandler(livestockController.createVeterinaryRecord));
livestockRouter.patch('/health/animals/:id/status', requireRoles('veterinario'), asyncHandler(livestockController.updateNursingHealthStatus));
livestockRouter.post('/health/animals/:id/discharge', requireRoles('veterinario'), asyncHandler(livestockController.dischargeNursingAnimal));
livestockRouter.get('/notifications', requireRoles('administrador', 'dueno', 'peon', 'veterinario'), asyncHandler(livestockController.listNotifications));
livestockRouter.patch('/notifications/:id', requireRoles('administrador', 'dueno', 'peon', 'veterinario'), asyncHandler(livestockController.updateNotification));
