// src/services/movimientosService.js
import axios from "axios";

const API_URL = "/api/inventario/movimientos";

// Obtener lista de movimientos
export const obtenerMovimientos = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo movimientos:", error);
    throw error;
  }
};
