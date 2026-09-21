/** rutas de notificaciones y alertas */
import { Router } from 'express';
import * as notificacionController from '../controllers/notificacionController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

/** cualquier usuario autenticado puede consultar o gestionar las alertas */
router.get('/', notificacionController.list);
router.delete('/:id', notificacionController.remove);
router.delete('/', notificacionController.clear);

export default router;
