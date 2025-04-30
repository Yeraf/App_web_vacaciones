import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { Modal, Button, Form } from 'react-bootstrap';
import 'react-calendar/dist/Calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export const Calendario = () => {
  const [date, setDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [eventos, setEventos] = useState({});
  const [nuevaCita, setNuevaCita] = useState('');

  useEffect(() => {
    const storedEventos = localStorage.getItem('eventosCalendario');
    if (storedEventos) {
      setEventos(JSON.parse(storedEventos));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('eventosCalendario', JSON.stringify(eventos));
  }, [eventos]);

  const handleDayClick = (value) => {
    setDate(value);
    setNuevaCita('');
    setModalOpen(true);
  };

  const handleAgregarCita = () => {
    const fecha = date.toISOString().split('T')[0];
    setEventos((prev) => {
      const citasPrevias = prev[fecha] || [];
      return { ...prev, [fecha]: [...citasPrevias, nuevaCita] };
    });
    setNuevaCita('');
    setModalOpen(false);
  };

  const handleEliminarCita = (fecha, index) => {
    setEventos((prev) => {
      const nuevasCitas = [...(prev[fecha] || [])];
      nuevasCitas.splice(index, 1);
      if (nuevasCitas.length === 0) {
        const { [fecha]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [fecha]: nuevasCitas };
    });
  };

  const tileContent = ({ date, view }) => {
    const fecha = date.toISOString().split('T')[0];
    if (view === 'month' && eventos[fecha]) {
      return (
        <div className="text-primary small">
          📌 {eventos[fecha].length}
        </div>
      );
    }
    return null;
  };

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
          className="w-100" // Hace que el calendario use todo el ancho disponible
        />
      </div>

      {/* Modal para agregar citas */}
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

          {eventos[date.toISOString().split('T')[0]] &&
            eventos[date.toISOString().split('T')[0]].map((cita, idx) => (
              <div key={idx} className="alert alert-info d-flex justify-content-between align-items-center">
                {cita}
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleEliminarCita(date.toISOString().split('T')[0], idx)}
                >
                  ✖
                </Button>
              </div>
            ))
          }
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
    </div>
  );
};