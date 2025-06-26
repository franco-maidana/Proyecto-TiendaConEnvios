// src/config/mercadoPago.js
import dotenv from 'dotenv';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

dotenv.config();

const mercadopago = require('mercadopago');

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

export default mercadopago;
