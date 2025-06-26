import { Router } from "express";
import {login,registrar, logout} from '../../controllers/auth.controllers.js'
import manejarErroresValidacion from "../../validators/manejoErrores.validator.js";
import {validarLoginUsuario} from '../../validators/usuario.validator.js'
// import loginRateLimiter from "../../middlewares/loginRateLimimt.js";
import {emailLoginRateLimiter} from '../../middlewares/emailLoginRateLimit.js'

const sessionsRouter = Router()

// Registro de un usuario => Funciona
sessionsRouter.post('/registro', registrar);

//Logeo de un usuario => Funciona 
sessionsRouter.post('/login', emailLoginRateLimiter, validarLoginUsuario, manejarErroresValidacion, login);

// Sierre de una sessionsbien 
sessionsRouter.post('/logout', logout);

export default sessionsRouter