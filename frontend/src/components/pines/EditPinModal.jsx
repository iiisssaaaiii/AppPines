// src/components/pines/EditPinModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { subirImagen } from "../../services/produccionService";

const EditPinModal = ({ open, pin, onClose, onSave }) => {
  const [nombre, setNombre] = useState("");
  const [etiquetas, setEtiquetas] = useState("");
  const [tamano, setTamano] = useState("grande");
  const [cantidad, setCantidad] = useState(0);
  const [preview, setPreview] = useState("");
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (pin) {
      setNombre(pin.nombre || "");
      setEtiquetas(pin.etiquetas || "");
      setTamano(pin.tamano || "grande");
      setCantidad(pin.cantidad ?? 0);
      setPreview(pin.url_imagen || "");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [pin]);

  if (!open || !pin) return null;

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    if (f) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(pin.url_imagen || "");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let url_imagen = pin.url_imagen;

    // Si subieron una nueva imagen, primero la mandamos al backend
    if (file) {
      const formData = new FormData();
      formData.append("imagen", file);
      const up = await subirImagen(formData); // { url: ".../uploads/xxx.png" }
      url_imagen = up.url;
    }

    await onSave({
      nombre: nombre?.trim() || null,
      etiquetas: etiquetas?.trim() || null,
      tamano,
      cantidad: Number(cantidad) || 0,
      url_imagen
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: 560 }}>
        <h3 style={{ marginTop: 0 }}>Editar pin #{pin.id_pin}</h3>

        <form onSubmit={handleSubmit} className="form-grid">
          {/* Columna izquierda */}
          <div className="form-col">
            <label className="form-label">Nombre</label>
            <input
              className="form-input"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Pikachu sonriente"
            />

            <label className="form-label">Etiquetas (separadas por coma)</label>
            <input
              className="form-input"
              type="text"
              value={etiquetas}
              onChange={(e) => setEtiquetas(e.target.value)}
              placeholder="anime, cute, amarillo"
            />

            <label className="form-label">Tamaño</label>
            <select className="form-input" value={tamano} onChange={(e) => setTamano(e.target.value)}>
              <option value="pequeno">Pequeño</option>
              <option value="grande">Grande</option>
            </select>

            <label className="form-label">Cantidad en inventario</label>
            <input
              className="form-input"
              type="number"
              min="0"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
            />
          </div>

          {/* Columna derecha */}
          <div className="form-col">
            <div className="vista-previa" style={{ textAlign: "center" }}>
              {preview ? (
                <img src={preview} alt="preview" style={{ width: 200, height: 200, objectFit: "cover", borderRadius: 12, border: "2px solid #ccc" }}/>
              ) : (
                <div style={{
                  width: 200, height: 200, borderRadius: 12, border: "2px dashed #ccc",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  Sin imagen
                </div>
              )}
            </div>

            <div style={{ marginTop: 12 }}>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} />
            </div>
          </div>
        </form>

        <div className="modal-actions" style={{ marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Guardar cambios</button>
        </div>
      </div>
    </div>
  );
};

export default EditPinModal;
