// Archivo backend/src/types/express.d.ts: tipos e interfaces compartidos relacionado con express. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
// extension de tipos express
import type { JwtPayload } from '../utils/jwt';

declare global {
  namespace Express {
    // Contrato de datos Request: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
    interface Request {
      // usuario autenticado extra�do del token jwt
      usuario?: JwtPayload;
    }
  }
}

export {};

