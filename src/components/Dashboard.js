import React, { useState, useEffect } from "react";

export const Dashboard = () => {
  const [activeCard, setActiveCard] = useState(null);
  const [colaboradores, setColaboradores] = useState([]);
  const [viewMode, setViewMode] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false); // Nuevo estado
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedColaborador, setSelectedColaborador] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewFoto, setPreviewFoto] = useState(null); // vista previa para edición
  const [showVacacionesModal, setShowVacacionesModal] = useState(false);
  const [showGenerarVacaciones, setShowGenerarVacaciones] = useState(false);
  const [vacacionesForm, setVacacionesForm] = useState({ FechaSalida: '', FechaEntrada: '' });
  const [diasTomadosPorColaborador, setDiasTomadosPorColaborador] = useState({});
  const [diasTomadosResumen, setDiasTomadosResumen] = useState(0);
  const [vacacionesDetalle, setVacacionesDetalle] = useState([]);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const rowsPerPage = 5;

  useEffect(() => {
    if (activeCard === "vacaciones") {
      fetchDiasTomados();
    }
  }, [activeCard]);

  const verDetalleVacaciones = async (cedula) => {
    try {
      const response = await fetch(`http://localhost:3001/api/vacaciones/${cedula}`);
      const data = await response.json();
      setVacacionesDetalle(data);
      setShowDetalleModal(true);
    } catch (error) {
      console.error("Error al cargar detalle:", error);
    }
  };

  const fetchDiasTomados = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/vacaciones");
      const data = await response.json();
      const diasAgrupados = {};
      data.forEach(item => {
        const cedula = item.CedulaID?.trim();
        diasAgrupados[cedula] = (diasAgrupados[cedula] || 0) + parseInt(item.DiasTomados || 0);
      });
      setDiasTomadosPorColaborador(diasAgrupados);
    } catch (error) {
      console.error("Error al cargar días tomados:", error);
    }
  };


  const handleVacacionesModal = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/colaboradores");
      const data = await response.json();
      setColaboradores(data);
      setCurrentPage(1);
      await fetchDiasTomados(); // ← Asegura que cargues los días tomados antes de mostrar
      setShowVacacionesModal(true);
    } catch (error) {
      console.error("Error al obtener colaboradores:", error);
    }
  };

  const calcularDias = (fechaIngreso, cedula) => {
    const hoy = new Date();
    const ingreso = new Date(fechaIngreso);
    const diasTrabajados = Math.floor((hoy - ingreso) / (1000 * 60 * 60 * 24));
    const diasBase = Math.floor(diasTrabajados / 30);
    const cedulaClean = cedula?.trim();
    const tomados = diasTomadosPorColaborador[cedulaClean] || 0;
    const diasDisponibles = diasBase - tomados;
    return { diasTrabajados, diasDisponibles, diasTomados: tomados };
  };

  const calcularDiasVacaciones = (inicio, fin) => {
    const f1 = new Date(inicio);
    const f2 = new Date(fin);
    return Math.floor((f2 - f1) / (1000 * 60 * 60 * 24));
  };

  const handleGenerarClick = (colaborador) => {
    setSelectedColaborador(colaborador);
    setVacacionesForm({ FechaSalida: '', FechaEntrada: '' });
    const resumen = diasTomadosPorColaborador[colaborador.CedulaID?.trim()] || 0;
    setDiasTomadosResumen(resumen);
    setShowGenerarVacaciones(true);
  };

  const cargarDiasTomados = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/vacaciones");
      const data = await response.json();
      const acumulados = {};
      data.forEach(entry => {
        if (!acumulados[entry.CedulaID]) acumulados[entry.CedulaID] = 0;
        acumulados[entry.CedulaID] += entry.DiasTomados;
      });
      setDiasTomadosPorColaborador(acumulados);
    } catch (error) {
      console.error("Error al cargar días tomados:", error);
    }
  };

  const handleGuardarVacaciones = async () => {
    try {
      const diasTomados = calcularDiasVacaciones(vacacionesForm.FechaSalida, vacacionesForm.FechaEntrada);
      const body = {
        CedulaID: selectedColaborador.CedulaID,
        Nombre: selectedColaborador.Nombre,
        FechaIngreso: selectedColaborador.FechaIngreso,
        FechaSalida: vacacionesForm.FechaSalida,
        FechaEntrada: vacacionesForm.FechaEntrada,
        DiasTomados: diasTomados,
        Detalle: vacacionesForm.Detalle || ""
      };
      await fetch("http://localhost:3001/api/vacaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      alert("Vacaciones registradas correctamente");
      setShowGenerarVacaciones(false);
      fetchDiasTomados();
    } catch (error) {
      console.error("Error al guardar vacaciones:", error);
    }
  };

  const cards = [
    { id: "colaboradores", title: "Colaboradores", img: "/images/agregar-usuario.png" },
    { id: "vacaciones", title: "VACACIONES", img: "/images/vacaciones.png" },
    { id: "planilla", title: "PLANILLA", img: "/images/aglutinante.png" },
    { id: "financiamientos", title: "FINANCIAMIENTOS", img: "/images/financiar.png" },
    { id: "disponible1", title: "DISPONIBLE", img: "/images/disponible.png" },
    { id: "disponible2", title: "DISPONIBLE", img: "/images/disponible.png" }
  ];

  const filteredColaboradores = colaboradores.filter(colaborador =>
    (colaborador.Nombre && colaborador.Nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (colaborador.CedulaID && colaborador.CedulaID.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const paginatedColaboradores = filteredColaboradores.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const [colaboradorData, setColaboradorData] = useState({
    Nombre: "", Apellidos: "", CedulaID: "", IDColaborador: "", Telefono: "",
    Direccion: "", Contrasena: "", Correo: "", FechaIngreso: "", Empresa: ""
  });

  const handleChange = (e) => {
    setColaboradorData({ ...colaboradorData, [e.target.name]: e.target.value });
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewFoto(reader.result); // mostrar vista previa
      setSelectedColaborador({
        ...selectedColaborador,
        Foto: reader.result, // guarda como base64 en el estado
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3001/api/colaboradores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(colaboradorData),
      });

      const data = await response.json();
      alert(data.message);
      setActiveCard(null);
    } catch (error) {
      console.error("Error al insertar:", error);
    }
  };

  const handleView = async (cardId) => {
    if (cardId === "colaboradores") {
      try {
        const response = await fetch("http://localhost:3001/api/colaboradores");
        const data = await response.json();
        setColaboradores(data);
        setCurrentPage(1); // Reinicia la paginación cada vez que hace fetch
        setActiveCard(cardId);
        setViewMode(true);
      } catch (error) {
        console.error("Error al obtener colaboradores:", error);
      }
    } else {
      setShowComingSoon(true);
    }
  };

  const handleUpdateColaborador = async () => {
    try {
      console.log("Datos a enviar:", selectedColaborador); // 👈 Agregado para depurar

      const response = await fetch(`http://localhost:3001/api/colaboradores/${selectedColaborador.ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedColaborador),
      });

      const data = await response.json();
      console.log("Respuesta del servidor:", data); // 👈
      alert(data.message);
      setIsEditing(false);
      handleView("colaboradores");
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  const handleDeleteColaborador = async (id) => {
    if (!window.confirm("¿Está seguro de que desea eliminar este colaborador?")) return;
    try {
      await fetch(`http://localhost:3001/api/colaboradores/${id}`, { method: "DELETE" });
      handleView("colaboradores"); // Refrescar lista
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const renderForm = () => {
    if (activeCard === "colaboradores" && viewMode) {
      return (
        <div>
          {/* <h3>Lista de Colaboradores</h3> */}
          {/* <h3 className="mb-3">Lista de Colaboradores</h3> */}

          <div className="mb-3 d-flex justify-content-between align-items-center">
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Buscar por nombre o cédula..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reiniciar la paginación
              }}
            />
            <span className="text-muted">Total: {filteredColaboradores.length} colaboradores</span>
          </div>

          <table className="table table-bordered table-hover table-striped">
            <thead className="table-dark">
              <tr>
                <th scope="col">#</th>
                <th scope="col">Nombre</th>
                <th scope="col">Apellidos</th>
                <th scope="col">Cédula</th>
                <th scope="col">Teléfono</th>
                <th scope="col">Correo</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedColaboradores.length > 0 ? (
                paginatedColaboradores.map((colaborador, index) => (
                  <tr key={index}>
                    <th scope="row">{(currentPage - 1) * rowsPerPage + index + 1}</th>
                    <td>{colaborador.Nombre}</td>
                    <td>{colaborador.Apellidos}</td>
                    <td>{colaborador.CedulaID}</td>
                    <td>{colaborador.Telefono}</td>
                    <td>{colaborador.Correo}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-info me-1"
                        onClick={() => {
                          setSelectedColaborador(colaborador);
                          setPreviewFoto(colaborador.Foto || null); // ← Aquí reiniciamos correctamente
                          setIsEditing(true);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteColaborador(colaborador.ID)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No se encontraron colaboradores que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>


          </table>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <button
              className="btn btn-outline-primary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              &lt; Anterior
            </button>
            <span>Página {currentPage} de {Math.ceil(colaboradores.length / rowsPerPage)}</span>
            <button
              className="btn btn-outline-primary"
              disabled={currentPage === Math.ceil(colaboradores.length / rowsPerPage)}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Siguiente &gt;
            </button>
          </div>



        </div>
      );
    }

    switch (activeCard) {
      case "colaboradores":
        return (
          <form onSubmit={handleSubmit}>
            <div className="div_form_colaboradores">
              <div className="form_div_label_input">
                <label>Nombre:</label>
                <input type="text" className="form-control" name="Nombre" onChange={handleChange} required />
                <label>Apellidos:</label>
                <input type="text" className="form-control" name="Apellidos" onChange={handleChange} required />
                <label>Cédula:</label>
                <input type="tel" className="form-control" name="CedulaID" onChange={handleChange} required />
                <label>Número de Colaborador:</label>
                <input type="tel" className="form-control" name="IDColaborador" onChange={handleChange} required />
                <label>Contraseña:</label>
                <input type="password" className="form-control" name="Contrasena" onChange={handleChange} required />
              </div>
              <div className="form_div_label_input">
                <label>Teléfono:</label>
                <input type="tel" className="form-control" name="Telefono" onChange={handleChange} required />
                <label>Correo:</label>
                <input type="email" className="form-control" name="Correo" onChange={handleChange} required />
                <label>Fecha de Ingreso:</label>
                <input type="date" className="form-control" name="FechaIngreso" onChange={handleChange} required />
                <label>Dirección:</label>
                <input type="text" className="form-control" name="Direccion" onChange={handleChange} required />
                <label>Empresa:</label>
                <select className="form-select form-select_option" name="Empresa" onChange={handleChange} required>
                  <option value="">Selecciona una empresa</option>
                  <option value="Noah Systems">Noah Systems</option>
                  <option value="Techno Noah">Techno Noah</option>
                  <option value="Super">Super</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary mt-1">Guardar</button>
          </form>
        );

      case "vacaciones":
      case "planilla":
      case "financiamientos":
        return null; // No mostrar formulario aquí si no es en modo CREAR
      default:
        return <p>Selecciona una opción</p>;
    }
  };



  ///////////////////////////////////////////////



  return (
    <div className="dashboard_principal">
      {cards.map((card) => (
        <div key={card.id} className="card div_cards_dasboard" style={{ width: "18rem" }}>
          <img src={card.img} className="card-img-top logo_cards_dashboard imagen_cards_dashboard" alt={card.title} />
          <h5 className="h5_cards_dashboard">{card.title}</h5>
          <div className="card-body card-body_dashboard">
            <div className="btn-group" role="group">
              <button
                type="button"
                className="btn btn-warning btn_dashboard btn_dashboard_button"
                onClick={() => {
                  if (card.id === "vacaciones") {
                    handleVacacionesModal();
                  } else {
                    setActiveCard(card.id);
                    setViewMode(false);
                  }
                }}
              >
                CREAR
              </button>
              <button
                type="button"
                className="btn btn-success btn_dashboard btn_dashboard_button"
                onClick={() => handleView(card.id)}
              >
                VER
              </button>
            </div>
          </div>
        </div>
      ))}

      {showVacacionesModal && (
        <div className="modal-overlay" onClick={() => setShowVacacionesModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Crear Vacaciones</h2>
            <div className="mb-3 d-flex justify-content-between align-items-center">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre o cédula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="text-muted">Total: {filteredColaboradores.length} colaboradores</span>
            </div>
            <table className="table table-bordered table-hover table-striped">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Cédula</th>
                  <th>Nombre</th>
                  <th>Fecha Ingreso</th>
                  <th>Días Trabajados</th>
                  <th>Días Disponibles</th>
                  <th>Días Tomados</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedColaboradores.map((colaborador, index) => {
                  const { diasTrabajados, diasDisponibles, diasTomados } = calcularDias(colaborador.FechaIngreso, colaborador.CedulaID);
                  return (
                    <tr key={index}>
                      <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                      <td>{colaborador.CedulaID}</td>
                      <td>{colaborador.Nombre}</td>
                      <td>{colaborador.FechaIngreso?.slice(0, 10)}</td>
                      <td>{diasTrabajados}</td>
                      <td>{diasDisponibles}</td>
                      <td>{diasTomados}</td>
                      <td>
                        <button className="btn btn-sm btn-info me-1" onClick={() => verDetalleVacaciones(colaborador.CedulaID)}>Detalles</button>
                        <button className="btn btn-sm btn-success" onClick={() => handleGenerarClick(colaborador)}>Generar</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>


            <div className="d-flex justify-content-between align-items-center mt-3">
              <button
                className="btn btn-outline-primary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                &lt; Anterior
              </button>
              <span>Página {currentPage} de {Math.ceil(filteredColaboradores.length / rowsPerPage)}</span>
              <button
                className="btn btn-outline-primary"
                disabled={currentPage === Math.ceil(filteredColaboradores.length / rowsPerPage)}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Siguiente &gt;
              </button>
            </div>
            <button className="btn btn-secondary mt-3" onClick={() => setShowVacacionesModal(false)}>Cerrar</button>
          </div>
        </div>
      )}


      {showGenerarVacaciones && selectedColaborador && (
        <div className="modal-overlay" onClick={() => setShowGenerarVacaciones(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Boleta de Vacaciones</h3>
            <label>Cédula:</label>
            <input type="text" className="form-control" value={selectedColaborador.CedulaID} readOnly />
            <label>Nombre:</label>
            <input type="text" className="form-control" value={selectedColaborador.Nombre} readOnly />
            <label>Fecha Ingreso:</label>
            <input type="date" className="form-control" value={selectedColaborador.FechaIngreso?.slice(0, 10)} readOnly />

            <label>Días Disponibles:</label>
            <input type="number" className="form-control" value={calcularDias(selectedColaborador.FechaIngreso, selectedColaborador.CedulaID).diasDisponibles} readOnly />

            <label className="mt-2">Fecha de Salida:</label>
            <input type="date" className="form-control" value={vacacionesForm.FechaSalida} onChange={(e) => setVacacionesForm({ ...vacacionesForm, FechaSalida: e.target.value })} />

            <label className="mt-2">Fecha de Regreso:</label>
            <input type="date" className="form-control" value={vacacionesForm.FechaEntrada} onChange={(e) => setVacacionesForm({ ...vacacionesForm, FechaEntrada: e.target.value })} />
            <label className="mt-2">Detalle:</label>
            <textarea
              className="form-control"
              placeholder="Ej: Agarró vacaciones para el día del Padre"
              value={vacacionesForm.Detalle || ""}
              onChange={(e) => setVacacionesForm({ ...vacacionesForm, Detalle: e.target.value })}
            />
            <div className="d-flex justify-content-end mt-3">
              <button className="btn btn-secondary me-2" onClick={() => setShowGenerarVacaciones(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleGuardarVacaciones}>Guardar Boleta</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para formularios */}
      {activeCard && (
        <div className="modal-overlay " onClick={() => setActiveCard(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{viewMode ? "Ver" : "Crear"} {cards.find((c) => c.id === activeCard)?.title}</h2>
            {renderForm()}
            <button className="btn btn-danger mt-1" onClick={() => { setActiveCard(null); setViewMode(false); }}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {isEditing && selectedColaborador && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="modal-content modal-content-editar_colaborador" onClick={(e) => e.stopPropagation()}>
            <h3>Editar Colaborador</h3>
            {/* Imagen (aunque esté vacía por ahora) */}
            <div className="mb-3 text-center">
              <label className="form-label">Foto del colaborador:</label>
              <div>
                <img
                  src={previewFoto || selectedColaborador.Foto || "/images/user-placeholder.png"}
                  alt="Foto previa"
                  className="img-thumbnail mb-2"
                  style={{ width: "150px", height: "150px", objectFit: "cover" }}
                />
              </div>
              <input type="file" accept="image/*" onChange={handleFotoChange} className="form-control mt-2" />
            </div>


            <div className="formulario-grid">
              {["Nombre", "Apellidos", "CedulaID", "IDColaborador", "Telefono", "Correo", "Direccion", "Empresa"].map((campo) => (
                <div className="formulario-col" key={campo}>
                  <label>{campo}:</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={selectedColaborador[campo] || ""}
                    onChange={(e) => setSelectedColaborador({ ...selectedColaborador, [campo]: e.target.value })}
                  />
                </div>
              ))}


              

              {/* Agrupar Contraseña y Fecha en la misma fila */}
              <div className="formulario-col">
                <label>Contraseña:</label>
                <input
                  type="password"
                  className="form-control form-control-sm"
                  value={selectedColaborador.Contrasena || ""}
                  onChange={(e) => setSelectedColaborador({ ...selectedColaborador, Contrasena: e.target.value })}
                />
              </div>
              <div className="formulario-col">
                <label>Fecha de Ingreso:</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={selectedColaborador.FechaIngreso ? selectedColaborador.FechaIngreso.slice(0, 10) : ""}
                  onChange={(e) => setSelectedColaborador({ ...selectedColaborador, FechaIngreso: e.target.value })}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end mt-3">
              <button className="btn btn-secondary me-2" onClick={() => setIsEditing(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleUpdateColaborador}>Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}


{/* Modal de detalles */}
{showDetalleModal && (
                <div className="modal-overlay" onClick={() => setShowDetalleModal(false)}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <h3>Historial de Vacaciones</h3>
                    <table className="table table-bordered table-hover table-striped">
                      <thead className="table-dark">
                        <tr>
                          <th>Fecha Salida</th>
                          <th>Fecha Entrada</th>
                          <th>Días Tomados</th>
                          <th>Detalle</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vacacionesDetalle.length > 0 ? vacacionesDetalle.map((v, i) => (
                          <tr key={i}>
                            <td>{v.FechaSalida?.slice(0, 10)}</td>
                            <td>{v.FechaEntrada?.slice(0, 10)}</td>
                            <td>{v.DiasTomados}</td>
                            <td>{v.Detalle || 'Sin detalle'}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan="4" className="text-center text-muted">Sin registros</td></tr>
                        )}
                      </tbody>
                    </table>
                    <div className="text-end">
                      <button className="btn btn-secondary" onClick={() => setShowDetalleModal(false)}>Cerrar</button>
                    </div>
                  </div>
                </div>
              )}
      

      {/* Modal "Próximamente" */}
      {showComingSoon && (
        <div className="modal-overlay" onClick={() => setShowComingSoon(false)}>
          <div className="modal-content coming-soon" onClick={(e) => e.stopPropagation()}>
            <img src="/images/alerta.png" alt="coming soon" style={{ width: "60px", marginBottom: "10px" }} />
            <h2>¡Próximamente!</h2>
            <p>Esta funcionalidad aún está en desarrollo.</p>
            <button className="btn btn-secondary mt-3" onClick={() => setShowComingSoon(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};