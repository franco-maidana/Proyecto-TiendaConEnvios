import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    // 🔐 Leer token desde cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Token no presente. Acceso denegado',
      });
    }

    // 🧠 Verificar y decodificar JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Estándar: req.usuario con id y rol
    req.usuario = {
      id: decoded.id,
      rol: decoded.rol,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      statusCode: 401,
      message: 'Token inválido o expirado',
    });
  }
};
