import {
  ActualizarCategoria,
  BorrarCategoriaDefinitivamente,
  CrearCategoria,
  EliminarCategoria,
  ObtenerCategoriaPorId,
  ObtenerCategorias,
  ReactivarCategoria,
} from "../models/categorias.models.js";


export const Crear = async ({ nombre, descripcion }) => {
  if (!nombre) throw new Error('El nombre es obligatorio');
  return await CrearCategoria(nombre, descripcion);
};

export const Listar = async (soloActivas = true) => {
  return await ObtenerCategorias(soloActivas);
};

export const Detalle = async (id) => {
  return await ObtenerCategoriaPorId(id);
};

export const Modificar = async (id, campos) => {
  if (!campos || typeof campos !== 'object') throw new Error('Datos inválidos');
  await ActualizarCategoria(id, campos);
};

export const Desactivar = async (id) => {
  await EliminarCategoria(id);
};

export const Reactivar = async (id) => {
  await ReactivarCategoria(id);
};

export const Borrar = async (id) => {
  await BorrarCategoriaDefinitivamente(id);
};