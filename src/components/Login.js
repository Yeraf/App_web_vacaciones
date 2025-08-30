// src/components/Login.js
import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "../apiBase";
import { saveUser } from "../auth";

export const Login = () => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const [isJumping, setIsJumping] = useState(false);
  const starsRef = useRef(null);

  const handleJump = () => {
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 600);

    for (let i = 0; i < 10; i++) {
      const star = document.createElement("div");
      star.className = "star";
      star.style.left = `${Math.random() * 80 + 10}px`;
      if (starsRef.current) {
        starsRef.current.appendChild(star);
        setTimeout(() => star.remove(), 1000);
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify({ correo, contrasena }),
      });

      if (!res.ok) {
        // útil para depurar si el backend responde 401/500
        const txt = await res.text().catch(() => "");
        console.error("Login no OK:", res.status, txt);
        alert("Credenciales incorrectas");
        return;
      }

      const data = await res.json();

      if (data?.success && data?.usuario) {
        // Guarda usuario (incluye Localidad) y lanza evento de storage
        saveUser(data.usuario);

        // Redirige a donde venía (si existe) o al dashboard.
        const to = location.state?.from?.pathname || "/dashboard";
        navigate(to, { replace: true });
      } else {
        alert(data?.message || "Credenciales inválidas");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Error al iniciar sesión");
    }
  };

  return (
    <div>
      <div
        className="div-background-fondo"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f1f1f1",
          padding: "30px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            width: "100%",
            maxWidth: "400px",
            textAlign: "center",
          }}
        >
          {/* Logo centrado */}
          <img
            src="/images/alpaca.png"
            alt="Logo"
            className={`logo_alpaca ${isJumping ? "jump" : ""}`}
            onClick={handleJump}
          />
          <div className="stars-container" ref={starsRef}></div>

          {/* Nombre debajo del logo */}
          <h4 className="text-center mb-3" style={{ color: "#004d40" }}>
            YOKU ADMIN
          </h4>

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
            <button type="submit" className="btn btn-primary w-100">
              Entrar
            </button>
          </form>

          {/* Frase final */}
          <p style={{ marginTop: "20px", fontSize: "0.9rem", color: "#555" }}>
            Organiza y gestiona tu negocio de forma simple y efectiva.
          </p>
        </div>
      </div>

      {/* Footer exclusivo para login */}
      <footer className="login-footer-scroll">
        <p>
          Para soporte o consultas al{" "}
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
