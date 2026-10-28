// declaro las rutas públicas y protegidas de autenticación.
import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { requireAuthentication } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const authRouter = Router();

authRouter.post('/login', asyncHandler(authController.login));
authRouter.post('/social/:provider', asyncHandler(authController.socialLogin));
authRouter.post('/refresh', asyncHandler(authController.refresh));
authRouter.post('/register', asyncHandler(authController.register));
authRouter.post('/verify-email', asyncHandler(authController.verifyRegistrationEmail));
authRouter.post('/resend-verification', asyncHandler(authController.resendRegistrationCode));
authRouter.post('/access-code', asyncHandler(authController.redeemAccessCode));
authRouter.post('/resend-access-code', asyncHandler(authController.resendAccessCode));
authRouter.post('/password-recovery/request', asyncHandler(authController.requestPasswordRecovery));
authRouter.post('/password-recovery/redeem', asyncHandler(authController.redeemPasswordRecoveryCode));
authRouter.post('/password-recovery/reset', asyncHandler(authController.completePasswordRecovery));
authRouter.get('/me', requireAuthentication, asyncHandler(authController.me));
authRouter.put('/profile', requireAuthentication, asyncHandler(authController.updateProfile));
authRouter.put('/password', requireAuthentication, asyncHandler(authController.changePassword));
