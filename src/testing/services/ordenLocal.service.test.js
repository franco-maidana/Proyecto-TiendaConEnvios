import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Conexion from '../../config/db.js';
import {
  CrearCarritoService,
  AgregarProductoService,
  ObtenerCarritoService,
  ConfirmarCarritoService,
  CancelarCarritoService,
  EliminarProductoService
} from '../../services/ordenLocal.service.js';

let ordenId = null;

// 👉 Identificadores de test
const productoId = 999;
const categoriaId = 999;
const insumoId = 999;
const envaseId = 999;
const cantidad = 2;

beforeAll(async () => {
  // 🧹 Eliminar referencias cruzadas antes de insertar
  await Conexion.query(`DELETE FROM productos_vendidos WHERE producto_id = ?`, [productoId]);
  await Conexion.query(`DELETE FROM detalle_orden_local WHERE producto_id = ?`, [productoId]);
  await Conexion.query(`DELETE FROM ordenes_locales WHERE id = ?`, [ordenId]);
  await Conexion.query(`DELETE FROM productos_limpieza WHERE id = ?`, [productoId]);
  await Conexion.query(`DELETE FROM categorias WHERE id = ?`, [categoriaId]);
  await Conexion.query(`DELETE FROM insumos_base WHERE id = ?`, [insumoId]);
  await Conexion.query(`DELETE FROM envases WHERE id = ?`, [envaseId]);

  // ➕ Insertar entidades necesarias (categoría, insumo, envase, producto)
  await Conexion.query(`
    INSERT IGNORE INTO categorias (id, nombre)
    VALUES (?, 'Categoría Test')
  `, [categoriaId]);

  await Conexion.query(`
    INSERT IGNORE INTO insumos_base (id, nombre, stock_litros, precio_litro, tipo)
    VALUES (?, 'Insumo Test', 100, 20, 'liquido')
  `, [insumoId]);

  await Conexion.query(`
    INSERT IGNORE INTO envases (id, tipo, capacidad_litros, stock, precio_envase)
    VALUES (?, 'Botella Test', 1.5, 10, 5)
  `, [envaseId]);

  await Conexion.query(`
    INSERT INTO productos_limpieza
    (id, nombre, descripcion, tipo_medida, precio_lista, ganancia,
     categoria_id, marca, activo, insumo_id, envase_id)
    VALUES (?, 'Producto Test', 'desc', 'litros', 100, 0.5,
     ?, 'Genérica', 1, ?, ?)
  `, [productoId, categoriaId, insumoId, envaseId]);
});

afterAll(async () => {
  await Conexion.query(`DELETE FROM productos_vendidos WHERE producto_id = ?`, [productoId]);
  await Conexion.query(`DELETE FROM detalle_orden_local WHERE producto_id = ?`, [productoId]);
  await Conexion.query(`DELETE FROM ordenes_locales WHERE id = ?`, [ordenId]);
  await Conexion.query(`DELETE FROM productos_limpieza WHERE id = ?`, [productoId]);
  await Conexion.query(`DELETE FROM categorias WHERE id = ?`, [categoriaId]);
  await Conexion.query(`DELETE FROM envases WHERE id = ?`, [envaseId]);
  await Conexion.query(`DELETE FROM insumos_base WHERE id = ?`, [insumoId]);
});


describe('OrdenesLocalesService 🧾', () => {
  it('debería crear un carrito vacío', async () => {
    ordenId = await CrearCarritoService();
    expect(typeof ordenId).toBe('number');
  });

  it('debería agregar un producto al carrito', async () => {
    await AgregarProductoService({ ordenId, productoId, cantidad });
    const { productos, total } = await ObtenerCarritoService(ordenId);
    expect(productos).toHaveLength(1);
    expect(total).toBeGreaterThan(0);
  });

  it('debería eliminar un producto del carrito', async () => {
    await EliminarProductoService({ ordenId, productoId });
    const { productos } = await ObtenerCarritoService(ordenId);
    expect(productos).toHaveLength(0);
  });

  it('debería cancelar el carrito', async () => {
    ordenId = await CrearCarritoService();
    await AgregarProductoService({ ordenId, productoId, cantidad });
    await CancelarCarritoService(ordenId);
    const [check] = await Conexion.query(`SELECT * FROM ordenes_locales WHERE id = ?`, [ordenId]);
    expect(check.length).toBe(0);
  });

  it('debería confirmar el carrito y registrar ventas + egresos', async () => {
    ordenId = await CrearCarritoService();
    await AgregarProductoService({ ordenId, productoId, cantidad });
    const resumen = await ConfirmarCarritoService(ordenId);
    expect(resumen).toHaveProperty('total');
    expect(resumen).toHaveProperty('cantidad_productos');
  });
});
