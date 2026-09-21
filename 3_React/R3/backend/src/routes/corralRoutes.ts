// rutas de corrales
import { Router } from "express";
import * as corralController from "../controllers/corralController";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();

router.use(authenticate);

router.get("/", corralController.list);
router.post("/", authorize("dueno", "copropietario"), corralController.create);
router.patch(
  "/:id",
  authorize("dueno", "copropietario"),
  corralController.update,
);
router.delete(
  "/:id",
  authorize("dueno", "copropietario"),
  corralController.remove,
);

export default router;
