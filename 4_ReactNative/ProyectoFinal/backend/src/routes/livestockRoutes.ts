// protejo las consultas de animales y corrales por sesión y rol vigente.
import { Router } from 'express';
import * as livestockController from '../controllers/livestockController.js';
import { requireAuthentication } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';

export const livestockRouter = Router();
livestockRouter.use(requireAuthentication);
livestockRouter.get('/animals', requireRoles('administrador', 'dueno', 'peon'), livestockController.listAnimals);
livestockRouter.get('/corrals', requireRoles('administrador', 'dueno', 'peon'), livestockController.listCorrals);
livestockRouter.post('/animals/:id/movements', requireRoles('administrador', 'peon'), livestockController.moveAnimal);
livestockRouter.get('/health/nursing', requireRoles('administrador', 'veterinario'), livestockController.listNursingAnimals);
livestockRouter.post('/health/animals/:id/discharge', requireRoles('administrador', 'veterinario'), livestockController.dischargeNursingAnimal);
livestockRouter.get('/notifications', requireRoles('administrador', 'dueno', 'peon'), livestockController.listNotifications);
