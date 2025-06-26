import Conexion from '../config/db.js';

export const CrearInsumo = async (
  nombre,
  tipo,
  stock_litros = 0,
  stock_unidades = 0,
  precio_litro = 0,
  precio_seco = 0
) => {
  const [res] = await Conexion.query(`
    INSERT INTO insumos_base (
      nombre, tipo, stock_litros, stock_unidades, precio_litro, precio_seco
    ) VALUES (?, ?, ?, ?, ?, ?)
  `, [
    nombre,
    tipo,
    stock_litros,
    stock_unidades,
    precio_litro,
    precio_seco
  ]);
  return res.insertId;
};


export const ObtenerInsumoPorId = async (id) => {
  const [rows] = await Conexion.query(`SELECT * FROM insumos_base WHERE id = ?`, [id]);
  return rows[0];
};

export const DescontarLitros = async (id, litros) => {
  await Conexion.query(`UPDATE insumos_base SET stock_litros = stock_litros - ? WHERE id = ?`, [litros, id]);
};


export const ActualizarStockInsumo = async (id, cantidadDescontar) => {
  await Conexion.query(`
    UPDATE insumos_base SET stock_litros = stock_litros - ?
    WHERE id = ?
  `, [cantidadDescontar, id]);
};

export const DescontarStockUnidades = async (id, unidades) => {
  await Conexion.query(
    `UPDATE insumos_base SET stock_unidades = stock_unidades - ? WHERE id = ?`,
    [unidades, id]
  );
};

export const ActualizarInsumo = async (id, campos) => {
  const claves = [], valores = [];
  for (const [k, v] of Object.entries(campos)) {
    claves.push(`${k} = ?`);
    valores.push(v);
  }
  valores.push(id);
  await Conexion.query(`UPDATE insumos_base SET ${claves.join(', ')} WHERE id = ?`, valores);
};

export const EliminarInsumo = async (id) => {
  await Conexion.query(`DELETE FROM insumos_base WHERE id = ?`, [id]);
};

export const ObtenerTodosInsumos = async () => {
  const [rows] = await Conexion.query(`SELECT * FROM insumos_base`);
  return rows;
};


export const RestarInsumosDeProducto = async (productoId, cantidadVendida) => {
const [rows] = await Conexion.query(`
  SELECT p.insumo_id, e.capacidad_litros
  FROM productos_limpieza p
  JOIN envases e ON p.envase_id = e.id
  WHERE p.id = ?
`, [productoId]);

const { insumo_id, capacidad_litros } = rows[0];

await Conexion.query(`
  UPDATE insumos_base
  SET stock_litros = stock_litros - (? * ?)
  WHERE id = ?
`, [cantidadVendida, capacidad_litros, insumo_id]);
};
