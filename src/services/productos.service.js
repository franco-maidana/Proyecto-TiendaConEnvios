import {
  CrearProducto,
  ObtenerProductoPorId,
  ObtenerProductos,
  ContarProductos,
  EliminarProducto,
  AnularProducto,
  ActivarProducto,
  ObtenerProductosAdmin,
  ActualizarProducto,
  ExisteEnvasePorId,
} from "../models/productos.model.js";

import { ObtenerInsumoPorId } from "../models/insumos.model.js";
import { ObtenerEnvasePorId } from "../models/envases.model.js";

export const Crear = async (datos, imagen, creado_por) => {
  const imagen_url = imagen ? `/uploads/productos/${imagen.filename}` : null;

  const resultado = await CrearProducto(
    datos.nombre,
    datos.descripcion,
    datos.tipo_medida,
    datos.stock_minimo,
    datos.precio_lista,
    datos.ganancia,
    datos.marca,
    datos.categoria_id,
    imagen_url,
    creado_por,
    datos.insumo_id,
    datos.envase_id
  );

  const producto = await ObtenerProductoPorId(resultado.insertId);
  return producto;
};

export const ListarProductos = async (
  pagina = 1,
  limite = 10,
  buscar = "",
  categoriaId = null
) => {
  const offset = (pagina - 1) * limite;
  const productos = await ObtenerProductos(limite, offset, buscar, categoriaId);
  const total = await ContarProductos(buscar, categoriaId);
  const totalPaginas = Math.ceil(total / limite);

  const productosConAlerta = productos.map((p) => ({
    ...p,
    stock_bajo: p.stock <= p.stock_minimo,
  }));

  return {
    productos: productosConAlerta,
    total,
    totalPaginas,
    paginaActual: pagina,
  };
};

export const ModificarProducto = async (id, datos, imagen) => {
  const campos = { ...datos };

  if (imagen) {
    campos.imagen_url = `/uploads/productos/${imagen.filename}`;
  }

  // Evitá stock negativo
  if ("stock_minimo" in campos && parseFloat(campos.stock_minimo) < 0) {
    throw new Error("El stock mínimo no puede ser negativo");
  }

  await ActualizarProducto(id, campos);
  const productoActualizado = await ObtenerProductoPorId(id);
  return productoActualizado;
};

export const BorrarProducto = async (id) => {
  return await EliminarProducto(id);
};

export const DesactivarProducto = async (id) => {
  return AnularProducto(id);
};

export const ListarProductosAdmin = async () => {
  const productos = await ObtenerProductosAdmin();

  return productos.map((p) => ({
    ...p,
    stock_bajo: p.stock <= p.stock_minimo,
  }));
};

export const ObtenerProductoPorIdBD = async (id) => {
  const producto = await ObtenerProductoPorId(id);
  if (!producto) {
    throw new Error("Producto no encontrado");
  }
  return producto;
};

export const ReactivarProducto = async (id) => {
  return await ActivarProducto(id);
};

// prueba
export const InsertarProductoNuevoConGasto = async (
  nombre,
  descripcion,
  tipo_medida,
  stock_minimo,
  ganancia,
  imagen_url,
  categoria_id,
  marca,
  creado_por,
  insumo_id,
  envase_id
) => {
  let precio_unitario = 0;
  let precio_lista = 0;

  const insumo = insumo_id ? await ObtenerInsumoPorId(insumo_id) : null;

  if (insumo && insumo.tipo === "liquido") {
    // Validación estricta si es líquido
    // Si es insumo líquido, debe tener envase
    if (insumo_id === 1 && !envase_id) {
      throw new Error("El insumo líquido requiere un envase");
    }

    if (insumo_id === 1) {
      if (!envase_id) {
        throw new Error("El insumo líquido requiere un envase");
      }

      const envaseExiste = await ExisteEnvasePorId(envase_id);
      if (!envaseExiste) {
        throw new Error("Envase no válido");
      }
    }

    const envase = await ObtenerEnvasePorId(envase_id);
    if (!envase) {
      throw new Error("Envase no válido");
    }

    const litros = parseFloat(envase.capacidad_litros);
    const precio_insumo = parseFloat(insumo.precio_litro) * litros;
    const precio_envase = parseFloat(envase.precio_envase);

    precio_lista = precio_insumo + precio_envase;
    precio_unitario =
      precio_lista + (precio_lista * parseFloat(ganancia)) / 100;
  } else if (insumo && insumo.tipo === "seco") {
    // Para insumo seco no se necesita envase
    precio_lista = parseFloat(insumo.precio_seco);
    precio_unitario =
      precio_lista + (precio_lista * parseFloat(ganancia)) / 100;
  } else {
    // Producto sin insumo
    precio_lista = 0;
    precio_unitario = 0;
  }

  const productoId = await CrearProducto(
    nombre,
    descripcion,
    tipo_medida,
    stock_minimo,
    precio_lista,
    parseFloat(ganancia),
    marca,
    categoria_id,
    imagen_url,
    creado_por,
    insumo_id,
    envase_id
  );

  return { id: productoId.insertId };
};
