import { describe, it, beforeEach, vi, expect } from "vitest";
import request from "supertest";
import app from "../../../server.js";

import * as reposicionService from "../../services/reposicion.service.js";

// Mock de usuario admin
const mockUsuario = { id: 123, rol: "admin" };

vi.mock("../../middlewares/auth.middlewares.js", () => ({
  authMiddleware: (req, res, next) => {
    req.usuario = mockUsuario;
    next();
  }
}));
vi.mock("../../middlewares/role.middlewares.js", () => ({
  verificarRole: () => (req, res, next) => next()
}));

describe("📦 Test endpoint de reposición", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /api/reposicion/agregar - éxito (200)", async () => {
    vi.spyOn(reposicionService, "ReponerStock").mockResolvedValue({
      nombre: "Producto X",
      monto: 1500
    });

    const res = await request(app)
      .post("/api/reposicion/agregar")
      .send({
        tipo: "producto",
        id: 9,
        cantidad: 10,
        precio_unitario: 150,
        descripcion: "Reposición de prueba"
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/reposici/i);
    expect(res.body.gasto_registrado).toBe(1500);
  });

  it("POST /api/reposicion/agregar - faltan campos (400)", async () => {
    const res = await request(app)
      .post("/api/reposicion/agregar")
      .send({
        tipo: "producto",
        id: 9,
        // Falta cantidad y precio_unitario
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/faltan campos/i);
  });

  it("POST /api/reposicion/agregar - error del servicio (500)", async () => {
    vi.spyOn(reposicionService, "ReponerStock").mockRejectedValue(new Error("Error inesperado"));

    const res = await request(app)
      .post("/api/reposicion/agregar")
      .send({
        tipo: "producto",
        id: 9,
        cantidad: 10,
        precio_unitario: 150,
        descripcion: "Reposición de prueba"
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/error al registrar/i);
    expect(res.body.error).toBe("Error inesperado");
  });
});
