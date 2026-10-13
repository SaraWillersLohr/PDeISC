// Archivo backend/src/routes/notificacionRoutes.ts: definición de endpoints de la api relacionado con notificacion routes. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
// rutas de notificaciones y alertas
import { Router } from "express";
import * as notificacionController from "../controllers/notificacionController";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();

router.use(authenticate);

// Los avisos se consultan según destinatario; solo administración puede borrarlos.
// Endpoint GET /: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. El controlador notificacionController.list procesa la solicitud.
router.get("/", notificacionController.list);
// Endpoint DELETE /:id: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. El controlador notificacionController.remove procesa la solicitud.
router.delete("/:id", authorize("administrador", "dueno", "copropietario"), notificacionController.remove);
// Endpoint DELETE /: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. El controlador notificacionController.clear procesa la solicitud.
router.delete("/", authorize("administrador", "dueno", "copropietario"), notificacionController.clear);

export default router;

