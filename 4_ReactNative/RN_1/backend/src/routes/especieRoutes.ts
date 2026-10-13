// Archivo backend/src/routes/especieRoutes.ts: definición de endpoints de la api relacionado con especie routes. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
// rutas de especies y razas
import { Router } from "express";
import * as especieController from "../controllers/especieController";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();


router.use(authenticate);

// Endpoint GET /: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. El controlador especieController.list procesa la solicitud.
router.get("/", especieController.list);
// Endpoint POST ruta indicada en la siguiente línea: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. Los argumentos indican los controles y el controlador de la operación.
router.post(
  "/",
  authorize("dueno", "copropietario"),
  especieController.createEspecie,
);
// Endpoint POST ruta indicada en la siguiente línea: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. Los argumentos indican los controles y el controlador de la operación.
router.post(
  "/:idEspecie/razas",
  authorize("dueno", "copropietario"),
  especieController.createRaza,
);

export default router;

