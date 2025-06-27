import {
  EliminarGastoYActualizarBalance,
  ListarGastos,
  ObtenerDetalleGasto,
  RegistrarGastoGeneral,
  ModificarGasto,
  ListarGastosMensuales,
  ResumenAnualGastos
} from "../services/finanzas.service.js";
import ApiError from "../middlewares/ApiError.js";

// Eliminar gasto
export const EliminarGastoController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const gasto_id = parseInt(id);
    if (isNaN(gasto_id)) {
      return next(new ApiError("ID de gasto inválido", 400));
    }
    await EliminarGastoYActualizarBalance(gasto_id);
    return res.status(200).json({
      message: `Gasto con ID ${gasto_id} eliminado correctamente y balance actualizado.`,
    });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al eliminar gasto", 500, error.message)
    );
  }
};

// Crear gasto manual
export const CrearGastoManualController = async (req, res, next) => {
  try {
    const { descripcion, monto, categoria } = req.body;
    await RegistrarGastoGeneral(descripcion, parseFloat(monto), categoria);
    res.status(201).json({ message: "Gasto registrado correctamente" });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al registrar gasto", 500, error.message)
    );
  }
};

// Listar gastos
export const ListarGastosController = async (req, res, next) => {
  try {
    const gastos = await ListarGastos();
    res.status(200).json({ gastos });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al listar gastos", 500, error.message)
    );
  }
};

// Obtener gasto por ID
export const ObtenerGastoPorIdController = async (req, res, next) => {
  try {
    const gasto = await ObtenerDetalleGasto(req.params.id);
    res.status(200).json({ gasto });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al obtener gasto", 500, error.message)
    );
  }
};

// Actualizar gasto
export const ActualizarGastoController = async (req, res, next) => {
  try {
    const id = req.params.id;
    await ModificarGasto(id, req.body);
    res.status(200).json({ message: "Gasto actualizado correctamente" });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al actualizar gasto", 500, error.message)
    );
  }
};

// Listar gastos mensuales
export const GastosMensualesController = async (req, res, next) => {
  try {
    const { anio, mes } = req.body;
    const anioInt = parseInt(anio);
    const mesInt = parseInt(mes);

    if (isNaN(anioInt) || isNaN(mesInt)) {
      return next(
        new ApiError("Parámetros 'anio' y 'mes' son obligatorios y deben ser números.", 400)
      );
    }
    const gastos = await ListarGastosMensuales(anioInt, mesInt);
    res.status(200).json({ gastos });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al listar gastos mensuales", 500, error.message)
    );
  }
};

// Resumen anual de gastos
export const ResumenGastosAnualesController = async (req, res, next) => {
  try {
    const { anio } = req.body;
    const anioInt = parseInt(anio);

    if (isNaN(anioInt)) {
      return next(
        new ApiError("Parámetro 'anio' inválido o faltante", 400)
      );
    }

    const resumen = await ResumenAnualGastos(anioInt);

    if (!resumen || resumen.length === 0) {
      return res.status(200).json({
        message: `No se registraron gastos en el año ${anioInt}`,
        resumen: []
      });
    }

    res.status(200).json({ resumen });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError("Error al obtener resumen anual", 500, error.message)
    );
  }
};
