# 🧹 Tienda Limpieza Backend

Backend profesional, seguro y modular para e-commerce de productos de limpieza.  
Desarrollado en Node.js + Express + MySQL.  
Incluye gestión de stock, ventas web/local, usuarios con roles, facturación en PDF, integración MercadoPago,
valoraciones, control financiero, mensajes de contacto, subida de imágenes y 

**testing profesional**.

## 📦 **Tecnologías y dependencias**

- **Node.js 18+ / Express**
- **MySQL 8+**
- **JWT (autenticación segura)**
- **bcrypt (hash de contraseñas)**
- **Multer (subida de imágenes)**
- **PDFKit (generación de facturas)**
- **Nodemailer (envío de emails)**
- **express-validator (validaciones)**
- **Supertest + Vitest (testing completo)**
- **MercadoPago SDK (pagos)**
- **dotenv (configuración por entorno)**

---

## 🏗️ **Estructura del proyecto**

src/
├── controllers/ # Lógica de entrada/salida (request/response)
├── services/ # Lógica de negocio y conexión a modelos
├── models/ # Acceso a la base de datos y consultas SQL
├── routers/ # Rutas express por dominio
├── middlewares/ # Middlewares de validación, autenticación y permisos
├── utils/ # Helpers: JWT, Multer, PDF, email, etc.
├── testing/ # Tests unitarios (services) e integración (routers)
├── server.js # Entrada principal de la app
└── db.js # Configuración de base de datos MySQL

---

## 🚀 **¿Qué funcionalidades incluye?**

### **Gestión de productos y stock**

- CRUD de productos, imágenes, categorías, stock, precios automáticos (incluyendo insumos/envases).
- Control de stock mínimo, alertas y reposición.

### **Órdenes y ventas**

- Carrito web con confirmación, edición, borrado, integración MercadoPago.
- Ventas en local/punto físico, con generación de factura PDF.
- Control de stock y movimientos financieros automáticos.

### **Usuarios y roles**

- Registro, login, recuperación de contraseña, verificación de email, roles (admin/cliente), edición y eliminación programada.
- Validación estricta de datos.

### **Finanzas**

- Registro y reporte de gastos, ganancias, balances mensuales/anuales, integración con operaciones de ventas y stock.

### **Valoraciones**

- Alta, edición, borrado y listado de valoraciones por producto.
- Promedio, resumen y control de votos por usuario.

### **Mensajes de contacto**

- Mensajería cliente-admin, respuestas, inbox, no leídos, marcado como leído.

### **Subida de archivos**

- Imágenes de productos (validación con Multer).
- PDFs de facturación (PDFKit).

### **Emails automáticos**

- Verificación de cuenta, recuperación, avisos de baja y envío de factura al cliente (Nodemailer).

### **Seguridad**

- JWT + cookies httpOnly para sesión.
- Bcrypt para passwords.
- Roles y permisos en rutas críticas.
- Validación exhaustiva de input (express-validator).
- Prevención de operaciones peligrosas.

### **Testing**

- Unitario para todos los servicios (Vitest).
- Integración de endpoints (Supertest).
- Mock de emails y facturación en entorno test.
- Limpieza de datos antes/después de tests.
- Casos de error y edge cases cubiertos.

---

## 🔒 **Seguridad aplicada**

- JWT firmado y expiración automática.
- Hash de contraseñas.
- Roles en rutas críticas (admin/cliente).
- Validación de datos en todos los endpoints.
- Emails de verificación/recuperación/solicitud de baja.
- Solo usuarios verificados pueden operar.
- Prevención de stock negativo, ventas sin pago, repetidos, etc.
- ¡Tests de seguridad incluidos!

---

## 🧪 **Testing profesional**

- **`npm test`** ejecuta TODOS los tests.
- Base de datos de test dedicada.
- Cobertura:
  - Lógica de negocio (services)
  - Endpoints completos (CRUD, errores, autenticación)
  - PDFs, emails (mockeados)
  - Casos de borde y validaciones
- ¡Más de 180 tests pasando!


| Dominio      | Ruta base           | Funcionalidades principales                     |
|--------------|---------------------|------------------------------------------------|
| Productos    | /api/products       | CRUD, imágenes, stock, listado admin/público    |
| Usuarios     | /api/users          | Registro, login, edición, baja, roles           |
| Almacén      | /api/almacen        | Insumos, envases, reposición, stock             |
| Finanzas     | /api/finanzas       | Gastos, resumen, balances, reportes             |
| Órdenes      | /api/ordenes        | Carrito web: agregar, modificar, pagar, PDF     |
| Local        | /api/ordenLocal     | Ventas en mostrador, PDF, stock directo         |
| Valoraciones | /api/valoraciones   | Crear, editar, borrar, promedio                 |
| Contacto     | /api/mensaje        | Mensajes cliente-admin, inbox, respuestas       |
| MercadoPago  | /api/mercadoPago    | Preferencias de pago                            |



🛡️ ¿Qué tan seguro es el backend?
Seguridad aplicada:

JWT, roles, hash, validaciones, emails automáticos.

Pruebas automáticas:

Todo lo importante está testeado (servicios + endpoints).

Recomendado para prod:

Agregar transacciones SQL para operaciones críticas.

Configurar CORS solo para tu frontend en prod.

Rate limiting para login/contacto.


🧑‍💻 Autor y créditos
Hecho por Franco Maidana – 2025

Consultas, sugerencias o propuestas: francomaidana094@gmail.com
