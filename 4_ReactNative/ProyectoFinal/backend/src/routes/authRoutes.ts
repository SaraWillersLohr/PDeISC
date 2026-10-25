// declaro las rutas públicas y protegidas de autenticación.
import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { requireAuthentication } from '../middleware/authMiddleware.js';

export const authRouter = Router();

authRouter.post('/login', authController.login);
authRouter.post('/social/:provider', authController.socialLogin);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/register', authController.register);
authRouter.post('/verify-email', authController.verifyRegistrationEmail);
authRouter.post('/resend-verification', authController.resendRegistrationCode);
authRouter.post('/access-code', authController.redeemAccessCode);
authRouter.post('/resend-access-code', authController.resendAccessCode);
authRouter.post('/password-recovery/request', authController.requestPasswordRecovery);
authRouter.post('/password-recovery/redeem', authController.redeemPasswordRecoveryCode);
authRouter.post('/password-recovery/reset', authController.completePasswordRecovery);
authRouter.get('/me', requireAuthentication, authController.me);
authRouter.put('/profile', requireAuthentication, authController.updateProfile);
authRouter.put('/password', requireAuthentication, authController.changePassword);
