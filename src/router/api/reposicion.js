import { Router } from "express";
import {ReposicionController} from '../../controllers/reposicion.controllers.js';
import {authMiddleware} from '../../middlewares/auth.middlewares.js';
import {verificarRole} from '../../middlewares/role.middlewares.js';


const reposicion = Router()

reposicion.post('/agregar', authMiddleware, verificarRole('admin'), ReposicionController);

export default reposicion
