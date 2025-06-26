import Conexion from './../config/db.js'
// import {CalcularPrecioVenta} from './stockDerivado.model.js'

export const CrearProducto = async (
  nombre, descripcion, tipo_medida,
  stock_minimo, precio_lista, ganancia, marca,
  categoria_id, imagen_url, creado_por,
  insumo_id, envase_id
) => {
  const [result] = await Conexion.query(
    `INSERT INTO productos_limpieza (
      nombre, descripcion, tipo_medida,
      stock_minimo, precio_lista, ganancia,
      marca, categoria_id, imagen_url, creado_por,
      insumo_id, envase_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nombre, descripcion, tipo_medida,
      stock_minimo, precio_lista, ganancia,
      marca, categoria_id, imagen_url, creado_por,
      insumo_id, envase_id
    ]
  );

  return result;
};

export const ObtenerProductoPorId = async (id) => {
  const [rows] = await Conexion.query(
    `SELECT * FROM productos_limpieza WHERE id = ?`,
    [id]
  );
  return rows[0];
};

export const ObtenerProductos = async (limite, offset, buscar = '', categoriaId = null) => {
  let query =  `
  SELECT p.*, c.nombre AS categoria
  FROM productos_limpieza p
  LEFT JOIN categorias c ON p.categoria_id = c.id
  WHERE p.nombre LIKE ? AND p.activo = 1
`;

  const valores = [`%${buscar}%`];

  if (categoriaId) {
    query += ` AND p.categoria_id = ?`;
    valores.push(categoriaId);
  }

  query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
  valores.push(limite, offset);

  const [productos] = await Conexion.query(query, valores);
  return productos;
};

export const ContarProductos = async (buscar = '', categoriaId = null) => {
  let query = `SELECT COUNT(*) AS total FROM productos_limpieza WHERE nombre LIKE ?`;
  const valores = [`%${buscar}%`];

  if (categoriaId) {
    query += ` AND categoria_id = ?`;
    valores.push(categoriaId);
  }

  const [result] = await Conexion.query(query, valores);
  return result[0].total;
};

export const ActualizarProducto = async (id, campos) => {
  const claves = [];
  const valores = [];

  for (const [clave, valor] of Object.entries(campos)) {
    claves.push(`${clave} = ?`);
    valores.push(valor);
  }

  if (claves.length === 0) {
    throw new Error('No hay campos para actualizar');
  }

  valores.push(id);

  const query = `
    UPDATE productos_limpieza
    SET ${claves.join(', ')}
    WHERE id = ?
  `;

  const [resultado] = await Conexion.query(query, valores);
  return resultado;
};

export const EliminarProducto = async (id) => {
  const [resultado] = await Conexion.query(
    `DELETE FROM productos_limpieza WHERE id = ?`,
    [id]
  );
  return resultado
};

export const AnularProducto = async (id) => {
  const [resultado] = await Conexion.query(
    `UPDATE productos_limpieza SET activo = 0 WHERE id = ?`,
    [id]
  );
  return resultado;
}

export const ObtenerProductosAdmin = async () => {
  const [productos] = await Conexion.query(`
    SELECT p.*, c.nombre AS categoria
    FROM productos_limpieza p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    ORDER BY p.created_at DESC
  `);
  return productos;
};

export const ActivarProducto = async (id) => {
  const [resultado] = await Conexion.query(
    `UPDATE productos_limpieza SET activo = 1 WHERE id = ?`,
    [id]
  );
  return resultado;
};

export const RegistrarProductoVendido = async (producto_id, cantidad, precio_unitario, grupo_orden) => {
  const subtotal = precio_unitario * cantidad;

  await Conexion.query(`
    INSERT INTO productos_vendidos (producto_id, cantidad, precio_unitario, subtotal, fecha, grupo_orden)
    VALUES (?, ?, ?, ?, NOW(), ?)
  `, [producto_id, cantidad, precio_unitario, subtotal, grupo_orden]);
};

export const ExisteEnvasePorId = async (envase_id) =>  {
  const [resultado] = await Conexion.query("SELECT id FROM envases WHERE id = ?", [envase_id]);
  return resultado.length > 0;
}
