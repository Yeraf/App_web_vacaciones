import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { EncabezadoEmpresa } from './EncabezadoEmpresa';
import ContratoColaborador from './ContratoColaborador';
import jsPDF from 'jspdf';

const GestionContratos = () => {
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalVer, setModalVer] = useState(false);

  const [contratos, setContratos] = useState([]);
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const contratosPorPagina = 6;

  const localidad = localStorage.getItem('localidad');

  const abrirModalVer = async () => {
    const res = await fetch(`http://localhost:3001/api/contratos?empresa=${encodeURIComponent(localidad)}`);
    const data = await res.json();
    setContratos(data);
    setPaginaActual(1);
    setModalVer(true);
  };

  const abrirModalEditar = async (contrato) => {
    if (!contrato) return;
    const res = await fetch(`http://localhost:3001/api/contratos/${contrato.ID}`);
    const data = await res.json();
    setContratoSeleccionado(data);
    setModalEditar(true);
  };

  const eliminarContrato = async (contratoID) => {
    if (!window.confirm("¿Estás seguro que deseas eliminar este contrato?")) return;

    try {
      const res = await fetch(`http://localhost:3001/api/contratos/${contratoID}`, { method: 'DELETE' });
      if (res.ok) {
        alert("Contrato eliminado correctamente.");
        refrescarContratos();
      } else {
        alert("Error al eliminar el contrato.");
      }
    } catch (error) {
      console.error("Error al eliminar contrato:", error);
      alert("Error inesperado.");
    }
  };

  const descargarPDF = async (contrato) => {
    try {
      const res = await fetch(`http://localhost:3001/api/contratos/${contrato.ID}`);
      const data = await res.json();

      if (!data || !data.Contenido) {
        return alert("Contrato sin contenido disponible");
      }

      const doc = new jsPDF({ unit: 'mm', format: 'letter' });
      let y = 20;

      doc.setFontSize(12);
      doc.setFont('times', 'bold');
      doc.text("Contrato Laboral", 105, y, { align: 'center' });
      y += 10;

      doc.setFont('times', 'normal');
      const lineas = data.Contenido.split('\n');
      lineas.forEach((linea) => {
        const textoDividido = doc.splitTextToSize(linea, 180);
        textoDividido.forEach((l) => {
          if (y > 260) {
            doc.addPage();
            y = 20;
          }
          doc.text(l, 15, y);
          y += 7;
        });
      });

      doc.save(`Contrato_${data.Nombre || 'colaborador'}.pdf`);
    } catch (error) {
      console.error("❌ Error al generar PDF:", error);
      alert("Error al generar PDF.");
    }
  };

  const refrescarContratos = async () => {
    const res = await fetch(`http://localhost:3001/api/contratos?empresa=${encodeURIComponent(localidad)}`);
    const data = await res.json();
    setContratos(data);
  };

  const indiceInicio = (paginaActual - 1) * contratosPorPagina;
  const contratosPaginados = contratos.slice(indiceInicio, indiceInicio + contratosPorPagina);
  const totalPaginas = Math.ceil(contratos.length / contratosPorPagina);

  return (
    <div className="container mt-4">
      <EncabezadoEmpresa />
      <h3 className="text-center mb-4">Contrato Laboral</h3>

      <div className="d-flex flex-wrap gap-3 justify-content-center">
        <button className="btn btn-success" onClick={() => setModalCrear(true)}>CREAR CONTRATO</button>
        <button className="btn btn-info" onClick={abrirModalVer}>VER CONTRATOS</button>
      </div>

      {/* Modal CREAR */}
      <Modal show={modalCrear} onHide={() => {}} backdrop="static" keyboard={false} size="xl" centered>
        <Modal.Header><Modal.Title>Crear Contrato</Modal.Title></Modal.Header>
        <Modal.Body className="d-flex justify-content-center">
          <div className="w-100" style={{ maxWidth: '900px' }}>
            <ContratoColaborador
              modo="crear"
              onClose={() => {
                setModalCrear(false);
                refrescarContratos();
              }}
              resetAfterSave={true}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalCrear(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal VER */}
      <Modal show={modalVer} onHide={() => setModalVer(false)} size="lg" centered>
        <Modal.Header closeButton><Modal.Title>Contratos Registrados</Modal.Title></Modal.Header>
        <Modal.Body>
          <table className="table table-striped">
            <thead><tr><th>Nombre</th><th>Cédula</th><th>Fecha</th><th>Acciones</th></tr></thead>
            <tbody>
              {contratosPaginados.map((c, idx) => (
                <tr key={idx}>
                  <td>{c.Nombre}</td>
                  <td>{c.CedulaID}</td>
                  <td>{c.FechaContrato?.split('T')[0]}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => descargarPDF(c)}>PDF</button>
                    <button className="btn btn-sm btn-outline-warning me-2" onClick={() => abrirModalEditar(c)}>Editar</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => eliminarContrato(c.ID)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="d-flex justify-content-center mt-3">
            <Button disabled={paginaActual === 1} onClick={() => setPaginaActual(p => p - 1)} className="me-2">Anterior</Button>
            <span className="align-self-center">Página {paginaActual} de {totalPaginas}</span>
            <Button disabled={paginaActual === totalPaginas} onClick={() => setPaginaActual(p => p + 1)} className="ms-2">Siguiente</Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Modal EDITAR */}
      <Modal show={modalEditar} onHide={() => setModalEditar(false)} size="xl" centered>
        <Modal.Header closeButton><Modal.Title>Editar Contrato</Modal.Title></Modal.Header>
        <Modal.Body>
          <ContratoColaborador modo="editar" contrato={contratoSeleccionado} onClose={() => {
            setModalEditar(false);
            refrescarContratos();
          }} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalEditar(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GestionContratos;
