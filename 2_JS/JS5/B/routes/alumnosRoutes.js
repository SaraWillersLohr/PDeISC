import { Router } from 'express';
import {
  crearAlumno,
  listarAlumnos,
} from '../controllers/alumnosController.js';

const router = Router();

router.post('/alumnos', crearAlumno);
router.get('/listar-alumnos', listarAlumnos);

export default router;
