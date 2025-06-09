// NUEVA IMPLEMENTACIÓN DESDE CERO PARA IMPRIMIR BOLETA
import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import Modal from 'react-bootstrap/Modal';
import React from 'react';

const ContenedorImpresion = React.forwardRef(function ContenedorImpresion({ boleta, empresa }, ref) {
  return (
    <div ref={ref} style={{ width: '80mm', fontSize: '11px', padding: '8px', fontFamily: 'monospace' }}>
      {empresa && (
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <strong>{empresa.Empresa}</strong><br />
          {empresa.RazonSocial}<br />
          N° Cédula: {empresa.NumeroCedula}<br />
          Correo: {empresa.Correo}<br />
          Teléfono: {empresa.Telefono}<br />
          <hr />
        </div>
      )}
      <div style={{ textAlign: 'center' }}>
        <strong>Boleta de Vacaciones</strong>
      </div>
      <div style={{ marginTop: '10px' }}>
        <p><strong>Colaborador:</strong> {boleta.Nombre}</p>
        <p><strong>Cédula:</strong> {boleta.CedulaID}</p>
        <p><strong>Desde:</strong> {boleta.FechaSalida?.slice(0, 10)}</p>
        <p><strong>Hasta:</strong> {boleta.FechaEntrada?.slice(0, 10)}</p>
        <p><strong>Días solicitados:</strong> {boleta.Dias}</p>
        <p><strong>Motivo:</strong> {boleta.Detalle}</p>
        <p><strong>Boleta:</strong> {boleta.NumeroBoleta}</p>
      </div>
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        ----------------------------------<br />
        <em>Gracias por su gestión</em>
      </div>
    </div>
  );
});

export const ModalImpresionBoleta = ({ mostrar, cerrar, boleta }) => {
  const [empresa, setEmpresa] = useState(null);
  const ref = useRef();

  const handleImprimir = useReactToPrint({
    content: () => ref.current,
    documentTitle: 'BoletaVacaciones'
  });

  useEffect(() => {
    const localidad = localStorage.getItem("localidad");
    if (localidad) {
      fetch(`http://localhost:3001/api/localidades/${encodeURIComponent(localidad)}`)
        .then(res => res.json())
        .then(data => setEmpresa(data))
        .catch(err => console.error("Error cargando encabezado empresa:", err));
    }
  }, [mostrar]);

  return (
    <Modal show={mostrar} onHide={cerrar} size="sm" centered>
      <Modal.Header closeButton>
        <Modal.Title>Boleta de Vacaciones</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {boleta && <ContenedorImpresion ref={ref} boleta={boleta} empresa={empresa} />}
      </Modal.Body>
      <Modal.Footer>
        <button onClick={handleImprimir} className="btn btn-success btn-sm">
          Descargar
        </button>
      </Modal.Footer>
    </Modal>
  );
};

