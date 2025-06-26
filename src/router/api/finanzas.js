import { Router } from "express";
import {
  EliminarGastoController,
  ActualizarGastoController,
  CrearGastoManualController,
  ListarGastosController,
  ObtenerGastoPorIdController,
  GastosMensualesController,
  ResumenGastosAnualesController
} from "../../controllers/finanzas.controllers.js";

import { authMiddleware } from "../../middlewares/auth.middlewares.js";
import { verificarRole } from "../../middlewares/role.middlewares.js";

const finanzas = Router();

// 🔒 Solo admin puede crear, editar, eliminar
finanzas.post('/gastos/manual', authMiddleware, verificarRole('admin'), CrearGastoManualController);
finanzas.put("/upDate/:id", authMiddleware, verificarRole('admin'), ActualizarGastoController);
finanzas.delete("/eliminar/:id", authMiddleware, verificarRole('admin'), EliminarGastoController);

// 🔒 Listados y reportes: protegidos (podés abrirlos si querés)
finanzas.get("/gastos", authMiddleware, verificarRole('admin'), ListarGastosController);
finanzas.get('/gastos/mensuales', authMiddleware, verificarRole('admin'), GastosMensualesController);
finanzas.get('/gastos/resumen', authMiddleware, verificarRole('admin'), ResumenGastosAnualesController);
finanzas.get("/gastos/:id", authMiddleware, verificarRole('admin'), ObtenerGastoPorIdController);

export default finanzas;
