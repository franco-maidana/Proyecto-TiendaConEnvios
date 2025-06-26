// testing/router/ganancias.router.test.js
import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import request from 'supertest';
import app from '../../../server.js';

let cookieAdmin;

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
  // Limpieza o cierre opcional
});

describe('🧪 Test de rutas protegidas de ganancias', () => {
  it('GET /api/ganancias → debe obtener las ganancias totales', async () => {
    const res = await request(app)
      .get('/api/ganancias')
      .set('Cookie', cookieAdmin);

    expect(res.status).toBe(200);
    expect(res.body).toBeTypeOf('object');
  });

  it('GET /api/ganancias/1 → debe obtener una ganancia por ID', async () => {
    const res = await request(app)
      .get('/api/ganancias/1')
      .set('Cookie', cookieAdmin);

    // El ID 1 debería existir; si no, actualizá este ID por uno válido
    expect([200, 404]).toContain(res.status);
  });

  it('GET /api/ganancias/mes/actual → debe obtener las ganancias del mes actual', async () => {
    const res = await request(app)
      .get('/api/ganancias/mes/actual')
      .set('Cookie', cookieAdmin);

    expect(res.status).toBe(200);
    expect(res.body).toBeTypeOf('object');
  });

  it('GET /api/ganancias/anio/actual → debe obtener las ganancias del año actual', async () => {
    const res = await request(app)
      .get('/api/ganancias/anio/actual')
      .set('Cookie', cookieAdmin);

    expect(res.status).toBe(200);
    expect(res.body).toBeTypeOf('object');
  });

  it('GET /api/ganancias/comparativa/mensual → debe obtener comparativa mensual', async () => {
    const res = await request(app)
      .get('/api/ganancias/comparativa/mensual')
      .set('Cookie', cookieAdmin);

    expect(res.status).toBe(200);
    expect(res.body).toBeTypeOf('object');
  });

  it('GET /api/ganancias/comparativa/anual → debe obtener comparativa anual', async () => {
    const res = await request(app)
      .get('/api/ganancias/comparativa/anual')
      .set('Cookie', cookieAdmin);

    expect(res.status).toBe(200);
    expect(res.body).toBeTypeOf('object');
  });
});
