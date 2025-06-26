import Conexion from '../config/db.js';

export const SumarStockInsumo = async (id, tipo, cantidad) => {
  if (tipo === 'liquido') {
    await Conexion.query(`UPDATE insumos_base SET stock_litros = stock_litros + ? WHERE id = ?`, [cantidad, id]);
  } else if (tipo === 'seco') {
    await Conexion.query(`UPDATE insumos_base SET stock_unidades = stock_unidades + ? WHERE id = ?`, [cantidad, id]);
  } else {
    throw new Error('Tipo de insumo no válido');
  }
};

export const SumarStockEnvase = async (id, cantidad) => {
  await Conexion.query(`UPDATE envases SET stock = stock + ? WHERE id = ?`, [cantidad, id]);
};
