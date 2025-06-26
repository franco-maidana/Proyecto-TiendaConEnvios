import Conexion from '../config/db.js';

export const RegistrarGasto = async (categoria, descripcion, monto) => {
  await Conexion.query(
    `INSERT INTO gastos_totales (categoria, descripcion, monto) VALUES (?, ?, ?)`,
    [categoria, descripcion, monto]
  );
};

export const ActualizarBalance = async () => {
  // Obtener el último ingreso registrado
  const [[ultimaGanancia]] = await Conexion.query(`
    SELECT total_general FROM ganancias_totales
    ORDER BY id DESC
    LIMIT 1
  `);

  const ingresos = ultimaGanancia?.total_general || 0;

  // Obtener suma de gastos, y si no hay ninguno, usar 0
  const [[{ gastos }]] = await Conexion.query(`
    SELECT SUM(monto) AS gastos FROM gastos_totales
  `);

  const totalGastos = gastos ?? 0;
  const balance = ingresos - totalGastos;

  // Comprobar si ya existe fila con ID 1
  const [[existe]] = await Conexion.query(`SELECT id FROM balance_actual WHERE id = 1`);

  if (existe) {
    await Conexion.query(`
      UPDATE balance_actual
      SET total_ingresos = ?, total_gastos = ?, balance = ?, fecha = CURRENT_TIMESTAMP
      WHERE id = 1
    `, [ingresos, totalGastos, balance]);
  } else {
    await Conexion.query(`
      INSERT INTO balance_actual (id, total_ingresos, total_gastos, balance)
      VALUES (1, ?, ?, ?)
    `, [ingresos, totalGastos, balance]);
  }
};


export const EliminarGastoPorProducto = async (clave) => {
  await Conexion.query(
    `DELETE FROM gastos_totales WHERE descripcion LIKE ? AND categoria = 'Reposición'`,
    [`%${clave}%`]
  );
};


export const EliminarGastoPorId = async (id) => {
  await Conexion.query(
    `DELETE FROM gastos_totales WHERE id = ?`,
    [id]
  );
};

// Crear gasto general
export const RegistrarGastoManual = async (descripcion, monto, categoria) => {
  await Conexion.query(
    `INSERT INTO gastos_totales (descripcion, monto, categoria) VALUES (?, ?, ?)`,
    [descripcion, monto, categoria]
  );
};


export const ObtenerGastos = async () => {
  const [gastos] = await Conexion.query(
    `SELECT * FROM gastos_totales ORDER BY fecha DESC`
  );
  return gastos;
};

export const ObtenerGastoPorId = async (id) => {
  const [rows] = await Conexion.query(
    `SELECT * FROM gastos_totales WHERE id = ?`,
    [id]
  );
  return rows[0];
};

export const ActualizarGastoManual = async (id, campos) => {
  const claves = [];
  const valores = [];

  for (const [clave, valor] of Object.entries(campos)) {
    claves.push(`${clave} = ?`);
    valores.push(valor);
  }

  valores.push(id);

  const query = `UPDATE gastos_totales SET ${claves.join(', ')} WHERE id = ?`;
  await Conexion.query(query, valores);
};

export const ObtenerGastosPorMes = async (anio, mes) => {
  const [gastos] = await Conexion.query(`
    SELECT * FROM gastos_totales
    WHERE YEAR(fecha) = ? AND MONTH(fecha) = ?
    ORDER BY fecha DESC
  `, [anio, mes]);
  return gastos;
};

export const ObtenerResumenGastosAnuales = async (anio) => {
  const [resumen] = await Conexion.query(`
    SELECT 
      MONTH(fecha) AS mes,
      SUM(monto) AS total
    FROM gastos_totales
    WHERE YEAR(fecha) = ?
    GROUP BY MONTH(fecha)
    ORDER BY mes ASC
  `, [anio]);
  return resumen;
};

