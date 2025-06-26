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

export const CrearProductoControllers = async (req, res) => {
  try {
    const datos = {
      ...req.body,
      insumo_id: parseInt(req.body.insumo_id),
      envase_id: parseInt(req.body.envase_id)
    };

    const imagen = req.file;
    const creado_por = 6;

    const producto = await Crear(datos, imagen, creado_por);

    return res.json({
      statusCode: 201,
      message: "Producto creado correctamente",
      producto,
    });
  } catch (error) {
    return res.json({
      statusCode: 400,
      message: error.message,
    });
  }
};

export const ObtenerTodosLosProductos = async (req, res) => {
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
    return res.status(500).json({
      statusCode: 500,
      message: "Error al obtener productos",
      error: error.message,
    });
  }
};

export const ActualizarProductoController = async (req, res) => {
  try {
    const id = req.params.id;
    const datos = req.body;
    const imagen = req.file;

    console.log("🛠️ UPDATE PAYLOAD", { id, datos, imagen }); // 👈 Debug

    const producto = await ModificarProducto(id, datos, imagen);

    return res.status(200).json({
      message: "Producto actualizado correctamente",
      producto,
    });
  } catch (error) {
    console.error("❌ ERROR EN ACTUALIZAR PRODUCTO:", error.message); // 👈 Más log
    return res.status(400).json({
      message: "Error al actualizar producto",
      error: error.message,
    });
  }
};


export const EliminarProductoControllers = async (req, res) => {
  try {
    const id = req.params.id;
    const resultado = await BorrarProducto(id);

    return res.json({
      statusCode: 200,
      message: "Producto eliminado correctamente",
    });
  } catch (error) {
    return res.json({
      statusCode: 500,
      message: "Error al eliminar el producto",
      error: error.message,
    });
  }
};

export const DesactivarproductoControllers = async (req, res) => {
  try {
    const id = req.params.id;
    const resultado = await DesactivarProducto(id);

    return res.json({
      statusCode: 200,
      message: "Producto desactivado para la venta",
    });
  } catch (error) {
    return res.json({
      statusCode: 500,
      message: "Error al desactivar producto",
      error: error.message,
    });
  }
};

export const ObtenerListadoAdmin = async (req, res) => {
  try {
    const productos = await ListarProductosAdmin();
    return res.json({
      statusCode: 200,
      message: 'Listado completo para administración',
      productos
    });
  } catch (error) {
    return res.json({
      statusCode: 500,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
};

export const ReactivarProductoController = async (req, res) => {
  try {
    const id = req.params.id;
    const resultado = await ReactivarProducto(id);
    return res.json({
      statusCode: 200,
      message: 'Producto reactivado correctamente',
    });
  } catch (error) {
    return res.json({
      statusCode: 500,
      message: 'Error al reactivar producto',
      error: error.message
    });
  }
};


// manejo de varias tablas
export const CrearProductoConGastoController = async (req, res) => {
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

    const creado_por = req.usuario?.id; // 🔒 Viene del JWT middleware

    if (!creado_por) {
      return res.status(401).json({
        statusCode: 401,
        message: 'No autorizado: falta usuario',
      });
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

    // ✅ Usamos res.status(201) para que el test lo reciba correctamente
    return res.status(201).json({
      message: 'Producto creado con gasto registrado y balance actualizado',
      productoId, // o podés simplificar con id: productoId.id
    });

  } catch (error) {
    console.error("❌ Error al crear producto con gasto:", error);
    return res.status(500).json({
      statusCode: 500,
      message: 'Error al crear producto con gasto',
      error: error.message,
    });
  }
};


