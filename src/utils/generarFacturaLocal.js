import fs from "fs";
import { crearFacturaPDF } from "./generarFacturaCompleta.js";
import Conexion from "../config/db.js";
import { ObtenerDetalleOrden, ObtenerGrupoOrden } from "../models/ordenLocal.model.js";

export const GenerarFacturaLocal = async ({ ordenId, usuario = {} }) => {
  // Obtener productos de la orden local
  const productos = await ObtenerDetalleOrden(ordenId);
  if (!productos || productos.length === 0) throw new Error("Orden vacía");

  // Tomar totales desde productos
  const totales = {
    mantenimiento: 0,
    envio: 0,
    subtotal: productos.reduce((acc, p) => acc + parseFloat(p.subtotal), 0),
    total: productos.reduce((acc, p) => acc + parseFloat(p.subtotal), 0),
  };

  // ¡Este campo debe ser el string grupo_orden, no el id!
  const grupoOrden = await ObtenerGrupoOrden(ordenId);

  // Registrar en invoices para obtener facturaId
  const [resultado] = await Conexion.query(
    `INSERT INTO invoices (grupo_orden, usuario_id, total, sent_by_email) VALUES (?, ?, ?, ?)`,
    [
      grupoOrden,              // importante: el valor de grupo_orden (string), no el id
      usuario?.id || null,
      totales.total,
      false
    ]
  );

  const facturaId = resultado.insertId;
  const numeroFactura = `000-000-${facturaId.toString().padStart(6, "0")}`;

  // Generar PDF
  const buffer = await crearFacturaPDF(
    numeroFactura,
    productos,
    totales,
    usuario
  );

  // Guardar PDF en carpeta
  const carpeta = "./facturas";
  if (!fs.existsSync(carpeta)) fs.mkdirSync(carpeta, { recursive: true });
  const rutaFactura = `${carpeta}/Factura-${numeroFactura}.pdf`;
  fs.writeFileSync(rutaFactura, buffer);

  // Actualizar DB con la ruta al archivo
  await Conexion.query(`UPDATE invoices SET pdf_url = ? WHERE id = ?`, [
    rutaFactura,
    facturaId,
  ]);

  console.log(`📄 Factura de venta local generada: ${rutaFactura}`);
  return { numeroFactura, rutaFactura };
};
