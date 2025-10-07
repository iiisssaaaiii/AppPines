// src/services/pinesService.js
import axios from "axios";

const API = "/api/pines";

export const actualizarPin = async (id, data) => {
  const { data: resp } = await axios.put(`${API}/${id}`, data);
  return resp;
};

export const eliminarPin = async (id) => {
  await axios.delete(`${API}/${id}`);
};

export const obtenerPin = async (id) => {
  const { data } = await axios.get(`${API}?id=${id}`); // si tu GET actual no filtra por id, puedes ignorar esto
  return data;
};
