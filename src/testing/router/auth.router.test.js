import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../../server.js";

describe("🧪 Rutas de Autenticación", () => {
  const nuevoUsuario = {
    nombre: "Test User",
    email: `test${Date.now()}@gmail.com`, // Evita duplicados
    password: "claveSegura123",
    telefono: "123456789",
    direccion: "Calle falsa 123",
    latitud: -34.603722,
    longitud: -58.381592,
  };

  it("POST /api/sessions/registro → debe registrar un nuevo usuario", async () => {
    const res = await request(app)
      .post("/api/sessions/registro")
      .send(nuevoUsuario);

    // Log para depurar si falla
    if (res.status !== 201) {
      console.error("❌ Error en registro:", res.body);
    }

    expect(res.status).toBe(201);
    expect(res.body.usuario).toHaveProperty("id");
    expect(res.body.mensaje).toMatch(/registro/i);
  });

  it("POST /api/sessions/login → debe fallar si no está verificado", async () => {
    const res = await request(app)
      .post("/api/sessions/login")
      .send({
        email: nuevoUsuario.email,
        password: nuevoUsuario.password,
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/verificar tu correo/i);
  });

  it("POST /api/sessions/logout → debe fallar si no hay cookie", async () => {
    const res = await request(app).post("/api/sessions/logout");

    expect(res.status).toBe(400);
    expect(res.body.mensaje).toMatch(/no hay sesión/i);
  });
});
