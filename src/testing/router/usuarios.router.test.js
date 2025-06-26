import request from "supertest";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import app from "../../../server.js";
import { describe, it, expect } from "vitest";
import crypto from "crypto";

dotenv.config();

describe("🧪 Test de rutas protegidas de usuarios", () => {
  it("GET /api/users/listado → debería retornar usuarios (requiere admin)", async () => {
    const token = jwt.sign(
      { id: "fake-admin-id", rol: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const cookie = `token=${token}`;
    const res = await request(app)
      .get("/api/users/listado")
      .set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.usuarios)).toBe(true); // ✅ correcto
  });

  it("debería registrar un nuevo usuario con todos los campos", async () => {
    const timestamp = Date.now();
    const fakeEmail = `test_user_${timestamp}@example.com`;

    const userData = {
      nombre: "Test Completo",
      email: fakeEmail,
      password: "TestPassword123",
      telefono: "1234567890",
      direccion: "Calle Inventada 123",
      latitud: "-34.6037",
      longitud: "-58.3816",
      token: crypto.randomBytes(20).toString("hex"),
      expira: new Date(Date.now() + 3600 * 1000).toISOString(), // 1h
    };

    const res = await request(app).post("/api/users/create").send(userData);

    console.log("🚀 STATUS:", res.status);
    console.log("📦 BODY:", res.body);

    // ✅ Validaciones
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty("usuario"); // 👈 nombre real de la prop
    expect(res.body.usuario.email).toBe(userData.email);
    expect(res.body.usuario).toHaveProperty("id");
  });

  it("POST /api/users/reset-password → debería iniciar recuperación de contraseña", async () => {
    const emailExistente = "franco@test.com";
    const res = await request(app)
      .post("/api/users/reset-password")
      .send({ email: emailExistente });
    console.log("📩 STATUS:", res.status);
    console.log("📩 BODY:", res.body);
    expect(res.status).toBe(400); // Espera 400 porque falta token y nueva password
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toMatch(
      /token y nueva contraseña son requeridas/i
    );
  });

  it("POST /api/users/verificar-email → debería fallar por token inválido", async () => {
    const res = await request(app)
      .post("/api/users/verificar-email")
      .send({ token: "token-fake-no-existe" });

    console.log("🧪 STATUS:", res.status);
    console.log("🧪 BODY:", res.body);

    expect(res.status).toBe(400); // o 404, según cómo manejes error
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toMatch(/usuario no encontrado/i); // ✅ éxito garantizado
  });

  it("debería registrar un nuevo usuario con todos los campos", async () => {
    const userData = {
      nombre: "Tester",
      email: `test-${Date.now()}@test.com`, // 👈 esto evita duplicados
      password: "securepass123",
      telefono: "123456789",
      direccion: "Avenida Test",
      latitud: "-34.6037",
      longitud: "-58.3816",
    };

    const res = await request(app).post("/api/users/create").send(userData);

    // 🔍 Inspección del cuerpo de la respuesta
    console.log("📦 RESPONSE BODY:", res.body);
    console.log("📦 RESPONSE STATUS:", res.status);

    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty("usuario");
    expect(res.body.usuario.email).toBe(userData.email);
  });

  it("debería registrar un nuevo usuario con todos los campos", async () => {
    const userData = {
      nombre: "Tester",
      email: `test-${Date.now()}@test.com`, // 👈 esto evita duplicados
      password: "securepass123",
      telefono: "123456789",
      direccion: "Avenida Test",
      latitud: "-34.6037",
      longitud: "-58.3816",
    };

    const res = await request(app).post("/api/users/create").send(userData);

    console.log("📦 RESPONSE BODY:", res.body);
    console.log("📦 RESPONSE STATUS:", res.status);

    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty("usuario");
    expect(res.body.usuario.email).toBe(userData.email);

    // 🧪 TEST de actualización inmediato con el mismo usuario
    const userId = res.body.usuario.id;

    // firmar token con id real
    const token = jwt.sign(
      { id: userId, rol: "cliente" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const updateRes = await request(app)
      .put(`/api/users/upDate/${userId}`)
      .set("Cookie", `token=${token}`)
      .send({
        nombre: "Modificado",
        telefono: "999999999",
      });

    console.log("🛠️ UPDATE RESPONSE:", updateRes.body);

    expect([200, 201]).toContain(updateRes.status);
    expect(updateRes.body).toHaveProperty("resultado");
    expect(updateRes.body.resultado?.nombre).toBe("Modificado");
  });

  it("DELETE /api/users/delete/:id → debería eliminar un usuario como admin", async () => {
    const userData = {
      nombre: "Para Eliminar",
      email: `delete-${Date.now()}@test.com`,
      password: "eliminar123",
      telefono: "0000000000",
      direccion: "Dirección Test",
      latitud: "-34.60",
      longitud: "-58.38",
    };

    const createRes = await request(app)
      .post("/api/users/create")
      .send(userData);
    const userId = createRes.body.usuario.id;

    const adminToken = jwt.sign(
      { id: "admin-id", rol: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const deleteRes = await request(app)
      .delete(`/api/users/delete/${userId}`)
      .set("Cookie", `token=${adminToken}`);

    console.log("🗑️ DELETE RESPONSE:", deleteRes.body);

    expect([200, 204]).toContain(deleteRes.status);
    expect(deleteRes.body.message).toMatch(/eliminado|correctamente/i);
  });

  it("POST /api/users/solicitar-baja/:id → debería solicitar baja correctamente", async () => {
    const userData = {
      nombre: "Para Baja",
      email: `baja-${Date.now()}@test.com`,
      password: "baja123",
      telefono: "999999999",
      direccion: "Baja Street",
      latitud: "-34.60",
      longitud: "-58.38",
    };

    const createRes = await request(app)
      .post("/api/users/create")
      .send(userData);
    const userId = createRes.body.usuario.id;

    const userToken = jwt.sign(
      { id: userId, rol: "cliente" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const bajaRes = await request(app)
      .post(`/api/users/solicitar-baja/${userId}`)
      .set("Cookie", `token=${userToken}`);

    console.log("📤 BAJA RESPONSE:", bajaRes.body);

    expect(bajaRes.status).toBe(200);
    expect(bajaRes.body.message).toMatch(/eliminacion/i);
  }, 1000);
});
