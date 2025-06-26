import { v4 as uuidv4 } from "uuid";
import {
  ObtenerProductoPorId,
  ObtenerCarritoPendientePorUsuario,
  MarcarOrdenesComoPagadas,
  ActualizarEnvioYMantenimiento,
  InsertarOrdenSimplificada,
  ModificarCantidadProductoCarritoPorProducto,
  EliminarProductoDelCarrito,
  VaciarCarritoUsuario,
  BuscarProductoEnCarrito,
  ActualizarCantidadExistente,
  AsignarGrupoOrden,
  InsertarOrdenResumen,
  InsertarProductoVendido,
  ObtenerOrdenPorGrupo as ObtenerOrdenPorGrupoModel,
} from "../models/ordenes.model.js";
import { ActualizarBalance,  } from "../models/finanzas.models.js";
import {
  DescontarEnvase,
  ObtenerEnvasePorId,
} from "../models/envases.model.js";
import {
  ObtenerInsumoPorId,
  DescontarLitros,
} from "../models/insumos.model.js";
import { DescontarStockUnidades } from "../models/insumos.model.js";
import {RegistrarGananciaAcumulada} from '../models/ganancias.model.js'
import {GenerarYEnviarFactura} from '../utils/generarFacturaCompleta.js'

export const ConfirmarOrdenUsuario = async (usuario_id) => {
  const carrito = await ObtenerCarritoPendientePorUsuario(usuario_id);
  if (carrito.length === 0) throw new Error("No hay productos pendientes");

  const grupo_orden = uuidv4();
  const subtotalTotal = carrito.reduce(
    (acc, item) => acc + parseFloat(item.subtotal),
    0
  );
  const envio = subtotalTotal >= 20000 ? 0 : 800;
  const mantenimiento = 200;
  const totalFinal = subtotalTotal + envio + mantenimiento;

  for (const item of carrito) {
    await AsignarGrupoOrden(item.id, grupo_orden);
  }

  await ActualizarEnvioYMantenimiento(carrito[0].id, envio, mantenimiento);
  await MarcarOrdenesComoPagadas(usuario_id);

  for (const item of carrito) {
    const producto = await ObtenerProductoPorId(item.producto_id);

    if (producto.insumo_id) {
      const insumo = await ObtenerInsumoPorId(producto.insumo_id);
      if (!insumo) throw new Error(`Insumo no encontrado para ${producto.nombre}`);

      if (insumo.tipo === "liquido") {
        const envase = await ObtenerEnvasePorId(producto.envase_id);
        const litrosPorUnidad = parseFloat(envase.capacidad_litros);
        const cantidadVendida = parseFloat(item.cantidad);
        const litrosNecesarios = litrosPorUnidad * cantidadVendida;

        if (insumo.stock_litros < litrosNecesarios)
          throw new Error(`Stock insuficiente de insumo líquido para ${producto.nombre}`);
        if (envase.stock < cantidadVendida)
          throw new Error(`Stock insuficiente de envases para ${producto.nombre}`);

        await DescontarLitros(insumo.id, litrosNecesarios);
        await DescontarEnvase(envase.id, cantidadVendida);
      }

      if (insumo.tipo === "seco") {
        const cantidadUnidades = parseFloat(item.cantidad);
        if (insumo.stock_unidades < cantidadUnidades)
          throw new Error(`Stock insuficiente del producto seco: ${producto.nombre}`);
        await DescontarStockUnidades(insumo.id, cantidadUnidades);
      }
    }

    await InsertarProductoVendido(
      grupo_orden,
      item.producto_id,
      item.cantidad,
      item.precio_unitario,
      item.subtotal
    );
  }

  await InsertarOrdenResumen(
    grupo_orden,
    usuario_id,
    carrito.length,
    subtotalTotal,
    mantenimiento,
    envio,
    totalFinal,
    "pagado"
  );

  // ✅ Ganancia acumulada correctamente desde resumen de orden
  const total_productos = subtotalTotal;
  const total_mantenimiento = mantenimiento;
  const total_envio = envio;

  console.log("🚀 [CONFIRMAR ORDEN] Ejecutando ganancia acumulada desde webhook");

  await RegistrarGananciaAcumulada({
    total_productos,
    total_mantenimiento,
    total_envio,
  });

  await ActualizarBalance();

  await GenerarYEnviarFactura(usuario_id, grupo_orden, totalFinal)

  return {
    grupo_orden,
    totalProductos: subtotalTotal,
    mantenimiento,
    envio,
    totalFinal,
  };
};

export const AgregarProductoAlCarrito = async (
  usuario_id,
  producto_id,
  cantidad
) => {
  const producto = await ObtenerProductoPorId(producto_id);
  if (!producto) throw new Error("Producto no encontrado");

  // Validación para productos con insumo y envase (líquidos)
  if (producto.insumo_id && producto.envase_id) {
    const insumo = await ObtenerInsumoPorId(producto.insumo_id);
    const envase = await ObtenerEnvasePorId(producto.envase_id);

    const litrosPorUnidad = parseFloat(envase.capacidad_litros);
    const litrosNecesarios = litrosPorUnidad * cantidad;

    if (parseFloat(insumo.stock_litros) < litrosNecesarios) {
      throw new Error(
        `Stock insuficiente de insumo líquido. Solo hay ${insumo.stock_litros} litros disponibles.`
      );
    }

    if (envase.stock < cantidad) {
      throw new Error(
        `Stock insuficiente de envases. Solo hay ${envase.stock} unidades disponibles.`
      );
    }
  }

  // Validación para productos secos (sin envase)
  if (producto.insumo_id && !producto.envase_id) {
    const insumo = await ObtenerInsumoPorId(producto.insumo_id);

    if (insumo.tipo === "seco") {
      const cantidadDisponible = parseInt(insumo.stock_unidades);

      if (cantidad > cantidadDisponible) {
        throw new Error(
          `Stock insuficiente del producto seco. Solo hay ${cantidadDisponible} unidades disponibles.`
        );
      }
    }
  }

  const existente = await BuscarProductoEnCarrito(usuario_id, producto_id);

  if (existente) {
    const nuevaCantidad = parseFloat(existente.cantidad) + cantidad;

    if (producto.insumo_id && producto.envase_id) {
      const insumo = await ObtenerInsumoPorId(producto.insumo_id);
      const envase = await ObtenerEnvasePorId(producto.envase_id);

      const litrosPorUnidad = parseFloat(envase.capacidad_litros);
      const litrosNecesarios = litrosPorUnidad * nuevaCantidad;

      if (parseFloat(insumo.stock_litros) < litrosNecesarios) {
        throw new Error(
          `No hay suficiente insumo para aumentar la cantidad. Disponible: ${insumo.stock_litros} litros.`
        );
      }

      if (envase.stock < nuevaCantidad) {
        throw new Error(
          `No hay suficientes envases. Disponible: ${envase.stock} unidades.`
        );
      }
    }

    if (producto.insumo_id && !producto.envase_id) {
      const insumo = await ObtenerInsumoPorId(producto.insumo_id);

      if (insumo.tipo === "seco") {
        const cantidadDisponible = parseInt(insumo.stock_unidades);
        if (nuevaCantidad > cantidadDisponible) {
          throw new Error(
            `No hay suficiente stock seco para esa cantidad. Disponible: ${cantidadDisponible}`
          );
        }
      }
    }

    await ActualizarCantidadExistente(existente.id, nuevaCantidad);

    return {
      producto: producto.nombre,
      cantidad: nuevaCantidad,
      mensaje: "Cantidad actualizada en el carrito",
    };
  } else {
    const total = producto.precio_unitario * cantidad;
    await InsertarOrdenSimplificada(
      usuario_id,
      producto_id,
      cantidad,
      producto.precio_unitario,
      total
    );

    return {
      producto: producto.nombre,
      cantidad,
      total_unitario: producto.precio_unitario,
      mensaje: "Producto agregado al carrito",
    };
  }
};

export const VerCarritoDelUsuario = async (usuario_id) => {
  const carrito = await ObtenerCarritoPendientePorUsuario(usuario_id);
  if (carrito.length === 0) {
    return {
      productos: [],
      subtotal: 0,
      envio: 0,
      mantenimiento: 0,
      total: 0,
    };
  }

  const subtotal = carrito.reduce(
    (acc, item) => acc + parseFloat(item.subtotal),
    0
  );
  const envio = subtotal >= 15000 ? 0 : 800;
  const mantenimiento = 200;
  const total = subtotal + envio + mantenimiento;

  return {
    productos: carrito,
    subtotal,
    envio,
    mantenimiento,
    total,
  };
};

export const EditarCantidadProductoEnCarrito = async (
  usuario_id,
  producto_id,
  nuevaCantidad
) => {
  if (!nuevaCantidad || nuevaCantidad <= 0) {
    throw new Error("Cantidad inválida");
  }

  const producto = await ObtenerProductoPorId(producto_id);

  if (!producto) {
    throw new Error("Producto no encontrado");
  }

  if (nuevaCantidad > producto.stock) {
    throw new Error("Stock insuficiente para la cantidad solicitada");
  }

  await ModificarCantidadProductoCarritoPorProducto(
    usuario_id,
    producto_id,
    nuevaCantidad
  );

  return {
    usuario_id,
    producto_id,
    cantidad_actualizada: nuevaCantidad,
  };
};

export const QuitarProductoDelCarrito = async (usuario_id, producto_id) => {
  await EliminarProductoDelCarrito(usuario_id, producto_id);
  return { usuario_id, producto_id };
};

export const VaciarCarrito = async (usuario_id) => {
  await VaciarCarritoUsuario(usuario_id);
  return { usuario_id };
};

export const ObtenerOrdenPorGrupo = async (grupo_orden) => {
  const productos = await ObtenerOrdenPorGrupoModel(grupo_orden);

  if (!productos.length) {
    throw new Error("Orden no encontrada");
  }

  const totales = {
    mantenimiento: productos[0].mantenimiento,
    envio: productos[0].envio,
    subtotal: productos.reduce((acc, i) => acc + parseFloat(i.subtotal), 0),
    total: productos.reduce((acc, i) => acc + parseFloat(i.total), 0),
  };

  return {
    grupo_orden,
    productos,
    totales,
  };
};
