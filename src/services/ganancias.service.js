import Conexion from '../config/db.js';

export const RegistrarGananciaAcumulada = async ({
  total_productos = 0,
  total_mantenimiento = 0,
  total_envio = 0,
}) => {
  const fecha = new Date();
  const total_nuevo = total_productos + total_mantenimiento + total_envio;

  // ✅ CORREGIDO: resultado está en rows[0]
  const [rows] = await Conexion.query(`
    SELECT total_general FROM ganancias_totales
    ORDER BY id DESC LIMIT 1
  `);

  const total_acumulado_anterior = rows[0]?.total_general || 0;
  const total_general = Number(total_acumulado_anterior) + Number(total_nuevo);


  console.log("🧠 [GANANCIAS] total_anterior:", total_acumulado_anterior);
console.log("🧠 [GANANCIAS] total_nuevo:", total_nuevo);
console.log("🧠 [GANANCIAS] total_general acumulado:", total_general);


const [result] = await Conexion.query(`
  INSERT INTO ganancias_totales (
    total_productos,
    total_mantenimiento,
    total_envio,
    total_general,
    fecha
  ) VALUES (?, ?, ?, ?, ?)
`, [
  total_productos,
  total_mantenimiento,
  total_envio,
  total_general,
  fecha
]);

return { insertId: result.insertId }; // 👈 RETORNAR INSERTID

};

// ✅ Ver todas las ganancias
export const ObtenerGananciasTotales = async () => {
  const [rows] = await Conexion.query(`SELECT * FROM ganancias_totales ORDER BY fecha DESC`);
  return rows;
};

// ✅ Buscar por ID
export const ObtenerGananciaPorId = async (id) => {
  const [rows] = await Conexion.query(`SELECT * FROM ganancias_totales WHERE id = ?`, [id]);
  return rows[0];
};

// 📅 Ganancias del mes actual
export const ObtenerGananciasDelMes = async () => {
  const [rows] = await Conexion.query(`
    SELECT * FROM ganancias_totales
    WHERE MONTH(fecha) = MONTH(CURRENT_DATE()) AND YEAR(fecha) = YEAR(CURRENT_DATE())
    ORDER BY fecha DESC
  `);
  return rows;
};

// 📅 Ganancias del año actual
export const ObtenerGananciasDelAnio = async () => {
  const [rows] = await Conexion.query(`
    SELECT * FROM ganancias_totales
    WHERE YEAR(fecha) = YEAR(CURRENT_DATE())
    ORDER BY fecha DESC
  `);
  return rows;
};

// 📊 Comparativa mensual
export const ObtenerComparativaMensual = async () => {
  const [rows] = await Conexion.query(`
    SELECT DATE_FORMAT(fecha, '%Y-%m') AS mes, SUM(total_general) AS total_mensual
    FROM ganancias_totales
    GROUP BY mes
    ORDER BY mes DESC
  `);
  return rows;
};

// 📊 Comparativa anual
export const ObtenerComparativaAnual = async () => {
  const [rows] = await Conexion.query(`
    SELECT YEAR(fecha) AS anio, SUM(total_general) AS total_anual
    FROM ganancias_totales
    GROUP BY anio
    ORDER BY anio DESC
  `);
  return rows;
};

export const RegistrarGanancia = async (total_productos, total_mantenimiento, total_envio, total_general) => {
  const [result] = await Conexion.query(
    `INSERT INTO ganancias_totales (total_productos, total_mantenimiento, total_envio, total_general) VALUES (?, ?, ?, ?)`,
    [total_productos, total_mantenimiento, total_envio, total_general]
  );
  return result;
};



