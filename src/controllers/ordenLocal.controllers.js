import {
  CrearCarritoService,
  AgregarProductoService,
  ObtenerCarritoService,
  ConfirmarCarritoService,
  CancelarCarritoService,
  EliminarProductoService
} from '../services/ordenLocal.service.js';
import ApiError from '../middlewares/ApiError.js';

// 🧾 Crear carrito vacío = crea una orden_Local
export const CrearCarritoController = async (req, res, next) => {
  try {
    const id = await CrearCarritoService();
    res.status(201).json({ message: 'Carrito creado', orden_id: id });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError('Error al crear carrito', 500, error.message)
    );
  }
};

// ➕ Agregar producto al carrito
export const AgregarProductoController = async (req, res, next) => {
  try {
    const { ordenId } = req.params;
    const { producto_id, cantidad } = req.body;

    await AgregarProductoService({ ordenId, productoId: producto_id, cantidad });

    res.status(200).json({ message: 'Producto agregado al carrito' });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError('Error al agregar producto', 500, error.message)
    );
  }
};

// 🔍 Ver carrito
export const ObtenerCarritoController = async (req, res, next) => {
  try {
    const { ordenId } = req.params;
    const result = await ObtenerCarritoService(ordenId);
    res.status(200).json(result);
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError('Error al obtener carrito', 500, error.message)
    );
  }
};

// ✅ Confirmar carrito
export const ConfirmarCarritoController = async (req, res, next) => {
  try {
    const { ordenId } = req.params;
    const result = await ConfirmarCarritoService(ordenId);
    res.status(200).json({
      message: 'Venta confirmada exitosamente',
      ...result
    });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError('Error al confirmar venta', 500, error.message)
    );
  }
};

// ❌ Cancelar carrito
export const CancelarCarritoController = async (req, res, next) => {
  try {
    const { ordenId } = req.params;
    await CancelarCarritoService(ordenId);
    res.status(200).json({ message: 'Carrito cancelado y eliminado' });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError('Error al cancelar carrito', 500, error.message)
    );
  }
};

// 🗑️ Eliminar producto del carrito
export const EliminarProductoDelCarritoController = async (req, res, next) => {
  try {
    const { ordenId, productoId } = req.params;
    await EliminarProductoService({ ordenId, productoId });
    res.status(200).json({ message: 'Producto eliminado del carrito' });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError('Error al eliminar producto del carrito', 500, error.message)
    );
  }
};
