import { describe, it, expect, vi, beforeEach } from "vitest";
import * as ProductosService from '../../services/productos.service.js';
import * as ProductosModel from '../../models/productos.model.js';
import * as InsumosModel from '../../models/insumos.model.js';
import * as EnvasesModel from '../../models/envases.model.js';
import {InsertarProductoNuevoConGasto} from '../../services/productos.service.js'

// Mocks de modelos
vi.mock('../../models/productos.model.js');
vi.mock('../../models/insumos.model.js');
vi.mock('../../models/envases.model.js');

describe("ProductoService", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ListarProductos", () => {
    it("debería devolver productos paginados correctamente", async () => {
      const mockProductos = [
        { id: 1, nombre: "Lavandina", codigo: "A001", stock: 10, stock_minimo: 5, stock_bajo: false },
        { id: 2, nombre: "Detergente", codigo: "A002", stock: 3, stock_minimo: 5, stock_bajo: true },
      ];

      ProductosModel.ContarProductos.mockResolvedValue(2);
      ProductosModel.ObtenerProductos.mockResolvedValue([
        { id: 1, nombre: "Lavandina", codigo: "A001", stock: 10, stock_minimo: 5 },
        { id: 2, nombre: "Detergente", codigo: "A002", stock: 3, stock_minimo: 5 },
      ]);

      const resultado = await ProductosService.ListarProductos(1, 2, "");

      expect(resultado.total).toBe(2);
      expect(resultado.totalPaginas).toBe(1);
      expect(resultado.paginaActual).toBe(1);
      expect(resultado.productos).toEqual(mockProductos);
    });
  });

  describe("ObtenerProductoPorId", () => {
    it("debería retornar el producto correctamente cuando existe", async () => {
      const mockProducto = {
        id: 1,
        nombre: 'Lavandina',
        codigo: 'A001',
        stock: 10
      };
      ProductosModel.ObtenerProductoPorId.mockResolvedValue(mockProducto);
      const resultado = await ProductosService.ObtenerProductoPorIdBD(1);
      expect(resultado).toEqual(mockProducto);
      expect(ProductosModel.ObtenerProductoPorId).toHaveBeenCalledWith(1);
    });

    it("debería lanzar error si el producto no existe", async () => {
      ProductosModel.ObtenerProductoPorId.mockResolvedValue(null);
      await expect(ProductosService.ObtenerProductoPorIdBD(999))
        .rejects.toThrow("Producto no encontrado");
    });
  });

  describe("Crear", () => {
    it("debería crear un producto correctamente y devolverlo", async () => {
      const datos = {
        nombre: "Lavandina",
        descripcion: "Desinfectante",
        tipo_medida: "litros",
        stock_minimo: 5,
        precio_lista: 100,
        ganancia: 20,
        marca: "LavaMax",
        categoria_id: 1,
        insumo_id: null,
        envase_id: null,
      };

      const imagen = { filename: "lavandina.jpg" };
      const creado_por = 1;

      const productoCreado = {
        id: 10,
        ...datos,
        imagen_url: "/uploads/productos/lavandina.jpg"
      };

      ProductosModel.CrearProducto.mockResolvedValue({ insertId: 10 });
      ProductosModel.ObtenerProductoPorId.mockResolvedValue(productoCreado);

      const resultado = await ProductosService.Crear(datos, imagen, creado_por);

      expect(ProductosModel.CrearProducto).toHaveBeenCalled();
      expect(ProductosModel.ObtenerProductoPorId).toHaveBeenCalledWith(10);
      expect(resultado).toEqual(productoCreado);
    });
  });

  describe("ModificarProducto", () => {
    it("debería actualizar un producto correctamente y devolver el actualizado", async () => {
      const id = 1;
      const datos = {
        nombre: "Nuevo nombre",
        stock_minimo: 3
      };
      const imagen = { filename: "nuevo.jpg" };

      const productoActualizado = {
        id,
        nombre: "Nuevo nombre",
        stock_minimo: 3,
        imagen_url: "/uploads/productos/nuevo.jpg"
      };

      ProductosModel.ActualizarProducto.mockResolvedValue();
      ProductosModel.ObtenerProductoPorId.mockResolvedValue(productoActualizado);

      const resultado = await ProductosService.ModificarProducto(id, datos, imagen);

      expect(ProductosModel.ActualizarProducto).toHaveBeenCalledWith(id, {
        ...datos,
        imagen_url: "/uploads/productos/nuevo.jpg"
      });
      expect(ProductosModel.ObtenerProductoPorId).toHaveBeenCalledWith(id);
      expect(resultado).toEqual(productoActualizado);
    });

    it("debería lanzar error si el stock mínimo es negativo", async () => {
      const id = 1;
      const datos = { stock_minimo: -10 };

      await expect(ProductosService.ModificarProducto(id, datos, null))
        .rejects.toThrow("El stock mínimo no puede ser negativo");
    });
  });

  describe("BorrarProducto", () => {
    it("debería eliminar un producto correctamente", async () => {
      const id = 7;

      ProductosModel.EliminarProducto.mockResolvedValue({ affectedRows: 1 });

      const resultado = await ProductosService.BorrarProducto(id);

      expect(ProductosModel.EliminarProducto).toHaveBeenCalledWith(id);
      expect(resultado).toEqual({ affectedRows: 1 });
    });
  });

  describe("DesactivarProducto", () => {
    it("debería anular un producto correctamente", async () => {
      const id = 4;
      ProductosModel.AnularProducto.mockResolvedValue({ affectedRows: 1 });

      const resultado = await ProductosService.DesactivarProducto(id);

      expect(ProductosModel.AnularProducto).toHaveBeenCalledWith(id);
      expect(resultado).toEqual({ affectedRows: 1 });
    });
  });

  describe("ReactivarProducto", () => {
    it("debería activar un producto correctamente", async () => {
      const id = 4;
      ProductosModel.ActivarProducto.mockResolvedValue({ affectedRows: 1 });

      const resultado = await ProductosService.ReactivarProducto(id);

      expect(ProductosModel.ActivarProducto).toHaveBeenCalledWith(id);
      expect(resultado).toEqual({ affectedRows: 1 });
    });
  });

  describe("ListarProductosAdmin", () => {
    it("debería retornar productos con el campo stock_bajo correctamente calculado", async () => {
      const productosMock = [
        { id: 1, nombre: "Lavandina", stock: 10, stock_minimo: 5 },
        { id: 2, nombre: "Detergente", stock: 3, stock_minimo: 5 }
      ];

      const productosEsperados = [
        { id: 1, nombre: "Lavandina", stock: 10, stock_minimo: 5, stock_bajo: false },
        { id: 2, nombre: "Detergente", stock: 3, stock_minimo: 5, stock_bajo: true }
      ];

      ProductosModel.ObtenerProductosAdmin.mockResolvedValue(productosMock);

      const resultado = await ProductosService.ListarProductosAdmin();

      expect(ProductosModel.ObtenerProductosAdmin).toHaveBeenCalled();
      expect(resultado).toEqual(productosEsperados);
    });
  });

  describe("InsertarProductoNuevoConGasto", () => {
    it("debería calcular precios correctamente para insumo líquido y crear el producto", async () => {
      const insumo_id = 5;
      const envase_id = 10;
      const datos = {
        nombre: "Jabón Líquido",
        descripcion: "Para manos",
        tipo_medida: "litros",
        stock_minimo: 3,
        ganancia: 25,
        imagen_url: "/uploads/productos/jabon.jpg",
        categoria_id: 1,
        marca: "CleanIt",
        creado_por: 1
      };

      const insumoMock = {
        id: insumo_id,
        tipo: "liquido",
        precio_litro: "100"
      };

      const envaseMock = {
        id: envase_id,
        capacidad_litros: "2",
        precio_envase: "50"
      };

      const precioListaEsperado = 100 * 2 + 50; // 250
      const precioUnitarioEsperado = precioListaEsperado + (precioListaEsperado * 25) / 100; // 312.5

      ProductosModel.CrearProducto.mockResolvedValue({ insertId: 99 });
      ProductosModel.ObtenerProductoPorId.mockResolvedValue({ id: 99 });

      InsumosModel.ObtenerInsumoPorId.mockResolvedValue(insumoMock);
      EnvasesModel.ObtenerEnvasePorId.mockResolvedValue(envaseMock);

      const result = await ProductosService.InsertarProductoNuevoConGasto(
        datos.nombre,
        datos.descripcion,
        datos.tipo_medida,
        datos.stock_minimo,
        datos.ganancia,
        datos.imagen_url,
        datos.categoria_id,
        datos.marca,
        datos.creado_por,
        insumo_id,
        envase_id
      );

      expect(InsumosModel.ObtenerInsumoPorId).toHaveBeenCalledWith(insumo_id);
      expect(EnvasesModel.ObtenerEnvasePorId).toHaveBeenCalledWith(envase_id);
      expect(ProductosModel.CrearProducto).toHaveBeenCalledWith(
        datos.nombre,
        datos.descripcion,
        datos.tipo_medida,
        datos.stock_minimo,
        precioListaEsperado,
        parseFloat(datos.ganancia),
        datos.marca,
        datos.categoria_id,
        datos.imagen_url,
        datos.creado_por,
        insumo_id,
        envase_id
      );
      expect(result).toEqual({ id: 99 });
    });
  });

  describe("InsertarProductoNuevoConGasto", () => {
    it("debería crear producto correctamente con insumo seco", async () => {
      const result = await InsertarProductoNuevoConGasto(
        "Detergente polvo",
        "Detergente en polvo de 1kg",
        "kg",
        5,
        30,
        "https://ejemplo.com/imagen.jpg",
        1,
        "Marca B",
        1,
        2, // insumo seco
        null
      );
      expect(result).toHaveProperty("id");
    });

    it("debería crear producto con precio 0 si no tiene insumo", async () => {
      const result = await InsertarProductoNuevoConGasto(
        "Producto sin insumo",
        "Descripción",
        "unidad",
        5,
        30,
        "https://ejemplo.com/imagen.jpg",
        1,
        "Marca C",
        1,
        null,
        null
      );
      expect(result).toHaveProperty("id");
    });

    it("debería lanzar error si el envase no es válido para insumo líquido", async () => {
      await expect(
        InsertarProductoNuevoConGasto(
          "Lavandina",
          "Lavandina con envase inválido",
          "litro",
          10,
          25,
          "https://ejemplo.com/lavandina.jpg",
          1,
          "Marca X",
          1,
          1, // insumo líquido
          9999 // envase que no existe
        )
      ).rejects.toThrow("Envase no válido");
    });
  });

});
