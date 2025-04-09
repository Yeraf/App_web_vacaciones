import React from 'react'
import { NavLink } from 'react-router-dom';

export const HeaderNav = () => {
  return (
    <header className='header'>
      <div className='logo'>
        <img src="/images/alpaca.png" className='logo_alpaca' alt="Alpaca Logo" />
        <h3 className='nombre_empresa'>YOKU PLANILLA</h3>
      </div>
      <nav>
        <ul>
          <li className='link_paginas'>
            <NavLink className={({ isActive }) => `NavLink ${isActive ? "active" : ""}`}
              to="/dashboard">DASHBOARD</NavLink>
            <NavLink className={({ isActive }) => `NavLink ${isActive ? "active" : ""}`}
              to="/contacto">CONTACTO</NavLink>
          </li>
        </ul>
      </nav>
    </header>
  )
}
