import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Conexion from '../../config/db.js';

import { ReponerStock } from '../../services/reposicion.service.js';
import { ObtenerInsumoPorId } from '../../models/insumos.model.js';
import { ObtenerEnvasePorId } from '../../models/envases.model.js';

describe('ReposicionService', () => {
  beforeAll(async () => {
    await Conexion.query(`
      INSERT IGNORE INTO insumos_base (id, nombre, stock_litros, precio_litro, tipo, stock_unidades, precio_seco)
      VALUES (1, 'Agua Test', 10.00, 15.00, 'liquido', 0, 0.00)
    `);

    await Conexion.query(`
      INSERT IGNORE INTO envases (id, tipo, capacidad_litros, stock, precio_envase)
      VALUES (1, 'Botella Test', 1.00, 10, 8.00)
    `);
  });


  it('debería reponer stock de insumo correctamente', async () => {
    const insumoAntes = await ObtenerInsumoPorId(1);
    const cantidad = 5;
    const precio = 10;

    const result = await ReponerStock({
      tipo: 'insumo',
      id: 1,
      cantidad,
      precio_unitario: precio
    });

    const insumoDespues = await ObtenerInsumoPorId(1);
    expect(Number(insumoDespues.stock_litros)).toBeCloseTo(Number(insumoAntes.stock_litros) + cantidad, 2);
    expect(result).toHaveProperty('monto', cantidad * precio);
    expect(result.nombre).toBe(insumoAntes.nombre);
  });

  it('debería reponer stock de envase correctamente', async () => {
    const envaseAntes = await ObtenerEnvasePorId(1);
    const cantidad = 3;
    const precio = 8;

    const result = await ReponerStock({
      tipo: 'envase',
      id: 1,
      cantidad,
      precio_unitario: precio
    });

    const envaseDespues = await ObtenerEnvasePorId(1);
    expect(envaseDespues.stock).toBe(envaseAntes.stock + cantidad);
    expect(result).toHaveProperty('monto', cantidad * precio);
    expect(result.nombre).toBe(envaseAntes.tipo);
  });

afterAll(async () => {
  await Conexion.query(`DELETE FROM insumos_base WHERE id = 1`);
  await Conexion.query(`DELETE FROM envases WHERE id = 1`);
  // Si tu tabla real de finanzas se llama diferente, ajusta aquí o comenta
  // await Conexion.query(`DELETE FROM finanzas WHERE descripcion LIKE '%Test%'`);
});

});
