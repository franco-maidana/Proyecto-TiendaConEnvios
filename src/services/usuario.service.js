import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  CrearUsuario,
  ObtenemosUsuarios,
  ContarUsuario,
  ActualizarUsuario,
  ObtenerUsuarioPorId,
  GuardarTokenRecuperacion,
  ActualizarPassword,
  ObtenerUsuarioPorToken,
  VerificarEmailUsuario,
  EliminarUsuario,
  SolicitarEliminacionUsuario,
  ObtenerUsuarioPorEmail,
} from "../models/usuario.models.js";
import {
  enviarEmailVerificacion,
  enviarRecuperacionPassword,
  enviarSolicitudEliminacion
} from "./email.service.js"; // <- tu nuevo servicio

// CREAR USUARIO Y ENVIAR MAIL
export const Crear = async (
  nombre,
  email,
  password,
  telefono,
  direccion,
  latitud,
  longitud
) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const verificacion_token = crypto.randomBytes(32).toString("hex");
    const verificacion_expira = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24hs

    // creamos el usuario con el token incluido
    const usuario = await CrearUsuario(
      nombre,
      email,
      passwordHash,
      telefono,
      direccion,
      latitud,
      longitud,
      verificacion_token,
      verificacion_expira
    );

    // envía mail con el servicio externo
    await enviarEmailVerificacion(email, verificacion_token);

    return usuario;
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("El email ya está registrado, intenta con otro.");
    }
    throw error;
  }
};

// LISTAR USUARIOS
export const ListarUsuarios = async (pagina = 1, limite = 10, buscar = "") => {
  const offset = (pagina - 1) * limite;
  const total = await ContarUsuario(buscar);
  const usuarios = await ObtenemosUsuarios(limite, offset, buscar);
  const totalPagina = Math.ceil(total / limite);

  return {
    usuarios,
    total,
    totalPagina,
    paginaActual: pagina,
  };
};

// MODIFICAR USUARIO
export const ModificarUsuario = async (id, datos, rol = "cliente") => {
  if ("password" in datos) {
    throw new Error("No se permite modificar la contraseña por este medio");
  }

  const usuarioExistente = await ObtenerUsuarioPorId(id);
  if (!usuarioExistente) {
    throw new Error("Usuario no encontrado");
  }

  const camposPermitidos = [
    "nombre",
    "telefono",
    "direccion",
    "latitud",
    "longitud",
  ];
  if (rol === "admin") camposPermitidos.push("email");

  const camposFiltrados = {};

  for (const campo of camposPermitidos) {
    const valor = datos[campo];
    if (valor !== undefined && valor !== null && valor !== "") {
      camposFiltrados[campo] =
        campo === "latitud" || campo === "longitud"
          ? parseFloat(valor)
          : valor;
    }
  }

  if (Object.keys(camposFiltrados).length === 0) {
    throw new Error("No se enviaron campos válidos para modificar");
  }

  await ActualizarUsuario(id, camposFiltrados);
  const usuarioActualizado = await ObtenerUsuarioPorId(id);
  return usuarioActualizado;
};

// CAMBIAR PASSWORD POR TOKEN
export const CambiarPassworPorToken = async (token, nuevaPassword) => {
  if (!token || !nuevaPassword) {
    throw new Error("Token y nueva contraseña son requeridas");
  }

  const usuario = await ObtenerUsuarioPorToken(token);
  if (!usuario) {
    throw new Error("Token invalido");
  }

  if (new Date(usuario.verficacion_expira) < new Date()) {
    throw new Error("El enlace ha expirado");
  }

  // validacion de seguridad
  const cumpleRequisitos = /^(?=.*\d).{8,}$/.test(nuevaPassword);
  if (!cumpleRequisitos) {
    throw new Error(
      "La contraseña debe tener al menos 8 caracteres y un número"
    );
  }

  const passwordHasheada = await bcrypt.hash(nuevaPassword, 10);
  await ActualizarPassword(usuario.id, passwordHasheada);

  return true;
};

// VERIFICAR EMAIL
export const VerificarEmail = async (token) => {
  const usuario = await ObtenerUsuarioPorToken(token);
  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  await VerificarEmailUsuario(token);
  return true;
};

// BORRAR USUARIO
export const BorrarUsuario = async (id) => {
  const usuario = await ObtenerUsuarioPorId(id);
  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }
  const resultado = await EliminarUsuario(id);
  if (resultado.affectedRows === 0) {
    throw new Error("Usuario no encontrado");
  }
  return resultado; // 🧠 devuelve el objeto entero
};

// SOLICITAR RECUPERACION PASSWORD
export const SolicitarRecuperacionPassword = async (email) => {
  const token = crypto.randomBytes(32).toString("hex");
  const expiracion = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

  // Guardamos token y expiracion
  await GuardarTokenRecuperacion(email, token, expiracion);

  // LLAMA al servicio de emails externo:
  await enviarRecuperacionPassword(email, token);

  return true;
};

// SOLICITAR ELIMINACION (con email)
export const SolicitarEliminacion = async (id, email) => {
  await SolicitarEliminacionUsuario(id);

  const fechaEliminacion = new Date();
  fechaEliminacion.setHours(fechaEliminacion.getHours() + 48);
  const fechaFormateada = fechaEliminacion.toLocaleString("es-AR");

  // LLAMA al servicio de emails externo:
  await enviarSolicitudEliminacion(email, fechaFormateada);

  return true;
};
