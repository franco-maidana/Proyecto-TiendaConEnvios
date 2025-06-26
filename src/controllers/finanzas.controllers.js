import {
  EliminarGastoYActualizarBalance,
  ListarGastos,
  ObtenerDetalleGasto,
  RegistrarGastoGeneral,
  ModificarGasto,
  ListarGastosMensuales,
  ResumenAnualGastos
} from "../services/finanzas.service.js";

export const EliminarGastoController = async (req, res) => {
  try {
    const { id } = req.params;

    const gasto_id = parseInt(id);
    if (isNaN(gasto_id)) {
      return res.status(400).json({ message: "ID de gasto inválido" });
    }

    await EliminarGastoYActualizarBalance(gasto_id);

    return res.status(200).json({
      message: `Gasto con ID ${gasto_id} eliminado correctamente y balance actualizado.`,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al eliminar gasto",
      error: error.message,
    });
  }
};

export const CrearGastoManualController = async (req, res) => {
  try {
    const { descripcion, monto, categoria } = req.body;
    await RegistrarGastoGeneral(descripcion, parseFloat(monto), categoria);

    res.status(201).json({ message: "Gasto registrado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al registrar gasto", error: error.message });
  }
};

export const ListarGastosController = async (req, res) => {
  try {
    const gastos = await ListarGastos();
    res.status(200).json({ gastos });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al listar gastos", error: error.message });
  }
};

export const ObtenerGastoPorIdController = async (req, res) => {
  try {
    const gasto = await ObtenerDetalleGasto(req.params.id);
    res.status(200).json({ gasto });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener gasto", error: error.message });
  }
};

export const ActualizarGastoController = async (req, res) => {
  try {
    const id = req.params.id;
    await ModificarGasto(id, req.body);
    res.status(200).json({ message: "Gasto actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar gasto", error: error.message });
  }
};

export const GastosMensualesController = async (req, res) => {
  try {
    const { anio, mes } = req.body;
      
    const anioInt = parseInt(anio);
    const mesInt = parseInt(mes);
      
    if (isNaN(anioInt) || isNaN(mesInt)) {
      return res.status(400).json({
        message: "Parámetros 'anio' y 'mes' son obligatorios y deben ser números."
      });
    }
    const gastos = await ListarGastosMensuales(anio, mes);
    console.log("👉 GASTOS ENCONTRADOS:", gastos);
    res.status(200).json({ gastos });
  } catch (error) {
    res.status(500).json({ message: "Error al listar gastos mensuales", error: error.message });
  }
};

export const ResumenGastosAnualesController = async (req, res) => {
  try {
    const { anio } = req.body;
    const anioInt = parseInt(anio);

    if (isNaN(anioInt)) {
      return res.status(400).json({
        message: "Parámetro 'anio' inválido o faltante"
      });
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
    res.status(500).json({
      message: "Error al obtener resumen anual",
      error: error.message
    });
  }
};

