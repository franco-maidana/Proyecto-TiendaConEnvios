export default function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || 500;
  const url = req.originalUrl;

  const isAuthRoute = url.includes('/sessions') || url.includes('/auth');
  const isOrdenesRoute = url.includes('/ordenes') || url.includes('/ordenLocal');
  const isReposicionRoute = url.includes('/reposicion'); // <-- Agregalo

  let customErrorMsg;

  // Ordenes/carrito y reposición: error genérico SIEMPRE
  if (isOrdenesRoute || isReposicionRoute) {
    customErrorMsg = "Error inesperado";
  }
  // Auth: mostrar mensaje real SOLO en 400/401, si no error genérico
  else if (isAuthRoute && (status === 400 || status === 401)) {
    customErrorMsg = err.message || "Error";
  }
  // Todos los otros: mostrar SIEMPRE el mensaje real
  else {
    customErrorMsg = err.message || "Error inesperado";
  }

  res.status(status).json({
    statusCode: status,
    message: err.message || 'Error interno del servidor',
    mensaje: err.message || 'Error interno del servidor',
    error: customErrorMsg,
  });
}
