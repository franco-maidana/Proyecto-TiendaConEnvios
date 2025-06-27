import {
  ObtenerComparativaAnual as ObtenerComparativaAnualService,
  ObtenerComparativaMensual as ObtenerComparativaMensualService,
  ObtenerGananciaPorId as ObtenerGananciaPorIdService,
  ObtenerGananciasDelAnio as ObtenerGananciasDelAnioService,
  ObtenerGananciasDelMes as ObtenerGananciasDelMesService,
  ObtenerGananciasTotales as ObtenerGananciasTotalesService,
} from "../services/ganancias.service.js";
import ApiError from "../middlewares/ApiError.js";

// Ganancias totales
export const ObtenerGanancias = async (req, res, next) => {
  try {
    const data = await ObtenerGananciasTotalesService();
    res.json(data);
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al obtener ganancias totales", 500, error.message)
    );
  }
};

// Ganancia por ID
export const ObtenerGananciaPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await ObtenerGananciaPorIdService(id);
    if (!data) return next(new ApiError('Ganancia no encontrada', 404));
    res.json(data);
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al obtener ganancia por ID", 500, error.message)
    );
  }
};

// Ganancias del mes
export const ObtenerGananciasMes = async (req, res, next) => {
  try {
    const data = await ObtenerGananciasDelMesService();
    res.json(data);
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al obtener ganancias mensuales", 500, error.message)
    );
  }
};

// Ganancias del año
export const ObtenerGananciasAnio = async (req, res, next) => {
  try {
    const data = await ObtenerGananciasDelAnioService();
    res.json(data);
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al obtener ganancias anuales", 500, error.message)
    );
  }
};

// Comparativa mensual
export const ObtenerComparativaMensual = async (req, res, next) => {
  try {
    const data = await ObtenerComparativaMensualService();
    res.json(data);
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al obtener comparativa mensual", 500, error.message)
    );
  }
};

// Comparativa anual
export const ObtenerComparativaAnual = async (req, res, next) => {
  try {
    const data = await ObtenerComparativaAnualService();
    res.json(data);
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al obtener comparativa anual", 500, error.message)
    );
  }
};
