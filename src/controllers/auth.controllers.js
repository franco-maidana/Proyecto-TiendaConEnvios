import * as AuthService from "../services/auth.service.js";
import { registrarIntentoFallido } from "../middlewares/emailLoginRateLimit.js";

export const registrar = async (req, res) => {
  try {
    const resultado = await AuthService.registrarUsuario(req.body);
    res.status(201).json({
      mensaje: "Registro exitoso",
      usuario: resultado,
    });
  } catch (err) {
    console.error("❌ Error en registrar:", err); // 👉 Log del error en consola
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
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
    if (req.body.email) registrarIntentoFallido(req.body.email);

    if (err.message && /verific(a|ar).*correo/i.test(err.message)) {
      return res.status(401).json({ error: err.message });
    }

    res.status(401).json({ error: "Credenciales inválidas" });
  }
};

// cierre de uan sessions
export const logout = (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(400).json({
      mensaje: "No hay sesión iniciada",
    });
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
