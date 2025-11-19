import axios from "axios";

const API_URL = "http://localhost:4000/api/imagenes";

// ==================================================
// 1. Obtener imágenes
// ==================================================
export async function obtenerImagenes() {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (error) {
    console.error("Error al obtener imágenes:", error);
    throw error;
  }
}

// ==================================================
// 2. Subir nueva imagen
// ==================================================
export async function subirImagen({ nombre, archivo, tags }) {
  const formData = new FormData();

  formData.append("nombre", nombre);
  formData.append("archivo", archivo);
  formData.append("tags", JSON.stringify(tags));

  const res = await axios.post(API_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}

// ==================================================
// 3. Eliminar imagen
// ==================================================
export async function eliminarImagen(id_imagen) {
  try {
    const res = await axios.delete(`${API_URL}/${id_imagen}`);
    return res.data;
  } catch (error) {
    console.error("Error al eliminar imagen:", error);
    throw error;
  }
}

// ==================================================
// 4. Obtener lista de tags
// ==================================================
export async function obtenerTags() {
  try {
    const res = await axios.get(`${API_URL}/tags/lista`);
    return res.data;
  } catch (error) {
    console.error("Error al obtener tags:", error);
    throw error;
  }
}

// ==================================================
// 5. Actualizar imagen (PUT)
// ==================================================
export async function actualizarImagen(id_imagen, { nombre, archivo, tags }) {
  const formData = new FormData();

  formData.append("nombre", nombre);
  formData.append("tags", JSON.stringify(tags));

  if (archivo) {
    formData.append("archivo", archivo);
  }

  const res = await axios.put(
    `http://localhost:4000/api/imagenes/${id_imagen}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return res.data;
}