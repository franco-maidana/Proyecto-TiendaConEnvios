import mercadoPago from "../config/mercadoPago.js";
import {
  ObtenerCarritoPendientePorUsuario,
  ObtenerProductoPorId,
} from "../models/ordenes.model.js";

export const CrearPreferenciaDesdeCarrito = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;

    const carrito = await ObtenerCarritoPendientePorUsuario(usuario_id);

    if (!carrito || carrito.length === 0) {
      return res.status(400).json({ message: "No hay productos en el carrito" });
    }

    const orden_id = carrito[0].id;

    let subtotalProductos = 0;
    for (const item of carrito) {
      const producto = await ObtenerProductoPorId(item.producto_id);
      subtotalProductos += parseFloat(item.precio_unitario) * parseFloat(item.cantidad);
    }

    const items = [
      {
        title: "Subtotal productos",
        quantity: 1,
        unit_price: parseFloat(subtotalProductos.toFixed(2)),
        currency_id: "ARS",
      },
      {
        title: "Cargo por mantenimiento de plataforma",
        quantity: 1,
        unit_price: 200,
        currency_id: "ARS",
      },
    ];

    const totalCarrito = carrito.reduce((acc, i) => acc + Number(i.subtotal), 0);

    if (totalCarrito < 20000) {
      items.push({
        title: "Costo de envío",
        quantity: 1,
        unit_price: 800,
        currency_id: "ARS",
      });
    }

    const preferencia = {
      items,
      back_urls: {
        success: "https://www.google.com",
        failure: "https://www.google.com",
        pending: "https://www.google.com",
      },
      auto_return: "approved",
      metadata: {
        usuario_id,
        orden_id,
      },
    };

    const respuesta = await mercadoPago.createPreference(preferencia);

    console.log('📦 Preferencia generada:', JSON.stringify(preferencia, null, 2));

    return res.status(200).json({
      statusCode: 200,
      message: "Preferencia creada con éxito",
      init_point: respuesta.body.init_point,
    });

  } catch (error) {
    console.error("Error al crear preferencia:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Error al crear preferencia",
      error: error.message,
    });
  }
};
