import { ObtenerUsuarioPorId } from "../models/usuario.models.js";
import {
  Crear,
  ListarUsuarios,
  ModificarUsuario,
  SolicitarRecuperacionPassword,
  CambiarPassworPorToken,
  VerificarEmail,
  BorrarUsuario,
  SolicitarEliminacion
} from "../services/usuario.service.js";
import ApiError from "../middlewares/ApiError.js";

// Registro de usuario
export const RegistroUsuario = async (req, res, next) => {
  try {
    const { nombre, email, password, telefono, direccion, latitud, longitud } = req.body;

    const lat = latitud && latitud !== "" ? parseFloat(latitud) : null;
    const long = longitud && longitud !== "" ? parseFloat(longitud) : null;

    if (!nombre || !email || !password || !telefono || !direccion) {
      throw new ApiError(
        "Faltan campos por llenar, por favor revise el formulario y envíelo de nuevo",
        400
      );
    }

    const usuario = await Crear(
      nombre,
      email,
      password,
      telefono,
      direccion,
      lat,
      long
    );

    return res.status(201).json({
      StatusCode: 201,
      message: "Usuario creado correctamente",
      usuario,
    });
  } catch (error) {
    console.error("🔥 Error en RegistroUsuario:", error);

    if (error.message.includes("ya está registrado")) {
      return next(new ApiError(error.message, 409));
    }

    return next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al registrar el usuario", 500, error.message)
    );
  }
};

// Listar usuarios
export const ObtenerTodosLosUsuarios = async (req, res, next) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 10;
    const buscar = req.query.buscar || "";

    const resultado = await ListarUsuarios(pagina, limite, buscar);

    return res.status(200).json({
      StatusCode: 200,
      message: "Usuarios obtenidos correctamente",
      ...resultado,
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar usuario
export const ActualizarDatosUsuario = async (req, res, next) => {
  try {
    const id = req.usuario.id; // ¡Directo desde el JWT decodificado!
    const datos = req.body;
    const rol = req.usuario.rol || "cliente"; // igual desde JWT

    const usuario = await ModificarUsuario(id, datos, rol);

    return res.status(200).json({
      StatusCode: 200,
      message: "Usuario actualizado correctamente",
      resultado: usuario,
    });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError(error.message, 400)
    );
  }
};


// Recuperar password
export const RecuperarPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ApiError("Email requerido", 400);
    }

    await SolicitarRecuperacionPassword(email);

    return res.status(200).json({
      statusCode: 200,
      message: "Se ha enviado un enlace de recuperación a tu email",
    });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al enviar el email", 500, error.message)
    );
  }
};

// Resetear password
export const ResetearPassword = async (req, res, next) => {
  try {
    const { token, nuevaPassword } = req.body;

    await CambiarPassworPorToken(token, nuevaPassword);

    return res.json({
      StatusCode: 200,
      message: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError(error.message, 400)
    );
  }
};

// Confirmar email
export const ConfirmarEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    await VerificarEmail(token);

    return res.status(200).json({
      statusCode: 200,
      message: "Email verificado correctamente. Ahora podés iniciar sesión.",
    });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError(`Error: ${error.message}`, 400)
    );
  }
};

// Eliminar usuario
export const EliminarUsuarioControllers = async (req, res, next) => {
  try {
    const id = req.params.id;

    await BorrarUsuario(id);

    return res.json({
      statusCode: 200,
      message: "Usuario eliminado correctamente",
    });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError(error.message, 404)
    );
  }
};

// Solicitar baja de usuario
export const SolicitaBajaUsuario = async (req, res, next) => {
  try {
    const id = req.usuario.id;

    const usuarios = await ObtenerUsuarioPorId(id);

    if (!usuarios) {
      throw new ApiError("Usuario no encontrado", 404);
    }

    await SolicitarEliminacion(id, usuarios.email);

    return res.json({
      statusCode: 200,
      message: "Se solicitó la eliminacion. Recibirás un email con los detalles",
    });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al solicitar la baja", 500, error.message)
    );
  }
};
