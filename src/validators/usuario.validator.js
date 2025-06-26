import { body } from "express-validator";

export const validarRegistroUsuario = [
  body("email")
    .isEmail().withMessage("El email no es válido")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 }).withMessage("La contraseña debe tener mínimo 6 caracteres"),
  body("nombre")
    .notEmpty().withMessage("El nombre es obligatorio")
    .trim().escape()
];

export const validarActualizarUsuario = [
  body("nombre")
    .optional()
    .notEmpty().withMessage("El nombre no puede estar vacío")
    .trim().escape(),
  body("email")
    .optional()
    .isEmail().withMessage("Debe ser un email válido")
    .normalizeEmail(),
  // ...agrega los campos que quieras validar
];

// Login seguro
export const validarLoginUsuario = [
  body("email")
    .isEmail().withMessage("El email es inválido")
    .normalizeEmail(),
  body("password")
    .isString()
    .isLength({ min: 8 }).withMessage("La contraseña debe tener mínimo 8 caracteres")
];
