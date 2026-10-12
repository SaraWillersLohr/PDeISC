// rutas de notificaciones y alertas
import { Router } from "express";
import * as notificacionController from "../controllers/notificacionController";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();

router.use(authenticate);

// Los avisos se consultan según destinatario; solo administración puede borrarlos.
router.get("/", notificacionController.list);
router.delete("/:id", authorize("administrador", "dueno", "copropietario"), notificacionController.remove);
router.delete("/", authorize("administrador", "dueno", "copropietario"), notificacionController.clear);

export default router;

