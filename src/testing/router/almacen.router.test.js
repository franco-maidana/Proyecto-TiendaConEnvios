// src/testing/router/almacen.router.test.js
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../../server.js';

let cookieAdmin;
let insumoId;
let envaseId;

const loginAdmin = {
  email: 'francomaidana094@gmail.com', // asegurate de tener este admin creado y verificado
  password: 'hola1234',
};

describe('🧪 Test de rutas del módulo de almacén', () => {
  beforeAll(async () => {
    const res = await request(app).post('/api/sessions/login').send(loginAdmin);
    expect(res.status).toBe(200);
    cookieAdmin = res.headers['set-cookie'];
  });

  it('POST /api/almacen/create-insumos → debe crear un insumo', async () => {
    const res = await request(app)
      .post('/api/almacen/create-insumos')
      .set('Cookie', cookieAdmin)
      .send({
        nombre: 'Ácido Cítrico',
        tipo: 'seco',
        stock_unidades: 100,
        precio_seco: 200,
      });

    expect(res.status).toBe(201);
    expect(res.body.insumo_id).toBeDefined();
    insumoId = res.body.insumo_id;
  });

  it('POST /api/almacen/create-envases → debe crear un envase', async () => {
    const res = await request(app)
      .post('/api/almacen/create-envases')
      .set('Cookie', cookieAdmin)
      .send({
        tipo: 'Bidón',
        capacidad_litros: 5,
        stock: 50,
        precio_envase: 100,
      });

    expect(res.status).toBe(201);
    expect(res.body.envase_id).toBeDefined();
    envaseId = res.body.envase_id;
  });

  it('GET /api/almacen/insumos → debe listar insumos', async () => {
    const res = await request(app).get('/api/almacen/insumos').set('Cookie', cookieAdmin);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('GET /api/almacen/envases → debe listar envases', async () => {
    const res = await request(app).get('/api/almacen/envases').set('Cookie', cookieAdmin);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('PUT /api/almacen/insumos-up/:id → debe modificar un insumo', async () => {
    const res = await request(app)
      .put(`/api/almacen/insumos-up/${insumoId}`)
      .set('Cookie', cookieAdmin)
      .send({ nombre: 'Ácido Cítrico Modificado' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/modificado/i);
  });

  it('PUT /api/almacen/envases-up/:id → debe modificar un envase', async () => {
    const res = await request(app)
      .put(`/api/almacen/envases-up/${envaseId}`)
      .set('Cookie', cookieAdmin)
      .send({ tipo: 'Botella' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/modificado/i);
  });

  it('DELETE /api/almacen/insumos-del/:id → debe eliminar un insumo', async () => {
    const res = await request(app)
      .delete(`/api/almacen/insumos-del/${insumoId}`)
      .set('Cookie', cookieAdmin);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/eliminado/i);
  });

  it('DELETE /api/almacen/envases-del/:id → debe eliminar un envase', async () => {
    const res = await request(app)
      .delete(`/api/almacen/envases-del/${envaseId}`)
      .set('Cookie', cookieAdmin);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/eliminado/i);
  });
});
