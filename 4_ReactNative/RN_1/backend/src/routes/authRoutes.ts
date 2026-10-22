// Archivo backend/src/routes/authRoutes.ts: definición de endpoints de la api relacionado con auth routes. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
// rutas de autenticacion
import { Router } from "express";
import * as authController from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";


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
// Estas rutas verifican el correo, el código temporal y la contraseña nueva del flujo de recuperación.
// Endpoint POST /password-recovery/request: solicita el código sin revelar si el correo existe.
router.post('/password-recovery/request', authController.requestPasswordRecovery);
// Endpoint POST /password-recovery/redeem: valida y consume el código, y devuelve un permiso temporal para cambiar la contraseña.
router.post('/password-recovery/redeem', authController.redeemPasswordRecoveryCode);
// Endpoint POST /password-recovery/reset: guarda la contraseña nueva y devuelve la sesión después del cambio obligatorio.
router.post('/password-recovery/reset', authController.completePasswordRecovery);
// Endpoint POST /login: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. El controlador authController.login procesa la solicitud.
router.post("/login", authController.login);
// Endpoint GET /me: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. El controlador authController.me procesa la solicitud.
router.get("/me", authenticate, authController.me);
// Cerrar sesión incrementa la versión del token y revoca también las copias robadas o guardadas en otros dispositivos.
// Endpoint POST /logout: invalida todas las sesiones de la cuenta autenticada.
router.post('/logout', authenticate, authController.logout);
// Endpoint POST ruta indicada en la siguiente línea: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. Los argumentos indican los controles y el controlador de la operación.
router.post(
  "/cambiar-password-inicial",
  authenticate,
  authController.cambiarPasswordInicial,
);

export default router;

