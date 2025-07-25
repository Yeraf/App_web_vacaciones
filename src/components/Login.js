// src/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useEffect } from 'react'; // Asegúrate de tener esta línea al inicio del archivo


export const Login = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const navigate = useNavigate();


  const [isJumping, setIsJumping] = useState(false);
  const starsRef = React.useRef(null);

  const handleJump = () => {
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 600); // Reset salto


    for (let i = 0; i < 10; i++) {
      const star = document.createElement("div");
      star.className = "star";
      star.style.left = `${Math.random() * 80 + 10}px`;
      starsRef.current.appendChild(star);
      setTimeout(() => star.remove(), 1000); // Eliminar después de animar
    }
  };


  // Mover hormiga 
  // useEffect(() => {
  //   const ant = document.getElementById("ant");

  //   const moveAnt = () => {
  //     if (!ant) return;

  //     const x = Math.random() * window.innerWidth;
  //     const y = Math.random() * window.innerHeight;

  //     ant.style.transform = `translate(${x}px, ${y}px) rotate(${Math.random() * 360}deg)`;
  //   };

  //   const interval = setInterval(() => {
  //     // Mostrar u ocultar la hormiga aleatoriamente
  //     const visible = Math.random() > 0.5;
  //     if (visible) {
  //       ant.style.opacity = 1;
  //       moveAnt();
  //     } else {
  //       ant.style.opacity = 0;
  //     }
  //   }, 4000); // cada 4s

  //   return () => clearInterval(interval);
  // }, []);

  // Aquí hacemos el Login

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });

      if (!res.ok) {
        alert("Credenciales incorrectas");
        return;
      }

      const data = await res.json();

      if (data.success && data.usuario) {
        const usuario = data.usuario;

        // Guardar en localStorage de forma segura
        localStorage.setItem("usuario", JSON.stringify(usuario));

        if (usuario.Localidad) {
          localStorage.setItem("localidad", usuario.Localidad);
        } else {
          console.warn("Localidad no encontrada en el objeto de usuario.");
          localStorage.removeItem("localidad");
        }

        // Solución: Redirige como si diera F5
        window.location.href = "/";

        // Esperar brevemente para garantizar que el almacenamiento esté completo
        await new Promise(resolve => setTimeout(resolve, 100));

        // Navegar solo si todo está correcto
        navigate("/dashboard");
      } else {
        alert(data.message || "Credenciales inválidas");
      }

    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Error al iniciar sesión");
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
            className={`logo_alpaca ${isJumping ? 'jump' : ''}`}
            onClick={handleJump}
          />
          <div className="stars-container" ref={starsRef}></div>

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

      {/* <div className="ant-container">
        <img src="/images/hormiga-voladora.png" alt="Hormiga" className="ant" id="ant" />
      </div> */}

      {/* Footer exclusivo para login */}
      <footer className="login-footer-scroll">
        <p>
          Para soporte o consultas al

          <img
            src="/images/whatsapp.png"
            alt="WhatsApp"
            className="whatsapp-icon"
          />

          <a
            href="https://wa.me/50687261983"
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-link"
          >

            8726-1983
          </a>
        </p>
        <p>Desarrollado por © Yoku Studios, CR 2025</p>
      </footer>
    </div>
  );
};