// publico las operaciones administrativas protegidas para solicitudes de acceso.
import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { requireRoles } from '../middleware/roleMiddleware.js';
import { requireAuthentication } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const adminRouter = Router();
adminRouter.use(requireAuthentication, requireRoles('dueno', 'gestor_usuarios'));
adminRouter.get('/registration-requests', asyncHandler(adminController.listRequests));
adminRouter.post('/registration-requests/:id/approve', asyncHandler(adminController.approveRequest));
adminRouter.post('/registration-requests/:id/reject', asyncHandler(adminController.rejectRequest));
