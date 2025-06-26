import MensajeContacto from "../models/mensajeContacto.models.js";

export async function crearMensaje({ usuario_id, remitente, asunto = null, mensaje, mensaje_padre_id = null }) {
  if (!mensaje || !remitente) throw new Error("El mensaje y el remitente son obligatorios");

  if (!asunto && !mensaje_padre_id) {
    throw new Error("El asunto es obligatorio para un mensaje nuevo");
  }

  const id = await MensajeContacto.crear({
    usuario_id, // ✅ ahora sí se pasa el real
    asunto,
    mensaje,
    mensaje_padre_id,
    remitente,
  });

  return { id };
}

export async function obtenerConversacion(mensaje_padre_id) {
  return await MensajeContacto.obtenerConversacion(mensaje_padre_id);
}

export async function obtenerMensajesIniciales() {
  return await MensajeContacto.listarMensajesIniciales();
}

export async function obtenerNoLeidosPorUsuario(remitente) {
  return await MensajeContacto.obtenerNoLeidos(remitente);
}

export async function marcarMensajeComoLeido(id) {
  return await MensajeContacto.marcarComoLeido(id);
}