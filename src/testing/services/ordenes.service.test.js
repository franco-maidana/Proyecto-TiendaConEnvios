import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import Conexion from '../../config/db.js';
import {
  InsertarOrdenSimplificada,
  ModificarCantidadProductoCarritoPorProducto,
  EliminarProductoDelCarrito,
  ObtenerCarritoPendientePorUsuario,
} from '../../models/ordenes.model.js';

// IDs fijos de prueba
const usuario_id = 9999;
const producto_id = 8888;
const categoria_id = 5555;

async function limpiarTodo() {
  // Limpiar tablas hijas primero
  await Conexion.query(`DELETE FROM ordenes_simplificadas WHERE usuario_id = ? OR producto_id = ?`, [usuario_id, producto_id]);
  await Conexion.query(`DELETE FROM valoraciones WHERE productos_id = ?`, [producto_id]);
  // Ahora padres
  await Conexion.query(`DELETE FROM productos_limpieza WHERE id = ?`, [producto_id]);
  await Conexion.query(`DELETE FROM categorias WHERE id = ?`, [categoria_id]);
  await Conexion.query(`DELETE FROM usuarios WHERE id = ?`, [usuario_id]);
}

describe('OrdenesService 🛒', () => {
  beforeAll(async () => {
    await limpiarTodo();

    // Usuario dummy
    await Conexion.query(`
      INSERT IGNORE INTO usuarios (id, nombre, email, password)
      VALUES (?, 'Test User', 'testuser@example.com', 'testpass')
    `, [usuario_id]);

    // Categoría dummy (algunos modelos requieren categoría existente)
    await Conexion.query(`
      INSERT IGNORE INTO categorias (id, nombre)
      VALUES (?, 'TestCat')
    `, [categoria_id]);

    // Producto dummy (¡con todos los campos necesarios!)
    await Conexion.query(`
      INSERT IGNORE INTO productos_limpieza
      (id, nombre, descripcion, tipo_medida, precio_lista, ganancia, imagen_url, marca, activo, stock_minimo, categoria_id, creado_por)
      VALUES (?, 'Producto Test', 'Test', 'litros', 100.00, 25.00, NULL, 'TestMarca', 1, 0, ?, ?)
    `, [producto_id, categoria_id, usuario_id]);
  });

  afterAll(async () => {
    await limpiarTodo();
  });

  it('debería insertar un producto en el carrito', async () => {
    const cantidad = 2;
    const precio_unitario = 125.00;
    const total = cantidad * precio_unitario;

    await InsertarOrdenSimplificada(usuario_id, producto_id, cantidad, precio_unitario, total);

    const carrito = await ObtenerCarritoPendientePorUsuario(usuario_id);
    const producto = carrito.find(p => p.producto_id === producto_id);

    expect(producto).toBeDefined();
    expect(Number(producto.cantidad)).toBe(cantidad);
  });

  it('debería modificar la cantidad del producto en el carrito', async () => {
    const nuevaCantidad = 5;

    await ModificarCantidadProductoCarritoPorProducto(usuario_id, producto_id, nuevaCantidad);
    const carrito = await ObtenerCarritoPendientePorUsuario(usuario_id);
    const producto = carrito.find(p => p.producto_id === producto_id);

    expect(producto).toBeDefined();
    expect(Number(producto.cantidad)).toBe(nuevaCantidad);
  });

  it('debería eliminar el producto del carrito', async () => {
    await EliminarProductoDelCarrito(usuario_id, producto_id);

    const carrito = await ObtenerCarritoPendientePorUsuario(usuario_id);
    const producto = carrito.find(p => p.producto_id === producto_id);

    expect(producto).toBeUndefined();
  });
});
