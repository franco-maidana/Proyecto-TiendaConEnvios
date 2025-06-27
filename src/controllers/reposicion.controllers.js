import { ReponerStock } from "../services/reposicion.service.js";
import ApiError from "../middlewares/ApiError.js";

export const ReposicionController = async (req, res, next) => {
  try {
    const { tipo, id, cantidad, precio_unitario, descripcion } = req.body;

    if (!id || !cantidad || !precio_unitario) {
      throw new ApiError("Faltan campos obligatorios", 400, "Faltan campos obligatorios");
    }

    const resultado = await ReponerStock({
      tipo,
      id,
      cantidad,
      precio_unitario,
      descripcion,
    });

    return res.status(200).json({
      statusCode: 200,
      message: `Reposición registrada correctamente para ${resultado.nombre}`,
      gasto_registrado: resultado.monto,
    });
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError(
            "Error al registrar reposición", // va en .message
            500,
            "Error inesperado" // va en .error
          )
    );
  }
};