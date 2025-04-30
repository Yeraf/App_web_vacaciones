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
              <NavLink className={({ isActive }) => `NavLink ${isActive ? "active" : ""}`} to="/estadisticas">
              <img src='/images/icono.png' className='logo_contacto'></img> PANEL
              </NavLink>
            </li>
            <li>
              <NavLink className={({ isActive }) => `NavLink ${isActive ? "active" : ""}`} to="/dashboard">
              <img src='/images/productividad.png' className='logo_contacto'></img> RECURSOS
              </NavLink>
            </li>
            <li>
              <NavLink className={({ isActive }) => `NavLink ${isActive ? "active" : ""}`} to="/tareas">
              <img src='/images/lista-de-tareas.png' className='logo_contacto'></img> TAREAS
              </NavLink>
            </li>
            <li>
              <NavLink className={({ isActive }) => `NavLink ${isActive ? "active" : ""}`} to="/horario">
              <img src='/images/horas-laborales.png' className='logo_contacto'></img> HORARIO
              </NavLink>
            </li>
            <li>
              <NavLink className={({ isActive }) => `NavLink ${isActive ? "active" : ""}`} to="/calendario">
              <img src='/images/calendario.png' className='logo_contacto'></img> AGENDA
              </NavLink>
            </li>
            <li>
              <NavLink className={({ isActive }) => `NavLink ${isActive ? "active" : ""}`} to="/registro">
              <img src='/images/buscar.png' className='logo_contacto'></img> BUSCAR
              </NavLink>
            </li>
            <li>
              <NavLink className={({ isActive }) => `NavLink ${isActive ? "active" : ""}`} to="/panel">
              <img src='/images/tipo-de-cambio.png' className='logo_contacto'></img> CAMBIO
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