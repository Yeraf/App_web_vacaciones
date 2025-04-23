import React, { useState, useEffect } from "react";
import { Footer } from "./layout/Footer";

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
  const [vacacionesForm, setVacacionesForm] = useState({
    FechaSalida: '', FechaEntrada: '', Detalle: '', NumeroBoleta: ''
  });
  const [diasTomadosPorColaborador, setDiasTomadosPorColaborador] = useState({});
  const [diasTomadosResumen, setDiasTomadosResumen] = useState(0);
  const [vacacionesDetalle, setVacacionesDetalle] = useState([]);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [pagosColaborador, setPagosColaborador] = useState([]);
  const [showPagosModal, setShowPagosModal] = useState(false);
  const [modoEditarPago, setModoEditarPago] = useState(false);
  const [idPagoEditando, setIdPagoEditando] = useState(null);
  const [showFinanciamientosModal, setShowFinanciamientosModal] = useState(false);
  const [financiamientosColaborador, setFinanciamientosColaborador] = useState([]);
  const [fotoBase64, setFotoBase64] = useState(null);
  const [listaFinanciamientos, setListaFinanciamientos] = useState([]);
  const [showVerFinanciamientos, setShowVerFinanciamientos] = useState(false);
  const [modoEditarFinanciamiento, setModoEditarFinanciamiento] = useState(false);
  const [idFinanciamientoEditando, setIdFinanciamientoEditando] = useState(null);
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

  const cerrarModalCrearPago = () => {
    setShowCrearPago(false);
    setSelectedColaborador(null);
    setModoEditarPago(false);
    setIdPagoEditando(null);
    setPagoForm({
      Contrato: "", Cuenta: "", SalarioBase: 0, TipoPago: "Mensual",
      HorasTrabajadas: 0, HorasExtra: 0, Comisiones: 0, Viaticos: 0,
      CCSS: 0, Prestamos: 0, Vales: 0, Adelantos: 0, Ahorro: 0
    });
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

  const generarNumeroBoleta = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/vacaciones/numeroboleta");
      const data = await response.json();
      console.log("Respuesta completa de numeroboleta:", data); // 👀
      return data.numeroBoleta; // <-- Aquí sabrás si es undefined
    } catch (error) {
      console.error("Error generando número de boleta:", error);
      return `NB???`;
    }
  };

  const [numeroBoletaTemp, setNumeroBoletaTemp] = useState("");

  const handleGenerarClick = async (colaborador) => {
    setSelectedColaborador(colaborador);
    const resumen = diasTomadosPorColaborador[colaborador.CedulaID?.trim()] || 0;
    setDiasTomadosResumen(resumen);

    const numeroBoletaGenerado = await generarNumeroBoleta();
    setNumeroBoletaTemp(numeroBoletaGenerado);

    setVacacionesForm((prev) => ({
      ...prev,
      NumeroBoleta: numeroBoletaGenerado,
      FechaSalida: '',
      FechaEntrada: '',
      Detalle: '',
    }));

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
        NumeroBoleta: vacacionesForm.NumeroBoleta,
        CedulaID: selectedColaborador.CedulaID,
        Nombre: selectedColaborador.Nombre,
        FechaIngreso: selectedColaborador.FechaIngreso,
        FechaSalida: vacacionesForm.FechaSalida,
        FechaEntrada: vacacionesForm.FechaEntrada,
        DiasTomados: diasTomados,
        Detalle: vacacionesForm.Detalle || "",
      };
      if (!vacacionesForm.NumeroBoleta || vacacionesForm.NumeroBoleta.trim() === "") {
        alert("Por favor, ingrese el número de boleta.");
        return;
      }
      await fetch("http://localhost:3001/api/vacaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      alert("Vacaciones registradas correctamente");
      setShowGenerarVacaciones(false);
      fetchDiasTomados();
      console.log("Boleta que se enviará:", body);
    } catch (error) {
      console.error("Error al guardar vacaciones:", error);
    }
  };

  const cards = [
    { id: "colaboradores", title: "Colaboradores", img: "/images/agregar-usuario.png" },
    { id: "vacaciones", title: "Vacaciones", img: "/images/vacaciones.png" },
    { id: "planilla", title: "PLANILLA", img: "/images/aglutinante.png" },
    { id: "financiamientos", title: "FINANCIAMIENTOS", img: "/images/financiar.png" },
    { id: "vales", title: "VALES", img: "/images/disponible.png" },
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
    Direccion: "", Contrasena: "", Correo: "", FechaIngreso: "", Empresa: "", Contrato: "", Cuenta: "", SalarioBase: 0
  });

  const verFinanciamientosColaborador = async (cedula) => {
    try {
      const colaborador = colaboradores.find(c => c.CedulaID === cedula);
      setSelectedColaborador(colaborador); // importante para mostrar el nombre

      const response = await fetch(`http://localhost:3001/api/financiamientos/${cedula}`);
      const data = await response.json();
      setFinanciamientosColaborador(data);
      setShowFinanciamientosModal(true);
    } catch (error) {
      console.error("Error al obtener financiamientos:", error);
    }
  };

  const verListaFinanciamientos = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/financiamientos");
      const data = await response.json();
      console.log("Financiamientos recibidos:", data); // 👈
      setListaFinanciamientos(data);
      setShowVerFinanciamientos(true); // 👈 asegúrate que esto se ejecuta
    } catch (error) {
      console.error("Error al obtener la lista de financiamientos:", error);
    }
  };

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
      const body = {
        ...colaboradorData,
        Foto: fotoBase64 // ⬅️ agrega esta línea
      };

      const response = await fetch("http://localhost:3001/api/colaboradores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      alert(data.message);
      setActiveCard(null);
    } catch (error) {
      console.error("Error al insertar:", error);
    }
  };

  const [showValesModal, setShowValesModal] = useState(false);
  const [valeForm, setValeForm] = useState({
    CedulaID: "", Nombre: "", FechaRegistro: new Date().toISOString().slice(0, 10),
    MontoVale: 0, Empresa: "", Motivo: ""
  });

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

  const handlePlanillaModal = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/colaboradores");
      const data = await response.json();
      setColaboradores(data);
      setCurrentPage(1);
      setActiveCard("planilla");
    } catch (error) {
      console.error("Error al obtener colaboradores:", error);
    }
  };

  function calcularDiasHabiles(fechaInicio, fechaFin, diasLibres) {
    let inicio = new Date(fechaInicio);
    let fin = new Date(fechaFin);
    let contador = 0;

    // Normalizamos: sumamos 1 día a la fecha fin para incluirlo si es necesario
    fin.setDate(fin.getDate() + 1);

    for (let d = new Date(inicio); d < fin; d.setDate(d.getDate() + 1)) {
      // Si el día de la semana NO es uno de los días libres, lo contamos
      if (!diasLibres.includes(d.getDay())) {
        contador++;
      }
    }
    return contador;
  }

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

  const [showCrearPago, setShowCrearPago] = useState(false);
  const [pagoForm, setPagoForm] = useState({
    Contrato: "", Cuenta: "", SalarioBase: 0, TipoPago: "Mensual",
    HorasTrabajadas: 0, HorasExtra: 0, Comisiones: 0, Viaticos: 0,
    CCSS: 0, Prestamos: 0, Vales: 0, Adelantos: 0, Ahorro: 0
  });

  const editarPago = (pago) => {
    setIdPagoEditando(pago.ID);
    setSelectedColaborador({ Nombre: pago.Nombre, CedulaID: pago.CedulaID, FechaIngreso: pago.FechaIngreso });
    setPagoForm({
      Contrato: pago.Contrato,
      Cuenta: pago.Cuenta,
      SalarioBase: pago.SalarioBase,
      TipoPago: pago.TipoPago,
      HorasTrabajadas: pago.HorasTrabajadas,
      HorasExtra: pago.HorasExtra,
      Comisiones: pago.Comisiones,
      Viaticos: pago.Viaticos,
      CCSS: pago.CCSS,
      Prestamos: pago.Prestamos,
      Vales: pago.Vales,
      Adelantos: pago.Adelantos,
      Ahorro: pago.Ahorro
    });
    setShowCrearPago(true);
    setModoEditarPago(true);
  };

  const calcularPagoTotal = (form) => {
    let ingresoBase = 0;

    switch (form.TipoPago) {
      case "Mensual":
        ingresoBase = form.SalarioBase;
        break;
      case "Quincenal":
        ingresoBase = form.SalarioBase / 2;
        break;
      case "Horas":
        ingresoBase = form.SalarioBase * form.HorasTrabajadas;
        break;
    }

    const extras = form.HorasExtra * (form.SalarioBase / 30 / 8); // pago x hora extra (aprox)
    const ingresos = ingresoBase + form.Comisiones + form.Viaticos + extras;
    const egresos = form.CCSS + form.Prestamos + form.Vales + form.Adelantos + form.Ahorro;

    return ingresos - egresos;
  };

  const eliminarPago = async (id) => {
    if (!window.confirm("¿Desea eliminar este pago?")) return;
    try {
      await fetch(`http://localhost:3001/api/pago-planilla/${id}`, {
        method: "DELETE",
      });
      // Refrescar la tabla
      if (selectedColaborador) {
        verPagosColaborador(selectedColaborador.CedulaID);
      }
    } catch (error) {
      console.error("Error al eliminar el pago:", error);
    }
  };

  const [showFinanciamientoModal, setShowFinanciamientoModal] = useState(false);
  const [financiamientoForm, setFinanciamientoForm] = useState({
    CedulaID: "", Nombre: "", Producto: "", Monto: 0,
    FechaCreacion: new Date().toISOString().slice(0, 10),
    Plazo: 0, InteresPorcentaje: 0, Descripcion: ""
  });

  const abrirModalFinanciamiento = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/colaboradores");
      const data = await response.json();
      setColaboradores(data);
      setShowFinanciamientoModal(true);
    } catch (error) {
      console.error("Error al cargar colaboradores:", error);
    }
  };

  const guardarPagoPlanilla = async () => {
    const totalPagar = calcularPagoTotal(pagoForm);
    const body = {
      CedulaID: selectedColaborador.CedulaID,
      Nombre: selectedColaborador.Nombre,
      FechaIngreso: selectedColaborador.FechaIngreso,
      ...pagoForm,
      TotalPago: totalPagar
    };

    try {
      let response;
      if (modoEditarPago && idPagoEditando) {
        response = await fetch(`http://localhost:3001/api/pago-planilla/${idPagoEditando}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        response = await fetch("http://localhost:3001/api/pago-planilla", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      const data = await response.json();
      alert(data.message || "Pago guardado correctamente");
      setShowCrearPago(false);
      setModoEditarPago(false);
      setIdPagoEditando(null);

      if (selectedColaborador) {
        verPagosColaborador(selectedColaborador.CedulaID);
      }
    } catch (error) {
      console.error("Error al guardar pago:", error);
    }
  };

  const [diasSolicitados, setDiasSolicitados] = useState(0);
  // Estado para días libres
  const [diasLibresSeleccionados, setDiasLibresSeleccionados] = useState([]);

  useEffect(() => {
    if (vacacionesForm.FechaSalida && vacacionesForm.FechaEntrada) {
      setDiasSolicitados(
        calcularDiasHabiles(
          vacacionesForm.FechaSalida,
          vacacionesForm.FechaEntrada,
          diasLibresSeleccionados // aquí va el arreglo de días libres
        )
      );
    } else {
      setDiasSolicitados(0);
    }
  }, [vacacionesForm.FechaSalida, vacacionesForm.FechaEntrada, diasLibresSeleccionados]);

  // Días de la semana para mostrar checkboxes
  const diasSemana = [
    { label: "Domingo", value: 0 },
    { label: "Lunes", value: 1 },
    { label: "Martes", value: 2 },
    { label: "Miércoles", value: 3 },
    { label: "Jueves", value: 4 },
    { label: "Viernes", value: 5 },
    { label: "Sábado", value: 6 },
  ];

  const guardarFinanciamiento = async () => {
    try {
      let response;
      if (modoEditarFinanciamiento && financiamientoForm.ID) {
        response = await fetch(`http://localhost:3001/api/financiamientos/${financiamientoForm.ID}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(financiamientoForm)
        });
      } else {
        response = await fetch("http://localhost:3001/api/financiamientos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(financiamientoForm)
        });
      }

      const data = await response.json();
      alert(data.message || "Financiamiento procesado correctamente");

      setShowFinanciamientoModal(false);
      setModoEditarFinanciamiento(false);
      setFinanciamientoForm({
        CedulaID: "", Nombre: "", Producto: "", Monto: 0,
        FechaCreacion: new Date().toISOString().slice(0, 10),
        Plazo: 0, InteresPorcentaje: 0, Descripcion: ""
      });

      verListaFinanciamientos(); // Actualiza la lista si estás en modo VER
    } catch (error) {
      console.error("Error al guardar financiamiento:", error);
      alert("Error al guardar financiamiento");
    }
  };

  const verPagosColaborador = async (cedula) => {
    try {
      const colaborador = colaboradores.find(c => c.CedulaID === cedula);
      setSelectedColaborador(colaborador); // ← ¡Esta línea es la clave!

      const response = await fetch(`http://localhost:3001/api/pago-planilla/${cedula}`);
      const data = await response.json();
      setPagosColaborador(data);
      setShowPagosModal(true);
    } catch (error) {
      console.error("Error al cargar pagos:", error);
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
              {/* Primera columna */}
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

              {/* Segunda columna */}
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

              {/* Tercera columna (nueva) */}
              <div className="form_div_label_input">
                <label>Contrato:</label>
                <input type="text" className="form-control" name="Contrato" onChange={handleChange} />

                <label>Cuenta:</label>
                <input type="text" className="form-control" name="Cuenta" onChange={handleChange} />

                <label>Salario Base Quincenal:</label>
                <input type="number" className="form-control" name="SalarioBase" onChange={handleChange} />
                {/* ⬇ NUEVO campo para subir imagen */}
                <div className="text-center mt-3">
                  <label className="form-label">Foto del colaborador:</label>
                  <div>
                    <img
                      src={fotoBase64 || "/images/user-placeholder.png"}
                      alt="Vista previa"
                      className="img-thumbnail mb-2"
                      style={{ width: "150px", height: "150px", objectFit: "cover" }}
                    />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => setFotoBase64(reader.result);
                      reader.readAsDataURL(file);
                    }}
                    className="form-control mt-2"
                  />
                </div>
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
                onClick={async () => {
                  if (card.id === "vacaciones") {
                    handleVacacionesModal();
                  } else if (card.id === "financiamientos") {
                    abrirModalFinanciamiento();
                  } else if (card.id === "vales") {
                    try {
                      const response = await fetch("http://localhost:3001/api/colaboradores");
                      const data = await response.json();
                      setColaboradores(data);
                      setShowValesModal(true);
                    } catch (error) {
                      console.error("Error al cargar colaboradores para vales:", error);
                    }
                  } else if (card.id === "planilla") {
                    handlePlanillaModal();
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
                onClick={() => {
                  if (card.id === "financiamientos") {
                    verListaFinanciamientos(); // 👈 este es el nuevo para mostrar lista
                  } else {
                    handleView(card.id); // lo demás sigue como estaba
                  }
                }}
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

      {showCrearPago && selectedColaborador && (
        <div className="modal-overlay" onClick={() => setShowCrearPago(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Crear Pago para {selectedColaborador.Nombre}</h3>

            <div className="formulario-grid-3cols">
              {[
                ["Contrato", "text"], ["Cuenta", "text"], ["SalarioBase", "number"], ["TipoPago", "select"],
                ["HorasTrabajadas", "number"], ["HorasExtra", "number"], ["Comisiones", "number"],
                ["Viaticos", "number"], ["CCSS", "number"], ["Prestamos", "number"],
                ["Vales", "number"], ["Adelantos", "number"], ["Ahorro", "number"]
              ].map(([campo, tipo]) => (
                <div key={campo} className="formulario-item">
                  <label>{campo}</label>
                  {tipo === "select" ? (
                    <select
                      className="form-control"
                      value={pagoForm.TipoPago}
                      onChange={(e) => setPagoForm({ ...pagoForm, TipoPago: e.target.value })}
                    >
                      <option value="Mensual">Mensual</option>
                      <option value="Quincenal">Quincenal</option>
                      <option value="Horas">Por Horas</option>
                    </select>
                  ) : (
                    <input
                      type={tipo}
                      className="form-control"
                      value={pagoForm[campo]}
                      readOnly={campo === "Contrato"} // ← Esto es lo nuevo
                      onChange={(e) =>
                        setPagoForm({
                          ...pagoForm,
                          [campo]: tipo === "number" ? parseFloat(e.target.value) || 0 : e.target.value
                        })
                      }
                    />
                  )}
                </div>
              ))}
            </div>

            <hr />
            <p><strong>Total a Pagar: </strong>₡{calcularPagoTotal(pagoForm).toLocaleString()}</p>
            <div className="text-end">
              <button className="btn btn-secondary me-2" onClick={cerrarModalCrearPago}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardarPagoPlanilla}>Guardar Pago</button>
            </div>
          </div>
        </div>
      )}

      {showGenerarVacaciones && selectedColaborador && (
        <div className="modal-overlay" onClick={() => setShowGenerarVacaciones(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Boleta de Vacaciones</h3>

            <div className="formulario-grid-3cols">

              <div className="formulario-item">
                <label>Número Boleta:</label>
                <input
                  type="text"
                  className="form-control"
                  value={vacacionesForm.NumeroBoleta}
                  onChange={(e) => setVacacionesForm({ ...vacacionesForm, NumeroBoleta: e.target.value })}
                  required
                />
              </div>

              <div className="formulario-item">
                <label>Cédula:</label>
                <input type="text" className="form-control" value={selectedColaborador.CedulaID} readOnly />
              </div>
              <div className="formulario-item">
                <label>Nombre:</label>
                <input type="text" className="form-control" value={selectedColaborador.Nombre} readOnly />
              </div>

              <div className="formulario-item">
                <label>Fecha Ingreso:</label>
                <input type="date" className="form-control" value={selectedColaborador.FechaIngreso?.slice(0, 10)} readOnly />
              </div>
              <div className="formulario-item">
                <label>Días Disponibles:</label>
                <input
                  type="number"
                  className="form-control"
                  value={calcularDias(selectedColaborador.FechaIngreso, selectedColaborador.CedulaID).diasDisponibles}
                  readOnly
                />
              </div>
              <div className="formulario-item">
                <label>Fecha de Salida:</label>
                <input
                  type="date"
                  className="form-control"
                  value={vacacionesForm.FechaSalida}
                  onChange={(e) => setVacacionesForm({ ...vacacionesForm, FechaSalida: e.target.value })}
                />
              </div>

              <div className="formulario-item">
                <label>Fecha de Regreso:</label>
                <input
                  type="date"
                  className="form-control"
                  value={vacacionesForm.FechaEntrada}
                  onChange={(e) => setVacacionesForm({ ...vacacionesForm, FechaEntrada: e.target.value })}
                />
              </div>
              <div className="formulario-item formulario-dias-libres">
                <label>Días Libres:</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {diasSemana.map((dia) => (
                    <div key={dia.value} style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={diasLibresSeleccionados.includes(dia.value)}
                        onChange={(e) => {
                          setDiasLibresSeleccionados((prev) =>
                            e.target.checked
                              ? [...prev, dia.value]
                              : prev.filter((d) => d !== dia.value)
                          );
                        }}
                      />
                      <span style={{ marginLeft: 4 }}>{dia.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="formulario-item">
                <label>Días Solicitados:</label>
                <input
                  type="number"
                  className="form-control"
                  value={diasSolicitados}
                  readOnly
                />
              </div>
              <div className="formulario-item formulario-textarea-fullwidth">
                <label>Detalle:</label>
                <textarea
                  className="form-control"
                  placeholder="Ej: Agarró vacaciones para el día del Padre"
                  value={vacacionesForm.Detalle || ""}
                  onChange={(e) => setVacacionesForm({ ...vacacionesForm, Detalle: e.target.value })}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end mt-3">
              <button className="btn btn-secondary me-2" onClick={() => setShowGenerarVacaciones(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleGuardarVacaciones}>Guardar Boleta</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para formularios */}
      {activeCard && !["planilla", "vales", "financiamientos", "vacaciones"].includes(activeCard) && (

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
              {["Nombre", "Apellidos", "CedulaID", "IDColaborador", "Telefono", "Correo", "Direccion", "Empresa", "Contrato", "Cuenta", "SalarioBase"].map((campo) => (
                <div className="formulario-col" key={campo}>
                  <label>{campo}:</label>
                  <input
                    type={campo === "SalarioBase" ? "number" : "text"}
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
      {/* ********************************************* */}
      {showFinanciamientosModal && (
        <div className="modal-overlay" onClick={() => setShowFinanciamientosModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Financiamientos de {selectedColaborador?.Nombre}</h3>

            <table className="table table-bordered table-hover table-striped mt-2">
              <thead className="table-dark">
                <tr>
                  <th>Producto</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                  <th>Plazo</th>
                  <th>Interés (%)</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {financiamientosColaborador.length > 0 ? (
                  financiamientosColaborador.map((f, index) => (
                    <tr key={index}>
                      <td>{f.Producto}</td>
                      <td>₡{f.Monto.toLocaleString()}</td>
                      <td>{f.FechaCreacion?.slice(0, 10)}</td>
                      <td>{f.Plazo}</td>
                      <td>{f.InteresPorcentaje}</td>
                      <td>{f.Descripcion}</td>
                      <td>{f.Estado}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" className="text-center text-muted">Sin financiamientos registrados</td></tr>
                )}
              </tbody>
            </table>

            <div className="text-end">
              <button className="btn btn-secondary" onClick={() => setShowFinanciamientosModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {showValesModal && (
        <div className="modal-overlay" onClick={() => setShowValesModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Crear Vale</h3>

            <div className="formulario-grid-2cols">
              {/* Columna 1 */}
              <div className="formulario-item">
                <label>Buscar Colaborador (por nombre o cédula):</label>
                <input
                  className="form-control mb-2"
                  type="text"
                  placeholder="Buscar..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                  className="form-select mb-2"
                  onChange={(e) => {
                    const selected = colaboradores.find(c => c.CedulaID === e.target.value);
                    if (selected) {
                      setValeForm(prev => ({
                        ...prev,
                        CedulaID: selected.CedulaID,
                        Nombre: `${selected.Nombre} ${selected.Apellidos}`
                      }));
                    }
                  }}
                >
                  <option value="">Seleccione un colaborador</option>
                  {colaboradores
                    .filter(c =>
                      c.CedulaID.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      c.Nombre.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((colaborador, idx) => (
                      <option key={idx} value={colaborador.CedulaID}>
                        {colaborador.Nombre} {colaborador.Apellidos} - {colaborador.CedulaID}
                      </option>
                    ))}
                </select>

                <label>Empresa:</label>
                <input
                  type="text"
                  className="form-control"
                  value={valeForm.Empresa}
                  onChange={(e) => setValeForm({ ...valeForm, Empresa: e.target.value })}
                />
              </div>

              {/* Columna 2 */}
              <div className="formulario-item">
                <label>Fecha de Registro:</label>
                <input
                  type="date"
                  className="form-control"
                  value={valeForm.FechaRegistro}
                  onChange={(e) => setValeForm({ ...valeForm, FechaRegistro: e.target.value })}
                />

                <label>Monto del Vale:</label>
                <input
                  type="number"
                  className="form-control"
                  value={valeForm.MontoVale}
                  onChange={(e) => setValeForm({ ...valeForm, MontoVale: parseFloat(e.target.value) || 0 })}
                />

                <label>Motivo:</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={valeForm.Motivo}
                  onChange={(e) => setValeForm({ ...valeForm, Motivo: e.target.value })}
                />
              </div>
            </div>

            <div className="text-end mt-3">
              <button className="btn btn-secondary me-2" onClick={() => setShowValesModal(false)}>Cancelar</button>
              <button
                className="btn btn-primary"
                onClick={async () => {
                  try {
                    await fetch("http://localhost:3001/api/vales", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(valeForm)
                    });
                    alert("Vale registrado correctamente");
                    setShowValesModal(false);
                    setValeForm({
                      CedulaID: "", Nombre: "", FechaRegistro: new Date().toISOString().slice(0, 10),
                      MontoVale: 0, Empresa: "", Motivo: ""
                    });
                  } catch (err) {
                    console.error("Error al guardar vale:", err);
                  }
                }}
              >
                Guardar Vale
              </button>
            </div>
          </div>
        </div>
      )}

      {showFinanciamientoModal && (
        <div className="modal-overlay" onClick={() => setShowFinanciamientoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{modoEditarFinanciamiento ? "Editar Financiamiento" : "Crear Financiamiento"}</h3>

            <div className="formulario-grid-2cols">
              {/* Columna 1 */}
              <div className="formulario-item">
                {modoEditarFinanciamiento && (
                  <>
                    <label>Colaborador:</label>
                    <input type="text" className="form-control" value={financiamientoForm.Nombre} readOnly />
                  </>
                )}

                <label>Producto:</label>
                <input
                  type="text"
                  className="form-control"
                  value={financiamientoForm.Producto}
                  onChange={(e) => setFinanciamientoForm({ ...financiamientoForm, Producto: e.target.value })}
                />

                <label className="mt-2">Monto:</label>
                <input
                  type="number"
                  className="form-control"
                  value={financiamientoForm.Monto}
                  onChange={(e) => setFinanciamientoForm({ ...financiamientoForm, Monto: parseFloat(e.target.value) || 0 })}
                />

                <label className="mt-2">Fecha de Creación:</label>
                <input
                  type="date"
                  className="form-control"
                  value={financiamientoForm.FechaCreacion}
                  onChange={(e) => setFinanciamientoForm({ ...financiamientoForm, FechaCreacion: e.target.value })}
                />
              </div>

              {/* Columna 2 */}
              <div className="formulario-item">
                <label>Plazo (meses):</label>
                <input
                  type="number"
                  className="form-control"
                  value={financiamientoForm.Plazo}
                  onChange={(e) => setFinanciamientoForm({ ...financiamientoForm, Plazo: parseInt(e.target.value) || 0 })}
                />

                <label className="mt-2">Interés (%):</label>
                <input
                  type="number"
                  className="form-control"
                  value={financiamientoForm.InteresPorcentaje}
                  onChange={(e) => setFinanciamientoForm({ ...financiamientoForm, InteresPorcentaje: parseFloat(e.target.value) || 0 })}
                />

                <label className="mt-2">Descripción:</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={financiamientoForm.Descripcion}
                  onChange={(e) => setFinanciamientoForm({ ...financiamientoForm, Descripcion: e.target.value })}
                />
              </div>
            </div>

            {/* Botones */}
            <div className="text-end mt-3">
              <button className="btn btn-secondary me-2" onClick={() => setShowFinanciamientoModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardarFinanciamiento}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {activeCard === "planilla" && !showCrearPago && (
        <div className="modal-overlay" onClick={() => setActiveCard(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Gestión de Pagos - Planilla</h2>
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
                  <th>Nombre completo</th>
                  <th>Cédula</th>
                  <th>Puesto</th>
                  <th>Fecha Ingreso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedColaboradores.map((colaborador, index) => (
                  <tr key={index}>
                    <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                    <td>{`${colaborador.Nombre} ${colaborador.Apellidos}`}</td>
                    <td>{colaborador.CedulaID}</td>
                    <td>{colaborador.Puesto || "—"}</td>
                    <td>{colaborador.FechaIngreso?.slice(0, 10)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-success me-1"
                        onClick={() => {
                          setSelectedColaborador(colaborador);
                          setPagoForm((prev) => ({
                            ...prev,
                            Contrato: colaborador.Contrato || "",
                            Cuenta: colaborador.Cuenta || "",
                            SalarioBase: colaborador.SalarioBase || 0
                          }));
                          setShowCrearPago(true);
                        }}
                      >
                        Crear Pago
                      </button>
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => verPagosColaborador(colaborador.CedulaID)}
                      >
                        Ver Pagos
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showVerFinanciamientos && (
        <div className="modal-overlay" onClick={() => setShowVerFinanciamientos(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Lista de Financiamientos</h3>
            <table className="table table-bordered table-hover table-striped mt-2">
              <thead className="table-dark">
                <tr>
                  <th>Cédula</th>
                  <th>Nombre</th>
                  <th>Producto</th>
                  <th>Monto</th>
                  <th>Plazo</th>
                  <th>Interés</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {listaFinanciamientos.length > 0 ? (
                  listaFinanciamientos.map((f, i) => (
                    <tr key={i}>
                      <td>{f.CedulaID}</td>
                      <td>{f.Nombre}</td>
                      <td>{f.Producto}</td>
                      <td>₡{f.Monto.toLocaleString()}</td>
                      <td>{f.Plazo} meses</td>
                      <td>{f.InteresPorcentaje}%</td>
                      <td>{f.Descripcion}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-1"
                          onClick={() => {
                            setFinanciamientoForm(f);
                            setIdFinanciamientoEditando(f.ID);
                            setModoEditarFinanciamiento(true);
                            setShowFinanciamientoModal(true);
                            setShowVerFinanciamientos(false);
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={async () => {
                            if (window.confirm("¿Seguro que deseas eliminar este financiamiento?")) {
                              try {
                                await fetch(`http://localhost:3001/api/financiamientos/${f.ID}`, {
                                  method: "DELETE"
                                });
                                verListaFinanciamientos(); // refresca lista
                              } catch (err) {
                                console.error("Error al eliminar:", err);
                              }
                            }
                          }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="8" className="text-center text-muted">No hay financiamientos registrados.</td></tr>
                )}
              </tbody>
            </table>
            <div className="text-end">
              <button className="btn btn-secondary" onClick={() => setShowVerFinanciamientos(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {showPagosModal && (
        <div className="modal-overlay" onClick={() => setShowPagosModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Pagos realizados a {selectedColaborador?.Nombre}</h3>
            <table className="table table-bordered table-hover table-striped">
              <thead className="table-dark">
                <tr>
                  <th>Fecha</th>
                  <th>Total Pago</th>
                  <th>Horas</th>
                  <th>Extras</th>
                  <th>Comisiones</th>
                  <th>Viáticos</th>
                  <th>CCSS</th>
                  <th>Préstamos</th>
                  <th>Vales</th>
                  <th>Adelantos</th>
                  <th>Ahorro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pagosColaborador.length > 0 ? (
                  pagosColaborador.map((pago, index) => (
                    <tr key={index}>
                      <td>{pago.FechaRegistro?.slice(0, 10)}</td>
                      <td>₡{pago.TotalPago.toLocaleString()}</td>
                      <td>{pago.HorasTrabajadas}</td>
                      <td>{pago.HorasExtra}</td>
                      <td>{pago.Comisiones}</td>
                      <td>{pago.Viaticos}</td>
                      <td>{pago.CCSS}</td>
                      <td>{pago.Prestamos}</td>
                      <td>{pago.Vales}</td>
                      <td>{pago.Adelantos}</td>
                      <td>{pago.Ahorro}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-1"
                          onClick={() => editarPago(pago)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => eliminarPago(pago.ID)}
                          data-bs-toggle="tooltip"
                          data-bs-placement="bottom"
                          title="Eliminar el Pago"
                        >
                          -
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="11" className="text-center text-muted">Sin pagos registrados</td></tr>
                )}
              </tbody>
            </table>
            <div className="text-end">
              <button className="btn btn-secondary" onClick={() => setShowPagosModal(false)}>Cerrar</button>
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