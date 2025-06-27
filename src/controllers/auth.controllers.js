import * as AuthService from "../services/auth.service.js";
import { registrarIntentoFallido } from "../middlewares/emailLoginRateLimit.js";
import ApiError from "../middlewares/ApiError.js";

// Registrar usuario
export const registrar = async (req, res, next) => {
  try {
    const resultado = await AuthService.registrarUsuario(req.body);
    res.status(201).json({
      mensaje: "Registro exitoso",
      usuario: resultado,
    });
  } catch (err) {
    // Error controlado o inesperado
    next(
      err instanceof ApiError
        ? err
        : new ApiError(err.message || "Error al registrar usuario", 400)
    );
  }
};

// Login
export const login = async (req, res, next) => {
  try {
    const { token, usuario } = await AuthService.loginUsuario(req.body);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 1000 * 60 * 60 * 12,
    });

    res.status(200).json({
      mensaje: "Inicio de sesión exitoso",
      usuario,
    });
  } catch (err) {
    // Rate limiting en login
    if (req.body.email) registrarIntentoFallido(req.body.email);

    // Error por email no verificado
    if (err.message && /verific(a|ar).*correo/i.test(err.message)) {
      return next(new ApiError(err.message, 401));
    }

    // Cualquier otro error de login
    next(
      err instanceof ApiError
        ? err
        : new ApiError("Credenciales inválidas", 401)
    );
  }
};

// Cierre de sesión
export const logout = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return next(new ApiError("No hay sesión iniciada", 400));
  }

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  return res.status(200).json({
    mensaje: "Sesión cerrada correctamente",
  });
};
