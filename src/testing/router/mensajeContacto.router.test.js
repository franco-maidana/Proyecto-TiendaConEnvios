import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import request from 'supertest';
import app from '../../../server.js';

let cookieCliente;
let cookieAdmin;
let mensajeId;

const cliente = {
  email: 'monifilareto@gmail.com',
  password: 'hola1234',
};

const admin = {
  email: 'francomaidana094@gmail.com',
  password: 'hola1234',
};

beforeAll(async () => {
  const resCliente = await request(app)
    .post('/api/sessions/login')
    .send(cliente);

  cookieCliente = resCliente.headers['set-cookie']?.[0];
  if (!cookieCliente) throw new Error('No se pudo autenticar cliente');

  const resAdmin = await request(app)
    .post('/api/sessions/login')
    .send(admin);

  cookieAdmin = resAdmin.headers['set-cookie']?.[0];
  if (!cookieAdmin) throw new Error('No se pudo autenticar admin');
});

afterAll(async () => {
  // No hace falta cerrar conexiones manualmente en este caso
});

describe('📩 Test de rutas de mensaje de contacto', () => {
  it('POST /api/mensaje/enviar → debe crear un mensaje público', async () => {
    const res = await request(app)
      .post('/api/mensaje/enviar')
      .set('Cookie', cookieCliente)
      .send({
        asunto: 'Consulta de prueba',
        mensaje: 'Este es un mensaje de prueba desde test',
        remitente: 'cliente'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    mensajeId = res.body.id;
  });

  it('GET /api/mensaje/listado → debe listar mensajes iniciales', async () => {
    const res = await request(app)
      .get('/api/mensaje/listado')
      .set('Cookie', cookieAdmin);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/mensaje/listado/:id/conversacion → debe listar una conversación', async () => {
    const res = await request(app)
      .get(`/api/mensaje/listado/${mensajeId}/conversacion`)
      .set('Cookie', cookieAdmin);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/mensaje/:id/responder → debe responder un mensaje', async () => {
    const res = await request(app)
      .post(`/api/mensaje/mensajes/${mensajeId}/responder`)
      .set('Cookie', cookieAdmin)
      .send({
        mensaje: 'Respuesta de prueba',
        remitente: 'admin'
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Respuesta enviada');
  });

  it('GET /api/mensaje/mensajes/no-leidos?remitente=cliente → debe listar no leídos', async () => {
    const res = await request(app)
      .get('/api/mensaje/mensajes/no-leidos?remitente=cliente')
      .set('Cookie', cookieAdmin);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('PUT /api/mensaje/:id/marcar-leido → debe marcar mensaje como leído', async () => {
    const res = await request(app)
      .put(`/api/mensaje/mensajes/${mensajeId}/marcar-leido`)
      .set('Cookie', cookieAdmin);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(`Mensaje ${mensajeId} marcado como leído`);

  });
});
