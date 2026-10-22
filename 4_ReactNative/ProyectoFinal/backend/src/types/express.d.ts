// amplío express para conservar el usuario validado durante una petición.
import type { AuthenticatedUser } from './auth.js';

declare global {
  namespace Express {
    interface Request {
      usuario?: AuthenticatedUser;
    }
  }
}

export {};
