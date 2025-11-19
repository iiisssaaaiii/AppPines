// src/services/pinesService.js
import axios from "axios";

const API = "/api/pines";

// Actualizar pin (tamaño, precio, stock)
export const actualizarPin = (id_pin, data) =>
  axios.put(`${API}/${id_pin}`, data);

// Eliminar pin
export const eliminarPin = (id_pin) =>
  axios.delete(`${API}/${id_pin}`);

// (Opcional) obtener un pin por id, solo si algún día lo necesitas
export const obtenerPin = async (id) => {
  const { data } = await axios.get(`${API}/${id}`);
  return data;
};
