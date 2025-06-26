import { Router } from "express";
import {
  ObtenerComparativaAnual,
  ObtenerComparativaMensual,
  ObtenerGananciaPorId,
  ObtenerGanancias,
  ObtenerGananciasAnio,
  ObtenerGananciasMes
} from "../../controllers/ganancias.controllers.js";

import { authMiddleware } from "../../middlewares/auth.middlewares.js";
import { verificarRole } from "../../middlewares/role.middlewares.js";

const ganancias = Router();

// 🔐 Todas protegidas para admin
ganancias.get('/', authMiddleware, verificarRole('admin'), ObtenerGanancias);
ganancias.get('/:id', authMiddleware, verificarRole('admin'), ObtenerGananciaPorId);
ganancias.get('/mes/actual', authMiddleware, verificarRole('admin'), ObtenerGananciasMes);
ganancias.get('/anio/actual', authMiddleware, verificarRole('admin'), ObtenerGananciasAnio);
ganancias.get('/comparativa/mensual', authMiddleware, verificarRole('admin'), ObtenerComparativaMensual);
ganancias.get('/comparativa/anual', authMiddleware, verificarRole('admin'), ObtenerComparativaAnual);

export default ganancias;
