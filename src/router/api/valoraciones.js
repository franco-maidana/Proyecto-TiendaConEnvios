import { Router } from "express";
import {
  ActualizarValoracionController,
  CrearValoracionController,
  EliminarValoracionController,
  ObtenerValoracionesController,
  ObtenerValoracionesPorProductoController,
  ObtenerPromedioEstrellasController,
  ObtenerResumenValoracionesController
} from "../../controllers/valoraciones.controllers.js";

import { authMiddleware } from "../../middlewares/auth.middlewares.js";

const valoraciones = Router();

// 🔐 Crear valoración solo logueado
valoraciones.post('/crear', authMiddleware, CrearValoracionController);

// ✅ Listados públicos
valoraciones.get('/listado', ObtenerValoracionesController);
valoraciones.get('/promedio/:id', ObtenerPromedioEstrellasController);
valoraciones.get('/producto/:id', ObtenerValoracionesPorProductoController);
valoraciones.get('/resumen/:id', ObtenerResumenValoracionesController);

// 🔐 Modificar / eliminar requieren autenticación
valoraciones.put('/producto-upDate/:id', authMiddleware, ActualizarValoracionController);
valoraciones.delete('/producto-del/:id/:usuarios_id', authMiddleware, EliminarValoracionController);

export default valoraciones;
