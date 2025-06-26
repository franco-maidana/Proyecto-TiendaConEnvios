import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../../server.js";

describe("🧪 Test profesional de rutas protegidas de productos (cookie auth)", () => {
  let cookie;
  let createdProductId;
  let categoriaId; // Para guardar la categoría creada

  beforeAll(async () => {
    // 1. Logueo
    const loginRes = await request(app).post("/api/sessions/login").send({
      email: "francomaidana094@gmail.com",
      password: "hola1234",
    });
    expect(loginRes.status).toBe(200);
    cookie = loginRes.headers["set-cookie"];
    expect(cookie).toBeDefined();

    // 2. Crear categoría antes de productos
    const catRes = await request(app)
      .post("/api/categorias/crear")
      .set("Cookie", cookie)
      .send({
        nombre: "Categoria Test GPT",
        descripcion: "Creada por test automatizado"
      });

    console.log('👉 RESPUESTA categoria:', catRes.body);

    expect(catRes.status).toBe(201);

    // Robust: tolera varias formas de respuesta
    categoriaId =
      (catRes.body.categoria && (catRes.body.categoria.id || catRes.body.categoria.categoria_id)) ||
      catRes.body.categoriaId ||
      catRes.body.id ||
      catRes.body.categoria_id;

    expect(categoriaId, `No se obtuvo id de categoría en la respuesta: ${JSON.stringify(catRes.body)}`).toBeDefined();
  });

  it("POST /api/products/crear-producto → debe crear un producto (autenticado)", async () => {
    const res = await request(app)
      .post("/api/products/crear-producto")
      .set("Cookie", cookie)
      .field("nombre", "Producto Test")
      .field("descripcion", "Un producto de test")
      .field("tipo_medida", "litros")
      .field("stock_minimo", 10)
      .field("precio_lista", 100)
      .field("ganancia", 30)
      .field("marca", "Test")
      .field("categoria_id", categoriaId)
      .field("insumo_id", 1030) // Cambia si necesitás uno dinámico
      .field("envase_id", 1030) // Cambia si necesitás uno dinámico
      .attach("imagen", "src/testing/files/foto.jpg"); // ⚠️ Debe existir ese archivo

    console.log("📦 Resultado del POST:", res.body);

    expect(res.status).toBe(201);

    // También robusto para productoId
    createdProductId =
      (res.body.productoId && (res.body.productoId.id || res.body.productoId.producto_id)) ||
      res.body.producto_id ||
      res.body.id;
    expect(createdProductId, `No se obtuvo id de producto en la respuesta: ${JSON.stringify(res.body)}`).toBeDefined();
  });

  it("GET /api/products/listar → debe listar productos (autenticado)", async () => {
    const res = await request(app)
      .get("/api/products/listar?pagina=1&limite=10")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.productos)).toBe(true);
  });

  it("GET /api/products/listar → debe traer el producto creado (buscándolo en la lista)", async () => {
    const res = await request(app)
      .get("/api/products/listar?pagina=1&limite=50")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    const found = res.body.productos?.find((p) => p.id === createdProductId || p.producto_id === createdProductId);
    expect(found, `No se encontró el producto creado en la lista. ID esperado: ${createdProductId}`).toBeDefined();
  });

  it("PUT /api/products/upDate/:id → debe actualizar el producto (autenticado)", async () => {
    const res = await request(app)
      .put(`/api/products/upDate/${createdProductId}`)
      .set("Cookie", cookie)
      .send({ stock_minimo: 20 });

    expect(res.status).toBe(200);
    expect(res.body.producto).toBeDefined();
    expect(Number(res.body.producto.stock_minimo)).toBe(20);
  });

  it("DELETE /api/products/delete/:id → debe eliminar el producto (autenticado)", async () => {
    const res = await request(app)
      .delete(`/api/products/delete/${createdProductId}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/eliminado/i);
  });
});
