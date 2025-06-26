import Conexion from '../config/db.js'

export const ObtenerProductoPorId = async (producto_id) => {
  const [rows] = await Conexion.query(
    `SELECT * FROM productos_limpieza WHERE id = ?`,
    [producto_id]
  );
  return rows[0];
};

export const ObtenerCarritoPendientePorUsuario = async (usuario_id) => {
  const [rows] = await Conexion.query(
    `SELECT 
      o.id,
      o.producto_id,
      p.nombre AS producto_nombre,
      o.cantidad,
      o.precio_unitario,
      o.subtotal
    FROM ordenes_simplificadas o
    JOIN productos_limpieza p ON o.producto_id = p.id
    WHERE o.usuario_id = ? AND o.estado = 'pendiente'`,
    [usuario_id]
  );
  return rows;
};

export const MarcarOrdenesComoPagadas = async (usuario_id) => {
  await Conexion.query(
    `UPDATE ordenes_simplificadas
     SET estado = 'pagado'
     WHERE usuario_id = ? AND estado = 'pendiente'`,
    [usuario_id]
  );
};

export const ActualizarEnvioYMantenimiento = async (id, envio, mantenimiento) => {
  await Conexion.query(
    `UPDATE ordenes_simplificadas
     SET envio = ?, mantenimiento = ?
     WHERE id = ?`,
    [envio, mantenimiento, id]
  );
};

export const InsertarOrdenSimplificada = async (
  usuario_id,
  producto_id,
  cantidad,
  precio_unitario,
  total
) => {
  await Conexion.query(
    `INSERT INTO ordenes_simplificadas 
     (usuario_id, producto_id, cantidad, precio_unitario, envio, mantenimiento, total, estado)
     VALUES (?, ?, ?, ?, 0, 0, ?, 'pendiente')`,
    [usuario_id, producto_id, cantidad, precio_unitario, total]
  );
};

// Modificar
export const ModificarCantidadProductoCarritoPorProducto = async (usuario_id, producto_id, nuevaCantidad) => {
  await Conexion.query(
    `UPDATE ordenes_simplificadas
      SET cantidad = ?
      WHERE usuario_id = ? AND producto_id = ? AND estado = 'pendiente'`,
    [nuevaCantidad, usuario_id, producto_id]
  );
};

// Eliminar 
export const EliminarProductoDelCarrito = async (usuario_id, producto_id) => {
  await Conexion.query(
    `DELETE FROM ordenes_simplificadas 
      WHERE usuario_id = ? AND producto_id = ? AND estado = 'pendiente'`,
    [usuario_id, producto_id]
  );
};

export const VaciarCarritoUsuario = async (usuario_id) => {
  await Conexion.query(
    `DELETE FROM ordenes_simplificadas 
      WHERE usuario_id = ? AND estado = 'pendiente'`,
    [usuario_id]
  );
};

export const BuscarProductoEnCarrito = async (usuario_id, producto_id) => {
  const [rows] = await Conexion.query(
    `SELECT * FROM ordenes_simplificadas 
      WHERE usuario_id = ? AND producto_id = ? AND estado = 'pendiente'`,
    [usuario_id, producto_id]
  );
  return rows[0];
};

export const ActualizarCantidadExistente = async (orden_id, nuevaCantidad) => {
  await Conexion.query(
    `UPDATE ordenes_simplificadas 
      SET cantidad = ?
      WHERE id = ?`,
    [nuevaCantidad, orden_id]
  );
};

export const ObtenerOrdenPorGrupo = async (grupo_orden) => {
  const [rows] = await Conexion.query(
    `SELECT o.*, p.nombre AS producto_nombre
      FROM ordenes_simplificadas o
      JOIN productos_limpieza p ON o.producto_id = p.id
      WHERE o.grupo_orden = ?
      ORDER BY o.id ASC`,
    [grupo_orden]
  );
  return rows;
};

export const AsignarGrupoOrden = async (orden_id, grupo_orden) => {
  await Conexion.query(
    `UPDATE ordenes_simplificadas SET grupo_orden = ? WHERE id = ?`,
    [grupo_orden, orden_id]
  );
};

export const InsertarOrdenResumen = async (
  grupo_orden,
  usuario_id,
  cantidad_productos,
  subtotal,
  mantenimiento,
  envio,
  total,
  estado
) => {
  await Conexion.query(
    `INSERT INTO ordenes_resumen (
      grupo_orden, usuario_id, cantidad_productos,
      subtotal, mantenimiento, envio, total, estado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [grupo_orden, usuario_id, cantidad_productos, subtotal, mantenimiento, envio, total, estado]
  );
};

export const InsertarProductoVendido = async (
  grupo_orden, producto_id, cantidad, precio_unitario, subtotal
) => {
  await Conexion.query(`
    INSERT INTO productos_vendidos (
      grupo_orden, producto_id, cantidad, precio_unitario, subtotal
    ) VALUES (?, ?, ?, ?, ?)`,
    [grupo_orden, producto_id, cantidad, precio_unitario, subtotal]
  );
};

// export const RegistrarGananciaTotal = async () => {
//   const [[{ total_productos }]] = await Conexion.query(`
//     SELECT SUM(subtotal) AS total_productos FROM productos_vendidos
//   `);

//   const [[{ total_mantenimiento }]] = await Conexion.query(`
//     SELECT SUM(mantenimiento) AS total_mantenimiento FROM ordenes_resumen
//   `);

//   const [[{ total_envio }]] = await Conexion.query(`
//     SELECT SUM(envio) AS total_envio FROM ordenes_resumen
//   `);

//   const total_general =
//     (parseFloat(total_productos) || 0) +
//     (parseFloat(total_mantenimiento) || 0) +
//     (parseFloat(total_envio) || 0);

//     console.log({
//       total_productos,
//       total_mantenimiento,
//       total_envio,
//       total_general
//     });


//   await Conexion.query(`
//     INSERT INTO ganancias_totales (
//       total_productos,
//       total_mantenimiento,
//       total_envio,
//       total_general
//     ) VALUES (?, ?, ?, ?)
//   `, [
//     total_productos || 0,
//     total_mantenimiento || 0,
//     total_envio || 0,
//     total_general
//   ]);
// };

// export const ObtenerDetalleOrdenResumenPorOrdenId = async (orden_id) => {
//   const [rows] = await Conexion.query(`
//     SELECT 
//       p.nombre, p.precio, d.cantidad, 
//       (p.precio * d.cantidad) AS subtotal, 
//       d.producto_id
//     FROM detalle_orden d
//     INNER JOIN productos p ON d.producto_id = p.id
//     WHERE d.orden_id = ?
//   `, [orden_id]);

//   return rows;
// };

