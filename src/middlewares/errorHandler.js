export default function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  res.status(status).json({
    status,
    message: err.message || 'Error interno del servidor'
  });
}
