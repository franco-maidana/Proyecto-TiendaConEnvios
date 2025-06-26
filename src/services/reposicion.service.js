import {ObtenerInsumoPorId}  from '../models/insumos.model.js'
import {ObtenerEnvasePorId} from '../models/envases.model.js'
import {RegistrarGasto, ActualizarBalance} from '../models/finanzas.models.js'
import {SumarStockEnvase, SumarStockInsumo} from '../models/reposicion.model.js'

export const ReponerStock = async ({ tipo, id, cantidad, precio_unitario, descripcion = '' }) => {
  if (!['insumo', 'envase'].includes(tipo)) {
    throw new Error('Tipo inválido. Debe ser "insumo" o "envase"');
  }

  if (tipo === 'insumo') {
    const insumo = await ObtenerInsumoPorId(id);
    if (!insumo) throw new Error('Insumo no encontrado');

    await SumarStockInsumo(id, insumo.tipo, cantidad);

    const monto = cantidad * precio_unitario;
    const texto = descripcion || `Reposición de insumo "${insumo.nombre}"`;

    await RegistrarGasto('Reposición', texto, monto);
    await ActualizarBalance();

    return { nombre: insumo.nombre, monto };
  }

  if (tipo === 'envase') {
    const envase = await ObtenerEnvasePorId(id);
    if (!envase) throw new Error('Envase no encontrado');

    await SumarStockEnvase(id, cantidad);

    const monto = cantidad * precio_unitario;
    const texto = descripcion || `Reposición de envase tipo "${envase.tipo}" (${envase.capacidad_litros}L)`;

    await RegistrarGasto('Reposición', texto, monto);
    await ActualizarBalance();

    return { nombre: envase.tipo, monto };
  }
};

export const CrearReposicion = async ({
  producto_id,
  insumo_id,
  envase_id,
  cantidad,
  costo_total,
  observaciones,
  fecha
}) => {
  const [res] = await Conexion.query(`
    INSERT INTO reposiciones (
      producto_id,
      insumo_id,
      envase_id,
      cantidad,
      costo_total,
      observaciones,
      fecha
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    producto_id,
    insumo_id,
    envase_id,
    cantidad,
    costo_total,
    observaciones,
    fecha
  ]);

  return res; // 🔥 devuelve insertId
};
