// Archivo backend/src/routes/tratamientoRoutes.ts: definición de endpoints de la api relacionado con tratamiento routes. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
// rutas de tratamientos m�dicos
import { Router } from "express";
import * as tratamientoController from "../controllers/tratamientoController";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();

router.use(authenticate);

// cualquier usuario autenticado puede leer historial m�dico
// Endpoint GET /: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. El controlador tratamientoController.listByAnimal procesa la solicitud.
router.get("/", tratamientoController.listByAnimal);

// solo veterinarios, due�o y copropietario pueden registrar tratamientos
// Endpoint POST ruta indicada en la siguiente línea: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. Los argumentos indican los controles y el controlador de la operación.
router.post(
  "/",
  authorize("veterinario", "dueno", "copropietario"),
  tratamientoController.create,
);

export default router;

