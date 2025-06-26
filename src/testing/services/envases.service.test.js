import { describe, it, expect } from 'vitest';
import {
  CrearEnvaseConGasto,
  ListarEnvases,
  ModificarEnvase,
  BorrarEnvase
} from '../../services/almacen.service.js';
import Conexion from '../../config/db.js';

describe('EnvasesService', () => {
  let envaseId;

  it('debería crear un nuevo envase con gasto', async () => {
    envaseId = await CrearEnvaseConGasto("Plástico", 1.5, 10, 50);
    expect(typeof envaseId).toBe("number");
  });

  it('debería listar envases existentes', async () => {
    const envases = await ListarEnvases();
    expect(Array.isArray(envases)).toBe(true);
    expect(envases.find(e => e.id === envaseId)).toBeDefined();
  });

  it('debería modificar un envase existente', async () => {
    await ModificarEnvase(envaseId, { stock: 20 });
    const [envase] = await Conexion.query(`SELECT * FROM envases WHERE id = ?`, [envaseId]);
    expect(envase[0].stock).toBe(20);
  });

  it('debería borrar un envase', async () => {
    await BorrarEnvase(envaseId);
    const [envase] = await Conexion.query(`SELECT * FROM envases WHERE id = ?`, [envaseId]);
    expect(envase.length).toBe(0);
  });
});
