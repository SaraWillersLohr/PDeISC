// rutas de autenticacion
import { Router } from "express";
import * as authController from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";
import * as socialAuthController from '../controllers/socialAuthController';

const router = Router();

router.post("/login", authController.login);
router.get("/me", authenticate, authController.me);
router.post(
  "/cambiar-password-inicial",
  authenticate,
  authController.cambiarPasswordInicial,
);
router.get('/:provider/callback', socialAuthController.completeSocialLogin);
router.get('/:provider', socialAuthController.startSocialLogin);
router.post('/social/exchange', socialAuthController.exchangeSocialCode);

export default router;

