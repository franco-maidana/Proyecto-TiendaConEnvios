import {
  CrearEnvaseConGasto,
  CrearInsumoConGasto,
  ListarInsumos,
  ListarEnvases,
  ModificarInsumo,
  ModificarEnvase,
  BorrarEnvase,
  BorrarInsumo,
} from "../services/almacen.service.js";

export const CrearInsumoController = async (req, res) => {
  try {
    const {
      nombre,
      tipo, // 'liquido' o 'seco'
      stock_litros = 0,
      stock_unidades = 0,
      precio_litro = 0,
      precio_seco = 0,
    } = req.body;

    // Convertir strings numéricos a número real si vienen de Postman
    const insumo_id = await CrearInsumoConGasto({
      nombre,
      tipo,
      stock_litros: parseFloat(stock_litros),
      stock_unidades: parseInt(stock_unidades),
      precio_litro: parseFloat(precio_litro),
      precio_seco: parseFloat(precio_seco),
    });

    return res.status(201).json({
      statusCode: 201,
      message: "Insumo creado correctamente",
      insumo_id,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al crear insumo",
      error: error.message,
    });
  }
};

export const CrearEnvaseController = async (req, res) => {
  try {
    const { tipo, capacidad_litros, stock, precio_envase } = req.body;
    const id = await CrearEnvaseConGasto(
      tipo,
      parseFloat(capacidad_litros),
      parseInt(stock),
      parseFloat(precio_envase)
    );

    return res.status(201).json({
      statusCode: 201,
      message: "Envase creado correctamente",
      envase_id: id,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al crear envase", error: error.message });
  }
};

export const VerInsumosController = async (req, res) => {
  try {
    const data = await ListarInsumos();
    res.json({ statusCode: 200, data });
  } catch (err) {
    res.status(500).json({ message: 'Error al listar insumos', error: err.message });
  }
};

export const VerEnvasesController = async (req, res) => {
  try {
    const data = await ListarEnvases();
    res.json({ statusCode: 200, data });
  } catch (err) {
    res.status(500).json({ message: 'Error al listar envases', error: err.message });
  }
};

export const EditarInsumoController = async (req, res) => {
  try {
    await ModificarInsumo(req.params.id, req.body);
    res.json({ statusCode: 200, message: 'Insumo modificado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al modificar insumo', error: err.message });
  }
};

export const EditarEnvaseController = async (req, res) => {
  try {
    await ModificarEnvase(req.params.id, req.body);
    res.json({ statusCode: 200, message: 'Envase modificado correctamente' });
  } catch (err) {
    console.error('❌ ERROR en EditarEnvaseController:', err.message);
    res.status(500).json({ message: 'Error al modificar envase', error: err.message });
  }
};


export const EliminarInsumoController = async (req, res) => {
  try {
    await BorrarInsumo(req.params.id);
    res.json({ statusCode: 200, message: 'Insumo eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar insumo', error: err.message });
  }
};

export const EliminarEnvaseController = async (req, res) => {
  try {
    await BorrarEnvase(req.params.id);
    res.json({ statusCode: 200, message: 'Envase eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar envase', error: err.message });
  }
};