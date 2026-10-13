// Archivo backend/src/routes/usuarioRoutes.ts: definición de endpoints de la api relacionado con usuario routes. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
// rutas crud de usuarios
import { Router } from "express";
import * as usuarioController from "../controllers/usuarioController";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();

// todas las rutas de usuarios requieren autenticaci�n + rol admin
router.use(authenticate);

router.use(authorize("administrador"));

// Endpoint GET /solicitudes: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. El controlador usuarioController.listRegistrationRequests procesa la solicitud.
router.get("/solicitudes", usuarioController.listRegistrationRequests);
// Endpoint POST /solicitudes/:id/aprobar: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. El controlador usuarioController.approveRegistrationRequest procesa la solicitud.
router.post("/solicitudes/:id/aprobar", usuarioController.approveRegistrationRequest);
// Endpoint POST /solicitudes/:id/rechazar: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. El controlador usuarioController.rejectRegistrationRequest procesa la solicitud.
router.post("/solicitudes/:id/rechazar", usuarioController.rejectRegistrationRequest);
// Endpoint GET /: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. El controlador usuarioController.list procesa la solicitud.
router.get("/", usuarioController.list);
// Endpoint POST /: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. El controlador usuarioController.create procesa la solicitud.
router.post("/", usuarioController.create);
// Endpoint PATCH /:id: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. El controlador usuarioController.update procesa la solicitud.
router.patch("/:id", usuarioController.update);
// Endpoint DELETE /:id: publica esta operación del backend y aplica el middleware que aparece entre la ruta y el controlador. El controlador usuarioController.remove procesa la solicitud.
router.delete("/:id", usuarioController.remove);

export default router;

