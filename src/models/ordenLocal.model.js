import Conexion from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

// 🧾 Crear una nueva orden local (carrito vacío)
export const CrearOrdenLocal = async () => {
  const grupo_orden = uuidv4(); // 🧬 Genera ID único
  const [res] = await Conexion.query(`
    INSERT INTO ordenes_locales (grupo_orden, estado, total)
    VALUES (?, 'pendiente', 0)
  `, [grupo_orden]);

  return res.insertId;
};

// ➕ Agregar producto al carrito
export const AgregarProductoAOrden = async (ordenId, productoId, cantidad) => {
  await Conexion.query(`
    INSERT INTO detalle_orden_local (orden_id, producto_id, cantidad)
    VALUES (?, ?, ?)
  `, [ordenId, productoId, cantidad]);
};

// 🔍 Obtener detalles de carrito
export const ObtenerDetalleOrden = async (ordenId) => {
  const [res] = await Conexion.query(`
    SELECT d.producto_id, p.nombre AS producto_nombre, p.precio_unitario, d.cantidad,
           (p.precio_unitario * d.cantidad) AS subtotal
    FROM detalle_orden_local d
    JOIN productos_limpieza p ON p.id = d.producto_id
    WHERE d.orden_id = ?
  `, [ordenId]);
  return res;
};


// 🚀 Confirmar la orden
export const ConfirmarOrden = async (total, grupo_orden) => {
  const fecha = new Date();
  const estado = 'confirmada';

  const [res] = await Conexion.query(`
    INSERT INTO ordenes_locales (estado, total, fecha, grupo_orden)
    VALUES (?, ?, ?, ?)
  `, [estado, total, fecha, grupo_orden]);

  return res.insertId; // por si querés usarlo después
};

// ❌ Eliminar carrito completo
export const EliminarOrdenLocal = async (ordenId) => {
  await Conexion.query(`DELETE FROM ordenes_locales WHERE id = ?`, [ordenId]);
  await Conexion.query(`DELETE FROM detalle_orden_local WHERE orden_id = ?`, [ordenId]);
};

// Elimina el producto del carrito 
export const EliminarProductoDeOrden = async (ordenId, productoId) => {
  await Conexion.query(`
    DELETE FROM detalle_orden_local
    WHERE orden_id = ? AND producto_id = ?
  `, [ordenId, productoId]);
};

export const ActualizarTotalOrden = async (ordenId) => {
  const [result] = await Conexion.query(`
    SELECT SUM(p.precio_unitario * d.cantidad) AS nuevo_total
    FROM detalle_orden_local d
    JOIN productos_limpieza p ON p.id = d.producto_id
    WHERE d.orden_id = ?
  `, [ordenId]);

  const nuevoTotal = result[0].nuevo_total || 0;

  await Conexion.query(`
    UPDATE ordenes_locales SET total = ? WHERE id = ?
  `, [nuevoTotal, ordenId]);
};

export const ObtenerGrupoOrden = async (ordenId) => {
  const [res] = await Conexion.query(
    `SELECT grupo_orden FROM ordenes_locales WHERE id = ?`,
    [ordenId]
  );
  return res[0]?.grupo_orden;
};

export const LimpiarDetalleCarrito = async (ordenId) => {
  await Conexion.query(`DELETE FROM detalle_orden_local WHERE orden_id = ?`, [ordenId]);
};

