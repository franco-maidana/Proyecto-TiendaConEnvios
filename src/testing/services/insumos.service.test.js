import { describe, it, expect } from 'vitest';
import {
  CrearInsumoConGasto,
  ListarInsumos,
  ModificarInsumo,
  BorrarInsumo
} from '../../services/almacen.service.js';
import Conexion from '../../config/db.js';

describe('InsumosService', () => {
  let insumoId;

  it('debería crear un nuevo insumo líquido', async () => {
    insumoId = await CrearInsumoConGasto({
      nombre: `CloroTest${Date.now()}`,
      tipo: "liquido",
      stock_litros: 20,
      precio_litro: 15
    });
    expect(typeof insumoId).toBe("number");
  });

  it('debería listar insumos existentes', async () => {
    const insumos = await ListarInsumos();
    expect(Array.isArray(insumos)).toBe(true);
    expect(insumos.find(i => i.id === insumoId)).toBeDefined();
  });

it('debería modificar un insumo existente', async () => {
  await ModificarInsumo(insumoId, { stock_litros: 25 });
  const [insumo] = await Conexion.query(`SELECT * FROM insumos_base WHERE id = ?`, [insumoId]);
  expect(parseFloat(insumo[0].stock_litros)).toBe(25);
});


  it('debería borrar un insumo', async () => {
    await BorrarInsumo(insumoId);
    const [insumo] = await Conexion.query(`SELECT * FROM insumos_base WHERE id = ?`, [insumoId]);
    expect(insumo.length).toBe(0);
  });
});
