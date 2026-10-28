// limito la gestión de usuarios y solicitudes de catálogo al administrador.
import { Router } from 'express';
import * as organization from '../controllers/organizationController.js';
import { requireAuthentication } from '../middleware/authMiddleware.js';
import { requireAdministrator } from '../middleware/adminMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const organizationRouter = Router();
organizationRouter.use(requireAuthentication);
organizationRouter.get('/users', requireRoles('administrador','dueno'), asyncHandler(organization.listUsers));
organizationRouter.put('/users/:id', requireAdministrator, asyncHandler(organization.updateUser));
organizationRouter.delete('/users/:id', requireAdministrator, asyncHandler(organization.deactivateUser));
organizationRouter.get('/catalog', requireRoles('administrador','dueno','peon'), asyncHandler(organization.listCatalog));
organizationRouter.post('/catalog/species', requireRoles('dueno'), asyncHandler(organization.createSpecies));
organizationRouter.post('/catalog/species/:id/breeds', requireRoles('dueno'), asyncHandler(organization.createBreed));
organizationRouter.delete('/catalog/species/:id', requireRoles('dueno'), asyncHandler(organization.deleteSpecies));
organizationRouter.delete('/catalog/breeds/:id', requireRoles('dueno'), asyncHandler(organization.deleteBreed));
organizationRouter.post('/catalog/requests', requireRoles('peon'), asyncHandler(organization.requestCatalog));
organizationRouter.patch('/catalog/requests/:id', requireRoles('dueno'), asyncHandler(organization.reviewCatalog));
