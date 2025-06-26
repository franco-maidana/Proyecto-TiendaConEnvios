import { describe, it, expect, vi, beforeEach } from "vitest";

import * as AuthService from "../../services/auth.service.js";
import * as UsuarioModel from "../../models/usuario.models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Mocks con vi
vi.mock("../../models/usuario.models.js");
vi.mock("bcrypt");
vi.mock("jsonwebtoken");

describe("AuthService - registrarUsuario", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debería registrar un usuario nuevo correctamente", async () => {
    UsuarioModel.ObtenerUsuarioPorEmail.mockResolvedValue(null);
    UsuarioModel.CrearUsuario.mockResolvedValue({
      id: 1,
      nombre: "Tester",
      email: "test@example.com",
    });

    const result = await AuthService.registrarUsuario({
      nombre: "Tester",
      email: "test@example.com",
      password: "12345678",
      telefono: "123456",
      direccion: "Fake Street",
      latitud: null,
      longitud: null,
    });

    expect(result).toMatchObject({
      mensaje: "Usuario registrado exitosamente",
      nombre: "Tester",
      email: "test@example.com",
    });
  });

  it("debería fallar si el email ya está registrado", async () => {
    UsuarioModel.ObtenerUsuarioPorEmail.mockResolvedValue({
      email: "test@example.com",
    });

    await expect(
      AuthService.registrarUsuario({
        nombre: "Tester",
        email: "test@example.com",
        password: "12345678",
        telefono: "123456",
        direccion: "Fake Street",
        latitud: null,
        longitud: null,
      })
    ).rejects.toThrow("El correo ya está registrado");
  });
});

describe("AuthService - loginUsuario", () => {
  const fakeUser = {
    id: 1,
    nombre: "Tester",
    email: "test@example.com",
    password: "hashed_password",
    rol: "cliente",
    email_verificado: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    UsuarioModel.ObtenerUsuarioPorEmail = vi.fn();
    bcrypt.compare = vi.fn();
    jwt.sign = vi.fn();
  });

  it("debería loguear si email y password son válidos", async () => {
    UsuarioModel.ObtenerUsuarioPorEmail.mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("FAKE_TOKEN");

    const res = await AuthService.loginUsuario({
      email: "test@example.com",
      password: "12345678",
    });

    expect(res.token).toBe("FAKE_TOKEN");
    expect(res.usuario).toMatchObject({
      id: 1,
      email: "test@example.com",
      rol: "cliente",
    });
  });

  it("debería rechazar login si no existe el usuario", async () => {
    UsuarioModel.ObtenerUsuarioPorEmail.mockResolvedValue(null);

    await expect(
      AuthService.loginUsuario({
        email: "notfound@example.com",
        password: "12345678",
      })
    ).rejects.toThrow("Credenciales inválidas");
  });

  it("debería rechazar login si el email no está verificado", async () => {
  UsuarioModel.ObtenerUsuarioPorEmail.mockResolvedValue({
    ...fakeUser,
    email_verificado: 0,
  });
  bcrypt.compare.mockResolvedValue(true); // <- necesario

  await expect(
    AuthService.loginUsuario({
      email: "test@example.com",
      password: "12345678",
    })
  ).rejects.toThrow(/verificar tu correo/i);
});


  it("debería rechazar login si la password es incorrecta", async () => {
    UsuarioModel.ObtenerUsuarioPorEmail.mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(false);

    await expect(
      AuthService.loginUsuario({
        email: "test@example.com",
        password: "wrongpass",
      })
    ).rejects.toThrow("Credenciales inválidas");
  });
});
