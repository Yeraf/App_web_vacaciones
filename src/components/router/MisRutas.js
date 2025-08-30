// src/components/router/MisRutas.js
import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Dashboard } from '../Dashboard';
import { Footer } from '../layout/Footer';
import { Contacto } from '../Contacto';
import { HeaderNav } from '../layout/HeaderNav';
import { PanelPrincipal } from '../PanelPrincipal';
import { Tareas } from '../Tareas';
import { Estadisticas } from '../Estadisticas';
import { Calendario } from '../Calendario';
import { Registro } from '../Registro';
import { Horarios } from '../Horarios';
import { Login } from '../Login';
import { RutaProtegida } from '../helpers/RutaProtegida';
import { Localidades } from '../Localidades';
// (opcional, si creaste auth.js con eventos) import { getUser } from '../auth';

export const MisRutas = () => {
  const location = useLocation();

  // ⚙️ estado
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  // ¿estamos en /login?
  const esLogin = location.pathname === "/login";

  useEffect(() => {
    // Lee usuario al montar
    try {
      const stored = localStorage.getItem('usuario');
      if (stored) setUsuario(JSON.parse(stored));
    } catch (_) {}

    // Escucha cambios (si usas auth.js que dispara eventos 'login'/'logout')
    const onLogin = () => {
      try {
        const u = JSON.parse(localStorage.getItem('usuario') || "null");
        setUsuario(u);
      } catch { setUsuario(null); }
    };
    const onLogout = () => setUsuario(null);

    window.addEventListener('login', onLogin);
    window.addEventListener('logout', onLogout);

    // Multi-pestaña: si otro tab hace login/logout
    const onStorage = (e) => {
      if (e.key === 'usuario') {
        try {
          const u = e.newValue ? JSON.parse(e.newValue) : null;
          setUsuario(u);
        } catch { setUsuario(null); }
      }
    };
    window.addEventListener('storage', onStorage);

    // Simula carga (tu loader)
    const t = setTimeout(() => setLoading(false), 450);

    return () => {
      clearTimeout(t);
      window.removeEventListener('login', onLogin);
      window.removeEventListener('logout', onLogout);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!usuario && !esLogin) {
    // guarda a dónde iba para que Login pueda devolverlo
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <>
      {/* Ruta pública de login sin layout */}
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>

      {/* Layout + rutas protegidas si hay usuario y no estamos en /login */}
      {!esLogin && usuario && (
        <>
          <HeaderNav />
          <div className="app-container animate-fadein">
            <section className="content_section">
              <Routes>
                <Route path="/" element={<RutaProtegida><Estadisticas /></RutaProtegida>} />
                <Route path="/estadisticas" element={<RutaProtegida><Estadisticas /></RutaProtegida>} />
                <Route path="/dashboard" element={<RutaProtegida><Dashboard /></RutaProtegida>} />
                <Route path="/tareas" element={<RutaProtegida><Tareas /></RutaProtegida>} />
                <Route path="/horario" element={<RutaProtegida><Horarios /></RutaProtegida>} />
                <Route path="/calendario" element={<RutaProtegida><Calendario /></RutaProtegida>} />
                <Route path="/registro" element={<RutaProtegida><Registro /></RutaProtegida>} />
                <Route path="/contacto" element={<RutaProtegida><Contacto /></RutaProtegida>} />
                <Route path="/panel" element={<RutaProtegida><PanelPrincipal /></RutaProtegida>} />
                <Route path="/localidad" element={<RutaProtegida><Localidades /></RutaProtegida>} />
                <Route path="/footer" element={<Footer />} />
              </Routes>
            </section>
          </div>
        </>
      )}
    </>
  );
};
