import Conexion from "../config/db.js";

const MensajeContacto = {
  async crear({ usuario_id, asunto = null, mensaje, mensaje_padre_id = null, remitente }) {
    const sql = `
      INSERT INTO mensaje_contacto (usuario_id, asunto, mensaje, mensaje_padre_id, remitente)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await Conexion.query(sql, [usuario_id, asunto, mensaje, mensaje_padre_id, remitente]);
    return result.insertId;
  },

  async obtenerConversacion(mensaje_padre_id) {
    const sql = `
      SELECT * FROM mensaje_contacto
      WHERE mensaje_padre_id = ? OR id = ?
      ORDER BY fecha_creacion ASC
    `;
    const [rows] = await Conexion.query(sql, [mensaje_padre_id, mensaje_padre_id]);
    return rows;
  },

  async listarMensajesIniciales() {
    const sql = `
      SELECT * FROM mensaje_contacto
      WHERE mensaje_padre_id IS NULL
      ORDER BY fecha_creacion DESC
    `;
    const [rows] = await Conexion.query(sql);
    return rows;
  },

  async obtenerNoLeidos(remitente) {
    const sql = `
      SELECT * FROM mensaje_contacto
      WHERE remitente = ? AND leido = 0
    `;
    const [rows] = await Conexion.query(sql, [remitente]);
    return rows;
  },

  async marcarComoLeido(id) {
    const sql = `UPDATE mensaje_contacto SET leido = 1 WHERE id = ?`;
    const [result] = await Conexion.query(sql, [id]);
    return result.affectedRows > 0;
  }
};

export default MensajeContacto;
