import React, { useEffect, useState } from 'react';
import { Routes, Route, BrowserRouter, useLocation, Navigate } from "react-router-dom";
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

export const MisRutas = () => {
  const location = useLocation();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('usuario');
    if (stored) {
      setUsuario(JSON.parse(stored));
    }
    // Simula carga
    setTimeout(() => {
      setLoading(false);
    }, 450); // medio segundo
  }, []);

  const esLogin = location.pathname === "/login";
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!usuario && !esLogin) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <Routes>
        {/* Rutas públicas como login SIN layout */}
        <Route path="/login" element={<Login />} />
      </Routes>

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
