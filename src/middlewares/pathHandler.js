export default function pathHandler(req, res, next) {
  res.status(404).json({
    status: 404,
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
}
