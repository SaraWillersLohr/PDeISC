// rutas de animales, esta carpeta contiene los endpoints relacionados con
//la gestión de animales, incluyendo la creación, actualización, eliminación y
// reporte de enfermedades.
//cuando el usuario selecciona useState en el frontend, se hace una solicitud a estos
// endpoints para obtener o modificar la información de los animales.
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
