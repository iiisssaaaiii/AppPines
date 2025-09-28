import axios from "axios";

const API_URL = "http://localhost:4000/api/produccion";

// Llamar al endpoint para imprimir pines
export const imprimirPines = async ({ url_imagen, etiquetas, tamano, cantidad, id_usuario }) => {
  try {
    const response = await axios.post(API_URL, {
      url_imagen,
      etiquetas,
      tamano,
      cantidad,
      id_usuario
    });
    return response.data;
  } catch (error) {
    console.error("Error al imprimir pines:", error);
    throw error.response?.data || { error: "Error desconocido" };
  }
};
