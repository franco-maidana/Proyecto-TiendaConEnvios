// tests/services/usuario.service.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as UsuarioService from "../../services/usuario.service.js";
import * as UsuarioModel from "../../models/usuario.models.js";

// Mocks correctos
vi.mock("../../models/usuario.models.js", () => ({
  ObtenerUsuarioPorId: vi.fn(),
  ActualizarUsuario: vi.fn(),
  ObtenemosUsuarios: vi.fn(),
  ContarUsuario: vi.fn(),
  ActualizarRolUsuario: vi.fn(),
  EliminarUsuario: vi.fn(),
  ObtenerUsuarioPorEmail: vi.fn(),
  VerificarEmailUsuario: vi.fn(),
  ObtenerUsuarioPorToken: vi.fn(), 
}));

describe("UsuarioService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debería listar usuarios paginados", async () => {
    UsuarioModel.ObtenemosUsuarios.mockResolvedValue([{ id: 1, nombre: "Usuario1" }]);
    UsuarioModel.ContarUsuario.mockResolvedValue(1);

    const result = await UsuarioService.ListarUsuarios(1);
    expect(result).toEqual({
      usuarios: [{ id: 1, nombre: "Usuario1" }],
      total: 1,
      paginaActual: 1,
      totalPagina: 1
    });
  });

  it("debería actualizar un usuario", async () => {
    const id = 1;

    // ⚠️ Este es el resultado que usará el service al final
    const mockUsuarioActualizado = {
      id,
      nombre: "Nuevo",
      telefono: "123456789",
      direccion: "Calle 123",
      latitud: 0,
      longitud: 0,
      rol: "cliente",
      email: "mock@mail.com",
      email_verificado: 1,
      created_at: "2025-06-01",
    };

    // 👇 Este es el que se devolverá tras la actualización
    UsuarioModel.ObtenerUsuarioPorId.mockResolvedValue(mockUsuarioActualizado);
    UsuarioModel.ActualizarUsuario.mockResolvedValue({});

    const result = await UsuarioService.ModificarUsuario(id, {
      nombre: "Nuevo",
      telefono: "123456789",
      direccion: "Calle 123",
      latitud: 0,
      longitud: 0,
    });

    // 🔍 Check completo del resultado final
    expect(result).toEqual(mockUsuarioActualizado);
  });

  it("debería lanzar error si el usuario no existe al actualizar", async () => {
    UsuarioModel.ObtenerUsuarioPorId.mockResolvedValue(null);
    await expect(UsuarioService.ModificarUsuario(99, { nombre: "X" }))
      .rejects.toThrow("Usuario no encontrado");
  });

  it("debería eliminar usuario", async () => {
    UsuarioModel.ObtenerUsuarioPorId.mockResolvedValue({ id: 1 });
    UsuarioModel.EliminarUsuario.mockResolvedValue({ affectedRows: 1 });
    const result = await UsuarioService.BorrarUsuario(1);
    expect(result).toEqual({ affectedRows: 1 });
  });

  it("debería lanzar error si usuario no existe al eliminar", async () => {
    UsuarioModel.ObtenerUsuarioPorId.mockResolvedValue(null);
    await expect(UsuarioService.BorrarUsuario(123))
      .rejects.toThrow("Usuario no encontrado");
  });

  it("debería verificar email correctamente", async () => {
    const mockUsuario = { id: 1, email_verificado: 0 };
    UsuarioModel.ObtenerUsuarioPorToken.mockResolvedValue(mockUsuario);
    UsuarioModel.VerificarEmailUsuario.mockResolvedValue(true);
    const result = await UsuarioService.VerificarEmail("token-valido");
    expect(result).toBe(true);
  });

  it("debería lanzar error al verificar email inexistente", async () => {
    UsuarioModel.ObtenerUsuarioPorToken.mockResolvedValue(null);
  
    await expect(
      UsuarioService.VerificarEmail("fake-token-123")
    ).rejects.toThrow("Usuario no encontrado");
  });

});
