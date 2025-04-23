import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

export const HeaderNav = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      {/* TOPBAR */}
      
      <div className="topbar">
        <div className="logo-topbar">
          <img src="/images/alpaca.png" alt="Logo" className="logo_alpaca" />
          <h3 className="nombre_empresa">YOKU ADMIN</h3>
        </div>
        <button className="hamburger" onClick={toggleSidebar}>
          &#9776;
        </button>
      </div>
      
      
      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
      <div className="sidebar-blur-overlay">
        <nav>
          <ul>
          <li>
              <NavLink className={({ isActive }) => `NavLink ${isActive ? "active" : ""}`} to="/panel">
              <img src='/images/icono.png' className='logo_contacto'></img> PANEL
              </NavLink>
            </li>
            <li>
              <NavLink className={({ isActive }) => `NavLink ${isActive ? "active" : ""}`} to="/dashboard">
              <img src='/images/productividad.png' className='logo_contacto'></img> ACTIVIDAD
              </NavLink>
            </li>
            <li>
              <NavLink className={({ isActive }) => `NavLink ${isActive ? "active" : ""}`} to="/contacto">
              <img src='/images/auriculares.png' className='logo_contacto'></img> Contacto
              </NavLink>
            </li>
          </ul>
        </nav>
        </div>
      </aside>
      
    </>
  );
};