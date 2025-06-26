import Conexion from "../config/db.js";

export const RegistrarMovimientoFinanciero = async (
  tipo,
  categoria,
  descripcion,
  monto,
  orden_id = null,
  usuario_id = null
) => {
  const [resultado] = await Conexion.query(
    `INSERT INTO movimientos_financieros
    (tipo, categoria, descripcion, monto, orden_id, usuario_id)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [tipo, categoria, descripcion, monto, orden_id, usuario_id]
  );
  return resultado;
};