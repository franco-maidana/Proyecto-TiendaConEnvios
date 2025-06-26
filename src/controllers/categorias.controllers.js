import {
  Borrar,
  Crear,
  Desactivar,
  Detalle,
  Listar,
  Modificar,
  Reactivar,
} from "../services/categorias.service.js";


export const CrearCategoriaController = async (req, res) => {
  try {
    const id = await Crear(req.body);
    res.status(201).json({ message: 'Categoría creada', id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const ListarCategoriasController = async (req, res) => {
  try {
    const soloActivas = req.query.todas !== 'true';
    const data = await Listar(soloActivas);
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const ObtenerCategoriaController = async (req, res) => {
  try {
    const cat = await Detalle(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Categoría no encontrada' });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const EditarCategoriaController = async (req, res) => {
  try {
    await Modificar(req.params.id, req.body);
    res.json({ message: 'Categoría actualizada' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const DesactivarCategoriaController = async (req, res) => {
  try {
    await Desactivar(req.params.id);
    res.json({ message: 'Categoría desactivada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const ReactivarCategoriaController = async (req, res) => {
  try {
    await Reactivar(req.params.id);
    res.json({ message: 'Categoría reactivada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const BorrarCategoriaDefinitivaController = async (req, res) => {
  try {
    await Borrar(req.params.id);
    res.json({ message: 'Categoría eliminada permanentemente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};