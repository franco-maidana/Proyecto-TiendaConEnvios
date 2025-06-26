import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Carga el .env correspondiente según el entorno
dotenv.config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });

// Usar nombres de variables consistentes en .env y .env.test
const Conexion = mysql.createPool({
  host: process.env.SERVIDOR,
  user: process.env.USUARIO,
  password: process.env.PASSWORD,
  database: process.env.BASE_DE_DATOS,
});

if (Conexion) {
  if (process.env.NODE_ENV === "test") {
    console.log(`Te has conectado a la base de datos de TEST [${process.env.BASE_DE_DATOS}]`);
  } else {
    console.log(`Te has conectado a la base de datos [${process.env.BASE_DE_DATOS}]`);
  }
} else {
  console.log('Error en la conexion a la base de datos');
}

export default Conexion;
