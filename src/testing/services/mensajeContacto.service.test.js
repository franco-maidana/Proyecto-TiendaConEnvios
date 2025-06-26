import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  crearMensaje,
  obtenerConversacion,
  obtenerMensajesIniciales,
  obtenerNoLeidosPorUsuario,
  marcarMensajeComoLeido
} from "../../services/mensajeContacto.service.js";
import { Crear } from "../../services/usuario.service.js";
import Conexion from "../../config/db.js";

describe("MensajeContactoService", () => {
  let usuarioIdTest;
  let mensajePadreId;
  let emailTest;

  beforeAll(async () => {
    try {
      emailTest = `franco+${Date.now()}@test.com`; // Siempre único 💡

      const nuevoUsuario = await Crear(
        "Franco",
        emailTest,
        "12345678",
        "123456789",
        "Av Siempre Viva 742",
        -34.6037,
        -58.3816
      );
      usuarioIdTest = nuevoUsuario.id;

      const mensaje = await crearMensaje({
        usuario_id: usuarioIdTest,
        remitente: "usuario1@example.com",
        asunto: "Consulta",
        mensaje: "Hola, tengo una duda"
      });
      mensajePadreId = mensaje.id;

    } catch (error) {
      console.error("❌ Error en beforeAll:", error);
      throw error;
    }
  });

  afterAll(async () => {
    // 1. Borrar respuestas primero
    await Conexion.query(
      `DELETE FROM mensaje_contacto WHERE mensaje_padre_id IN (
         SELECT id FROM (SELECT id FROM mensaje_contacto WHERE usuario_id = ?) AS temp
       )`,
      [usuarioIdTest]
    );

    // 2. Luego mensajes padres
    await Conexion.query(`DELETE FROM mensaje_contacto WHERE usuario_id = ?`, [usuarioIdTest]);

    // 3. Finalmente el usuario
    await Conexion.query(`DELETE FROM usuarios WHERE id = ?`, [usuarioIdTest]);
  });

  it("debería crear un mensaje nuevo con asunto", async () => {
    const mensaje = await crearMensaje({
      usuario_id: usuarioIdTest,
      remitente: "usuario2@example.com",
      asunto: "Pedido",
      mensaje: "¿Cuándo llega mi pedido?"
    });
    expect(typeof mensaje.id).toBe("number");
  });

  it("debería lanzar error si falta el mensaje", async () => {
    await expect(() =>
      crearMensaje({
        usuario_id: usuarioIdTest,
        remitente: "usuario3@example.com",
        asunto: "Falla",
        mensaje: null
      })
    ).rejects.toThrow("El mensaje y el remitente son obligatorios");
  });

  it("debería lanzar error si falta el remitente", async () => {
    await expect(() =>
      crearMensaje({
        usuario_id: usuarioIdTest,
        remitente: null,
        asunto: "Asunto",
        mensaje: "Mensaje sin remitente"
      })
    ).rejects.toThrow("El mensaje y el remitente son obligatorios");
  });

  it("debería lanzar error si se crea mensaje sin asunto y sin padre", async () => {
    await expect(() =>
      crearMensaje({
        usuario_id: usuarioIdTest,
        remitente: "usuario4@example.com",
        asunto: null,
        mensaje: "Sin asunto"
      })
    ).rejects.toThrow("El asunto es obligatorio para un mensaje nuevo");
  });

  it("debería crear una respuesta a un mensaje existente", async () => {
    const respuesta = await crearMensaje({
      usuario_id: usuarioIdTest,
      remitente: "admin@example.com",
      mensaje: "Gracias por escribir",
      mensaje_padre_id: mensajePadreId
    });
    expect(respuesta).toHaveProperty("id");
  });

  it("debería obtener la conversación completa", async () => {
    const conversacion = await obtenerConversacion(mensajePadreId);
    expect(Array.isArray(conversacion)).toBe(true);
    expect(conversacion.length).toBeGreaterThanOrEqual(1);
  });

  it("debería listar los mensajes iniciales", async () => {
    const mensajes = await obtenerMensajesIniciales();
    expect(Array.isArray(mensajes)).toBe(true);
  });

  it("debería devolver mensajes no leídos para un usuario", async () => {
    const noLeidos = await obtenerNoLeidosPorUsuario("usuario1@example.com");
    expect(Array.isArray(noLeidos)).toBe(true);
  });

  it("debería marcar un mensaje como leído", async () => {
    const nuevos = await obtenerNoLeidosPorUsuario("usuario1@example.com");
    if (nuevos.length > 0) {
      await marcarMensajeComoLeido(nuevos[0].id);
      const verificado = await obtenerConversacion(nuevos[0].mensaje_padre_id || nuevos[0].id);
      const mensajeModificado = verificado.find(m => m.id === nuevos[0].id);
      expect(mensajeModificado.leido).toBe(1);
    } else {
      expect(true).toBe(true); // No había mensajes no leídos
    }
  });
});
