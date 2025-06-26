import Conexion from "../config/db.js";

export const CrearValoracion = async ({
  usuarios_id,
  productos_id,
  estrellas,
  comentarios,
}) => {
  await Conexion.query(
    `
    INSERT INTO valoraciones (usuarios_id, productos_id, estrellas, comentarios)
    VALUES (?, ?, ?, ?)
  `,
    [usuarios_id, productos_id, estrellas, comentarios]
  );
};

export const ObtenerValoraciones = async () => {
  const [rows] = await Conexion.query(
    `SELECT * FROM valoraciones ORDER BY fecha DESC`
  );
  return rows;
};

export const ObtenerValoracionPorId = async (id) => {
  const [[row]] = await Conexion.query(
    `SELECT * FROM valoraciones WHERE id = ?`,
    [id]
  );

  return row; // puede ser undefined si no existe
};

export const ObtenerTodasLasValoraciones = async (page = 1, limit = 5) => {
  const offset = (page - 1) * limit;

  const [valoraciones] = await Conexion.query(
    `SELECT v.id, v.usuarios_id, v.productos_id, v.estrellas, v.comentarios, v.fecha,
            u.nombre AS usuario_nombre
     FROM valoraciones v
     JOIN usuarios u ON v.usuarios_id = u.id
     ORDER BY v.fecha DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  const [[{ total }]] = await Conexion.query(
    `SELECT COUNT(*) AS total FROM valoraciones`
  );

  return {
    data: valoraciones,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
  };
};

export const EliminarValoracion = async (id) => {
  await Conexion.query(`DELETE FROM valoraciones WHERE id = ?`, [id]);
};

export const ActualizarValoracion = async (id, { estrellas, comentarios }) => {
  await Conexion.query(
    `
    UPDATE valoraciones SET estrellas = ?, comentarios = ? WHERE id = ?
  `,
    [estrellas, comentarios, id]
  );
};

// 🔍 Verificar si ya existe una valoración de un usuario para un producto
export const VerificarValoracionExistente = async (
  usuarios_id,
  productos_id
) => {
  const [rows] = await Conexion.query(
    `
    SELECT id FROM valoraciones
    WHERE usuarios_id = ? AND productos_id = ?
    LIMIT 1
  `,
    [usuarios_id, productos_id]
  );

  return rows.length > 0;
};

export const ObtenerPromedioEstrellasPorProducto = async (producto_id) => {
  const [[{ promedio }]] = await Conexion.query(`
    SELECT ROUND(AVG(estrellas), 1) AS promedio
    FROM valoraciones
    WHERE productos_id = ?
  `, [producto_id]);

  return promedio ? Number(promedio) : 0; // 🔥 Forzamos número
};


export const ObtenerResumenValoracionesPorProducto = async (producto_id) => {
  const [rows] = await Conexion.query(`
    SELECT estrellas, COUNT(*) AS cantidad
    FROM valoraciones
    WHERE productos_id = ?
    GROUP BY estrellas
  `, [producto_id]);

  // Asegurarse de incluir todos los valores del 1 al 5 aunque no existan
  const resumen = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  rows.forEach(row => {
    resumen[row.estrellas] = row.cantidad;
  });

  return resumen;
};

export const ObtenerValoracionesPorProducto = async (producto_id, page = 1, limit = 5) => {
  const offset = (page - 1) * limit;

  const [valoraciones] = await Conexion.query(
    `SELECT v.id, v.usuarios_id, v.productos_id, v.estrellas, v.comentarios, v.fecha,
            u.nombre AS usuario_nombre
     FROM valoraciones v
     JOIN usuarios u ON v.usuarios_id = u.id
     WHERE v.productos_id = ?
     ORDER BY v.fecha DESC
     LIMIT ? OFFSET ?`,
    [producto_id, limit, offset]
  );

  const [[{ total }]] = await Conexion.query(
    `SELECT COUNT(*) AS total FROM valoraciones WHERE productos_id = ?`,
    [producto_id]
  );

  return {
    data: valoraciones,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
  };
};
