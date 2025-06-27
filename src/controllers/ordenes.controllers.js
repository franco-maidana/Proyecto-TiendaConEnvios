import {
  AgregarProductoAlCarrito,
  VerCarritoDelUsuario,
  EditarCantidadProductoEnCarrito,
  QuitarProductoDelCarrito,
  VaciarCarrito,
  ObtenerOrdenPorGrupo
} from "../services/ordenes.service.js";
import ApiError from "../middlewares/ApiError.js";

// ✅ Agrega producto al carrito (usuario autenticado)
export const AgregarProductoAlCarritoController = async (req, res, next) => {
  try {
    const usuario_id = req.usuario.id;
    const { producto_id, cantidad } = req.body;

    if (!producto_id || !cantidad) {
      return next(new ApiError("Faltan campos obligatorios", 400));
    }

    const resultado = await AgregarProductoAlCarrito(
      usuario_id,
      parseInt(producto_id),
      parseFloat(cantidad)
    );

    return res.status(201).json({
      statusCode: 201,
      message: "Producto agregado al carrito",
      resultado,
    });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al agregar producto al carrito", 500, error.message)
    );
  }
};

// ✅ Ver carrito del usuario autenticado
export const ObtenerCarritoDelUsuario = async (req, res, next) => {
  try {
    const usuario_id = req.usuario.id;

    const resultado = await VerCarritoDelUsuario(usuario_id);

    return res.status(200).json({
      statusCode: 200,
      message: "Carrito obtenido correctamente",
      ...resultado,
    });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al obtener el carrito", 500, error.message)
    );
  }
};

// ✅ Modificar cantidad en carrito
export const ModificarProductoEnCarritoController = async (req, res, next) => {
  try {
    const usuario_id = req.usuario.id;
    const { producto_id, cantidad } = req.body;

    if (!producto_id || !cantidad) {
      return next(new ApiError("Faltan datos", 400));
    }

    const resultado = await EditarCantidadProductoEnCarrito(
      usuario_id,
      parseInt(producto_id),
      parseFloat(cantidad)
    );

    return res.status(200).json({
      statusCode: 200,
      message: "Cantidad actualizada correctamente",
      resultado,
    });
  } catch (error) {
    // ------> CAMBIA EL STATUS DE 500 A 400 en este controller!!!
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al actualizar la cantidad", 400, error.message)
        // -----------^^^ SOLO EN ESTE CATCH
    );
  }
};


// ✅ Eliminar producto del carrito
export const EliminarProductoCarritoController = async (req, res, next) => {
  try {
    const usuario_id = req.usuario.id;
    const producto_id = parseInt(req.body.producto_id);

    if (isNaN(producto_id)) {
      return next(new ApiError("ID de producto inválido", 400));
    }

    const resultado = await QuitarProductoDelCarrito(usuario_id, producto_id);

    return res.status(200).json({
      statusCode: 200,
      message: "Producto eliminado del carrito",
      resultado,
    });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al eliminar producto del carrito", 500, error.message)
    );
  }
};

// ✅ Vaciar carrito del usuario autenticado
export const VaciarCarritoController = async (req, res, next) => {
  try {
    const usuario_id = req.usuario.id;

    const resultado = await VaciarCarrito(usuario_id);

    return res.status(200).json({
      statusCode: 200,
      message: "Carrito vaciado correctamente",
      resultado,
    });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al vaciar el carrito", 500, error.message)
    );
  }
};

// ✅ Obtener detalles de una orden por grupo
export const ObtenerOrdenPorGrupoController = async (req, res, next) => {
  try {
    const { grupo_orden } = req.params;
    if (!grupo_orden) return next(new ApiError('Falta grupo_orden', 400));

    const resultado = await ObtenerOrdenPorGrupo(grupo_orden);

    return res.status(200).json({
      statusCode: 200,
      message: 'Orden obtenida con éxito',
      ...resultado
    });

  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError('Error al obtener la orden', 500, error.message)
    );
  }
};
