// src/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        navigate('/estadisticas');
      } else {
        alert('Credenciales incorrectas');
      }
    } catch (error) {
      alert('Error al conectar con el servidor');
      console.error(error);
    }
  };

  return (
    <div>
      <div className="div-background-fondo" style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f1f1f1',
        padding: '30px'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          {/* Logo centrado */}
          <img
            src="/images/alpaca.png"
            alt="Logo"
            className="logo_alpaca"
            style={{ width: '80px', height: '80px', marginBottom: '10px' }}
          />

          {/* Nombre debajo del logo */}
          <h4 className="text-center mb-3" style={{ color: '#004d40' }}>YOKU ADMIN</h4>

          {/* Formulario */}
          <h3 className="text-center mb-4">Iniciar sesión</h3>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              className="form-control mb-3"
              placeholder="Correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
            <input
              type="password"
              className="form-control mb-4"
              placeholder="Contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary w-100">Entrar</button>
          </form>

          {/* Frase final */}
          <p style={{ marginTop: '20px', fontSize: '0.9rem', color: '#555' }}>
            Organiza y gestiona tu negocio de forma simple y efectiva.
          </p>
        </div>
      </div>
      {/* Footer exclusivo para login */}
      <footer className="login-footer-scroll">
  <p>
    Para soporte o consultas al 
    <a
      href="https://wa.me/50687261983"
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-link"
    >
      <img 
        src="/images/whatsapp.png"
        alt="WhatsApp"
        className="whatsapp-icon"
      />
      8726-1983
    </a>
  </p>
  <p>Desarrollado por © Yoku Studios, CR 2025</p>
</footer>
    </div>
  );
};