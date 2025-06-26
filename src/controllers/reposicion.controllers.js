import {ReponerStock} from '../services/reposicion.service.js'

export const ReposicionController = async (req, res) => {
  try {
    const { tipo, id, cantidad, precio_unitario, descripcion } = req.body;

    if (!id || !cantidad || !precio_unitario) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const resultado = await ReponerStock({ tipo, id, cantidad, precio_unitario, descripcion });

    return res.status(200).json({
      statusCode: 200,
      message: `Reposición registrada correctamente para ${resultado.nombre}`,
      gasto_registrado: resultado.monto
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error al registrar reposición',
      error: error.message
    });
  }
};