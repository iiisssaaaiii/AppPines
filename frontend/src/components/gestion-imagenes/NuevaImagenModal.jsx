import React from 'react';

const NuevaImagenModal = ({ onClose, onAgregar }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '10px',
        width: '90%',
        maxWidth: '500px'
      }}>
        <h2>Modal de Nueva Imagen</h2>
        <p>Este modal está en desarrollo</p>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

export default NuevaImagenModal;