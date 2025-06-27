import ApiError from '../middlewares/ApiError.js';
import {
  ActualizarValoracionService,
  CrearValoracionService,
  EliminarValoracionService,
  ObtenerValoracionesPorProductoService,
  ObtenerValoracionesService,
  PromedioEstrellasService,
  ResumenValoracionesService
} from "../services/valoracione.service.js";
import { ObtenerValoracionPorId } from '../models/valoraciones.model.js';

export const CrearValoracionController = async (req, res, next) => {
  try {
    const { usuarios_id, productos_id, estrellas, comentarios } = req.body;

    if (!estrellas || estrellas < 1 || estrellas > 5) {
      return next(new ApiError('Las estrellas deben ser un número entre 1 y 5', 400));
    }

    await CrearValoracionService({ usuarios_id, productos_id, estrellas, comentarios });
    res.status(201).json({ mensaje: '✅ Valoración creada correctamente' });
  } catch (e) {
    next(
      e instanceof ApiError ? e : new ApiError(e.message, 500)
    );
  }
};

export const ObtenerValoracionesController = async (req, res, next) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const result = await ObtenerValoracionesService(parseInt(page), parseInt(limit));
    res.json(result);
  } catch (e) {
    next(new ApiError(e.message, 500));
  }
};

export const ObtenerValoracionesPorProductoController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 5 } = req.query;
    const data = await ObtenerValoracionesPorProductoService(id, parseInt(page), parseInt(limit));
    res.json(data);
  } catch (e) {
    next(new ApiError(e.message, 500));
  }
};

export const EliminarValoracionController = async (req, res, next) => {
  try {
    const { id, usuarios_id } = req.params;
    const uid = parseInt(usuarios_id);

    const valoracion = await ObtenerValoracionPorId(id);

    if (!valoracion) {
      return next(new ApiError('Valoración no encontrada', 404));
    }

    if (valoracion.usuarios_id !== uid) {
      return next(new ApiError('No tienes permiso para eliminar esta valoración', 403));
    }

    await EliminarValoracionService(id);
    res.json({ mensaje: '🗑️ Valoración eliminada' });
  } catch (e) {
    next(new ApiError(e.message, 500));
  }
};

export const ActualizarValoracionController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estrellas, comentarios, usuarios_id } = req.body;

    if (estrellas < 1 || estrellas > 5) {
      return next(new ApiError('Las estrellas deben estar entre 1 y 5', 400));
    }

    const valoracion = await ObtenerValoracionPorId(id);

    if (!valoracion) {
      return next(new ApiError('Valoración no encontrada', 404));
    }

    if (valoracion.usuarios_id !== parseInt(usuarios_id)) {
      return next(new ApiError('No tienes permiso para modificar esta valoración', 403));
    }

    await ActualizarValoracionService(id, { estrellas, comentarios });
    res.json({ mensaje: '✏️ Valoración actualizada' });
  } catch (e) {
    next(new ApiError(e.message, 500));
  }
};

export const ObtenerPromedioEstrellasController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const promedio = await PromedioEstrellasService(id);
    res.json({ promedio });
  } catch (e) {
    next(new ApiError(e.message, 500));
  }
};

export const ObtenerResumenValoracionesController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resumen = await ResumenValoracionesService(id);
    res.json({ producto_id: parseInt(id), resumen });
  } catch (e) {
    next(new ApiError(e.message, 500));
  }
};
