// src/services/ordenesDistribucion.service.js
import { ObtenerEnvasesOrdenados } from '../models/envases.model.js';

/**
 * Distribuye litros entre envases disponibles
 * @param {number} litrosSolicitados - Cantidad de litros a envasar
 * @returns {Object} resultado con detalle de asignación o error
 */
export const distribuirEnvasesPorLitros = async (litrosSolicitados) => {
  const envases = await ObtenerEnvasesOrdenados(); // [{id, tipo, capacidad_litros, stock, precio_envase}]

  let litrosRestantes = litrosSolicitados;
  const envasesUsados = [];

  for (const envase of envases) {
    const maxPosibles = Math.floor(litrosRestantes / envase.capacidad_litros);
    const cantidadAUsar = Math.min(maxPosibles, envase.stock);

    if (cantidadAUsar > 0) {
      envasesUsados.push({
        envase_id: envase.id,
        tipo: envase.tipo,
        capacidad_litros: envase.capacidad_litros,
        cantidad: cantidadAUsar,
        precio_unitario: envase.precio_envase
      });

      litrosRestantes -= cantidadAUsar * envase.capacidad_litros;
    }

    if (litrosRestantes <= 0) break;
  }

  if (litrosRestantes > 0) {
    return {
      posible: false,
      mensaje: `❌ No hay suficientes envases para ${litrosSolicitados} litros`,
      litrosRestantes
    };
  }

  return {
    posible: true,
    litrosTotales: litrosSolicitados,
    envasesUsados // Array con detalle por tipo de envase
  };
};
