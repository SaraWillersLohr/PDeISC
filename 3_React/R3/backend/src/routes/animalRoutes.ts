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

router.get("/", animalController.list);
router.post(
  "/",
  authorize("dueno", "copropietario", "peon"),
  animalController.create,
);
router.patch(
  "/:id",
  authorize("dueno", "copropietario", "peon", "veterinario"),
  animalController.update,
);
router.delete(
  "/:id",
  authorize("dueno", "copropietario"),
  animalController.remove,
);

// acciones especiales de flujo sanitario
router.post(
  "/:id/reportar-enfermedad",
  authorize("peon", "dueno", "copropietario", "veterinario"),
  animalController.reportarEnfermedad,
);
router.post(
  "/:id/alta",
  authorize("veterinario", "dueno", "copropietario"),
  animalController.darDeAlta,
);

export default router;

