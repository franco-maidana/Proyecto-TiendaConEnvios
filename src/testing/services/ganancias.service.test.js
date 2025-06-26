import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Conexion from "../../config/db.js";
import {
  RegistrarGananciaAcumulada,
  ObtenerGananciasTotales,
  ObtenerGananciaPorId,
  ObtenerGananciasDelMes,
  ObtenerGananciasDelAnio,
  ObtenerComparativaMensual,
  ObtenerComparativaAnual
} from "../../services/ganancias.service.js";

let insertedId = null;

describe("GananciasService", () => {
  beforeAll(async () => {
    await Conexion.query(`DELETE FROM ganancias_totales`);
  });

  afterAll(async () => {
    await Conexion.query(`DELETE FROM ganancias_totales WHERE id = ?`, [insertedId]);
  });

  it("debería registrar una ganancia acumulada", async () => {
    const data = {
      total_productos: 1000.50,
      total_mantenimiento: 150.75,
      total_envio: 200.00
    };

    const result = await RegistrarGananciaAcumulada(data);
    expect(result).toHaveProperty("insertId");
    insertedId = result.insertId;
  });

  it("debería obtener todas las ganancias", async () => {
    const ganancias = await ObtenerGananciasTotales();
    expect(Array.isArray(ganancias)).toBe(true);
    expect(ganancias.length).toBeGreaterThan(0);
  });

  it("debería obtener una ganancia por ID", async () => {
    const ganancia = await ObtenerGananciaPorId(insertedId);
    expect(ganancia).toHaveProperty("id");
    expect(ganancia.id).toBe(insertedId);
  });

  it("debería obtener las ganancias del mes actual", async () => {
    const mes = await ObtenerGananciasDelMes();
    expect(Array.isArray(mes)).toBe(true);
  });

  it("debería obtener las ganancias del año actual", async () => {
    const anio = await ObtenerGananciasDelAnio();
    expect(Array.isArray(anio)).toBe(true);
  });

  it("debería mostrar la comparativa mensual", async () => {
    const comparativa = await ObtenerComparativaMensual();
    expect(Array.isArray(comparativa)).toBe(true);
  });

  it("debería mostrar la comparativa anual", async () => {
    const comparativa = await ObtenerComparativaAnual();
    expect(Array.isArray(comparativa)).toBe(true);
  });
});
