/** extension de tipos express */
import type { JwtPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      /** usuario autenticado extraído del token jwt */
      usuario?: JwtPayload;
    }
  }
}

export {};
