import React, { useState, useRef } from "react";
import { imprimirPines } from "../services/produccionService"; // ✅ importar servicio

const NuevaImagen = () => {
  const [nombre, setNombre] = useState("");
  const [etiquetas, setEtiquetas] = useState([]);
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState("");
  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const fileInputRef = useRef(null);

  const agregarEtiqueta = () => {
    if (nuevaEtiqueta.trim() !== "") {
      setEtiquetas([...etiquetas, nuevaEtiqueta.trim()]);
      setNuevaEtiqueta("");
    }
  };

  const eliminarEtiqueta = (index) => {
    setEtiquetas(etiquetas.filter((_, i) => i !== index));
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImagen(file);

      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagenPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImagen(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagenPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imagen) {
      alert("Por favor, selecciona una imagen");
      return;
    }

    try {
      // ⚡ Aquí usamos el servicio del backend
      const result = await imprimirPines({
        url_imagen: imagenPreview, // En esta fase usamos la preview base64 (luego se puede guardar en servidor real)
        etiquetas: etiquetas.join(","),
        tamano: "grande", // o "pequeno" según la selección en tu UI
        cantidad: 12, // ejemplo: una hoja completa de pines grandes
        id_usuario: 1 // luego se reemplaza con el usuario autenticado
      });

      alert(`✅ ${result.mensaje}`);

      // Resetear formulario después de éxito
      setNombre("");
      setEtiquetas([]);
      setImagen(null);
      setImagenPreview(null);
    } catch (error) {
      console.error("Error al enviar al backend:", error);
      alert("❌ Error al registrar la producción");
    }
  };

  const handleCancel = () => {
    setNombre("");
    setEtiquetas([]);
    setImagen(null);
    setImagenPreview(null);
  };

  return (
    <div className="nueva-imagen-container">
      <div className="page-header">
        <h1>Tienda de Pines</h1>
        <p>Gestión de imágenes</p>
      </div>

      <h2>NUEVA IMAGEN</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="nombre">NOMBRE</label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ingresa el nombre de la imagen"
              required
            />
          </div>

          <div className="etiquetas-section">
            <div className="etiquetas-header">
              <span>AGREGAR ETIQUETAS</span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={nuevaEtiqueta}
                  onChange={(e) => setNuevaEtiqueta(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), agregarEtiqueta())
                  }
                  placeholder="Nueva etiqueta"
                  style={{
                    padding: "0.5rem",
                    border: "1px solid #bdc3c7",
                    borderRadius: "4px"
                  }}
                />
                <button
                  type="button"
                  onClick={agregarEtiqueta}
                  className="btn btn-primary"
                >
                  Agregar
                </button>
              </div>
            </div>

            <table className="etiquetas-table">
              <thead>
                <tr>
                  <th>- ETIQUETAS</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {etiquetas.map((etiqueta, index) => (
                  <tr key={index}>
                    <td>{etiqueta}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => eliminarEtiqueta(index)}
                        className="btn btn-cancel"
                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {etiquetas.length === 0 && (
                  <tr>
                    <td
                      colSpan="2"
                      style={{ textAlign: "center", color: "#7f8c8d" }}
                    >
                      No hay etiquetas agregadas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sección de carga de imagen */}
        <div
          className="upload-section"
          onClick={handleUploadClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{ cursor: "pointer" }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            style={{ display: "none" }}
          />

          {imagenPreview ? (
            <div>
              <img
                src={imagenPreview}
                alt="Vista previa"
                style={{
                  maxWidth: "200px",
                  maxHeight: "200px",
                  marginBottom: "1rem",
                  border: "2px solid #3498db",
                  borderRadius: "4px"
                }}
              />
              <p>Imagen seleccionada: {imagen.name}</p>
              <p style={{ color: "#7f8c8d", fontSize: "0.9rem" }}>
                Haz clic para cambiar de imagen o arrastra una nueva
              </p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📷</div>
              <div className="upload-text">
                <p>Haz clic para seleccionar una imagen</p>
                <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
                  o arrastra y suelta una imagen aquí
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Información de la imagen seleccionada */}
        {imagen && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              backgroundColor: "#ecf0f1",
              borderRadius: "4px",
              textAlign: "left"
            }}
          >
            <h4>Información de la imagen:</h4>
            <p>
              <strong>Nombre:</strong> {imagen.name}
            </p>
            <p>
              <strong>Tamaño:</strong>{" "}
              {(imagen.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <p>
              <strong>Tipo:</strong> {imagen.type}
            </p>
          </div>
        )}

        {/* Botones */}
        <div className="button-group" style={{ marginTop: "2rem" }}>
          <button type="button" onClick={handleCancel} className="btn btn-cancel">
            CANCELAR
          </button>
          <button type="submit" className="btn btn-primary">
            AGREGAR
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevaImagen;
