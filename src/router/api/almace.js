import { Router } from "express";
import {
  CrearEnvaseController,
  CrearInsumoController,
  VerEnvasesController,
  VerInsumosController,
  EditarInsumoController,
  EditarEnvaseController,
  EliminarInsumoController,
  EliminarEnvaseController
} from "../../controllers/amacen.controllers.js";

import { authMiddleware } from "../../middlewares/auth.middlewares.js";
import { verificarRole } from "../../middlewares/role.middlewares.js";

const almacen = Router();

// 🔒 Crear solo admins
almacen.post("/create-envases", authMiddleware, verificarRole('admin'), CrearEnvaseController);
almacen.post("/create-insumos", authMiddleware, verificarRole('admin'), CrearInsumoController);

// 👁️ Lectura pública (opcional: podés protegerlas también si querés)
almacen.get('/insumos', authMiddleware, verificarRole('admin') ,VerInsumosController);
almacen.get('/envases', authMiddleware, verificarRole('admin') ,VerEnvasesController);

// 🔒 Modificar solo admins
almacen.put('/insumos-up/:id', authMiddleware, verificarRole('admin'), EditarInsumoController);
almacen.put('/envases-up/:id', authMiddleware, verificarRole('admin'), EditarEnvaseController);

// 🔒 Eliminar solo admins
almacen.delete('/insumos-del/:id', authMiddleware, verificarRole('admin'), EliminarInsumoController);
almacen.delete('/envases-del/:id', authMiddleware, verificarRole('admin'), EliminarEnvaseController);

export default almacen;
