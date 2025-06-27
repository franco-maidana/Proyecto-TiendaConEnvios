import {
  CrearEnvaseConGasto,
  CrearInsumoConGasto,
  ListarInsumos,
  ListarEnvases,
  ModificarInsumo,
  ModificarEnvase,
  BorrarEnvase,
  BorrarInsumo,
} from "../services/almacen.service.js";
import ApiError from "../middlewares/ApiError.js";

// Crear insumo
export const CrearInsumoController = async (req, res, next) => {
  try {
    const {
      nombre,
      tipo, // 'liquido' o 'seco'
      stock_litros = 0,
      stock_unidades = 0,
      precio_litro = 0,
      precio_seco = 0,
    } = req.body;

    const insumo_id = await CrearInsumoConGasto({
      nombre,
      tipo,
      stock_litros: parseFloat(stock_litros),
      stock_unidades: parseInt(stock_unidades),
      precio_litro: parseFloat(precio_litro),
      precio_seco: parseFloat(precio_seco),
    });

    return res.status(201).json({
      statusCode: 201,
      message: "Insumo creado correctamente",
      insumo_id,
    });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al crear insumo", 500, error.message)
    );
  }
};

// Crear envase
export const CrearEnvaseController = async (req, res, next) => {
  try {
    const { tipo, capacidad_litros, stock, precio_envase } = req.body;
    const id = await CrearEnvaseConGasto(
      tipo,
      parseFloat(capacidad_litros),
      parseInt(stock),
      parseFloat(precio_envase)
    );

    return res.status(201).json({
      statusCode: 201,
      message: "Envase creado correctamente",
      envase_id: id,
    });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al crear envase", 500, error.message)
    );
  }
};

// Listar insumos
export const VerInsumosController = async (req, res, next) => {
  try {
    const data = await ListarInsumos();
    res.json({ statusCode: 200, data });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al listar insumos", 500, error.message)
    );
  }
};

// Listar envases
export const VerEnvasesController = async (req, res, next) => {
  try {
    const data = await ListarEnvases();
    res.json({ statusCode: 200, data });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al listar envases", 500, error.message)
    );
  }
};

// Editar insumo
export const EditarInsumoController = async (req, res, next) => {
  try {
    await ModificarInsumo(req.params.id, req.body);
    res.json({ statusCode: 200, message: 'Insumo modificado correctamente' });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al modificar insumo", 500, error.message)
    );
  }
};

// Editar envase
export const EditarEnvaseController = async (req, res, next) => {
  try {
    await ModificarEnvase(req.params.id, req.body);
    res.json({ statusCode: 200, message: 'Envase modificado correctamente' });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al modificar envase", 500, error.message)
    );
  }
};

// Eliminar insumo
export const EliminarInsumoController = async (req, res, next) => {
  try {
    await BorrarInsumo(req.params.id);
    res.json({ statusCode: 200, message: 'Insumo eliminado' });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al eliminar insumo", 500, error.message)
    );
  }
};

// Eliminar envase
export const EliminarEnvaseController = async (req, res, next) => {
  try {
    await BorrarEnvase(req.params.id);
    res.json({ statusCode: 200, message: 'Envase eliminado' });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al eliminar envase", 500, error.message)
    );
  }
};
