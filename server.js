// server.js

import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import Conexion from "./src/config/db.js";
import indexRouter from "./src/router/index.router.js";
import passport from "passport";
import './src/middlewares/auth.middlewares.js';
import helmet from "helmet";
import cors from 'cors';
import globalRateLimiter from "./src/middlewares/globalRateLimit.js";
import errorHandler from "./src/middlewares/errorHandler.js";
import pathHandler from "./src/middlewares/pathHandler.js";

dotenv.config();

const app = express();

// Middlewares de seguridad y parseo
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(cookieParser());
app.use(helmet());
app.use(globalRateLimiter);

// CORS: sólo permite tu frontend (ajusta en prod)
app.use(cors({
  origin: ["http://localhost:3000"],
  credentials: true,
}));

// Tus rutas principales
app.use('/', indexRouter);

// Maneja rutas inexistentes (404)
app.use(pathHandler);

// Maneja errores generales (siempre lo último)
app.use(errorHandler);

// Exporta el app sin iniciar el server (para testing)
export default app;

// Sólo arranca el server si no está en modo test
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 8081;

  const ready = async () => {
    try {
      await Conexion.query('SELECT 1');
      console.log('🟢 Te has conectado a la base de datos');
      console.log('🚀 Servidor corriendo en el puerto ' + PORT);
    } catch (err) {
      console.error('❌ Error al conectar a la base de datos:', err.message);
      process.exit(1);
    }
  };

  app.listen(PORT, ready);
}
