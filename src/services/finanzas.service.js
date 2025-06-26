import {
  EliminarGastoPorId,
  ActualizarBalance,
  RegistrarGastoManual,
  ObtenerGastos,
  ObtenerGastoPorId,
  ActualizarGastoManual,
  ObtenerGastosPorMes,
  ObtenerResumenGastosAnuales
} from "../models/finanzas.models.js";

export const EliminarGastoYActualizarBalance = async (gasto_id) => {
  await EliminarGastoPorId(gasto_id);
  await ActualizarBalance();
};

export const RegistrarGastoGeneral = async (descripcion, monto, categoria) => {
  await RegistrarGastoManual(descripcion, monto, categoria);
  await ActualizarBalance();
};

export const ListarGastos = async () => {
  return await ObtenerGastos();
};

export const ObtenerDetalleGasto = async (id) => {
  return await ObtenerGastoPorId(id);
};

export const ModificarGasto = async (id, campos) => {
  await ActualizarGastoManual(id, campos);
  await ActualizarBalance();
};

export const ListarGastosMensuales = async (anio, mes) => {
  return await ObtenerGastosPorMes(anio, mes);
};

export const ResumenAnualGastos = async (anio) => {
  return await ObtenerResumenGastosAnuales(anio);
};