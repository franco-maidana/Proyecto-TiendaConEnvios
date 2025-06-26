import {
  CrearCarritoService,
  AgregarProductoService,
  ObtenerCarritoService,
  ConfirmarCarritoService,
  CancelarCarritoService,
  EliminarProductoService
} from '../services/ordenLocal.service.js';

// 🧾 Crear carrito vacío = crea una orden_Local
export const CrearCarritoController = async (req, res) => {
  try {
    const id = await CrearCarritoService();
    res.status(201).json({ message: 'Carrito creado', orden_id: id });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear carrito', error: error.message });
  }
};
// ➕ Agregar producto al carrito == agrega un producto en la orden_local
export const AgregarProductoController = async (req, res) => {
  try {
    const { ordenId } = req.params;
    const { producto_id, cantidad } = req.body;

    await AgregarProductoService({ ordenId, productoId: producto_id, cantidad });

    res.status(200).json({ message: 'Producto agregado al carrito' });
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar producto', error: error.message });
  }
};
// 🔍 Ver carrito = muestra la orden con los productos adentro y el total a pagar 
export const ObtenerCarritoController = async (req, res) => {
  try {
    const { ordenId } = req.params;
    const result = await ObtenerCarritoService(ordenId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener carrito', error: error.message });
  }
};
// ✅ Confirmar carrito == confirma el pago 
export const ConfirmarCarritoController = async (req, res) => {
  try {
    const { ordenId } = req.params;
    const result = await ConfirmarCarritoService(ordenId);
    res.status(200).json({
      message: 'Venta confirmada exitosamente',
      ...result
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al confirmar venta', error: error.message });
  }
};
// ❌ Cancelar carrito == elimina la ordenLocal
export const CancelarCarritoController = async (req, res) => {
  try {
    const { ordenId } = req.params;
    await CancelarCarritoService(ordenId);
    res.status(200).json({ message: 'Carrito cancelado y eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al cancelar carrito', error: error.message });
  }
};
// Elimina el producto del carrito = Elimina el producto dentro de la orden 
export const EliminarProductoDelCarritoController = async (req, res) => {
  try {
    const { ordenId, productoId } = req.params;
    await EliminarProductoService({ ordenId, productoId });
    res.status(200).json({ message: 'Producto eliminado del carrito' });
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar producto del carrito',
      error: error.message,
    });
  }
};