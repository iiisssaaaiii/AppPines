// src/services/inventarioService.js
import axios from "axios";

const API_URL = "/api/inventario";

export const obtenerInventario = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data; // 👈 incluye inventario y materiaPrima
  } catch (error) {
    console.error("Error al obtener inventario:", error);
    throw error;
  }
};
