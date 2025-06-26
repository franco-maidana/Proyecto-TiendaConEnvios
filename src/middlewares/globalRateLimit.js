import rateLimit from "express-rate-limit";

const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP cada 15 minutos (ajusta si necesitas más o menos)
  message: {
    status: 429,
    error: "Has realizado demasiadas peticiones. Intenta de nuevo en 15 minutos."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default globalRateLimiter;
