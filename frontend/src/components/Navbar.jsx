// src/components/Navbar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const menuItems = [
    { path: '/', label: 'Inicio', key: 'inicio', icon: "🏠" },
    { path: "/nueva-imagen", label: "Nueva Imagen", icon: "➕" },
    { path: "/produccion", label: "Producción", icon: "🏭" },
    { path: "/inventario", label: "Inventario", icon: "📦" },
    { path: "/reportes", label: "Reportes", icon: "📊" },
    { path: "/catalogo", label: "Catálogo", icon: "📔"}
  ];

  return (
    <nav className="navbar">
      <div className="nav-container">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;