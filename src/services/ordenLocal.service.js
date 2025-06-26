import {
  CrearOrdenLocal,
  AgregarProductoAOrden,
  ObtenerDetalleOrden,
  ConfirmarOrden,
  EliminarOrdenLocal,
  ActualizarTotalOrden,
  ObtenerGrupoOrden,
  LimpiarDetalleCarrito,
  EliminarProductoDeOrden
} from '../models/ordenLocal.model.js';

import { ObtenerProductoPorId, RegistrarProductoVendido } from '../models/productos.model.js';
import { RestarInsumosDeProducto } from '../models/insumos.model.js';
import { RestarEnvasesDeProducto } from '../models/envases.model.js';
import {RegistrarGananciaAcumulada} from '../models/ganancias.model.js'
import {ActualizarBalance} from '../models/finanzas.models.js'
import {GenerarFacturaLocal} from '../utils/generarFacturaLocal.js'
import { ObtenerInsumoPorId } from '../models/insumos.model.js';
import { ObtenerEnvasePorId } from '../models/envases.model.js';

// 🧾 Crear carrito vacío = crea una orden_Local
export const CrearCarritoService = async () => {
  const ordenId = await CrearOrdenLocal();
  return ordenId;
};
// ➕ Agregar producto al carrito == agrega un producto en la orden_local
export const AgregarProductoService = async ({ ordenId, productoId, cantidad }) => {
  const producto = await ObtenerProductoPorId(productoId);
  if (!producto) throw new Error(`Producto con ID ${productoId} no existe`);

  // === VERIFICACIÓN DE STOCK ANTES DE AGREGAR ===
  if (producto.insumo_id) {
    const insumo = await ObtenerInsumoPorId(producto.insumo_id);

    // Si es líquido (requiere envase)
    if (insumo.tipo === "liquido") {
      const envase = await ObtenerEnvasePorId(producto.envase_id);
      const litrosPorUnidad = parseFloat(envase.capacidad_litros);
      const litrosNecesarios = litrosPorUnidad * cantidad;

      if (insumo.stock_litros < litrosNecesarios) {
        throw new Error(
          `Stock insuficiente de insumo líquido para ${producto.nombre}. Solo hay ${insumo.stock_litros} litros disponibles.`
        );
      }
      if (envase.stock < cantidad) {
        throw new Error(
          `Stock insuficiente de envases para ${producto.nombre}. Solo hay ${envase.stock} unidades disponibles.`
        );
      }
    }

    // Si es seco
    if (insumo.tipo === "seco") {
      if (insumo.stock_unidades < cantidad) {
        throw new Error(
          `Stock insuficiente del producto seco: ${producto.nombre}. Solo hay ${insumo.stock_unidades} unidades disponibles.`
        );
      }
    }
  }
  // === FIN VERIFICACIÓN DE STOCK ===

  await AgregarProductoAOrden(ordenId, productoId, cantidad);
};

// 🔍 Ver carrito = muestra la orden con los productos adentro y el total a pagar 
export const ObtenerCarritoService = async (ordenId) => {
  const productos = await ObtenerDetalleOrden(ordenId);
  const total = productos.reduce((acc, item) => acc + parseFloat(item.subtotal), 0);
  return { productos, total };
};
// ✅ Confirmar carrito == confirma el pago 
export const ConfirmarCarritoService = async (ordenId, usuario = {}) => {
  const productos = await ObtenerDetalleOrden(ordenId);
  if (productos.length === 0) throw new Error('El carrito está vacío');

  const grupoOrden = await ObtenerGrupoOrden(ordenId);

  // ==== VERIFICACIÓN DE STOCK PREVIA (NO DESCUESTA SI FALTA) ====
  for (const item of productos) {
    const producto = await ObtenerProductoPorId(item.producto_id);

    // Si tiene insumo asociado
    if (producto.insumo_id) {
      const insumo = await ObtenerInsumoPorId(producto.insumo_id);

      // Si es líquido (requiere envase)
      if (insumo.tipo === "liquido") {
        const envase = await ObtenerEnvasePorId(producto.envase_id);
        const litrosPorUnidad = parseFloat(envase.capacidad_litros);
        const cantidadVendida = parseFloat(item.cantidad);
        const litrosNecesarios = litrosPorUnidad * cantidadVendida;

        if (insumo.stock_litros < litrosNecesarios) {
          throw new Error(
            `Stock insuficiente de insumo líquido para ${producto.nombre}. Solo hay ${insumo.stock_litros} litros disponibles.`
          );
        }
        if (envase.stock < cantidadVendida) {
          throw new Error(
            `Stock insuficiente de envases para ${producto.nombre}. Solo hay ${envase.stock} unidades disponibles.`
          );
        }
      }

      // Si es seco
      if (insumo.tipo === "seco") {
        const cantidadUnidades = parseFloat(item.cantidad);
        if (insumo.stock_unidades < cantidadUnidades) {
          throw new Error(
            `Stock insuficiente del producto seco: ${producto.nombre}. Solo hay ${insumo.stock_unidades} unidades disponibles.`
          );
        }
      }
    }
  }
  // ==== FIN VERIFICACIÓN DE STOCK ====

  // Si llegó hasta acá, hay stock suficiente de todo

  for (const item of productos) {
    await RestarInsumosDeProducto(item.producto_id, item.cantidad);
    await RestarEnvasesDeProducto(item.producto_id, item.cantidad);
    await RegistrarProductoVendido(
      item.producto_id,
      item.cantidad,
      item.precio_unitario,
      grupoOrden
    );
  }

  const total = productos.reduce((acc, item) => acc + parseFloat(item.subtotal), 0);

  // Esto hace UPDATE a la orden que ya existe
  await ConfirmarOrden(total, grupoOrden);

  // === 👉 Generar factura/remito PDF ANTES de limpiar el carrito
  const factura = await GenerarFacturaLocal({ ordenId, usuario });

  // ✅ Limpiar el carrito después de generar la factura
  await LimpiarDetalleCarrito(ordenId);

  await RegistrarGananciaAcumulada({
    total_productos: total,
    total_mantenimiento: 0,
    total_envio: 0
  });

  await ActualizarBalance();

  // Devuelve el dato de la factura (o remito) generada
  return {
    total,
    cantidad_productos: productos.length,
    factura, // Puedes usar factura.numeroFactura y factura.rutaFactura en el frontend
  };
};

// ❌ Cancelar carrito == elimina la ordenLocal
export const CancelarCarritoService = async (ordenId) => {
  await EliminarOrdenLocal(ordenId);
};
// Elimina el producto del carrito = Elimina el producto dentro de la orden 
export const EliminarProductoService = async ({ ordenId, productoId }) => {
  await EliminarProductoDeOrden(ordenId, productoId);
  await ActualizarTotalOrden(ordenId); // 🧮 recalcular total
};