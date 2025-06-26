import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import Conexion from "../config/db.js";
import { ObtenerOrdenPorGrupo } from "../models/ordenes.model.js";

const formatFacturaNro = (id) => {
  return `000-000-${id.toString().padStart(6, "0")}`;
};

export const crearFacturaPDF = (numeroFactura, productos, totales, usuario) => {
  return new Promise(async (resolve, reject) => {
    const PDFDocument = (await import("pdfkit")).default;
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    const margenIzq = 50;
    const xCantidad = 340;
    const xSubtotal = 450;
    const anchoLinea = 500;
    let y = doc.y;

    // Logo
    try {
      doc.image("logo.png", margenIzq, y, { width: 100 });
    } catch {}

    y += 50;

    doc
      .fillColor("#004d99")
      .fontSize(20)
      .text("Tienda de Limpieza", margenIzq, y)
      .fillColor("black")
      .fontSize(10)
      .text("Calle Ficticia 123, La Plata, Buenos Aires", margenIzq)
      .text("Tel: +54 221 555-0000 / +54 9 11 1234-5678", margenIzq)
      .text("Email: contacto@tiendalimpieza.com", margenIzq);

    y = doc.y + 10;

    const nombreCliente = usuario?.nombre || "Consumidor Final";
    const emailCliente = usuario?.email || "-";
    const telefonoCliente = usuario?.telefono || "-";
    const direccionCliente = usuario?.direccion || "-";

    doc
      .fontSize(14)
      .fillColor("#000000")
      .text(`Remito / Factura N° ${numeroFactura}`, margenIzq, y)
      .text(`Fecha: ${new Date().toLocaleDateString()}`, margenIzq)
      .moveDown(0.5)
      .fontSize(12)
      .text(`Cliente: ${nombreCliente}`, margenIzq)
      .text(`Email: ${emailCliente}`, margenIzq)
      .text(`Teléfono: ${telefonoCliente}`, margenIzq)
      .text(`Dirección de envío: ${direccionCliente}`, margenIzq);

    y = doc.y + 20;

    // Tabla encabezado
    doc
      .fillColor("#ffffff")
      .rect(margenIzq, y, anchoLinea, 20)
      .fill("#004d99")
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("Producto", margenIzq + 5, y + 5)
      .text("Cantidad", xCantidad + 5, y + 5)
      .text("Subtotal", xSubtotal + 5, y + 5);

    y += 25;
    doc
      .moveTo(margenIzq, y)
      .lineTo(margenIzq + anchoLinea, y)
      .stroke();

    // Productos
    doc.font("Helvetica").fontSize(11).fillColor("#000000");
    productos.forEach((p) => {
      const cantidad = parseFloat(p.cantidad);
      const subtotal = parseFloat(p.subtotal);

      doc
        .text(p.producto_nombre, margenIzq + 5, y + 5)
        .text(`${cantidad}`, xCantidad + 5, y + 5)
        .text(`$${subtotal.toFixed(2)}`, xSubtotal + 5, y + 5);

      y += 20;
      doc
        .moveTo(margenIzq, y)
        .lineTo(margenIzq + anchoLinea, y)
        .stroke();
    });

    // Totales
    y += 30;
    const totalBoxStartY = y;

    const detallesTotales = [
      { label: "Subtotal", value: totales.subtotal },
      { label: "Envío", value: totales.envio },
      { label: "Mantenimiento", value: totales.mantenimiento },
      { label: "TOTAL FACTURADO", value: totales.total, bold: true },
    ];

    doc
      .fontSize(12)
      .fillColor("#ffffff")
      .rect(margenIzq, totalBoxStartY, anchoLinea, detallesTotales.length * 20)
      .fill("#004d99");

    doc.fontSize(12);

    detallesTotales.forEach((item, i) => {
      const yLinea = totalBoxStartY + i * 20 + 5;

      doc
        .font(item.bold ? "Helvetica-Bold" : "Helvetica")
        .fillColor("#ffffff")
        .text(item.label, margenIzq + 5, yLinea)
        .text(`$${item.value.toFixed(2)}`, xSubtotal + 5, yLinea);
    });

    // FOOTER SOLO AL PIE DE LA ÚLTIMA PÁGINA
    const footerText = "Gracias por tu compra. Ante cualquier consulta escribinos al mail o WhatsApp.";
    const footerMargin = 80;

    doc
      .font("Helvetica-Oblique")
      .fontSize(10)
      .fillColor("#555")
      .text(
        footerText,
        0,
        doc.page.height - footerMargin,
        { align: "center", width: doc.page.width }
      );

    doc.end();
  });
};


// 🔐 Mailer
const enviarFacturaEmail = async (email, buffer, numeroFactura) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GOOGLE_EMAIL,
      pass: process.env.GOOGLE_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Tienda de Limpieza" <${process.env.GOOGLE_EMAIL}>`,
    to: email,
    subject: `Factura generada - N° ${numeroFactura}`,
    text: `Hola! Gracias por tu compra. Adjuntamos tu factura.`,
    attachments: [
      {
        filename: `Factura-${numeroFactura}.pdf`,
        content: buffer,
        contentType: "application/pdf",
      },
    ],
  });

  console.log(`📧 Email enviado a ${email} con factura ${numeroFactura}`);
};

// 💥 Lógica central
export const GenerarYEnviarFactura = async (usuario_id, grupo_orden, total) => {
  const productos = await ObtenerOrdenPorGrupo(grupo_orden);

  const [[usuario]] = await Conexion.query(
    `SELECT nombre, email, telefono, direccion FROM usuarios WHERE id = ?`,
    [usuario_id]
  );
  if (!usuario?.email) throw new Error("Email no encontrado");

  const totales = {
    mantenimiento: parseFloat(productos[0].mantenimiento),
    envio: parseFloat(productos[0].envio),
    subtotal: productos.reduce((acc, p) => acc + parseFloat(p.subtotal), 0),
    total: parseFloat(total),
  };

  // 💾 Registrar factura y obtener ID
  const [resultado] = await Conexion.query(
    `INSERT INTO invoices (grupo_orden, usuario_id, total, sent_by_email) VALUES (?, ?, ?, ?)`,
    [grupo_orden, usuario_id, total, true]
  );
  const facturaId = resultado.insertId;
  const numeroFactura = formatFacturaNro(facturaId);

  // 🧾 Generar PDF
  const buffer = await crearFacturaPDF(
    numeroFactura,
    productos,
    totales,
    usuario
  );

  // 📁 Guardar PDF en disco (carpeta facturas, asegurate que exista)
  const carpetaFacturas = path.resolve("./facturas");
  if (!fs.existsSync(carpetaFacturas)) {
    fs.mkdirSync(carpetaFacturas, { recursive: true });
  }
  const rutaFactura = path.join(
    carpetaFacturas,
    `Factura-${numeroFactura}.pdf`
  );
  fs.writeFileSync(rutaFactura, buffer);

  // Guardar la ruta en la DB
  await Conexion.query(`UPDATE invoices SET pdf_url = ? WHERE id = ?`, [
    rutaFactura,
    facturaId,
  ]);

  // Enviar el email
  await enviarFacturaEmail(usuario.email, buffer, numeroFactura);

  console.log(`📄 Factura guardada en ${rutaFactura} y enviada por email`);
};
