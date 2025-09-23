import React, { useState, useRef } from 'react';
import EtiquetasInput from './EtiquetasInput';

const NuevaImagenModal = ({ onClose, onAgregar }) => {
  const [nombre, setNombre] = useState('');
  const [etiquetas, setEtiquetas] = useState([]);
  const [imagenPreview, setImagenPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagenPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAgregar = () => {
    if (nombre && imagenPreview) {
      onAgregar({
        nombre,
        etiquetas,
        url: imagenPreview
      });
    }
  };

  const handleSubirFoto = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Header del Modal */}
        <div className="modal-header">
          <h2>NUEVA IMAGEN</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Campos del Formulario */}
        <div className="modal-body">
          {/* Campo Nombre */}
          <div className="form-group">
            <label>NOMBRE</label>
            <input 
              type="text" 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ingresa el nombre del diseño"
            />
          </div>

          {/* Campo Etiquetas */}
          <div className="form-group">
            <label>AGREGAR ETIQUETAS</label>
            <EtiquetasInput 
              etiquetas={etiquetas}
              setEtiquetas={setEtiquetas}
            />
          </div>

          {/* Subir Foto */}
          <div className="upload-section">
            <button className="btn-subir-foto" onClick={handleSubirFoto}>
              Subir foto
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              style={{ display: 'none' }}
            />
            
            {/* Vista Previa */}
            {imagenPreview && (
              <div className="image-preview">
                <img src={imagenPreview} alt="Vista previa" />
              </div>
            )}
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="modal-actions">
          <button className="btn-cancelar" onClick={onClose}>
            CANCELAR
          </button>
          <button 
            className="btn-agregar" 
            onClick={handleAgregar}
            disabled={!nombre || !imagenPreview}
          >
            AGREGAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default NuevaImagenModal;