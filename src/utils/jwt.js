import jwt from 'jsonwebtoken'

export const generarToken = (usuario) => {
  return jwt.sign({
    id: usuario.id,
    rol: usuario.rol,
    email: usuario.email
  },
  process.env.JWT_SECRET,
  {expiresIn: '1h'}
  )
}

export const verificarToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
}