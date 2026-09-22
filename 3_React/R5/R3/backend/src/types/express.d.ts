// extension de tipos express
import type { JwtPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      // usuario autenticado extra�do del token jwt
      usuario?: JwtPayload;
    }
  }
}

export {};

