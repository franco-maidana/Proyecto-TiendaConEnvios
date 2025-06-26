import { describe, it, beforeEach, vi, expect } from "vitest";
import request from "supertest";
import app from "../../../server.js";

// Importa todos los métodos del service
import * as ordenesService from "../../services/ordenes.service.js";

// Mock authMiddleware para inyectar usuario simulado
const mockUsuario = { id: 123 };

vi.mock("../../middlewares/auth.middlewares.js", () => ({
  authMiddleware: (req, res, next) => {
    req.usuario = mockUsuario;
    next();
  }
}));

describe("🛒 Test de endpoints de órdenes/carrito", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Agregar producto al carrito
  it("POST /api/ordenes/create - debe agregar producto al carrito (201)", async () => {
    vi.spyOn(ordenesService, "AgregarProductoAlCarrito").mockResolvedValue({
      carrito: [{ producto_id: 1, cantidad: 2 }]
    });

    const res = await request(app)
      .post("/api/ordenes/create")
      .send({ producto_id: 1, cantidad: 2 });

    expect(res.body.statusCode).toBe(201);
    expect(res.body.message).toBe("Producto agregado al carrito");
    expect(res.body.resultado).toBeDefined();
  });

  it("POST /api/ordenes/create - debe devolver 400 si faltan campos", async () => {
    const res = await request(app)
      .post("/api/ordenes/create")
      .send({ producto_id: 1 });

    expect(res.body.statusCode).toBe(400);
    expect(res.body.message).toBe("Faltan campos obligatorios");
  });

  it("POST /api/ordenes/create - debe manejar errores del servicio (500)", async () => {
    vi.spyOn(ordenesService, "AgregarProductoAlCarrito").mockRejectedValue(new Error("Error inesperado"));

    const res = await request(app)
      .post("/api/ordenes/create")
      .send({ producto_id: 1, cantidad: 2 });

    expect(res.body.statusCode).toBe(500);
    expect(res.body.message).toBe("Error al agregar producto al carrito");
    expect(res.body.error).toBe("Error inesperado");
  });

  // 2. Ver carrito del usuario
  it("GET /api/ordenes/listado/:usuario_id - debe devolver el carrito (200)", async () => {
    vi.spyOn(ordenesService, "VerCarritoDelUsuario").mockResolvedValue({
      carrito: [{ producto_id: 1, cantidad: 2 }]
    });

    const res = await request(app)
      .get(`/api/ordenes/listado/${mockUsuario.id}`);

    expect(res.body.statusCode).toBe(200);
    expect(res.body.message).toBe("Carrito obtenido correctamente");
    expect(res.body.carrito).toBeDefined();
  });

  it("GET /api/ordenes/listado/:usuario_id - debe manejar errores del servicio (500)", async () => {
    vi.spyOn(ordenesService, "VerCarritoDelUsuario").mockRejectedValue(new Error("Error inesperado"));

    const res = await request(app)
      .get(`/api/ordenes/listado/${mockUsuario.id}`);

    expect(res.body.statusCode).toBe(500);
    expect(res.body.message).toBe("Error al obtener el carrito");
    expect(res.body.error).toBe("Error inesperado");
  });

  // 3. Modificar cantidad de producto en carrito
  it("PUT /api/ordenes/upDate - debe modificar la cantidad correctamente (200)", async () => {
    vi.spyOn(ordenesService, "EditarCantidadProductoEnCarrito").mockResolvedValue({ ok: true });

    const res = await request(app)
      .put("/api/ordenes/upDate")
      .send({ producto_id: 1, cantidad: 5 });

    expect(res.body.statusCode).toBe(200);
    expect(res.body.message).toBe("Cantidad actualizada correctamente");
    expect(res.body.resultado).toBeDefined();
  });

  it("PUT /api/ordenes/upDate - debe devolver 400 si faltan campos", async () => {
    const res = await request(app)
      .put("/api/ordenes/upDate")
      .send({ producto_id: 1 }); // Falta cantidad

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Faltan datos");
  });

  it("PUT /api/ordenes/upDate - debe manejar errores del servicio (400)", async () => {
    vi.spyOn(ordenesService, "EditarCantidadProductoEnCarrito").mockRejectedValue(new Error("Error inesperado"));

    const res = await request(app)
      .put("/api/ordenes/upDate")
      .send({ producto_id: 1, cantidad: 5 });

    expect(res.body.statusCode).toBe(400);
    expect(res.body.message).toBe("Error al actualizar la cantidad");
    expect(res.body.error).toBe("Error inesperado");
  });

  // 4. Eliminar producto del carrito
  it("DELETE /api/ordenes/destroi/:usuario_id - debe eliminar el producto correctamente (200)", async () => {
    vi.spyOn(ordenesService, "QuitarProductoDelCarrito").mockResolvedValue({ ok: true });

    const res = await request(app)
      .delete(`/api/ordenes/destroi/${mockUsuario.id}`)
      .send({ producto_id: 1 });

    expect(res.body.statusCode).toBe(200);
    expect(res.body.message).toBe("Producto eliminado del carrito");
    expect(res.body.resultado).toBeDefined();
  });

  it("DELETE /api/ordenes/destroi/:usuario_id - debe devolver 400 si producto_id es inválido", async () => {
    const res = await request(app)
      .delete(`/api/ordenes/destroi/${mockUsuario.id}`)
      .send({ producto_id: "no-num" });

    expect(res.body.statusCode).toBe(400);
    expect(res.body.message).toBe("ID de producto inválido");
  });

  it("DELETE /api/ordenes/destroi/:usuario_id - debe manejar errores del servicio (500)", async () => {
    vi.spyOn(ordenesService, "QuitarProductoDelCarrito").mockRejectedValue(new Error("Error inesperado"));

    const res = await request(app)
      .delete(`/api/ordenes/destroi/${mockUsuario.id}`)
      .send({ producto_id: 1 });

    expect(res.body.statusCode).toBe(500);
    expect(res.body.message).toBe("Error al eliminar producto del carrito");
    expect(res.body.error).toBe("Error inesperado");
  });

  // 5. Vaciar carrito del usuario
  it("DELETE /api/ordenes/vaciar-carrito/:usuario_id - debe vaciar el carrito (200)", async () => {
    vi.spyOn(ordenesService, "VaciarCarrito").mockResolvedValue({ ok: true });

    const res = await request(app)
      .delete(`/api/ordenes/vaciar-carrito/${mockUsuario.id}`);

    expect(res.body.statusCode).toBe(200);
    expect(res.body.message).toBe("Carrito vaciado correctamente");
    expect(res.body.resultado).toBeDefined();
  });

  it("DELETE /api/ordenes/vaciar-carrito/:usuario_id - debe manejar errores del servicio (500)", async () => {
    vi.spyOn(ordenesService, "VaciarCarrito").mockRejectedValue(new Error("Error inesperado"));

    const res = await request(app)
      .delete(`/api/ordenes/vaciar-carrito/${mockUsuario.id}`);

    expect(res.body.statusCode).toBe(500);
    expect(res.body.message).toBe("Error al vaciar el carrito");
    expect(res.body.error).toBe("Error inesperado");
  });

  // 6. Obtener orden por grupo
  it("GET /api/ordenes/obtener/:grupo_orden - debe obtener la orden por grupo (200)", async () => {
    vi.spyOn(ordenesService, "ObtenerOrdenPorGrupo").mockResolvedValue({ orden: { id: 5 } });

    const res = await request(app)
      .get("/api/ordenes/obtener/GRUPO123");

    expect(res.body.statusCode).toBe(200);
    expect(res.body.message).toBe("Orden obtenida con éxito");
    expect(res.body.orden).toBeDefined();
  });

  it("GET /api/ordenes/obtener/:grupo_orden - debe devolver 400 si falta grupo_orden", async () => {
    const res = await request(app)
      .get("/api/ordenes/obtener/"); // Ruta mal formada

    expect([400, 404]).toContain(res.status); // Puede ser 404 por router o 400 por lógica
  });

  it("GET /api/ordenes/obtener/:grupo_orden - debe manejar errores del servicio (500)", async () => {
    vi.spyOn(ordenesService, "ObtenerOrdenPorGrupo").mockRejectedValue(new Error("Error inesperado"));

    const res = await request(app)
      .get("/api/ordenes/obtener/GRUPO123");

    expect(res.body.statusCode).toBe(500);
    expect(res.body.message).toBe("Error al obtener la orden");
    expect(res.body.error).toBe("Error inesperado");
  });
});
