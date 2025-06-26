import { Router } from "express";
import { CrearPreferenciaDesdeCarrito } from '../../controllers/mercadoPago.controllers.js'
import {authMiddleware} from '../../middlewares/auth.middlewares.js'

const  mercadoPago = Router()

mercadoPago.post('/crear-pago', authMiddleware ,CrearPreferenciaDesdeCarrito);

export default mercadoPago