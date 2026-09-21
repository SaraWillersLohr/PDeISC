// rutas del dashboard  solo roles administrativos
import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";
import * as dashboardController from "../controllers/dashboardController";

const router = Router();

router.get(
  "/summary",
  authenticate,
  authorize("dueno", "copropietario"),
  dashboardController.summary,
);

export default router;

