import { enviarAlertaIntentosFallidos } from "../services/mail.service.js"; // Ajusta el path si es necesario

const intentosPorEmail = new Map();
const LIMITE_INTENTOS = 5; // intentos fallidos permitidos
const VENTANA_TIEMPO_MS = 15 * 60 * 1000; // 15 minutos en ms

export const emailLoginRateLimiter = (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(); // Si no hay email, sigue (que lo valide otro middleware)

  const ahora = Date.now();
  let registro = intentosPorEmail.get(email);

  if (!registro) {
    registro = { count: 0, firstAttempt: ahora, avisoEnviado: false };
    intentosPorEmail.set(email, registro);
  }

  // Si la ventana de tiempo expiró, reiniciamos el contador y el aviso
  if (ahora - registro.firstAttempt > VENTANA_TIEMPO_MS) {
    registro.count = 0;
    registro.firstAttempt = ahora;
    registro.avisoEnviado = false;
  }

  if (registro.count >= LIMITE_INTENTOS) {
    // Enviar solo UN mail de alerta por ventana de tiempo
    if (!registro.avisoEnviado) {
      enviarAlertaIntentosFallidos(email, registro.count).catch(console.error);
      registro.avisoEnviado = true;
    }
    const retryAfter = Math.ceil((VENTANA_TIEMPO_MS - (ahora - registro.firstAttempt)) / 1000);
    return res.status(429).json({
      status: 429,
      error: "Demasiados intentos fallidos con este usuario/email. Intenta de nuevo más tarde.",
      retryAfter
    });
  }

  req._registroLoginRateLimit = registro;
  next();
};

// Cuando el login realmente falla, llama a esto:
export const registrarIntentoFallido = (email) => {
  if (!email) return;
  const ahora = Date.now();
  let registro = intentosPorEmail.get(email);
  if (!registro) {
    registro = { count: 0, firstAttempt: ahora, avisoEnviado: false };
    intentosPorEmail.set(email, registro);
  }
  registro.count += 1;
};
