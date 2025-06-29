import {
  Crear,
  ListarProductos,
  ModificarProducto,
  BorrarProducto,
  DesactivarProducto,
  ListarProductosAdmin,
  ReactivarProducto,
  InsertarProductoNuevoConGasto
} from "../services/productos.service.js";
import ApiError from "../middlewares/ApiError.js";

// Crear producto
export const CrearProductoControllers = async (req, res, next) => {
  try {
    const datos = {
      ...req.body,
      insumo_id: parseInt(req.body.insumo_id),
      envase_id: parseInt(req.body.envase_id)
    };

    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const imagen = req.file;
    const creado_por = req.usuario.id

    const producto = await Crear(datos, imagen, creado_por);

    return res.status(201).json({
      statusCode: 201,
      message: "Producto creado correctamente",
      producto,
    });
  } catch (error) {
    console.error("❌ ERROR REAL EN CREAR PRODUCTO:", error); // <--- AGREGAR ESTO
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al crear producto", 400, error.message)
    );
  }
};

// Obtener todos los productos (con paginación, búsqueda y filtro por categoría)
export const ObtenerTodosLosProductos = async (req, res, next) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 10;
    const buscar = req.query.buscar || "";
    const categoria = req.query.categoria_id || null;

    const resultado = await ListarProductos(pagina, limite, buscar, categoria);

    return res.status(200).json({
      statusCode: 200,
      message: "Productos obtenidos correctamente",
      ...resultado,
    });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al obtener productos", 500, error.message)
    );
  }
};

// Actualizar producto
export const ActualizarProductoController = async (req, res, next) => {
  try {
    const id = req.params.id;
    const datos = req.body;
    const imagen = req.file;

    console.log("🛠️ UPDATE PAYLOAD", { id, datos, imagen });

    const producto = await ModificarProducto(id, datos, imagen);

    return res.status(200).json({
      message: "Producto actualizado correctamente",
      producto,
    });
  } catch (error) {
    console.error("❌ ERROR EN ACTUALIZAR PRODUCTO:", error.message);
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al actualizar producto", 400, error.message)
    );
  }
};

// Eliminar producto
export const EliminarProductoControllers = async (req, res, next) => {
  try {
    const id = req.params.id;
    await BorrarProducto(id);

    return res.status(200).json({
      statusCode: 200,
      message: "Producto eliminado correctamente",
    });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al eliminar el producto", 500, error.message)
    );
  }
};

// Desactivar producto
export const DesactivarproductoControllers = async (req, res, next) => {
  try {
    const id = req.params.id;
    await DesactivarProducto(id);

    return res.status(200).json({
      statusCode: 200,
      message: "Producto desactivado para la venta",
    });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al desactivar producto", 500, error.message)
    );
  }
};

// Listado admin
export const ObtenerListadoAdmin = async (req, res, next) => {
  try {
    const productos = await ListarProductosAdmin();
    return res.status(200).json({
      statusCode: 200,
      message: 'Listado completo para administración',
      productos
    });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError('Error al obtener productos', 500, error.message)
    );
  }
};

// Reactivar producto
export const ReactivarProductoController = async (req, res, next) => {
  try {
    const id = req.params.id;
    await ReactivarProducto(id);
    return res.status(200).json({
      statusCode: 200,
      message: 'Producto reactivado correctamente',
    });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError('Error al reactivar producto', 500, error.message)
    );
  }
};

// Crear producto con gasto (varias tablas)
export const CrearProductoConGastoController = async (req, res, next) => {
  try {
    const {
      nombre,
      descripcion,
      tipo_medida,
      stock_minimo,
      ganancia,
      categoria_id,
      marca,
      insumo_id,
      envase_id,
    } = req.body;

    const creado_por = req.usuario?.id;

    if (!creado_por) {
      return next(
        new ApiError('No autorizado: falta usuario', 401)
      );
    }

    const imagen_url = req.file
      ? `/uploads/productos/${req.file.filename}`
      : null;

    const productoId = await InsertarProductoNuevoConGasto(
      nombre,
      descripcion,
      tipo_medida,
      parseFloat(stock_minimo),
      parseFloat(ganancia),
      imagen_url,
      parseInt(categoria_id),
      marca,
      creado_por,
      parseInt(insumo_id),
      parseInt(envase_id)
    );

    return res.status(201).json({
      message: 'Producto creado con gasto registrado y balance actualizado',
      productoId,
    });

  } catch (error) {
    console.error("❌ Error al crear producto con gasto:", error);
    next(
      error instanceof ApiError
        ? error
        : new ApiError('Error al crear producto con gasto', 500, error.message)
    );
  }
};
