// Archivo backend/src/routes/reproduccionRoutes.ts: expone el historial reproductivo con autenticación y permisos de campo.
import { Router } from "express";
import * as reproduccionController from "../controllers/reproduccionController";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();

// Toda consulta o registro reproductivo requiere una sesión vigente.
router.use(authenticate);

// Los roles de gestión, campo y veterinaria consultan eventos de la estancia.
router.get("/", authorize("dueno", "copropietario", "peon", "veterinario"), reproduccionController.list);

// Los roles operativos habilitados pueden dejar el evento en el historial común.
router.post("/", authorize("dueno", "copropietario", "peon", "veterinario"), reproduccionController.create);

export default router;
