// src/components/EncabezadoEmpresa.js
import React, { useEffect, useState } from 'react';

export const EncabezadoEmpresa = () => {
  const [empresa, setEmpresa] = useState(null);

  useEffect(() => {
    const localidad = localStorage.getItem("localidad");
    if (localidad) {
      fetch(`http://localhost:3001/api/localidades/${encodeURIComponent(localidad)}`)
        .then(res => res.json())
        .then(data => setEmpresa(data))
        .catch(err => console.error("Error cargando encabezado:", err));
    }
  }, []);

  if (!empresa) return null;

  return (
    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
      <h3>{empresa.Empresa}</h3>
      <p>{empresa.RazonSocial}</p>
      <p>N° Cédula: {empresa.NumeroCedula}</p>
      <p>Correo: {empresa.Correo}</p>
      <p>Teléfono: {empresa.Telefono}</p>
      <p>{empresa.Direccion}</p>
      <hr />
    </div>
  );
};