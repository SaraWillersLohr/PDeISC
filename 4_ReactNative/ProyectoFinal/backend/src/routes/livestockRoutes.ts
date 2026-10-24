// protejo las consultas de animales y corrales por sesión y rol vigente.
import { Router } from 'express';
import * as livestockController from '../controllers/livestockController.js';
import { requireAuthentication } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';

export const livestockRouter = Router();
livestockRouter.use(requireAuthentication);
livestockRouter.get('/animals', requireRoles('administrador', 'dueno', 'peon'), livestockController.listAnimals);
livestockRouter.post('/animals', requireRoles('administrador', 'dueno', 'peon'), livestockController.createAnimal);
livestockRouter.get('/corrals', requireRoles('administrador', 'dueno', 'peon'), livestockController.listCorrals);
livestockRouter.put('/animals/:id', requireRoles('administrador', 'dueno', 'peon'), livestockController.updateAnimal);
livestockRouter.post('/corrals', requireRoles('administrador', 'dueno'), livestockController.createCorral);
livestockRouter.put('/corrals/:id', requireRoles('administrador', 'dueno'), livestockController.updateCorral);
livestockRouter.delete('/corrals/:id', requireRoles('administrador', 'dueno'), livestockController.deleteCorral);
livestockRouter.post('/animals/:id/movements', requireRoles('administrador', 'peon'), livestockController.moveAnimal);
livestockRouter.get('/health/nursing', requireRoles('administrador', 'veterinario'), livestockController.listNursingAnimals);
livestockRouter.post('/health/animals/:id/discharge', requireRoles('administrador', 'veterinario'), livestockController.dischargeNursingAnimal);
livestockRouter.get('/notifications', requireRoles('administrador', 'dueno', 'peon'), livestockController.listNotifications);
