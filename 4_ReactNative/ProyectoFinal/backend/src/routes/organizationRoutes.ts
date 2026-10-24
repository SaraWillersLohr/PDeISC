// limito la gestión de usuarios y solicitudes de catálogo al administrador.
import { Router } from 'express';
import * as organization from '../controllers/organizationController.js';
import { requireAuthentication } from '../middleware/authMiddleware.js';
import { requireAdministrator } from '../middleware/adminMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';

export const organizationRouter = Router();
organizationRouter.use(requireAuthentication);
organizationRouter.get('/users', requireRoles('administrador','dueno'), organization.listUsers);
organizationRouter.put('/users/:id', requireAdministrator, organization.updateUser);
organizationRouter.delete('/users/:id', requireAdministrator, organization.deactivateUser);
organizationRouter.get('/catalog', requireRoles('administrador','dueno','peon'), organization.listCatalog);
organizationRouter.post('/catalog/requests', requireRoles('administrador','peon'), organization.requestCatalog);
organizationRouter.patch('/catalog/requests/:id', requireAdministrator, organization.reviewCatalog);
