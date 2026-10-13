// Archivo backend/src/routes/authRoutes.ts: definición de endpoints de la api relacionado con auth routes. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
// rutas de autenticacion
import { Router } from "express";
import * as authController from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";
import * as socialAuthController from '../controllers/socialAuthController';


const router = Router();

// Endpoint POST /register: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. El controlador authController.register procesa la solicitud.
router.post("/register", authController.register);
// Endpoint POST /verify-email: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. El controlador authController.verifyEmail procesa la solicitud.
router.post("/verify-email", authController.verifyEmail);
// Endpoint POST /resend-verification: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. El controlador authController.resendVerification procesa la solicitud.
router.post("/resend-verification", authController.resendVerification);
// Endpoint POST /access-token: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. El controlador authController.redeemAccessToken procesa la solicitud.
router.post("/access-token", authController.redeemAccessToken);
// Endpoint POST /resend-access-token: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. El controlador authController.resendAccessToken procesa la solicitud.
router.post("/resend-access-token", authController.resendAccessToken);
// Endpoint POST /login: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. El controlador authController.login procesa la solicitud.
router.post("/login", authController.login);
// Endpoint GET /me: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. El controlador authController.me procesa la solicitud.
router.get("/me", authenticate, authController.me);
// Endpoint POST ruta indicada en la siguiente línea: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. Los argumentos indican los controles y el controlador de la operación.
router.post(
  "/cambiar-password-inicial",
  authenticate,
  authController.cambiarPasswordInicial,
);
// Endpoint GET /social/providers: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. El controlador socialAuthController.listSocialProviders procesa la solicitud.
router.get('/social/providers', socialAuthController.listSocialProviders);
// Endpoint GET /:provider/callback: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. El controlador socialAuthController.completeSocialLogin procesa la solicitud.
router.get('/:provider/callback', socialAuthController.completeSocialLogin);
// Endpoint GET /:provider: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. El controlador socialAuthController.startSocialLogin procesa la solicitud.
router.get('/:provider', socialAuthController.startSocialLogin);
// Endpoint POST /social/exchange: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. El controlador socialAuthController.exchangeSocialCode procesa la solicitud.
router.post('/social/exchange', socialAuthController.exchangeSocialCode);

export default router;

