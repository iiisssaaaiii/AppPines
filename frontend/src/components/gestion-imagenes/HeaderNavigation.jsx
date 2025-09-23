// src/components/gestion-imagenes/HeaderNavigation.jsx
import React from 'react';

const HeaderNavigation = ({ activo }) => {
  const menus = [
    { key: 'gestion-imagenes', label: 'Gestión de imágenes' },
    { key: 'produccion-pines', label: 'Producción de pines' },
    { key: 'inventario-pines', label: 'Inventario de pines' },
    { key: 'ventas', label: 'Ventas' },
    { key: 'reportes', label: 'Reportes' },
    { key: 'administracion', label: 'Administración' }
  ];

  return (
    <header className="header-navigation">
      <div className="header-title">
        <h1># Tienda de Pines</h1>
      </div>
      
      {/* Tabla de navegación como en la imagen */}
      <table className="nav-table">
        <tbody>
          <tr>
            {menus.map(menu => (
              <td key={menu.key}>
                <button
                  className={`nav-btn ${activo === menu.key ? 'active' : ''}`}
                >
                  {menu.label}
                </button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </header>
  );
};

export default HeaderNavigation;