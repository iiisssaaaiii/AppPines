// src/services/movimientosService.js
import axios from "axios";

const API_URL = "http://localhost:4000/api/inventario/movimientos";

export const obtenerMovimientos = async (params = {}) => {
  try {
    // Construir query string dinámico
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_URL}?${query}` : API_URL;

    const res = await axios.get(url);
    return res.data;

  } catch (error) {
    console.error("❌ Error obteniendo movimientos:", error);
    throw error;
  }
};
