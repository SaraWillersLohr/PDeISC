import type { RequestHandler } from 'express';

// paso al manejador común cualquier rechazo async que un controlador no haya contestado.
export function asyncHandler(handler: RequestHandler): RequestHandler {
  return (req, res, next) => { Promise.resolve(handler(req, res, next)).catch(next); };
}
