// rutas de tratamientos m�dicos
import { Router } from "express";
import * as tratamientoController from "../controllers/tratamientoController";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();

router.use(authenticate);

// cualquier usuario autenticado puede leer historial m�dico
router.get("/", tratamientoController.listByAnimal);

// solo veterinarios, due�o y copropietario pueden registrar tratamientos
router.post(
  "/",
  authorize("veterinario", "dueno", "copropietario"),
  tratamientoController.create,
);

export default router;

