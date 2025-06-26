import { Router } from "express";
import {
  enviarMensaje,
  listarConversacion,
  listarMensajesIniciales,
  responderMensaje,
  listarNoLeidos,
  marcarLeido
} from "../../controllers/mensajeContacto.controllers.js";

import { authMiddleware } from "../../middlewares/auth.middlewares.js";
import { verificarRole } from "../../middlewares/role.middlewares.js";

const mensajeContacto = Router();

// 👤 Público: cualquier cliente puede enviar un mensaje
mensajeContacto.post("/enviar", authMiddleware, enviarMensaje);

// 🔐 Solo admin puede gestionar mensajes
mensajeContacto.get("/listado", authMiddleware, verificarRole('admin'), listarMensajesIniciales);
mensajeContacto.get('/mensajes/no-leidos', authMiddleware, verificarRole('admin'), listarNoLeidos);
mensajeContacto.post('/mensajes/:id/responder', authMiddleware, verificarRole('admin'), responderMensaje);
mensajeContacto.get("/listado/:id/conversacion", authMiddleware, verificarRole('admin'), listarConversacion);
mensajeContacto.put('/mensajes/:id/marcar-leido', authMiddleware, verificarRole('admin'), marcarLeido);

export default mensajeContacto;

// ver hilo de conversacion para el cliente y administrador, para tener un contacto mas fluido