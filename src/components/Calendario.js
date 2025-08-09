import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { Modal, Button, Form } from 'react-bootstrap';
import 'react-calendar/dist/Calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const SHOW_REMINDER_DELAY_MS = 30000; // 30s

// Fecha local YYYY-MM-DD (sin zona horaria UTC)
const toYMDLocal = (d) => {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
};

const resolveLocalidad = () => {
  const raw = localStorage.getItem('localidad');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed.Localidad || parsed.Empresa || raw;
      }
    } catch {
      return raw;
    }
  }
  try {
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    if (usuario?.Localidad) return usuario.Localidad;
  } catch {}
  return 'General';
};

export const Calendario = () => {
  const [date, setDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [eventos, setEventos] = useState({});
  const [nuevaCita, setNuevaCita] = useState('');

  // 🔔 modal de recordatorios
  const [showRecordatorios, setShowRecorditorios] = useState(false);
  const [recordatoriosHoy, setRecordatoriosHoy] = useState([]);
  const [recordatoriosManana, setRecordatoriosManana] = useState([]);

  const localidad = resolveLocalidad();

  const hoy = new Date();
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);
  const hoyStr = toYMDLocal(hoy);
  const mananaStr = toYMDLocal(manana);

  // Cargar eventos (migra si el formato es el viejo)
  useEffect(() => {
    const stored = localStorage.getItem('eventosCalendario');
    if (!stored) {
      setEventos({});
      return;
    }

    try {
      const parsed = JSON.parse(stored);

      // Formato nuevo: { [localidad]: { 'YYYY-MM-DD': [citas] } }
      const esFormatoNuevo =
        parsed && typeof parsed === 'object' &&
        Object.values(parsed).some(
          v => v && typeof v === 'object' && Object.keys(v).some(k => /^\d{4}-\d{2}-\d{2}$/.test(k))
        );

      // Formato viejo: { 'YYYY-MM-DD': [citas] }
      const pareceFormatoViejo =
        parsed && typeof parsed === 'object' &&
        Object.keys(parsed).every(k => /^\d{4}-\d{2}-\d{2}$/.test(k));

      if (esFormatoNuevo) {
        setEventos(parsed);
      } else if (pareceFormatoViejo) {
        const migrado = { [localidad]: parsed };
        setEventos(migrado);
        localStorage.setItem('eventosCalendario', JSON.stringify(migrado));
      } else {
        setEventos({});
      }
    } catch {
      setEventos({});
    }
  }, [localidad]);

  // Guardar eventos
  useEffect(() => {
    localStorage.setItem('eventosCalendario', JSON.stringify(eventos));
  }, [eventos]);

  // Mostrar recordatorios 30s después de montar la pantalla de Calendario
  useEffect(() => {
    const porLoc = eventos[localidad] || {};
    const hoyArr = porLoc[hoyStr] || [];
    const mananaArr = porLoc[mananaStr] || [];

    if (hoyArr.length === 0 && mananaArr.length === 0) return;

    const t = setTimeout(() => {
      setRecordatoriosHoy(hoyArr);
      setRecordatoriosManana(mananaArr);
      setShowRecorditorios(true);
    }, SHOW_REMINDER_DELAY_MS);

    return () => clearTimeout(t);
  }, [eventos, localidad, hoyStr, mananaStr]);

  const handleDayClick = (value) => {
    setDate(value);
    setNuevaCita('');
    setModalOpen(true);
  };

  const handleAgregarCita = () => {
    const fecha = toYMDLocal(date);
    setEventos((prev) => {
      const porLoc = prev[localidad] || {};
      const citasPrevias = porLoc[fecha] || [];
      const actualLoc = { ...porLoc, [fecha]: [...citasPrevias, nuevaCita].filter(Boolean) };
      return { ...prev, [localidad]: actualLoc };
    });
    setNuevaCita('');
    setModalOpen(false);
  };

  const handleEliminarCita = (fecha, index) => {
    setEventos((prev) => {
      const porLoc = prev[localidad] || {};
      const existentes = [...(porLoc[fecha] || [])];
      existentes.splice(index, 1);

      const nuevoPorLoc = { ...porLoc };
      if (existentes.length === 0) {
        delete nuevoPorLoc[fecha];
      } else {
        nuevoPorLoc[fecha] = existentes;
      }

      return { ...prev, [localidad]: nuevoPorLoc };
    });
  };

  const eventosPorLocalidad = eventos[localidad] || {};

  const tileContent = ({ date, view }) => {
    const fecha = toYMDLocal(date);
    if (view === 'month' && eventosPorLocalidad[fecha]) {
      return (
        <div className="text-primary small">
          📌 {eventosPorLocalidad[fecha].length}
        </div>
      );
    }
    return null;
  };

  const citasDelDiaSeleccionado = eventosPorLocalidad[toYMDLocal(date)] || [];

  return (
    <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: '51vh', paddingTop: '20px' }}>
      <h2 className="mb-4 text-center">Calendario {new Date().getFullYear()}</h2>

      <div style={{
        background: '#f9f9f9',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        maxWidth: '700px',
        width: '100%',
      }}>
        <Calendar
          onClickDay={handleDayClick}
          value={date}
          tileContent={tileContent}
          className="w-100"
        />
      </div>

      {/* Modal para agregar/ver citas del día */}
      <Modal show={modalOpen} onHide={() => setModalOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Cita para {date.toLocaleDateString()}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Descripción de la Cita</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Reunión, Médico, Cumpleaños..."
              value={nuevaCita}
              onChange={(e) => setNuevaCita(e.target.value)}
            />
          </Form.Group>

          {citasDelDiaSeleccionado.map((cita, idx) => (
            <div key={idx} className="alert alert-info d-flex justify-content-between align-items-center">
              {cita}
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleEliminarCita(toYMDLocal(date), idx)}
              >
                ✖
              </Button>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Cerrar
          </Button>
          <Button variant="primary" onClick={handleAgregarCita}>
            Guardar Cita
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de recordatorios (hoy/mañana) */}
      <Modal show={showRecordatorios} onHide={() => setShowRecorditorios(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>🔔 Recordatorios — {localidad}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {recordatoriosHoy.length === 0 && recordatoriosManana.length === 0 && (
            <div className="text-muted">No hay tareas para hoy o mañana.</div>
          )}

          {recordatoriosHoy.length > 0 && (
            <>
              <h6 className="mb-2">📅 Hoy ({new Date().toLocaleDateString()}):</h6>
              <ul className="list-group mb-3">
                {recordatoriosHoy.map((txt, i) => (
                  <li key={`h-${i}`} className="list-group-item">{txt}</li>
                ))}
              </ul>
            </>
          )}

          {recordatoriosManana.length > 0 && (
            <>
              <h6 className="mb-2">⏭️ Mañana ({manana.toLocaleDateString()}):</h6>
              <ul className="list-group">
                {recordatoriosManana.map((txt, i) => (
                  <li key={`m-${i}`} className="list-group-item">{txt}</li>
                ))}
              </ul>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowRecorditorios(false)}>
            Entendido
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
