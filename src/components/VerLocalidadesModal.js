import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const VerLocalidadesModal = ({ show, onHide }) => {
  const [localidades, setLocalidades] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const localidadesPorPagina = 8;
  const [formData, setFormData] = useState({});
  const [mostrarFormularioEdicion, setMostrarFormularioEdicion] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    const fetchLocalidades = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/localidades/ver-todas');
        const data = await response.json();
        if (Array.isArray(data)) {
          setLocalidades(data);
        } else {
          console.error("Respuesta inesperada del backend:", data);
        }
      } catch (error) {
        console.error("Error al obtener localidades:", error);
      }
    };

    if (show) {
      fetchLocalidades();
    }
  }, [show]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'Logo' && files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, Logo: reader.result }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const iniciarEdicion = (localidad) => {
    setEditandoId(localidad.IdLocalidad);
    setFormData(localidad);
    setMostrarFormularioEdicion(true);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setFormData({});
    setMostrarFormularioEdicion(false);
  };

  const guardarCambios = async () => {
    try {
      const payload = { ...formData };

      if (!payload.Empresa || payload.Empresa.trim() === '') {
        const original = localidades.find(l => l.IdLocalidad === editandoId);
        if (original?.Empresa) {
          payload.Empresa = original.Empresa;
        } else {
          console.error("Empresa no encontrada para esta localidad.");
          return;
        }
      }

      const response = await fetch(`http://localhost:3001/api/localidades/${editandoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const nuevasLocalidades = localidades.map((loc) =>
          loc.IdLocalidad === editandoId ? { ...payload } : loc
        );
        setLocalidades(nuevasLocalidades);
        cancelarEdicion();
      } else {
        const data = await response.json();
        console.error("Error al actualizar la localidad:", data);
      }
    } catch (error) {
      console.error("Error en guardarCambios:", error);
    }
  };

  const eliminarLocalidad = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta localidad?')) return;
    try {
      const response = await fetch(`http://localhost:3001/api/localidades/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setLocalidades(localidades.filter((loc) => loc.IdLocalidad !== id));
      } else {
        console.error("Error al eliminar localidad");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const totalPaginas = Math.ceil(localidades.length / localidadesPorPagina);
  const localidadesActuales = localidades.slice(
    (paginaActual - 1) * localidadesPorPagina,
    paginaActual * localidadesPorPagina
  );

  return (
    <>
      <Modal show={show && !mostrarFormularioEdicion} onHide={onHide} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Lista de Localidades</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Alias</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                  <th>Provincia</th>
                  <th>Distrito</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {localidadesActuales.map((item) => (
                  <tr key={item.IdLocalidad}>
                    {['Empresa', 'Alias', 'Telefono', 'Correo', 'Provincia', 'Distrito'].map((name) => (
                      <td key={name}>
                        <span>{item[name]}</span>
                      </td>
                    ))}
                    <td>
                      <button className="btn btn-warning btn-sm me-2" onClick={() => iniciarEdicion(item)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => eliminarLocalidad(item.IdLocalidad)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <span>Página {paginaActual} de {totalPaginas}</span>
            <div>
              <Button variant="secondary" disabled={paginaActual === 1} onClick={() => setPaginaActual(paginaActual - 1)}>
                Anterior
              </Button>{' '}
              <Button variant="secondary" disabled={paginaActual === totalPaginas} onClick={() => setPaginaActual(paginaActual + 1)}>
                Siguiente
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {mostrarFormularioEdicion && (
        <Modal show={true} onHide={cancelarEdicion} size="xl">
          <Modal.Header closeButton>
            <Modal.Title>Editar Localidad</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <div className="row">
                {["Empresa", "Alias", "TipoCedula", "NumeroCedula", "RazonSocial", "Correo",
                  "Dirreccion", "Telefono", "Provincia", "Canton", "Distrito", "Regimen",
                  "LimiteFact", "MontoLicencia", "Cuenta1", "Cuenta2", "Banco2", "Sinpe"
                ].map((name) => (
                  <div className="col-md-4 mb-3" key={name}>
                    <label>{name}:</label>
                    {name === 'TipoCedula' || name === 'Regimen' ? (
                      <select name={name} className="form-select" value={formData[name] || ''} onChange={handleInputChange}>
                        {name === 'TipoCedula' ? (
                          <>
                            <option value="">Seleccione</option>
                            <option value="Cédula Física">Cédula Física</option>
                            <option value="Cédula Jurídica">Cédula Jurídica</option>
                          </>
                        ) : (
                          <>
                            <option value="">Seleccione</option>
                            <option value="Simplificado">Simplificado</option>
                            <option value="Tradicional">Tradicional</option>
                          </>
                        )}
                      </select>
                    ) : (
                      <input
                        name={name}
                        className="form-control"
                        type={name.includes('Monto') || name.includes('Limite') ? 'number' : 'text'}
                        value={formData[name] || ''}
                        onChange={handleInputChange}
                        readOnly={name === 'Empresa'}
                      />
                    )}
                  </div>
                ))}

                <div className="col-md-4 mb-3">
                  <label>Pie Documento:</label>
                  <textarea
                    name="PieDocumento"
                    className="form-control"
                    value={formData.PieDocumento || ''}
                    onChange={handleInputChange}
                    rows="2"
                  ></textarea>
                </div>

                <div className="col-md-4 mb-3">
                  <label>Pie Proforma:</label>
                  <textarea
                    name="PieProforma"
                    className="form-control"
                    value={formData.PieProforma || ''}
                    onChange={handleInputChange}
                    rows="2"
                  ></textarea>
                </div>

                <div className="col-md-4 mb-3">
                  <label>Logo (JPG o PNG):</label>
                  <input
                    type="file"
                    name="Logo"
                    className="form-control"
                    onChange={handleInputChange}
                    accept="image/*"
                  />
                </div>
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={cancelarEdicion}>Cancelar</Button>
            <Button variant="primary" onClick={guardarCambios}>Guardar Cambios</Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default VerLocalidadesModal;
