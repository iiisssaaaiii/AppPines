// src/services/reportesService.js
import api from "./api";

// Categorías más vendidas (ya lo tenías)
export const obtenerCategoriasMasVendidas = async (params = {}) => {
  const { data } = await api.get("/inventario/reportes/categorias", { params });
  return data;
};

// 🔹 NUEVO: Reporte de ventas
export const obtenerVentas = async (params = {}) => {
  const { data } = await api.get("/inventario/reportes/ventas", { params });
  return data;
};
