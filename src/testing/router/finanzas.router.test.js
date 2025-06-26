// testing/router/finanzas.router.test.js
import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import request from 'supertest';
import app from '../../../server.js';
import Conexion from '../../config/db.js';

let cookieAdmin;
let gastoId;

const loginAdmin = {
  email: 'francomaidana094@gmail.com',
  password: 'hola1234'
};

beforeAll(async () => {
  const res = await request(app).post('/api/sessions/login').send(loginAdmin);
  expect(res.status).toBe(200);
  cookieAdmin = res.headers['set-cookie'];
});

afterAll(async () => {
  await Conexion.end();
});

describe('🧪 Test de rutas de finanzas', () => {
  it('POST /api/finanzas/gastos/manual → debe crear un gasto', async () => {
    const nuevoGasto = {
      descripcion: 'Compra de insumos test',
      monto: 1234.56,
      categoria: 'insumos'
    };

    const res = await request(app)
      .post('/api/finanzas/gastos/manual')
      .set('Cookie', cookieAdmin)
      .send(nuevoGasto);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Gasto registrado correctamente');
  });

  it('GET /api/finanzas/gastos → debe listar gastos', async () => {
    const res = await request(app)
      .get('/api/finanzas/gastos')
      .set('Cookie', cookieAdmin);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.gastos)).toBe(true);
    gastoId = res.body.gastos[0]?.id; // Guarda un ID para pruebas siguientes
  });

  it('GET /api/finanzas/gastos/:id → debe obtener gasto por ID', async () => {
    const res = await request(app)
      .get(`/api/finanzas/gastos/${gastoId}`)
      .set('Cookie', cookieAdmin);

    expect(res.status).toBe(200);
    expect(res.body.gasto).toHaveProperty('id', gastoId);
  });

  it('PUT /api/finanzas/upDate/:id → debe actualizar un gasto', async () => {
    const res = await request(app)
      .put(`/api/finanzas/upDate/${gastoId}`)
      .set('Cookie', cookieAdmin)
      .send({ descripcion: 'Gasto actualizado' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Gasto actualizado correctamente');
  });

  it('GET /api/finanzas/gastos/mensuales → debe listar gastos mensuales', async () => {
    const res = await request(app)
      .get('/api/finanzas/gastos/mensuales')
      .set('Cookie', cookieAdmin)
      .send({ anio: new Date().getFullYear(), mes: new Date().getMonth() + 1 });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.gastos)).toBe(true);
  });

  it('GET /api/finanzas/gastos/resumen → debe obtener resumen anual', async () => {
    const res = await request(app)
      .get('/api/finanzas/gastos/resumen')
      .set('Cookie', cookieAdmin)
      .send({ anio: new Date().getFullYear() });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('resumen');
  });

  it('DELETE /api/finanzas/eliminar/:id → debe eliminar un gasto', async () => {
    const res = await request(app)
      .delete(`/api/finanzas/eliminar/${gastoId}`)
      .set('Cookie', cookieAdmin);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('eliminado correctamente');
  });
});
