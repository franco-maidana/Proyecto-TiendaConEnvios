import { describe, it, expect, beforeEach } from 'vitest';
import * as CategoriaService from '../../services/categorias.service.js';
import Conexion from './../../config/db.js';

let categoriaId;

beforeEach(async () => {
  // Borra todas las tablas dependientes, de la más hija a la más padre
  await Conexion.query("DELETE FROM valoraciones");
  await Conexion.query("DELETE FROM productos_vendidos");
  await Conexion.query("DELETE FROM ordenes_simplificadas");
  await Conexion.query("DELETE FROM productos_limpieza");
  await Conexion.query("DELETE FROM categorias");
});

describe('CategoriaService', () => {
  it('debería crear una categoría correctamente', async () => {
    categoriaId = await CategoriaService.Crear({ nombre: 'Limpieza', descripcion: 'Productos de limpieza' });
    expect(typeof categoriaId).toBe('number');
  });

  it('debería listar categorías activas', async () => {
    await CategoriaService.Crear({ nombre: 'Ropa' });
    const categorias = await CategoriaService.Listar();
    expect(categorias).toHaveLength(1);
    expect(categorias[0]).toHaveProperty('nombre', 'Ropa');
  });

  it('debería retornar el detalle de una categoría por ID', async () => {
    const id = await CategoriaService.Crear({ nombre: 'Higiene' });
    const categoria = await CategoriaService.Detalle(id);
    expect(categoria).toHaveProperty('nombre', 'Higiene');
  });

  it('debería modificar una categoría correctamente', async () => {
    const id = await CategoriaService.Crear({ nombre: 'Vieja' });
    await CategoriaService.Modificar(id, { nombre: 'Nueva' });
    const actualizada = await CategoriaService.Detalle(id);
    expect(actualizada.nombre).toBe('Nueva');
  });

  it('debería desactivar una categoría', async () => {
    const id = await CategoriaService.Crear({ nombre: 'Temporal' });
    await CategoriaService.Desactivar(id);
    const categorias = await CategoriaService.Listar(); // solo activas
    expect(categorias.length).toBe(0);
  });

  it('debería reactivar una categoría', async () => {
    const id = await CategoriaService.Crear({ nombre: 'Reactivable' });
    await CategoriaService.Desactivar(id);
    await CategoriaService.Reactivar(id);
    const categorias = await CategoriaService.Listar();
    expect(categorias[0].activo).toBe(1);
  });

  it('debería borrar una categoría definitivamente', async () => {
    const id = await CategoriaService.Crear({ nombre: 'Borrar' });
    await CategoriaService.Borrar(id);
    const detalle = await CategoriaService.Detalle(id);
    expect(detalle).toBeUndefined();
  });

  it('debería lanzar error si se crea sin nombre', async () => {
    await expect(() =>
      CategoriaService.Crear({ descripcion: 'Sin nombre' })
    ).rejects.toThrow('El nombre es obligatorio');
  });

  it('debería lanzar error si se intenta modificar con datos inválidos', async () => {
    const id = await CategoriaService.Crear({ nombre: 'Valida' });
    await expect(() =>
      CategoriaService.Modificar(id, null)
    ).rejects.toThrow('Datos inválidos');
  });
});
