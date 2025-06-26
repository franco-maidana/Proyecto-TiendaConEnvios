import {
  ActualizarValoracion,
  CrearValoracion,
  EliminarValoracion,
  ObtenerTodasLasValoraciones,
  ObtenerPromedioEstrellasPorProducto,
  VerificarValoracionExistente,
  ObtenerResumenValoracionesPorProducto,
  ObtenerValoracionesPorProducto
} from "../models/valoraciones.model.js";

export const CrearValoracionService = async ({ usuarios_id, productos_id, estrellas, comentarios }) => {
  const existe = await VerificarValoracionExistente(usuarios_id, productos_id);

  if (existe) {
    throw new Error('Ya has valorado este producto');
  }

  await CrearValoracion({ usuarios_id, productos_id, estrellas, comentarios });
};

export const ObtenerValoracionesService = async (page = 1, limit = 5) => {
  return await ObtenerTodasLasValoraciones(page, limit);
};

export const ObtenerValoracionesPorProductoService = async (productoId) => {
  return await ObtenerValoracionesPorProducto(productoId);
};

export const EliminarValoracionService = async (id) => {
  await EliminarValoracion(id);
};

export const ActualizarValoracionService = async (id, data) => {
  await ActualizarValoracion(id, data);
};

export const PromedioEstrellasService = async (producto_id) => {
  return await ObtenerPromedioEstrellasPorProducto(producto_id);
};

export const ResumenValoracionesService = async (producto_id) => {
  return await ObtenerResumenValoracionesPorProducto(producto_id);
};