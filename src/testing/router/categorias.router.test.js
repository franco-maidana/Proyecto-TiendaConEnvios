// testing/router/categorias.router.test.js
import { describe, it, beforeAll, expect } from 'vitest';
import request from 'supertest';
import app from '../../../server.js';

let cookieAdmin;
let categoriaId;

const loginAdmin = {
  email: 'francomaidana094@gmail.com',
  password: 'hola1234'
};

beforeAll(async () => {
  const res = await request(app).post('/api/sessions/login').send(loginAdmin);
  expect(res.status).toBe(200);
  cookieAdmin = res.headers['set-cookie'];
});

describe('🧪 Test de rutas de categorías', () => {
  it('POST /api/categorias/crear → debe crear una categoría', async () => {
    const nuevaCategoria = { nombre: 'Test Categoría' };

    const res = await request(app)
      .post('/api/categorias/crear')
      .set('Cookie', cookieAdmin)
      .send(nuevaCategoria);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    categoriaId = res.body.id;
  });

  it('GET /api/categorias/listado → debe listar categorías', async () => {
    const res = await request(app).get('/api/categorias/listado');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/categorias/listado/:id → debe obtener categoría por ID', async () => {
    const res = await request(app).get(`/api/categorias/listado/${categoriaId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', categoriaId);
  });

  it('PUT /api/categorias/upDate/:id → debe editar una categoría', async () => {
    const res = await request(app)
      .put(`/api/categorias/upDate/${categoriaId}`)
      .set('Cookie', cookieAdmin)
      .send({ nombre: 'Nombre Actualizado' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Categoría actualizada');
  });

  it('PUT /api/categorias/upDate/:id/desactivar → debe desactivar una categoría', async () => {
    const res = await request(app)
      .put(`/api/categorias/upDate/${categoriaId}/desactivar`)
      .set('Cookie', cookieAdmin);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Categoría desactivada');
  });

  it('PUT /api/categorias/upDate/:id/reactivar → debe reactivar una categoría', async () => {
    const res = await request(app)
      .put(`/api/categorias/upDate/${categoriaId}/reactivar`)
      .set('Cookie', cookieAdmin);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Categoría reactivada');
  });

  it('DELETE /api/categorias/destroi/:id → debe eliminar una categoría', async () => {
    const res = await request(app)
      .delete(`/api/categorias/destroi/${categoriaId}`)
      .set('Cookie', cookieAdmin);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Categoría eliminada permanentemente');
  });
});
