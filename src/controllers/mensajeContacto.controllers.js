import {
  crearMensaje,
  obtenerConversacion,
  obtenerMensajesIniciales,
  marcarMensajeComoLeido,
  obtenerNoLeidosPorUsuario
} from "../services/mensajeContacto.service.js";

// 📬 Enviar nuevo mensaje
export const enviarMensaje = async (req, res) => {
  try {
    const { asunto, mensaje, mensaje_padre_id, remitente } = req.body;
    const usuario_id = req.usuario.id;

    if (!usuario_id || !mensaje || !remitente || (!asunto && !mensaje_padre_id)) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
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
    console.error("❌ Error al crear mensaje:", err.message);
    res.status(400).json({ error: err.message });
  }
};

// 📥 Listar mensajes de una conversación por ID
export const listarConversacion = async (req, res) => {
  try {
    const { id } = req.params;
    const conversacion = await obtenerConversacion(id);
    res.status(200).json({ data: conversacion });
  } catch (err) {
    console.error("❌ Error al obtener conversación:", err.message);
    res.status(500).json({ error: "Error al obtener conversación" });
  }
};

// 📜 Mensajes iniciales sin respuestas (root)
export const listarMensajesIniciales = async (req, res) => {
  try {
    const mensajes = await obtenerMensajesIniciales();
    res.status(200).json({ data: mensajes });
  } catch (err) {
    console.error("❌ Error al obtener mensajes:", err.message);
    res.status(500).json({ error: "Error al obtener mensajes" });
  }
};

// 📤 Responder un mensaje
export const responderMensaje = async (req, res) => {
  try {
    const mensaje_padre_id = req.params.id;
    const { mensaje, remitente } = req.body;
    const usuario_id = req.usuario.id;

    if (!mensaje || !remitente || !usuario_id) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const respuesta = await crearMensaje({
      usuario_id,
      mensaje,
      mensaje_padre_id,
      remitente,
    });

    res.status(201).json({ message: "Respuesta enviada", id: respuesta.id });
  } catch (err) {
    console.error("❌ Error al responder:", err.message);
    res.status(500).json({ error: "Error al responder mensaje" });
  }
};

// 🟡 Ver mensajes no leídos para el usuario autenticado
export const listarNoLeidos = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const { remitente } = req.query;

    if (!usuario_id || !remitente) {
      return res.status(400).json({ error: 'Faltan datos: usuario y remitente' });
    }

    const mensajes = await obtenerNoLeidosPorUsuario(remitente); // usuario_id ya no lo usás en el service
    res.status(200).json({ data: mensajes });
  } catch (err) {
    console.error('❌ Error al listar no leídos:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// ✅ Marcar un mensaje como leído
export const marcarLeido = async (req, res) => {
  try {
    const { id } = req.params;
    const actualizado = await marcarMensajeComoLeido(id);

    if (!actualizado) {
      return res.status(404).json({ error: "Mensaje no encontrado" });
    }

    res.status(200).json({ message: `Mensaje ${id} marcado como leído` });
  } catch (err) {
    console.error('❌ Error al marcar como leído:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  }
};
