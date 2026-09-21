/** rutas de especies y razas */
import { Router } from 'express';
import * as especieController from '../controllers/especieController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', especieController.list);
router.post('/', authorize('dueno', 'copropietario'), especieController.createEspecie);
router.post('/:idEspecie/razas', authorize('dueno', 'copropietario'), especieController.createRaza);

export default router;
