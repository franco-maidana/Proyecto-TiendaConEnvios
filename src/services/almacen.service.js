import {
  CrearInsumo,
  ActualizarInsumo,
  EliminarInsumo,
  ObtenerTodosInsumos,
  ObtenerInsumoPorId,
} from "../models/insumos.model.js";
import {
  CrearEnvase,
  ActualizarEnvase,
  EliminarEnvase,
  ObtenerTodosEnvases,
  ObtenerEnvasePorId,
} from "../models/envases.model.js";
import {
  RegistrarGasto,
  ActualizarBalance,
  EliminarGastoPorProducto,
  RegistrarGastoManual,
} from "../models/finanzas.models.js";

export const CrearInsumoConGasto = async (datos) => {
  const {
    nombre,
    tipo,
    stock_litros = 0,
    stock_unidades = 0,
    precio_litro = 0,
    precio_seco = 0,
  } = datos;

  // Validación de campos obligatorios
  if (!nombre || !tipo) {
    throw new Error("Faltan campos obligatorios: nombre y tipo");
  }

  // Conversión segura
  const stockLitros = parseFloat(stock_litros) || 0;
  const stockUnidades = parseInt(stock_unidades) || 0;
  const precioLitro = parseFloat(precio_litro) || 0;
  const precioSeco = parseFloat(precio_seco) || 0;

  // Crear el insumo
  const id = await CrearInsumo(
    nombre,
    tipo,
    stockLitros,
    stockUnidades,
    precioLitro,
    precioSeco
  );

  // Registrar gasto si corresponde
  let monto = 0;
  let descripcion = "";

  if (tipo === "liquido" && stockLitros > 0 && precioLitro > 0) {
    monto = stockLitros * precioLitro;
    descripcion = `Alta de insumo líquido "${nombre}" con ${stockLitros} litros`;
  }

  if (tipo === "seco" && stockUnidades > 0 && precioSeco > 0) {
    monto = stockUnidades * precioSeco;
    descripcion = `Alta de insumo seco "${nombre}" con ${stockUnidades} unidades`;
  }

  if (monto > 0) {
    await RegistrarGasto("Reposición", descripcion, monto);
    await ActualizarBalance();
  }

  return id;
};

export const CrearEnvaseConGasto = async (
  tipo,
  capacidad_litros,
  stock,
  precio_envase
) => {
  const id = await CrearEnvase(tipo, capacidad_litros, stock, precio_envase);

  if (stock > 0 && precio_envase > 0) {
    const monto = stock * precio_envase;
    const descripcion = `Alta de envases tipo "${tipo}" (${capacidad_litros}L) con ${stock} unidades`;
    await RegistrarGasto("Reposición", descripcion, monto);
    await ActualizarBalance();
  }

  return id;
};

// Listados
export const ListarInsumos = async () => await ObtenerTodosInsumos();
export const ListarEnvases = async () => await ObtenerTodosEnvases();

// Modificar + registrar nuevo gasto
export const ModificarInsumo = async (id, campos) => {
  if (!campos || typeof campos !== 'object') {
    throw new Error('Datos inválidos para modificar insumo');
  }

  // 🔒 FILTRAR campos vacíos
  const camposFiltrados = {};
  for (const [k, v] of Object.entries(campos)) {
    if (v !== '' && v !== undefined && v !== null) {
      camposFiltrados[k] = v;
    }
  }

  if (Object.keys(camposFiltrados).length === 0) {
    throw new Error('No se enviaron campos válidos para modificar');
  }

  const insumo = await ObtenerInsumoPorId(id);
  if (!insumo) throw new Error('Insumo no encontrado');

  await ActualizarInsumo(id, camposFiltrados);
  await EliminarGastoPorProducto(insumo.nombre); // 👈 usás solo el nombre

  const stock_litros = 'stock_litros' in camposFiltrados ? parseFloat(camposFiltrados.stock_litros) : insumo.stock_litros;
  const stock_unidades = 'stock_unidades' in camposFiltrados ? parseInt(camposFiltrados.stock_unidades) : insumo.stock_unidades;
  const precio_litro = 'precio_litro' in camposFiltrados ? parseFloat(camposFiltrados.precio_litro) : insumo.precio_litro;
  const precio_seco = 'precio_seco' in camposFiltrados ? parseFloat(camposFiltrados.precio_seco) : insumo.precio_seco;

  let descripcion = '', monto = 0;

  if (insumo.tipo === 'liquido') {
    monto = stock_litros * precio_litro;
    descripcion = `Modificación de insumo líquido "${insumo.nombre}"`;
  } else if (insumo.tipo === 'seco') {
    monto = stock_unidades * precio_seco;
    descripcion = `Modificación de insumo seco "${insumo.nombre}"`;
  }

  if (monto > 0) {
    await RegistrarGastoManual(descripcion, monto, 'Reposición');
    await ActualizarBalance();
  }
};


export const ModificarEnvase = async (id, campos) => {
  if (!campos || typeof campos !== 'object') {
    throw new Error('Datos inválidos para modificar envase');
  }

  // ✅ FILTRO: Ignorar campos vacíos
  const camposFiltrados = {};
  for (const [k, v] of Object.entries(campos)) {
    if (v !== '' && v !== undefined && v !== null) {
      camposFiltrados[k] = v;
    }
  }

  if (Object.keys(camposFiltrados).length === 0) {
    throw new Error('No se enviaron campos válidos para modificar');
  }

  const envase = await ObtenerEnvasePorId(id);
  if (!envase) throw new Error('Envase no encontrado');

  await ActualizarEnvase(id, camposFiltrados);
  await EliminarGastoPorProducto(envase.tipo);

  // Usamos valores filtrados o los originales si no fueron enviados
  const stock = 'stock' in camposFiltrados ? parseInt(camposFiltrados.stock) : envase.stock;
  const precio_envase = 'precio_envase' in camposFiltrados ? parseFloat(camposFiltrados.precio_envase) : envase.precio_envase;

  const monto = stock * precio_envase;
  const descripcion = `Modificación de envase "${envase.tipo}" (${envase.capacidad_litros}L)`;

  if (monto > 0) {
    await RegistrarGastoManual(descripcion, monto, 'Reposición');
    await ActualizarBalance();
  }
};

// Eliminar + eliminar gasto
export const BorrarInsumo = async (id) => {
  const insumo = await ObtenerInsumoPorId(id);
  await EliminarGastoPorProducto(insumo.nombre);
  await EliminarInsumo(id);
};

export const BorrarEnvase = async (id) => {
  const envase = await ObtenerEnvasePorId(id);
  await EliminarGastoPorProducto(envase.tipo);
  await EliminarEnvase(id);
};
