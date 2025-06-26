import mercadoPago from '../config/mercadoPago.js';
import { ConfirmarOrdenUsuario } from '../services/ordenes.service.js';

export const WebhookMP = async (req, res) => {
  try {
    const { query } = req;

    if (query.type !== 'payment') return res.sendStatus(200);

    const paymentId = query['data.id'];

    const { body: payment } = await mercadoPago.get(`/v1/payments/${paymentId}`);

    console.log('📩 Webhook payment data:', JSON.stringify(payment, null, 2));

    if (payment.status !== 'approved') return res.sendStatus(200);

    const usuario_id = payment.metadata?.usuario_id;

    if (!usuario_id) return res.sendStatus(400); // falta info crítica

    // Lógica central que lo hace todo: stock, estado, resumen, productos vendidos, movimientos
    await ConfirmarOrdenUsuario(usuario_id);

    return res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error en webhook Mercado Pago:', error.message);
    return res.sendStatus(500);
  }
};
