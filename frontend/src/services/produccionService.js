// src/services/produccionService.js
import axios from "axios";

const API_URL = "/api/produccion";

// 📌 Subir imagen al backend (se guarda en /uploads y devuelve la URL)
export const subirImagen = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data; // { url: "http://localhost:4000/uploads/imagen.png" }
  } catch (error) {
    console.error("Error al subir imagen:", error);
    throw error.response?.data || { error: "Error desconocido al subir imagen" };
  }
};

// 📌 Registrar la producción de pines
export const imprimirPines = async ({
  url_imagen,
  etiquetas,
  tamano,
  cantidad,
  id_usuario,
}) => {
  try {
    const response = await axios.post(API_URL, {
      url_imagen,
      etiquetas,
      tamano,
      cantidad,
      id_usuario,
    });
    return response.data;
  } catch (error) {
    console.error("Error al imprimir pines:", error);
    throw error.response?.data || { error: "Error desconocido al imprimir pines" };
  }
};
