import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const HeaderNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menus = [
    { path: '/inicio', label: 'Ventas', key: 'inicio' },
    { path: '/nueva-imagen', label: 'Gestión de imágenes', key: 'gestion' },
    { path: '/produccion', label: 'Producción de pines', key: 'produccion' },
    { path: '/inventario', label: 'Inventario de pines', key: 'inventario' },
    { path: '/reportes', label: 'Reportes', key: 'reportes' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header-navigation">
      <div className="header-title">
        <h1># Tienda de Pines</h1>
      </div>
      
      <table className="nav-table">
        <tbody>
          <tr>
            {menus.map(menu => (
              <td key={menu.key}>
                <button
                  className={`nav-btn ${isActive(menu.path) ? 'active' : ''}`}
                  onClick={() => navigate(menu.path)}
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