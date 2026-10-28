// paso al manejador común cualquier rechazo async que un controlador no haya contestado.
export function asyncHandler(handler) {
    return (req, res, next) => { Promise.resolve(handler(req, res, next)).catch(next); };
}
