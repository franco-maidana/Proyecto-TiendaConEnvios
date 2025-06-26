import {
  ObtenerComparativaAnual as ObtenerComparativaAnualService,
  ObtenerComparativaMensual as ObtenerComparativaMensualService,
  ObtenerGananciaPorId as ObtenerGananciaPorIdService,
  ObtenerGananciasDelAnio as ObtenerGananciasDelAnioService,
  ObtenerGananciasDelMes as ObtenerGananciasDelMesService,
  ObtenerGananciasTotales as ObtenerGananciasTotalesService,
} from "../services/ganancias.service.js";

export const ObtenerGanancias = async (req, res) => {
  const data = await ObtenerGananciasTotalesService();
  res.json(data);
};

export const ObtenerGananciaPorId = async (req, res) => {
  const { id } = req.params;
  const data = await ObtenerGananciaPorIdService(id);
  if (!data) return res.status(404).json({ msg: 'Ganancia no encontrada' });
  res.json(data);
};

export const ObtenerGananciasMes = async (req, res) => {
  const data = await ObtenerGananciasDelMesService();
  res.json(data);
};

export const ObtenerGananciasAnio = async (req, res) => {
  const data = await ObtenerGananciasDelAnioService();
  res.json(data);
};

export const ObtenerComparativaMensual = async (req, res) => {
  const data = await ObtenerComparativaMensualService();
  res.json(data);
};

export const ObtenerComparativaAnual = async (req, res) => {
  const data = await ObtenerComparativaAnualService();
  res.json(data);
};
