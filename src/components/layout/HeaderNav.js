import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export const HeaderNav = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [mostrarModalPassword, setMostrarModalPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [errorPassword, setErrorPassword] = useState('');

  useEffect(() => {
    document.body.classList.add('sidebar-open');
    return () => {
      document.body.classList.remove('sidebar-open');
      document.body.classList.remove('sidebar-closed');
    };
  }, []);

  const toggleSidebar = () => {
    const nuevoEstado = !sidebarOpen;
    setSidebarOpen(nuevoEstado);

    if (nuevoEstado) {
      document.body.classList.add('sidebar-open');
      document.body.classList.remove('sidebar-closed');
    } else {
      document.body.classList.add('sidebar-closed');
      document.body.classList.remove('sidebar-open');
    }
  };

  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const localidad = usuario?.Localidad || "Sin Localidad";

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  const verificarPassword = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/verificar-password-localidad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.autorizado) {
        setMostrarModalPassword(false);
        navigate('/localidad');
      } else {
        setErrorPassword('Contraseña incorrecta');
      }
    } catch (error) {
      setErrorPassword('Error al verificar contraseña');
    }
  };

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar d-flex justify-content-between align-items-center">
        <div className="logo-topbar d-flex align-items-center">
          <img src="/images/alpaca.png" alt="Logo" className="logo_alpaca" />
          <h3 className="nombre_empresa">YOKU ADMIN</h3>
        </div>

        <div className="text-center flex-grow-1">
          <h5 style={{ color: "white", margin: 0 }}>{localidad}</h5>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {usuario && <span className="text-light">👋 Hola, {usuario.Nombre}</span>}
          <button onClick={handleLogout} className="btn btn-outline-light btn-sm">Cerrar sesión</button>
          <button className="hamburger" onClick={toggleSidebar}>&#9776;</button>
        </div>
      </div>

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-blur-overlay">
          <nav>
            <ul>
              <li>
                <NavLink className={({ isActive }) => `NavLink ${isActive ? "active" : ""}`} to="/estadisticas">
                  <img src='/images/icono.png' className='logo_contacto' alt="" /> PANEL
                </NavLink>
              </li>
              <li>
                <NavLink className={({ isActive }) => `NavLink ${isActive ? "active" : ""}`} to="/dashboard">
                  <img src='/images/productividad.png' className='logo_contacto' alt="" /> RECURSOS
                </NavLink>
              </li>
              <li>
                <NavLink className={({ isActive }) => `NavLink ${isActive ? "active" : ""}`} to="/tareas">
                  <img src='/images/lista-de-tareas.png' className='logo_contacto' alt="" /> TAREAS
                </NavLink>
              </li>
              <li>
                <NavLink className={({ isActive }) => `NavLink ${isActive ? "active" : ""}`} to="/horario">
                  <img src='/images/horas-laborales.png' className='logo_contacto' alt="" /> HORARIO
                </NavLink>
              </li>
              <li>
                <NavLink className={({ isActive }) => `NavLink ${isActive ? "active" : ""}`} to="/calendario">
                  <img src='/images/calendario.png' className='logo_contacto' alt="" /> AGENDA
                </NavLink>
              </li>
              <li>
                <NavLink className={({ isActive }) => `NavLink ${isActive ? "active" : ""}`} to="/registro">
                  <img src='/images/buscar.png' className='logo_contacto' alt="" /> BUSCAR
                </NavLink>
              </li>
              <li>
                <NavLink className={({ isActive }) => `NavLink ${isActive ? "active" : ""}`} to="/panel">
                  <img src='/images/tipo-de-cambio.png' className='logo_contacto' alt="" /> CALCULAR
                </NavLink>
              </li>

              <li className="nav-item">
                <div
                  className="NavLink nav-link d-flex align-items-center justify-content-between"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseAcciones"
                  aria-expanded="false"
                  aria-controls="collapseAcciones"
                  role="button"
                >
                  <div className="d-flex align-items-center">
                    <img src="/images/empresa.png" className="logo_contacto me-2" alt="" />
                    <span className='text-white bold span-text-empresa'>EMPRESA</span>
                  </div>
                  <i className="bi bi-chevron-down"></i>
                </div>

                <div id="collapseAcciones" className="collapse">
                  <div className=" py-2 collapse-inner rounded">
                    <button className="NavLink btn w-100 text-start" onClick={() => setMostrarModalPassword(true)}>
                      Localidad
                    </button>
                  </div>
                </div>
              </li>

              <li>
                <NavLink className={({ isActive }) => `NavLink ${isActive ? "active" : ""}`} to="/contacto">
                  <img src='/images/auriculares.png' className='logo_contacto' alt="" /> CONTACTO
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      <Modal show={mostrarModalPassword} onHide={() => setMostrarModalPassword(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Acceso a Localidad</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="password"
            className="form-control"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errorPassword && <p className="text-danger mt-2">{errorPassword}</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModalPassword(false)}>Cancelar</Button>
          <Button variant="primary" onClick={verificarPassword}>Acceder</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
