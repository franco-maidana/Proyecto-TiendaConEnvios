class ApiError extends Error {
  /**
   * @param {string} message - Descripción del error
   * @param {number} statusCode - Código HTTP (ej: 404, 500)
   * @param {any} [details] - Información adicional (opcional)
   */
  constructor(message, statusCode, details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    if (details) this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError
