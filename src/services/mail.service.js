import nodemailer from "nodemailer";

const NOMBRE_TIENDA = "Tienda Limpieza"; // Cambia esto por el nombre de tu tienda

const transporte = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_EMAIL,
    pass: process.env.GOOGLE_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function enviarAlertaIntentosFallidos(email, cantidad) {
  console.log(
    `[DEBUG] Enviando alerta a ${email} por ${cantidad} intentos fallidos`
  );
  await transporte.sendMail({
    from: `"Soporte ${NOMBRE_TIENDA}" <${process.env.GOOGLE_EMAIL}>`,
    to: email,
    subject: `🔒 Alerta de seguridad en tu cuenta | ${NOMBRE_TIENDA}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #222;">
        <h2 style="color: #3366cc;">${NOMBRE_TIENDA}: Alerta de intentos fallidos</h2>
        <p>Hola,</p>
        <p>
          Hemos detectado <b>${cantidad}</b> intentos fallidos de inicio de sesión en tu cuenta asociada a <b>${email}</b>.<br>
          Por motivos de seguridad, tu cuenta fue temporalmente <b>bloqueada por 15 minutos</b>.
        </p>
        <p>
          Si fuiste vos, simplemente espera ese tiempo antes de intentar ingresar de nuevo.<br>
          Si <b>NO</b> realizaste estos intentos, te recomendamos que <b>cambies tu contraseña inmediatamente</b> para proteger tu cuenta.
        </p>
        <div style="margin: 24px 0;">
          <a href="http://localhost:8080/api/users/reset-password" 
              style="padding: 10px 20px; background: #3366cc; color: #fff; text-decoration: none; border-radius: 4px;">
              Cambiar contraseña
          </a>
        </div>
        <p style="font-size: 0.9em; color: #888;">
          <b>Consejos de seguridad:</b>
          <ul>
            <li>No compartas tu contraseña con nadie.</li>
            <li>Usa una contraseña única y segura.</li>
            <li>Ignora este mensaje si reconoces la actividad.</li>
          </ul>
        </p>
        <p>
          Si necesitas ayuda, contáctanos a <a href="mailto:${process.env.GOOGLE_EMAIL}">${process.env.GOOGLE_EMAIL}</a>.
        </p>
        <p style="color: #888;">— Equipo de seguridad de ${NOMBRE_TIENDA}</p>
      </div>
    `,
  });
}
