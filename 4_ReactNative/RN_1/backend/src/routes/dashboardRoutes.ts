// Archivo backend/src/routes/dashboardRoutes.ts: definición de endpoints de la api relacionado con dashboard routes. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
// rutas del dashboard  solo roles administrativos
import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";
import * as dashboardController from "../controllers/dashboardController";


const router = Router();

// Endpoint GET ruta indicada en la siguiente línea: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. Los argumentos indican los controles y el controlador de la operación.
router.get(
  "/summary",
  authenticate,
  authorize("dueno", "copropietario"),
  dashboardController.summary,
);

export default router;

