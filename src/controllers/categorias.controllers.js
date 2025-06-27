import {
  Borrar,
  Crear,
  Desactivar,
  Detalle,
  Listar,
  Modificar,
  Reactivar,
} from "../services/categorias.service.js";
import ApiError from "../middlewares/ApiError.js";

// Crear categoría
export const CrearCategoriaController = async (req, res, next) => {
  try {
    const id = await Crear(req.body);
    res.status(201).json({ message: 'Categoría creada', id });
  } catch (err) {
    next(
      err instanceof ApiError
        ? err
        : new ApiError(err.message || "Error al crear categoría", 400)
    );
  }
};

// Listar categorías
export const ListarCategoriasController = async (req, res, next) => {
  try {
    const soloActivas = req.query.todas !== 'true';
    const data = await Listar(soloActivas);
    res.json({ data });
  } catch (err) {
    next(
      err instanceof ApiError
        ? err
        : new ApiError(err.message || "Error al listar categorías", 500)
    );
  }
};

// Obtener detalle de categoría
export const ObtenerCategoriaController = async (req, res, next) => {
  try {
    const cat = await Detalle(req.params.id);
    if (!cat) {
      return next(new ApiError('Categoría no encontrada', 404));
    }
    res.json(cat);
  } catch (err) {
    next(
      err instanceof ApiError
        ? err
        : new ApiError(err.message || "Error al obtener categoría", 500)
    );
  }
};

// Editar categoría
export const EditarCategoriaController = async (req, res, next) => {
  try {
    await Modificar(req.params.id, req.body);
    res.json({ message: 'Categoría actualizada' });
  } catch (err) {
    next(
      err instanceof ApiError
        ? err
        : new ApiError(err.message || "Error al editar categoría", 400)
    );
  }
};

// Desactivar categoría
export const DesactivarCategoriaController = async (req, res, next) => {
  try {
    await Desactivar(req.params.id);
    res.json({ message: 'Categoría desactivada' });
  } catch (err) {
    next(
      err instanceof ApiError
        ? err
        : new ApiError(err.message || "Error al desactivar categoría", 500)
    );
  }
};

// Reactivar categoría
export const ReactivarCategoriaController = async (req, res, next) => {
  try {
    await Reactivar(req.params.id);
    res.json({ message: 'Categoría reactivada' });
  } catch (err) {
    next(
      err instanceof ApiError
        ? err
        : new ApiError(err.message || "Error al reactivar categoría", 500)
    );
  }
};

// Eliminar definitivamente
export const BorrarCategoriaDefinitivaController = async (req, res, next) => {
  try {
    await Borrar(req.params.id);
    res.json({ message: 'Categoría eliminada permanentemente' });
  } catch (err) {
    next(
      err instanceof ApiError
        ? err
        : new ApiError(err.message || "Error al eliminar categoría", 500)
    );
  }
};
