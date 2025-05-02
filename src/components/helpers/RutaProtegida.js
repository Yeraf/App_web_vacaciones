// src/components/helpers/RutaProtegida.js
import React from 'react';
import { Navigate } from 'react-router-dom';

export const RutaProtegida = ({ children }) => {
  const usuario = localStorage.getItem('usuario');
  return usuario ? children : <Navigate to="/login" />;
};