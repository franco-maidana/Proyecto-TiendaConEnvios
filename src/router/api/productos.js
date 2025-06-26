import { Router } from "express";
import upload from "../../utils/multer.js";
import {
  CrearProductoControllers,
  ObtenerTodosLosProductos,
  ActualizarProductoController,
  EliminarProductoControllers,
  DesactivarproductoControllers,
  ObtenerListadoAdmin,
  ReactivarProductoController,
  CrearProductoConGastoController
} from "../../controllers/productos.controllers.js";

import { authMiddleware } from "../../middlewares/auth.middlewares.js";
import { verificarRole } from "../../middlewares/role.middlewares.js";

const productos = Router();

// Pública
productos.get("/listar", ObtenerTodosLosProductos);

// Solo admin
productos.post("/create", authMiddleware, verificarRole('admin'), upload.single("imagen"), CrearProductoControllers);
productos.put("/upDate/:id", authMiddleware, verificarRole('admin'), ActualizarProductoController);
productos.delete("/delete/:id", authMiddleware, verificarRole('admin'), EliminarProductoControllers);
productos.put('/desactivar/:id', authMiddleware, verificarRole('admin'), DesactivarproductoControllers);
productos.put('/reactivar/:id', authMiddleware, verificarRole('admin'), ReactivarProductoController);
productos.get('/admin-listado', authMiddleware, verificarRole('admin'), ObtenerListadoAdmin);

// Solo admin (con lógica especial)
productos.post("/crear-producto", authMiddleware, verificarRole('admin'), upload.single("imagen"), CrearProductoConGastoController);

export default productos;
