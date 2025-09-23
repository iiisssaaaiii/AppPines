import React, { useState } from 'react';
import '../styles/GestionImagenes.css';
import NuevaImagenModal from '../components/gestion-imagenes/NuevaImagenModal';

const GestionImagenes = () => {
  const [showModal, setShowModal] = useState(false);
  const [imagenes, setImagenes] = useState([]);

  // Datos de ejemplo para las imágenes
  const imagenesEjemplo = [
    { id: 1, nombre: 'Diseño 1', etiquetas: ['animales', 'colorido'], url: '/placeholder1.jpg' },
    { id: 2, nombre: 'Diseño 2', etiquetas: ['abstracto', 'moderno'], url: '/placeholder2.jpg' },
    { id: 3, nombre: 'Diseño 3', etiquetas: ['texto', 'minimalista'], url: '/placeholder3.jpg' },
  ];

  const agregarImagen = (nuevaImagen) => {
    setImagenes([...imagenes, { ...nuevaImagen, id: Date.now() }]);
    setShowModal(false);
  };

  return (
    <div className="gestion-imagenes-container">
      {/* Header */}
      <header className="ges-header">
        <h1># Tienda de Pines</h1>
        <nav className="ges-nav">
          <button className="nav-btn active">Gestión de imágenes</button>
          <button className="nav-btn">Producción de pines</button>
          <button className="nav-btn">Inventario de pines</button>
          <button className="nav-btn">Ventas</button>
          <button className="nav-btn">Reportes</button>
          <button className="nav-btn">Administración</button>
        </nav>
      </header>

      {/* Contenido Principal */}
      <main className="ges-main">
        {/* Botón Nueva Imagen */}
        <div className="nueva-imagen-section">
          <button 
            className="btn-nueva-imagen"
            onClick={() => setShowModal(true)}
          >
            + NUEVA IMAGEN
          </button>
        </div>

        {/* Grid de Imágenes */}
        <div className="imagenes-grid">
          {imagenesEjemplo.map(imagen => (
            <div key={imagen.id} className="imagen-card">
              <div className="imagen-preview">
                <img src={imagen.url} alt={imagen.nombre} />
              </div>
              <div className="imagen-info">
                <h3>{imagen.nombre}</h3>
                <div className="etiquetas-container">
                  {imagen.etiquetas.map((etiqueta, index) => (
                    <span key={index} className="etiqueta-chip">{etiqueta}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal Nueva Imagen */}
      {showModal && (
        <NuevaImagenModal 
          onClose={() => setShowModal(false)}
          onAgregar={agregarImagen}
        />
      )}
    </div>
  );
};

export default GestionImagenes;