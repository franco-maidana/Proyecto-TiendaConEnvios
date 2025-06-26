import {
  ActualizarValoracionService,
  CrearValoracionService,
  EliminarValoracionService,
  ObtenerValoracionesPorProductoService,
  ObtenerValoracionesService,
  PromedioEstrellasService,
  ResumenValoracionesService
} from "../services/valoracione.service.js";
import { ObtenerValoracionPorId } from '../models/valoraciones.model.js'

export const CrearValoracionController = async (req, res) => {
  try {
    const { usuarios_id, productos_id, estrellas, comentarios } = req.body;

    if (!estrellas || estrellas < 1 || estrellas > 5) {
      return res.status(400).json({ error: 'Las estrellas deben ser un número entre 1 y 5' });
    }

    await CrearValoracionService({ usuarios_id, productos_id, estrellas, comentarios });
    res.status(201).json({ mensaje: '✅ Valoración creada correctamente' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const ObtenerValoracionesController = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const result = await ObtenerValoracionesService(pageNum, limitNum);
    res.json(result);
  } catch (error) {
    console.error('❌ Error al obtener valoraciones:', error.message);
    res.status(500).json({ error: 'Error al obtener valoraciones' });
  }
};

export const ObtenerValoracionesPorProductoController = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 5 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const data = await ObtenerValoracionesPorProductoService(id, pageNum, limitNum);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const EliminarValoracionController = async (req, res) => {
  try {
    const { id, usuarios_id } = req.params;

    const uid = parseInt(usuarios_id);

    // 🔍 Buscar la valoración
    const valoracion = await ObtenerValoracionPorId(id);

    if (!valoracion) {
      return res.status(404).json({ error: 'Valoración no encontrada' });
    }

    if (valoracion.usuarios_id !== uid) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta valoración' });
    }

    await EliminarValoracionService(id);
    res.json({ mensaje: '🗑️ Valoración eliminada' });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const ActualizarValoracionController = async (req, res) => {
  try {
    const { id } = req.params;
    const { estrellas, comentarios, usuarios_id } = req.body;
    console.log(req.body)
    if (estrellas < 1 || estrellas > 5) {
      return res.status(400).json({ error: 'Las estrellas deben estar entre 1 y 5' });
    }

    // 🔐 Validar si la valoración existe y si pertenece al usuario
    const valoracion = await ObtenerValoracionPorId(id);

    if (!valoracion) {
      return res.status(404).json({ error: 'Valoración no encontrada' });
    }

    if (valoracion.usuarios_id !== parseInt(usuarios_id)) {
  return res.status(403).json({ error: 'No tienes permiso para modificar esta valoración' });
}


    // ✅ Ahora sí, actualizar
    await ActualizarValoracionService(id, { estrellas, comentarios });

    res.json({ mensaje: '✏️ Valoración actualizada' });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const ObtenerPromedioEstrellasController = async (req, res) => {
  try {
    const { id } = req.params;
    const promedio = await PromedioEstrellasService(id);
    res.json({ promedio }); // ej: { promedio: 4.3 }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const ObtenerResumenValoracionesController = async (req, res) => {
  try {
    const { id } = req.params;

    const resumen = await ResumenValoracionesService(id);

    res.json({
      producto_id: parseInt(id),
      resumen
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};