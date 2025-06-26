export const verificarRole = (rolRequerido) => {
  return (req, res, next) => {
    try {
      if (!req.usuario || req.usuario.rol !== rolRequerido) {
        return res.status(403).json({
          StatusCode: 403,
          message: 'Acceso denegado: Usuario con rol insuficiente'
        });
      }

      next(); // ✅ usuario tiene el rol requerido
    } catch (error) {
      next(error);
    }
  };
};
