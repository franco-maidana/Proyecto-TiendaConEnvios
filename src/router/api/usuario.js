import { Router } from "express";
import {
  RegistroUsuario,
  ObtenerTodosLosUsuarios,
  ActualizarDatosUsuario,
  RecuperarPassword,
  ResetearPassword,
  ConfirmarEmail,
  EliminarUsuarioControllers,
  SolicitaBajaUsuario
} from "../../controllers/usuario.controllers.js";
import {authMiddleware} from "../../middlewares/auth.middlewares.js";
import { verificarRole } from '../../middlewares/role.middlewares.js';
import {validarRegistroUsuario, validarActualizarUsuario} from '../../validators/usuario.validator.js';
import manejarErroresValidacion from "../../validators/manejoErrores.validator.js";

const usuarios = Router();

usuarios.post("/create", validarRegistroUsuario, manejarErroresValidacion, RegistroUsuario); // crear usuario
usuarios.get('/listado', authMiddleware, verificarRole('admin'), ObtenerTodosLosUsuarios); // ver todos los usuarios
usuarios.put("/upDate/:id", authMiddleware, validarActualizarUsuario, manejarErroresValidacion, ActualizarDatosUsuario); // modificar usuaarios
usuarios.post("/recuperar-password", RecuperarPassword); // recuperar password
usuarios.post("/reset-password", ResetearPassword); // resetear password
usuarios.post("/verificar-email", ConfirmarEmail); // confirmacion email
usuarios.delete('/delete/:id', authMiddleware, verificarRole('admin') ,EliminarUsuarioControllers); // eliminar usuarios
usuarios.post('/solicitar-baja/:id', authMiddleware ,SolicitaBajaUsuario); // solicitar baja del usuario

export default usuarios;
