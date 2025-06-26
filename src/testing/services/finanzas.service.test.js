import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  RegistrarGastoGeneral,
  EliminarGastoYActualizarBalance,
  ModificarGasto,
  ListarGastos,
  ObtenerDetalleGasto,
  ListarGastosMensuales,
  ResumenAnualGastos
} from "../../services/finanzas.service.js";
import Conexion from "../../config/db.js";

describe("FinanzasService", () => {
  let gastoIdTest;

  beforeAll(async () => {
    // Usar categorías válidas
    await RegistrarGastoGeneral("Test Gasto Inicial", 100.0, "General");
    const gastos = await ListarGastos();
    const creado = gastos.find(g => g.descripcion === "Test Gasto Inicial");
    gastoIdTest = creado.id;
  });

  afterAll(async () => {
    await Conexion.query(`DELETE FROM gastos_totales WHERE descripcion LIKE '%Test Gasto%'`);
  });

  it("debería registrar un gasto general", async () => {
    const antes = await ListarGastos();
    await RegistrarGastoGeneral("Test Gasto", 200.0, "Operativo");
    const despues = await ListarGastos();
    expect(despues.length).toBeGreaterThan(antes.length);
  });

  it("debería obtener detalle de un gasto", async () => {
    const detalle = await ObtenerDetalleGasto(gastoIdTest);
    expect(detalle).toHaveProperty("descripcion", "Test Gasto Inicial");
  });

  it("debería modificar un gasto existente", async () => {
    await ModificarGasto(gastoIdTest, { descripcion: "Test Gasto Modificado", monto: 300.0 });
    const detalle = await ObtenerDetalleGasto(gastoIdTest);
    expect(detalle.descripcion).toBe("Test Gasto Modificado");
    expect(parseFloat(detalle.monto)).toBe(300.0);
  });

  it("debería eliminar un gasto y actualizar el balance", async () => {
    await RegistrarGastoGeneral("Test Gasto Delete", 50.0, "Temporal");
    const gastos = await ListarGastos();
    const gastoParaEliminar = gastos.find(g => g.descripcion === "Test Gasto Delete");

    await EliminarGastoYActualizarBalance(gastoParaEliminar.id);

    const verificado = await ObtenerDetalleGasto(gastoParaEliminar.id);
    expect(verificado).toBeUndefined();
  });

  it("debería listar los gastos mensuales", async () => {
    const now = new Date();
    // Asegurar categoría válida
    await RegistrarGastoGeneral(`Test Gasto ${now.getTime()} - Mensual`, 120.0, "General");
    const gastos = await ListarGastosMensuales(now.getFullYear(), now.getMonth() + 1);
    expect(Array.isArray(gastos)).toBe(true);
  });

  it("debería mostrar el resumen de gastos anuales", async () => {
    const now = new Date();
    // Asegurar categoría válida
    await RegistrarGastoGeneral(`Test Gasto ${now.getTime()} - Anual`, 130.0, "Operativo");
    const resumen = await ResumenAnualGastos(now.getFullYear());
    expect(Array.isArray(resumen)).toBe(true);
  });
});
