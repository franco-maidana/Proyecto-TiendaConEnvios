import { Router } from "express";
import {
  AgregarProductoAlCarritoController,
  ObtenerCarritoDelUsuario,
  ModificarProductoEnCarritoController,
  EliminarProductoCarritoController,
  VaciarCarritoController,
  ObtenerOrdenPorGrupoController
} from "../../controllers/ordenes.controllers.js";

import { authMiddleware } from "../../middlewares/auth.middlewares.js";
import { verificarRole } from "../../middlewares/role.middlewares.js";

const ordenes = Router();

// 🔐 Solo usuario logueado puede operar con carrito
ordenes.post("/create", authMiddleware, AgregarProductoAlCarritoController);
ordenes.get("/listado/:usuario_id", authMiddleware, ObtenerCarritoDelUsuario);
ordenes.put('/upDate', authMiddleware, ModificarProductoEnCarritoController);
ordenes.delete('/destroi/:usuario_id', authMiddleware, EliminarProductoCarritoController);
ordenes.delete('/vaciar-carrito/:usuario_id', authMiddleware, VaciarCarritoController);
ordenes.get('/obtener/:grupo_orden', authMiddleware, ObtenerOrdenPorGrupoController);

export default ordenes;
