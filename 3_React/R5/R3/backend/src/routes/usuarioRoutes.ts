// rutas crud de usuarios
import { Router } from "express";
import * as usuarioController from "../controllers/usuarioController";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();

// todas las rutas de usuarios requieren autenticaci�n + rol admin
router.use(authenticate);
router.use(authorize("dueno", "copropietario"));

router.get("/", usuarioController.list);
router.post("/", usuarioController.create);
router.patch("/:id", usuarioController.update);
router.delete("/:id", usuarioController.remove);

export default router;

