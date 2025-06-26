import Conexion from '../config/db.js';

export const CrearEnvase = async (tipo, capacidad_litros, stock, precio_envase) => {
  const [res] = await Conexion.query(`
    INSERT INTO envases (tipo, capacidad_litros, stock, precio_envase)
    VALUES (?, ?, ?, ?)
  `, [tipo, capacidad_litros, stock, precio_envase]);
  return res.insertId;
};

export const ObtenerEnvasesOrdenados = async () => {
  const [rows] = await Conexion.query(`
    SELECT * FROM envases
    WHERE stock > 0
    ORDER BY capacidad_litros ASC
  `);
  return rows;
};

export const DescontarEnvase = async (envase_id, cantidad) => {
  await Conexion.query(`UPDATE envases SET stock = stock - ? WHERE id = ?`, [cantidad, envase_id]);
};

export const ObtenerEnvasesDisponibles = async () => {
  const [rows] = await Conexion.query(`SELECT * FROM envases WHERE stock > 0`);
  return rows;
};

export const ObtenerEnvasePorId = async (id) => {
  const [rows] = await Conexion.query(
    `SELECT * FROM envases WHERE id = ?`,
    [id]
  );
  return rows[0]; // retorna un solo objeto
};

export const ActualizarEnvase = async (id, campos) => {
  const claves = [], valores = [];
  for (const [k, v] of Object.entries(campos)) {
    claves.push(`${k} = ?`);
    valores.push(v);
  }
  valores.push(id);
  await Conexion.query(`UPDATE envases SET ${claves.join(', ')} WHERE id = ?`, valores);
};

export const EliminarEnvase = async (id) => {
  await Conexion.query(`DELETE FROM envases WHERE id = ?`, [id]);
};

export const ObtenerTodosEnvases = async () => {
  const [rows] = await Conexion.query(`SELECT * FROM envases`);
  return rows;
};

export const RestarEnvasesDeProducto = async (productoId, cantidadVendida) => {
const [rows] = await Conexion.query(`
  SELECT envase_id FROM productos_limpieza WHERE id = ?
`, [productoId]);

const envase_id = rows[0].envase_id;

await Conexion.query(`
  UPDATE envases SET stock = stock - ?
  WHERE id = ?
`, [cantidadVendida, envase_id]);
};

