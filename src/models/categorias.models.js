import Conexion from '../config/db.js'

export const CrearCategoria = async (nombre, descripcion = null) => {
  const [res] = await Conexion.query(`
    INSERT INTO categorias (nombre, descripcion)
    VALUES (?, ?)
  `, [nombre, descripcion]);

  return res.insertId;
};

export const ObtenerCategorias = async (soloActivas = true) => {
  const query = soloActivas
    ? 'SELECT * FROM categorias WHERE activo = 1 ORDER BY nombre'
    : 'SELECT * FROM categorias ORDER BY nombre';

  const [rows] = await Conexion.query(query);
  return rows;
};

export const ObtenerCategoriaPorId = async (id) => {
  const [rows] = await Conexion.query(`SELECT * FROM categorias WHERE id = ?`, [id]);
  return rows[0];
};

export const ActualizarCategoria = async (id, campos) => {
  const claves = [], valores = [];

  for (const [k, v] of Object.entries(campos)) {
    claves.push(`${k} = ?`);
    valores.push(v);
  }

  valores.push(id);
  const query = `UPDATE categorias SET ${claves.join(', ')} WHERE id = ?`;

  await Conexion.query(query, valores);
};

export const EliminarCategoria = async (id) => {
  await Conexion.query(`UPDATE categorias SET activo = 0 WHERE id = ?`, [id]);
};

export const ReactivarCategoria = async (id) => {
  await Conexion.query(`UPDATE categorias SET activo = 1 WHERE id = ?`, [id]);
};

export const BorrarCategoriaDefinitivamente = async (id) => {
  await Conexion.query(`DELETE FROM categorias WHERE id = ?`, [id]);
};