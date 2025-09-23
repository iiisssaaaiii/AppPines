import React, { useState, useRef } from 'react';
import '../styles/GestionImagenes.css';
import HeaderNavigation from '../components/gestion-imagenes/HeaderNavigation';
import EtiquetasInput from '../components/gestion-imagenes/EtiquetasInput';

const NuevaImagen = () => {
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

  const handleSubirFoto = () => {
    fileInputRef.current.click();
  };

  const handleAgregar = () => {
    if (nombre && imagenPreview) {
      alert(`Imagen "${nombre}" agregada con etiquetas: ${etiquetas.join(', ')}`);
      // Aquí luego conectaremos con la base de datos
      setNombre('');
      setEtiquetas([]);
      setImagenPreview(null);
    }
  };

  const handleCancelar = () => {
    setNombre('');
    setEtiquetas([]);
    setImagenPreview(null);
  };

  return (
    <div className="nueva-imagen-container">
      {/* Header con navegación */}
      <HeaderNavigation activo="gestion-imagenes" />

      {/* Contenido principal - EXACTAMENTE como en la imagen */}
      <main className="nueva-imagen-main">
        <div className="form-container">
          {/* Título */}
          <h1 className="form-title">NUEVA IMAGEN</h1>

          {/* Campo Nombre */}
          <div className="form-group">
            <label className="form-label">NOMBRE</label>
            <input 
              type="text" 
              className="form-input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ingresa el nombre del diseño"
            />
          </div>

          {/* Campo Etiquetas */}
          <div className="form-group">
            <label className="form-label">AGREGAR ETIQUETAS</label>
            <EtiquetasInput 
              etiquetas={etiquetas}
              setEtiquetas={setEtiquetas}
            />
          </div>

          {/* Botones Cancelar y Agregar */}
          <div className="form-actions">
            <button className="btn-cancelar" onClick={handleCancelar}>
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

          {/* Separador */}
          <div className="separator"></div>

          {/* Botón Subir Foto */}
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
            
            {/* Vista Previa de la imagen */}
            {imagenPreview && (
              <div className="image-preview-large">
                <img src={imagenPreview} alt="Vista previa" />
                <p>Vista previa de la imagen</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NuevaImagen;