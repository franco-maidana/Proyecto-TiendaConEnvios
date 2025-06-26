import { Router } from 'express';
import {
  CrearCarritoController,
  AgregarProductoController,
  ObtenerCarritoController,
  ConfirmarCarritoController,
  CancelarCarritoController,
  EliminarProductoDelCarritoController
} from '../../controllers/ordenLocal.controllers.js';

import { authMiddleware } from "../../middlewares/auth.middlewares.js";
import { verificarRole } from "../../middlewares/role.middlewares.js";

const ordenLocal = Router();

// 🔐 Solo usuarios autorizados pueden operar carritos en el local
ordenLocal.post('/crear', authMiddleware, verificarRole('admin'), CrearCarritoController);
ordenLocal.post('/:ordenId/agregar', authMiddleware, verificarRole('admin'), AgregarProductoController);
ordenLocal.get('/:ordenId', authMiddleware, verificarRole('admin'), ObtenerCarritoController);
ordenLocal.post('/:ordenId/confirmar', authMiddleware, verificarRole('admin'), ConfirmarCarritoController);
ordenLocal.delete('/:ordenId', authMiddleware, verificarRole('admin'), CancelarCarritoController);
ordenLocal.delete('/:ordenId/producto/:productoId', authMiddleware, verificarRole('admin'), EliminarProductoDelCarritoController);

export default ordenLocal;
