// src/services/inventarioService.js
import axios from "axios";

const API_URL = "/api/inventario";

// Obtener inventario de pines
export const obtenerInventario = async () => {
  const response = await axios.get(`${API_URL}/pines`);
  return response.data;
};

// Obtener materia prima
export const obtenerMateriaPrima = async () => {
  const response = await axios.get(`${API_URL}/materia-prima`);
  return response.data;
};

// Registrar venta
export async function registrarVenta(data) {
  const res = await axios.post(`${API_URL}/venta`, data);
  return res.data;
}
