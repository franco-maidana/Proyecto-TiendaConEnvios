import nodemailer from "nodemailer";

const EMAIL_FROM = `"Soporte Tienda Limpieza" <${process.env.GOOGLE_EMAIL}>`;

function getTransport() {
  const config = {
    service: "gmail",
    auth: {
      user: process.env.GOOGLE_EMAIL,
      pass: process.env.GOOGLE_PASSWORD,
    }
  };
  // Solo ignorar TLS en dev
  if (process.env.NODE_ENV !== 'production') {
    config.tls = { rejectUnauthorized: false };
  }
  return nodemailer.createTransport(config);
}


// Verifica la conexión SMTP (opcional, solo una vez al arrancar el server)
getTransport().verify((error, success) => {
  if (error) {
    console.error('Error conectando a Gmail SMTP:', error);
  } else {
    console.log('Servidor de correo listo para enviar emails.');
  }
});

// Función genérica de envío con manejo de errores
export async function enviarEmail(destino, asunto, html) {
  if (process.env.NODE_ENV === 'test') {
    console.log(`[MOCK EMAIL] Para: ${destino} | Asunto: ${asunto}\n${html}`);
    return true;
  }
  const transporte = getTransport();
  try {
    await transporte.sendMail({
      from: EMAIL_FROM,
      to: destino,
      subject: asunto,
      html,
    });
    return true;
  } catch (err) {
    console.error('Error enviando email:', err);
    throw new Error('No se pudo enviar el email.');
  }
}

// --- Funciones especializadas ---

export async function enviarEmailVerificacion(email, token) {
  const link = `https://tusitio.com/verificar-email?token=${token}`;
  const html = `
    <p>Gracias por registrarte.</p>
    <p>Hacé clic en el siguiente enlace para verificar tu cuenta:</p>
    <a href="${link}">${link}</a>
    <p>Este enlace expirará en 24 horas.</p>
  `;
  return enviarEmail(email, "Verificación de cuenta", html);
}

export async function enviarRecuperacionPassword(email, token) {
  const link = `https://tusitio.com/reset-password?token=${token}`;
  const html = `
    <p>Has solicitado restablecer tu contraseña.</p>
    <p>Hacé clic en el siguiente enlace para continuar:</p>
    <a href="${link}">${link}</a>
    <p>Copia el token: ${token} para poder cambiar la contraseña.</p>
    <p>Este enlace es válido por 15 minutos.</p>
  `;
  return enviarEmail(email, "Recuperación de contraseña", html);
}

export async function enviarSolicitudEliminacion(email, fechaFormateada) {
  const html = `
    <p>Hola,</p>
    <p>Recibimos una solicitud para eliminar tu cuenta.</p>
    <p>Tu cuenta será eliminada el <strong>${fechaFormateada}</strong>.</p>
    <p>Si no fuiste vos o querés cancelar esta solicitud, contactanos antes de esa fecha.</p>
    <p>Gracias por haber usado nuestra tienda.</p>
  `;
  return enviarEmail(email, "Solicitud de eliminación de cuenta", html);
}
