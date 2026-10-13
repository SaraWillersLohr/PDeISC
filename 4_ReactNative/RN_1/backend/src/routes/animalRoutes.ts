// Archivo backend/src/routes/animalRoutes.ts: definición de endpoints de la api relacionado con animal routes. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
// rutas de animales, esta carpeta contiene los endpoints relacionados con
// la gesti�n de animales, incluyendo la creaci�n, actualizaci�n, eliminaci�n y
// reporte de enfermedades.
// cuando el usuario selecciona usestate en el frontend, se hace una solicitud a estos
// endpoints para obtener o modificar la informaci�n de los animales.
import { Router } from "express";
import * as animalController from "../controllers/animalController";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();


router.use(authenticate);

// Endpoint GET /: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. El controlador animalController.list procesa la solicitud.
router.get("/", animalController.list);
// Endpoint POST ruta indicada en la siguiente línea: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. Los argumentos indican los controles y el controlador de la operación.
router.post(
  "/",
  authorize("dueno", "copropietario", "peon"),
  animalController.create,
);
// Endpoint PATCH ruta indicada en la siguiente línea: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. Los argumentos indican los controles y el controlador de la operación.
router.patch(
  "/:id",
  authorize("dueno", "copropietario", "peon", "veterinario"),
  animalController.update,
);
// Endpoint DELETE ruta indicada en la siguiente línea: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. Los argumentos indican los controles y el controlador de la operación.
router.delete(
  "/:id",
  authorize("dueno", "copropietario"),
  animalController.remove,
);

// acciones especiales de flujo sanitario
// Endpoint POST ruta indicada en la siguiente línea: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. Los argumentos indican los controles y el controlador de la operación.
router.post(
  "/:id/reportar-enfermedad",
  authorize("peon", "dueno", "copropietario", "veterinario"),
  animalController.reportarEnfermedad,
);
// Endpoint POST ruta indicada en la siguiente línea: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. Los argumentos indican los controles y el controlador de la operación.
router.post(
  "/:id/alta",
  authorize("veterinario", "dueno", "copropietario"),
  animalController.darDeAlta,
);

export default router;

