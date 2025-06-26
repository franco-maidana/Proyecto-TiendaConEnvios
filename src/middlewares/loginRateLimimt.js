import rateLimit from "express-rate-limit";

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  standardHeaders: true, // Devuelve Retry-After en header
  legacyHeaders: false,
  handler: (req, res) => {
    // Calcula segundos restantes (esto se los pasa express-rate-limit)
    const retryAfter = Math.ceil((req.rateLimit.resetTime - new Date()) / 1000);
    res.status(429).json({
      status: 429,
      error: "Has superado el límite de intentos de login. Intenta de nuevo más tarde.",
      retryAfter // <-- El tiempo en segundos que debe esperar
    });
  }
});

export default loginRateLimiter;
