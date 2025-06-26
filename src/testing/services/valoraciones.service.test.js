import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Conexion from '../../config/db.js';
import {
  CrearValoracionService,
  ObtenerValoracionesService,
  ObtenerValoracionesPorProductoService,
  PromedioEstrellasService,
  ResumenValoracionesService,
  ActualizarValoracionService,
  EliminarValoracionService,
} from '../../services/valoracione.service.js';

let testValoracionId = null;
const testUsuarioId = 1;     // 👈 asegurate que este ID existe en tu tabla usuarios
const testProductoId = 1;    // 👈 asegurate que este ID existe en tu tabla productos

describe('ValoracionesService', () => {
  beforeAll(async () => {
    // Crear usuario de prueba si no existe
    await Conexion.query(`
      INSERT IGNORE INTO usuarios (id, nombre, email) 
      VALUES (1, 'Tester', 'tester@mail.com')
    `);
    
    // 👇 CAMBIO ACÁ: insertar en productos_limpieza, NO en productos
    await Conexion.query(`
      INSERT IGNORE INTO productos_limpieza (id, nombre, descripcion) 
      VALUES (1, 'Producto Test', 'Este es un producto de prueba')
    `);
    
    // Limpiar valoraciones previas por seguridad
    await Conexion.query(`DELETE FROM valoraciones WHERE usuarios_id = 1 AND productos_id = 1`);
  });



  it('debería crear una nueva valoración', async () => {
    await CrearValoracionService({
      usuarios_id: testUsuarioId,
      productos_id: testProductoId,
      estrellas: 5,
      comentarios: 'Excelente producto!',
    });

    const [[row]] = await Conexion.query(
      'SELECT * FROM valoraciones WHERE usuarios_id = ? AND productos_id = ?',
      [testUsuarioId, testProductoId]
    );

    expect(row).toBeDefined();
    testValoracionId = row.id;
  });

  it('debería listar todas las valoraciones paginadas', async () => {
    const result = await ObtenerValoracionesService(1, 5);
    expect(result).toHaveProperty('data');
    expect(Array.isArray(result.data)).toBe(true);
  });

  it('debería obtener valoraciones de un producto', async () => {
    const result = await ObtenerValoracionesPorProductoService(testProductoId);
    expect(result).toHaveProperty('data');
    expect(Array.isArray(result.data)).toBe(true);
  });

  it('debería calcular promedio de estrellas de un producto', async () => {
    const promedio = await PromedioEstrellasService(testProductoId);
    expect(typeof promedio).toBe('number');
  });

  it('debería obtener resumen de valoraciones por producto', async () => {
    const resumen = await ResumenValoracionesService(testProductoId);
    expect(resumen).toHaveProperty('5'); // 👈 porque usamos 5 estrellas
  });

  it('debería actualizar la valoración', async () => {
    await ActualizarValoracionService(testValoracionId, {
      estrellas: 4,
      comentarios: 'Lo pensé mejor, es muy bueno pero no perfecto.',
    });

    const [[updated]] = await Conexion.query('SELECT estrellas FROM valoraciones WHERE id = ?', [testValoracionId]);
    expect(updated).toBeDefined(); // ✅ Nueva línea de seguridad
    expect(updated.estrellas).toBe(4);
  });

  it('debería eliminar la valoración', async () => {
    await EliminarValoracionService(testValoracionId);

    const [[deleted]] = await Conexion.query('SELECT * FROM valoraciones WHERE id = ?', [testValoracionId]);
    expect(deleted).toBeUndefined();
  });
});
