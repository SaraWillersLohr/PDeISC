/** rutas de tratamientos médicos */
import { Router } from 'express';
import * as tratamientoController from '../controllers/tratamientoController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';

const router = Router();

router.use(authenticate);

/** cualquier usuario autenticado puede leer historial médico */
router.get('/', tratamientoController.listByAnimal);

/** solo veterinarios, dueño y copropietario pueden registrar tratamientos */
router.post('/', authorize('veterinario', 'dueno', 'copropietario'), tratamientoController.create);

export default router;
