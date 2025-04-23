// src/components/PanelPrincipal.js
import React from 'react';

export const PanelPrincipal = () => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  return (
    <div style={{ padding: '20px' }}>
      <h1>Bienvenido, {usuario?.nombre}</h1>
      <p>Aquí irán tus estadísticas...</p>
    </div>
  );
};