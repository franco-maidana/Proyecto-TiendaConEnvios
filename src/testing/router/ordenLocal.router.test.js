import { describe, it, beforeEach, vi, expect } from "vitest";
import request from "supertest";
import app from "../../../server.js";

import * as ordenLocalService from "../../services/ordenLocal.service.js";

// Mock de usuario con rol admin
const mockUsuario = { id: 123, rol: 'admin' };

vi.mock("../../middlewares/auth.middlewares.js", () => ({
  authMiddleware: (req, res, next) => {
    req.usuario = mockUsuario;
    next();
  }
}));

vi.mock("../../middlewares/role.middlewares.js", () => ({
  verificarRole: () => (req, res, next) => next()
}));

describe("🧾 Test de endpoints de orden local", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Crear carrito vacío
  it("POST /api/ordenLocal/crear - debe crear un carrito vacío (201)", async () => {
    vi.spyOn(ordenLocalService, "CrearCarritoService").mockResolvedValue("orden123");

    const res = await request(app)
      .post("/api/ordenLocal/crear");

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Carrito creado");
    expect(res.body.orden_id).toBe("orden123");
  });

  it("POST /api/ordenLocal/crear - debe manejar error del servicio (500)", async () => {
    vi.spyOn(ordenLocalService, "CrearCarritoService").mockRejectedValue(new Error("Error inesperado"));

    const res = await request(app)
      .post("/api/ordenLocal/crear");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error al crear carrito");
    expect(res.body.error).toBe("Error inesperado");
  });

  // 2. Agregar producto al carrito
  it("POST /api/ordenLocal/:ordenId/agregar - debe agregar producto (200)", async () => {
    vi.spyOn(ordenLocalService, "AgregarProductoService").mockResolvedValue();

    const res = await request(app)
      .post("/api/ordenLocal/orden123/agregar")
      .send({ producto_id: 99, cantidad: 4 });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Producto agregado al carrito");
  });

  it("POST /api/ordenLocal/:ordenId/agregar - debe manejar error del servicio (500)", async () => {
    vi.spyOn(ordenLocalService, "AgregarProductoService").mockRejectedValue(new Error("Error inesperado"));

    const res = await request(app)
      .post("/api/ordenLocal/orden123/agregar")
      .send({ producto_id: 99, cantidad: 4 });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error al agregar producto");
    expect(res.body.error).toBe("Error inesperado");
  });

  // 3. Obtener carrito local
  it("GET /api/ordenLocal/:ordenId - debe devolver el carrito (200)", async () => {
    vi.spyOn(ordenLocalService, "ObtenerCarritoService").mockResolvedValue({ productos: [{ id: 1 }] });

    const res = await request(app)
      .get("/api/ordenLocal/orden123");

    expect(res.status).toBe(200);
    expect(res.body.productos).toBeDefined();
  });

  it("GET /api/ordenLocal/:ordenId - debe manejar error del servicio (500)", async () => {
    vi.spyOn(ordenLocalService, "ObtenerCarritoService").mockRejectedValue(new Error("Error inesperado"));

    const res = await request(app)
      .get("/api/ordenLocal/orden123");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error al obtener carrito");
    expect(res.body.error).toBe("Error inesperado");
  });

  // 4. Confirmar carrito
  it("POST /api/ordenLocal/:ordenId/confirmar - debe confirmar la venta (200)", async () => {
    vi.spyOn(ordenLocalService, "ConfirmarCarritoService").mockResolvedValue({ total: 1000 });

    const res = await request(app)
      .post("/api/ordenLocal/orden123/confirmar");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Venta confirmada exitosamente");
    expect(res.body.total).toBe(1000);
  });

  it("POST /api/ordenLocal/:ordenId/confirmar - debe manejar error del servicio (500)", async () => {
    vi.spyOn(ordenLocalService, "ConfirmarCarritoService").mockRejectedValue(new Error("Error inesperado"));

    const res = await request(app)
      .post("/api/ordenLocal/orden123/confirmar");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error al confirmar venta");
    expect(res.body.error).toBe("Error inesperado");
  });

  // 5. Cancelar carrito
  it("DELETE /api/ordenLocal/:ordenId - debe cancelar el carrito (200)", async () => {
    vi.spyOn(ordenLocalService, "CancelarCarritoService").mockResolvedValue();

    const res = await request(app)
      .delete("/api/ordenLocal/orden123");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Carrito cancelado y eliminado");
  });

  it("DELETE /api/ordenLocal/:ordenId - debe manejar error del servicio (500)", async () => {
    vi.spyOn(ordenLocalService, "CancelarCarritoService").mockRejectedValue(new Error("Error inesperado"));

    const res = await request(app)
      .delete("/api/ordenLocal/orden123");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error al cancelar carrito");
    expect(res.body.error).toBe("Error inesperado");
  });

  // 6. Eliminar producto de carrito
  it("DELETE /api/ordenLocal/:ordenId/producto/:productoId - debe eliminar producto (200)", async () => {
    vi.spyOn(ordenLocalService, "EliminarProductoService").mockResolvedValue();

    const res = await request(app)
      .delete("/api/ordenLocal/orden123/producto/88");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Producto eliminado del carrito");
  });

  it("DELETE /api/ordenLocal/:ordenId/producto/:productoId - debe manejar error del servicio (500)", async () => {
    vi.spyOn(ordenLocalService, "EliminarProductoService").mockRejectedValue(new Error("Error inesperado"));

    const res = await request(app)
      .delete("/api/ordenLocal/orden123/producto/88");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error al eliminar producto del carrito");
    expect(res.body.error).toBe("Error inesperado");
  });

});
