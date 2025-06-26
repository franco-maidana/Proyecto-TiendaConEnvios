import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ObtenerUsuarioPorEmail } from '../models/usuario.models.js';
import { Crear as CrearUsuarioConVerificacion } from '../services/usuario.service.js'; // 🔁 reutilizamos

// Registro de usuario (con email verificación)
export const registrarUsuario = async ({
  nombre,
  email,
  password,
  telefono,
  direccion,
  latitud,
  longitud
}) => {
  const existente = await ObtenerUsuarioPorEmail(email);
  if (existente) throw new Error('El correo ya está registrado');

  // 🔁 Usamos tu lógica ya validada que incluye hash, token, expiración y mail
  const usuario = await CrearUsuarioConVerificacion(
    nombre,
    email,
    password,
    telefono,
    direccion,
    latitud,
    longitud
  );

  return {
    mensaje: 'Usuario registrado exitosamente',
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email
  };
};

// Login con verificación de email
export const loginUsuario = async ({ email, password }) => {
  const usuario = await ObtenerUsuarioPorEmail(email);
  if (!usuario) throw new Error('Credenciales inválidas');

  const coincide = await bcrypt.compare(password, usuario.password);
  if (!coincide) throw new Error('Credenciales inválidas');

  if (!usuario.email_verificado) {
    throw new Error('Debes verificar tu correo electrónico antes de ingresar');
  }

  const token = jwt.sign(
    {
      id: usuario.id,
      rol: usuario.rol,
      email: usuario.email
    },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );

  return {
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    }
  };
};


