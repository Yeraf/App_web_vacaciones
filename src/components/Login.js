// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const response = await fetch('http://localhost:3001/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena })
    });

    const data = await response.json();
    if (response.ok) {
      // podés guardar en localStorage si querés mantener sesión
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      navigate('/panel');
    } else {
      alert(data.mensaje);
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar sesión</h2>
      <input type="email" placeholder="Correo" value={correo} onChange={e => setCorreo(e.target.value)} />
      <input type="password" placeholder="Contraseña" value={contrasena} onChange={e => setContrasena(e.target.value)} />
      <button onClick={handleLogin}>Entrar</button>
    </div>
  );
};