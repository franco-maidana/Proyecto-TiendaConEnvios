import {
  crearMensaje,
  obtenerConversacion,
  obtenerMensajesIniciales,
  marcarMensajeComoLeido,
  obtenerNoLeidosPorUsuario
} from "../services/mensajeContacto.service.js";
import ApiError from "../middlewares/ApiError.js";

// 📬 Enviar nuevo mensaje
export const enviarMensaje = async (req, res, next) => {
  try {
    const { asunto, mensaje, mensaje_padre_id, remitente } = req.body;
    const usuario_id = req.usuario.id;

    if (!usuario_id || !mensaje || !remitente || (!asunto && !mensaje_padre_id)) {
      return next(new ApiError("Faltan datos obligatorios", 400));
    }

    const nuevoMensaje = await crearMensaje({
      usuario_id,
      asunto,
      mensaje,
      mensaje_padre_id,
      remitente,
    });

    res.status(201).json({ message: "Mensaje creado", id: nuevoMensaje.id });
  } catch (err) {
    next(
      err instanceof ApiError
        ? err
        : new ApiError("Error al crear mensaje", 400, err.message)
    );
  }
};

// 📥 Listar mensajes de una conversación por ID
export const listarConversacion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conversacion = await obtenerConversacion(id);
    res.status(200).json({ data: conversacion });
  } catch (err) {
    next(
      err instanceof ApiError
        ? err
        : new ApiError("Error al obtener conversación", 500, err.message)
    );
  }
};

// 📜 Mensajes iniciales sin respuestas (root)
export const listarMensajesIniciales = async (req, res, next) => {
  try {
    const mensajes = await obtenerMensajesIniciales();
    res.status(200).json({ data: mensajes });
  } catch (err) {
    next(
      err instanceof ApiError
        ? err
        : new ApiError("Error al obtener mensajes", 500, err.message)
    );
  }
};

// 📤 Responder un mensaje
export const responderMensaje = async (req, res, next) => {
  try {
    const mensaje_padre_id = req.params.id;
    const { mensaje, remitente } = req.body;
    const usuario_id = req.usuario.id;

    if (!mensaje || !remitente || !usuario_id) {
      return next(new ApiError("Faltan datos obligatorios", 400));
    }

    const respuesta = await crearMensaje({
      usuario_id,
      mensaje,
      mensaje_padre_id,
      remitente,
    });

    res.status(201).json({ message: "Respuesta enviada", id: respuesta.id });
  } catch (err) {
    next(
      err instanceof ApiError
        ? err
        : new ApiError("Error al responder mensaje", 500, err.message)
    );
  }
};

// 🟡 Ver mensajes no leídos para el usuario autenticado
export const listarNoLeidos = async (req, res, next) => {
  try {
    const usuario_id = req.usuario.id;
    const { remitente } = req.query;

    if (!usuario_id || !remitente) {
      return next(new ApiError('Faltan datos: usuario y remitente', 400));
    }

    const mensajes = await obtenerNoLeidosPorUsuario(remitente);
    res.status(200).json({ data: mensajes });
  } catch (err) {
    next(
      err instanceof ApiError
        ? err
        : new ApiError('Error del servidor', 500, err.message)
    );
  }
};

// ✅ Marcar un mensaje como leído
export const marcarLeido = async (req, res, next) => {
  try {
    const { id } = req.params;
    const actualizado = await marcarMensajeComoLeido(id);

    if (!actualizado) {
      return next(new ApiError("Mensaje no encontrado", 404));
    }

    res.status(200).json({ message: `Mensaje ${id} marcado como leído` });
  } catch (err) {
    next(
      err instanceof ApiError
        ? err
        : new ApiError('Error del servidor', 500, err.message)
    );
  }
};
