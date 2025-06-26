import { describe, it, beforeEach, vi, expect } from "vitest";
import request from "supertest";
import app from "../../../server.js";

import * as valoracionService from "../../services/valoracione.service.js";
import * as valoracionModel from "../../models/valoraciones.model.js";

// Mock auth para req.usuario
const mockUsuario = { id: 123 };

vi.mock("../../middlewares/auth.middlewares.js", () => ({
  authMiddleware: (req, res, next) => {
    req.usuario = mockUsuario;
    next();
  }
}));

describe("⭐ Test endpoints de valoraciones", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Crear valoración
  it("POST /api/valoraciones/crear - éxito (201)", async () => {
    vi.spyOn(valoracionService, "CrearValoracionService").mockResolvedValue();

    const res = await request(app)
      .post("/api/valoraciones/crear")
      .send({
        usuarios_id: 123,
        productos_id: 1,
        estrellas: 5,
        comentarios: "Excelente"
      });

    expect(res.status).toBe(201);
    expect(res.body.mensaje).toBe("✅ Valoración creada correctamente");
  });

  it("POST /api/valoraciones/crear - error por estrellas inválidas (400)", async () => {
    const res = await request(app)
      .post("/api/valoraciones/crear")
      .send({
        usuarios_id: 123,
        productos_id: 1,
        estrellas: 6,
        comentarios: "Fuera de rango"
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/estrellas/i);
  });

  it("POST /api/valoraciones/crear - error de servicio (500)", async () => {
    vi.spyOn(valoracionService, "CrearValoracionService").mockRejectedValue(new Error("Error inesperado"));

    const res = await request(app)
      .post("/api/valoraciones/crear")
      .send({
        usuarios_id: 123,
        productos_id: 1,
        estrellas: 4,
        comentarios: "Comentario"
      });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Error inesperado");
  });

  // 2. Obtener valoraciones paginadas (listado público)
  it("GET /api/valoraciones/listado - éxito", async () => {
    vi.spyOn(valoracionService, "ObtenerValoracionesService").mockResolvedValue({ total: 1, docs: [] });

    const res = await request(app)
      .get("/api/valoraciones/listado?page=1&limit=2");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("total");
    expect(res.body).toHaveProperty("docs");
  });

  it("GET /api/valoraciones/listado - error de servicio (500)", async () => {
    vi.spyOn(valoracionService, "ObtenerValoracionesService").mockRejectedValue(new Error("Error inesperado"));

    const res = await request(app)
      .get("/api/valoraciones/listado");

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/error/i);
  });

  // 3. Obtener valoraciones de un producto
  it("GET /api/valoraciones/producto/:id - éxito", async () => {
    vi.spyOn(valoracionService, "ObtenerValoracionesPorProductoService").mockResolvedValue({ total: 1, docs: [] });

    const res = await request(app)
      .get("/api/valoraciones/producto/12?page=1&limit=2");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("total");
    expect(res.body).toHaveProperty("docs");
  });

  it("GET /api/valoraciones/producto/:id - error de servicio (500)", async () => {
    vi.spyOn(valoracionService, "ObtenerValoracionesPorProductoService").mockRejectedValue(new Error("Error inesperado"));

    const res = await request(app)
      .get("/api/valoraciones/producto/12");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Error inesperado");
  });

  // 4. Eliminar valoración (requiere permisos)
  it("DELETE /api/valoraciones/producto-del/:id/:usuarios_id - éxito", async () => {
    vi.spyOn(valoracionModel, "ObtenerValoracionPorId").mockResolvedValue({ id: 44, usuarios_id: 123 });
    vi.spyOn(valoracionService, "EliminarValoracionService").mockResolvedValue();

    const res = await request(app)
      .delete("/api/valoraciones/producto-del/44/123");

    expect(res.status).toBe(200);
    expect(res.body.mensaje).toMatch(/eliminada/i);
  });

  it("DELETE /api/valoraciones/producto-del/:id/:usuarios_id - no existe (404)", async () => {
    vi.spyOn(valoracionModel, "ObtenerValoracionPorId").mockResolvedValue(null);

    const res = await request(app)
      .delete("/api/valoraciones/producto-del/44/123");

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/no encontrada/i);
  });

  it("DELETE /api/valoraciones/producto-del/:id/:usuarios_id - sin permisos (403)", async () => {
    vi.spyOn(valoracionModel, "ObtenerValoracionPorId").mockResolvedValue({ id: 44, usuarios_id: 999 }); // otro usuario

    const res = await request(app)
      .delete("/api/valoraciones/producto-del/44/123");

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/permiso/i);
  });

  it("DELETE /api/valoraciones/producto-del/:id/:usuarios_id - error servicio (500)", async () => {
    vi.spyOn(valoracionModel, "ObtenerValoracionPorId").mockResolvedValue({ id: 44, usuarios_id: 123 });
    vi.spyOn(valoracionService, "EliminarValoracionService").mockRejectedValue(new Error("Error inesperado"));

    const res = await request(app)
      .delete("/api/valoraciones/producto-del/44/123");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Error inesperado");
  });

  // 5. Actualizar valoración (requiere permisos)
  it("PUT /api/valoraciones/producto-upDate/:id - éxito", async () => {
    vi.spyOn(valoracionModel, "ObtenerValoracionPorId").mockResolvedValue({ id: 77, usuarios_id: 123 });
    vi.spyOn(valoracionService, "ActualizarValoracionService").mockResolvedValue();

    const res = await request(app)
      .put("/api/valoraciones/producto-upDate/77")
      .send({ estrellas: 4, comentarios: "Editado", usuarios_id: 123 });

    expect(res.status).toBe(200);
    expect(res.body.mensaje).toMatch(/actualizada/i);
  });

  it("PUT /api/valoraciones/producto-upDate/:id - estrellas inválidas (400)", async () => {
    const res = await request(app)
      .put("/api/valoraciones/producto-upDate/77")
      .send({ estrellas: 9, comentarios: "Editado", usuarios_id: 123 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/estrellas/i);
  });

  it("PUT /api/valoraciones/producto-upDate/:id - no existe (404)", async () => {
    vi.spyOn(valoracionModel, "ObtenerValoracionPorId").mockResolvedValue(null);

    const res = await request(app)
      .put("/api/valoraciones/producto-upDate/77")
      .send({ estrellas: 4, comentarios: "Editado", usuarios_id: 123 });

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/no encontrada/i);
  });

  it("PUT /api/valoraciones/producto-upDate/:id - sin permisos (403)", async () => {
    vi.spyOn(valoracionModel, "ObtenerValoracionPorId").mockResolvedValue({ id: 77, usuarios_id: 888 });

    const res = await request(app)
      .put("/api/valoraciones/producto-upDate/77")
      .send({ estrellas: 4, comentarios: "Editado", usuarios_id: 123 });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/permiso/i);
  });

  it("PUT /api/valoraciones/producto-upDate/:id - error servicio (500)", async () => {
    vi.spyOn(valoracionModel, "ObtenerValoracionPorId").mockResolvedValue({ id: 77, usuarios_id: 123 });
    vi.spyOn(valoracionService, "ActualizarValoracionService").mockRejectedValue(new Error("Error inesperado"));

    const res = await request(app)
      .put("/api/valoraciones/producto-upDate/77")
      .send({ estrellas: 4, comentarios: "Editado", usuarios_id: 123 });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Error inesperado");
  });

  // 6. Promedio de estrellas
  it("GET /api/valoraciones/promedio/:id - éxito", async () => {
    vi.spyOn(valoracionService, "PromedioEstrellasService").mockResolvedValue(4.2);

    const res = await request(app)
      .get("/api/valoraciones/promedio/1");

    expect(res.status).toBe(200);
    expect(res.body.promedio).toBe(4.2);
  });

  it("GET /api/valoraciones/promedio/:id - error servicio (500)", async () => {
    vi.spyOn(valoracionService, "PromedioEstrellasService").mockRejectedValue(new Error("Error inesperado"));

    const res = await request(app)
      .get("/api/valoraciones/promedio/1");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Error inesperado");
  });

  // 7. Resumen valoraciones
  it("GET /api/valoraciones/resumen/:id - éxito", async () => {
    vi.spyOn(valoracionService, "ResumenValoracionesService").mockResolvedValue({ total: 12, estrellas_5: 5 });

    const res = await request(app)
      .get("/api/valoraciones/resumen/1");

    expect(res.status).toBe(200);
    expect(res.body.producto_id).toBe(1);
    expect(res.body.resumen).toHaveProperty("total");
    expect(res.body.resumen).toHaveProperty("estrellas_5");
  });

  it("GET /api/valoraciones/resumen/:id - error servicio (500)", async () => {
    vi.spyOn(valoracionService, "ResumenValoracionesService").mockRejectedValue(new Error("Error inesperado"));

    const res = await request(app)
      .get("/api/valoraciones/resumen/1");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Error inesperado");
  });
});
