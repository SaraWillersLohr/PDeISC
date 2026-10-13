// Archivo backend/src/routes/corralRoutes.ts: definición de endpoints de la api relacionado con corral routes. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
// rutas de corrales
import { Router } from "express";
import * as corralController from "../controllers/corralController";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();


router.use(authenticate);

// Endpoint GET /: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. El controlador corralController.list procesa la solicitud.
router.get("/", corralController.list);
// Endpoint POST /: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. El controlador corralController.create procesa la solicitud.
router.post("/", authorize("dueno", "copropietario"), corralController.create);
// Endpoint PATCH ruta indicada en la siguiente línea: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. Los argumentos indican los controles y el controlador de la operación.
router.patch(
  "/:id",
  authorize("dueno", "copropietario"),
  corralController.update,
);
// Endpoint DELETE ruta indicada en la siguiente línea: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. Los argumentos indican los controles y el controlador de la operación.
router.delete(
  "/:id",
  authorize("dueno", "copropietario"),
  corralController.remove,
);

export default router;

