import {
  ObtenerCarritoPendientePorUsuario,
  AsignarGrupoOrden,
  ActualizarEnvioYMantenimiento,
  MarcarOrdenesComoPagadas,
  DescontarStock,
  InsertarProductoVendido,
  InsertarOrdenResumen,
} from '../models/ordenes.model.js';

import { ActualizarBalance } from '../models/finanzas.models.js';
import { RegistrarGananciaAcumulada } from '../models/ganancias.model.js';
import { v4 as uuidv4 } from 'uuid';

export const DebugConfirmarOrden = async (usuario_id) => {
  try {
    console.log('📦 Obteniendo carrito...');
    const carrito = await ObtenerCarritoPendientePorUsuario(usuario_id);
    if (!carrito.length) throw new Error('Carrito vacío');

    const grupo_orden = uuidv4();

    const subtotal = carrito.reduce((acc, item) => acc + parseFloat(item.subtotal), 0);
    const envio = subtotal >= 20000 ? 0 : 800;
    const mantenimiento = 200;
    const total = subtotal + envio + mantenimiento;

    for (const item of carrito) {
      await AsignarGrupoOrden(item.id, grupo_orden);
    }

    await ActualizarEnvioYMantenimiento(carrito[0].id, envio, mantenimiento);
    await MarcarOrdenesComoPagadas(usuario_id);

    for (const item of carrito) {
      console.log(`🧾 Descontando stock de producto ${item.producto_id} - Cantidad: ${item.cantidad}`);
      await DescontarStock(item.producto_id, item.cantidad);

      console.log('📤 Registrando producto vendido...');
      await InsertarProductoVendido(
        grupo_orden,
        item.producto_id,
        item.cantidad,
        item.precio_unitario,
        item.subtotal
      );
    }

    console.log('📚 Insertando orden resumen...');
    await InsertarOrdenResumen(
      grupo_orden,
      usuario_id,
      carrito.length,
      subtotal,
      mantenimiento,
      envio,
      total,
      'pagado'
    );

    console.log('💰 Registrando ganancia acumulada...');
    await RegistrarGananciaAcumulada({
      total_productos: subtotal,
      total_mantenimiento: mantenimiento,
      total_envio: envio,
    });

    console.log('📈 Actualizando balance...');
    await ActualizarBalance();

    return {
      grupo_orden,
      mensaje: '🟢 Orden confirmada exitosamente',
    };
  } catch (error) {
    console.error('❌ Falla en DebugConfirmarOrden:', error.message);
    throw error;
  }
};
