import { Router } from "express";
import {
  BorrarCategoriaDefinitivaController,
  CrearCategoriaController,
  DesactivarCategoriaController,
  EditarCategoriaController,
  ListarCategoriasController,
  ObtenerCategoriaController,
  ReactivarCategoriaController,
} from "../../controllers/categorias.controllers.js";
import { authMiddleware } from "../../middlewares/auth.middlewares.js";
import { verificarRole } from "../../middlewares/role.middlewares.js";

const categorias = Router();

categorias.post('/crear', authMiddleware, verificarRole('admin'), CrearCategoriaController); // Crear categoria
categorias.get('/listado', ListarCategoriasController); // Listar categoria
categorias.get('/listado/:id', ObtenerCategoriaController); // Listar categoria por id 
categorias.put('/upDate/:id', authMiddleware, verificarRole('admin'), EditarCategoriaController); // editar una categoria
categorias.put('/upDate/:id/desactivar', authMiddleware, verificarRole('admin'), DesactivarCategoriaController); // desactivar una categoria
categorias.put('/upDate/:id/reactivar', authMiddleware, verificarRole('admin'), ReactivarCategoriaController); // activar una categoria
categorias.delete('/destroi/:id', authMiddleware, verificarRole('admin'), BorrarCategoriaDefinitivaController); // eliminar una categoria


export default categorias