import React, { useState, useEffect } from "react";
import html2pdf from "html2pdf.js";

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
  const [showEditarVacacionModal, setShowEditarVacacionModal] = useState(false);
  const [vacacionEditando, setVacacionEditando] = useState(null);
  const [showAbonosModal, setShowAbonosModal] = useState(false);
  const [listaAbonos, setListaAbonos] = useState([]);
  const [showListaColaboradoresAguinaldo, setShowListaColaboradoresAguinaldo] = useState(false);
  const [aguinaldoCalculado, setAguinaldoCalculado] = useState(0);
  const [pagosDelAguinaldo, setPagosDelAguinaldo] = useState([]);
  const [showAguinaldoModal, setShowAguinaldoModal] = useState(false);
  const [showReporteTabla, setShowReporteTabla] = useState(false);      // Para el tipo Excel
  const [showReporteColillas, setShowReporteColillas] = useState(false); // Para las colillas
  const [fechaInicioReporte, setFechaInicioReporte] = useState("");
  const [fechaFinReporte, setFechaFinReporte] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [pagosFiltrados, setPagosFiltrados] = useState([]);
  const [showVerPendientes, setShowVerPendientes] = useState(false);
  const [pendientesVale, setPendientesVale] = useState([]);
  const [pendientesFinanciamiento, setPendientesFinanciamiento] = useState([]);
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
      const localidad = localStorage.getItem("localidad");
      const response = await fetch(`http://localhost:3001/api/colaboradores?localidad=${encodeURIComponent(localidad)}`);
      const data = await response.json();
      setColaboradores(data);
      setCurrentPage(1);
      await fetchDiasTomados(); // aseguramos cargar días antes de mostrar
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
    { id: "vales", title: "VALES", img: "/images/mano-con-dolar.png" },
    { id: "aguinaldo", title: "AGUINALDO", img: "/images/disponible.png" },
    // { id: "disponible3", title: "DISPONIBLE", img: "/images/disponible.png" }
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

  const verAbonos = async (financiamientoID) => {
    try {
      const response = await fetch(`http://localhost:3001/api/abonos/${financiamientoID}`);
      const data = await response.json();
      setListaAbonos(data);
      setShowAbonosModal(true);
    } catch (error) {
      console.error("Error al obtener abonos:", error);
    }
  };

  const generarReportePagos = async () => {
    try {
      console.log("Fechas enviadas:", fechaInicio, fechaFin);

      if (!fechaInicio || !fechaFin) {
        alert("Debe seleccionar ambas fechas.");
        return;
      }

      const localidad = localStorage.getItem("localidad");
      const res = await fetch(`http://localhost:3001/api/reporte-pagos?inicio=${fechaInicio}&fin=${fechaFin}&localidad=${encodeURIComponent(localidad)}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setPagosFiltrados(data);
      } else {
        console.error("Respuesta inesperada:", data);
        setPagosFiltrados([]);
        alert("Error al generar el reporte: formato de respuesta inválido");
      }
    } catch (err) {
      console.error("Error al generar reporte:", err);
      setPagosFiltrados([]);
      alert("Hubo un error al generar el reporte.");
    }
  };
  const guardarPagoFinanciamiento = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/pagos-financiamiento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          FinanciamientoID: financiamientoSeleccionado.ID,
          FechaPago: pagoForm.FechaPago,
          MontoAplicado: pagoForm.MontoAplicado,
          Observaciones: pagoForm.Observaciones
        })
      });
      const data = await response.json();
      alert(data.message || "Pago aplicado correctamente");
      setShowAplicarPagoModal(false);
      setShowVerFinanciamientos(false);
      setPagoFinanciamientoForm({
        IDFinanciamiento: null,
        Fecha: new Date().toISOString().slice(0, 10),
        MontoAplicado: 0,
        Observaciones: ""
      });
      verListaFinanciamientos(); // refrescar la tabla
    } catch (error) {
      console.error("Error aplicando pago:", error);
    }
  };

  const cargarPendientes = async (cedula) => {
    try {
      const backendUrl = "http://localhost:3001";
      const [valesRes, finanRes] = await Promise.all([
        fetch(`${backendUrl}/api/vales/${cedula}`),
        fetch(`${backendUrl}/api/financiamientos/${cedula}`)
      ]);

      const valesData = await valesRes.json();
      const financiamientosData = await finanRes.json();

      setPendientesVale(valesData);
      setPendientesFinanciamiento(financiamientosData);
      setShowVerPendientes(true);
    } catch (error) {
      console.error("Error cargando pendientes:", error);
    }
  };

  const [showAplicarPagoModal, setShowAplicarPagoModal] = useState(false);
  const [financiamientoSeleccionado, setFinanciamientoSeleccionado] = useState(null);
  const [pagoFinanciamientoForm, setPagoFinanciamientoForm] = useState({
    IDFinanciamiento: null,
    Fecha: new Date().toISOString().slice(0, 10),
    MontoAplicado: 0,
    Observaciones: ""
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
        // const response = await fetch("http://localhost:3001/api/colaboradores");
        const localidad = localStorage.getItem("localidad"); // ⬅️ obtiene la localidad del usuario
        const response = await fetch(`http://localhost:3001/api/colaboradores?localidad=${encodeURIComponent(localidad)}`);
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

  const abrirModalAguinaldo = async () => {
    try {
      const localidad = localStorage.getItem("localidad");
      const response = await fetch(`http://localhost:3001/api/colaboradores?localidad=${encodeURIComponent(localidad)}`);
      const data = await response.json();
      setColaboradores(data);
      setShowListaColaboradoresAguinaldo(true);
    } catch (error) {
      console.error("Error al obtener colaboradores para aguinaldo:", error);
    }
  };

  const calcularAguinaldo = async (colaborador) => {
    setSelectedColaborador(colaborador);
    try {
      const res = await fetch(`http://localhost:3001/api/aguinaldo/${colaborador.CedulaID}`);
      const data = await res.json();
      setAguinaldoCalculado(data.aguinaldo);
      setPagosDelAguinaldo(data.pagos);
      setShowAguinaldoModal(true);
    } catch (err) {
      console.error("Error al calcular aguinaldo:", err);
    }
  };

  const handlePlanillaModal = async () => {
    try {
      const localidad = localStorage.getItem("localidad");
      const response = await fetch(`http://localhost:3001/api/colaboradores?localidad=${encodeURIComponent(localidad)}`);
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

  const options = {
    margin: 0.5,
    filename: `reporte-pagos-${new Date().toISOString().slice(0, 10)}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' } // 👈 AQUÍ
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

  const [showCrearPago, setShowCrearPago] = useState(false);
  const [pagoForm, setPagoForm] = useState({
    Contrato: "", Cuenta: "", SalarioBase: 0, TipoPago: "Mensual",
    HorasTrabajadas: 0, HorasExtra: 0, Comisiones: 0, Viaticos: 0,
    CCSS: 0, Prestamos: 0, Vales: 0, Adelantos: 0, Ahorro: 0,
    MontoPorHoraExtra: 0
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
      Ahorro: pago.Ahorro,
      MontoPorHoraExtra: 0,
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

    const pagoHorasExtra = form.HorasExtra * form.MontoPorHoraExtra; // ← NUEVO cálculo
    // const extras = form.HorasExtra * form.MontoPorHoraExtra; // ← usa lo ingresado
    const ingresos = ingresoBase + form.Comisiones + form.Viaticos + pagoHorasExtra;
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
    Plazo: 0, InteresPorcentaje: 0, Descripcion: "",
    Localidad: localStorage.getItem("localidad") // 👈 Se agrega automáticamente
  });

  const abrirModalFinanciamiento = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/colaboradores");
      const data = await response.json();
      setColaboradores(data);

      setModoEditarFinanciamiento(false); // 👈 FORZAMOS modo creación
      setFinanciamientoForm({
        CedulaID: "", Nombre: "", Producto: "", Monto: 0,
        FechaCreacion: new Date().toISOString().slice(0, 10),
        Plazo: 0, InteresPorcentaje: 0, Descripcion: ""
      }); // 👈 Reseteamos el formulario

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
      const body = {
        ...financiamientoForm,
        Localidad: localStorage.getItem("localidad") // 👈 aseguramos valor actualizado
      };

      let response;
      if (modoEditarFinanciamiento && financiamientoForm.ID) {
        response = await fetch(`http://localhost:3001/api/financiamientos/${financiamientoForm.ID}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
      } else {
        response = await fetch("http://localhost:3001/api/financiamientos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
      }

      const data = await response.json();
      alert(data.message || "Financiamiento procesado correctamente");
      setShowFinanciamientoModal(false);
      setModoEditarFinanciamiento(false);
      setFinanciamientoForm({
        CedulaID: "", Nombre: "", Producto: "", Monto: 0,
        FechaCreacion: new Date().toISOString().slice(0, 10),
        Plazo: 0, InteresPorcentaje: 0, Descripcion: "",
        Localidad: localStorage.getItem("localidad")
      });

      verListaFinanciamientos();
    } catch (error) {
      console.error("Error al guardar financiamiento:", error);
      alert("Error al guardar financiamiento");
    }
  };

  const descargarPDFColillas = () => {
    const elemento = document.querySelector('.reporte-colillas');

    const options = {
      margin: 0.2,
      filename: `reporte-pagos-${new Date().toISOString().slice(0, 10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, scrollY: 0, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(options).from(elemento).save();
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
                <input
                  type="text"
                  className="form-control"
                  name="Empresa"
                  value={localStorage.getItem("localidad")}
                  readOnly
                />
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
                      // const response = await fetch("http://localhost:3001/api/colaboradores");
                      const localidad = localStorage.getItem("localidad");
                      const response = await fetch(`http://localhost:3001/api/colaboradores?localidad=${encodeURIComponent(localidad)}`);
                      const data = await response.json();
                      setColaboradores(data);
                      setShowValesModal(true);
                    } catch (error) {
                      console.error("Error al cargar colaboradores para vales:", error);
                    }
                  } else if (card.id === "planilla") {
                    handlePlanillaModal();
                  } else if (card.id === "aguinaldo") {
                    abrirModalAguinaldo();
                  }
                  else {
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
              {/* Campos normales */}
              {[
                ["Contrato", "text"], ["Cuenta", "text"], ["SalarioBase", "number"], ["TipoPago", "select"],
                ["HorasTrabajadas", "number"], ["HorasExtra", "number"], ["MontoPorHoraExtra", "number"], // 👈 NUEVO
                ["Comisiones", "number"], ["Viaticos", "number"], ["CCSS", "number"], ["Prestamos", "number"],
                ["Vales", "number"], ["Adelantos", "number"], ["Ahorro", "number"]
              ].map(([campo, tipo]) => (
                <div key={campo} className="formulario-item">
                  <label>{campo === "MontoPorHoraExtra" ? "₡ por Hora Extra" : campo}</label>
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
                      readOnly={campo === "Contrato"}
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
            <p>
              <strong>Horas Extra:</strong> {pagoForm.HorasExtra} horas x ₡{pagoForm.MontoPorHoraExtra?.toFixed(2)} = ₡{(pagoForm.HorasExtra * pagoForm.MontoPorHoraExtra).toLocaleString()}
            </p>
            <p>
              <strong>Total a Pagar: </strong>₡{calcularPagoTotal(pagoForm).toLocaleString()}
            </p>
            <div className="text-end">
              <button className="btn btn-secondary me-2" onClick={cerrarModalCrearPago}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardarPagoPlanilla}>Guardar Pago</button>
            </div>
            <button
              className="btn btn-info mb-2"
              onClick={() => cargarPendientes(selectedColaborador?.CedulaID)}
            >
              Ver Pendientes
            </button>
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

            {/* Imagen */}
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

            {/* Formulario en 3 columnas */}
            <div className="formulario-grid-3cols">
              {/* <div className="formulario-item">
                <label>Fecha Ingreso:</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={selectedColaborador.FechaIngreso ? selectedColaborador.FechaIngreso.slice(0, 10) : ""}
                  onChange={(e) => setSelectedColaborador({ ...selectedColaborador, FechaIngreso: e.target.value })}
                />
              </div> */}
              <div className="formulario-item">
                <label>Nombre:</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={selectedColaborador.Nombre || ""}
                  onChange={(e) => setSelectedColaborador({ ...selectedColaborador, Nombre: e.target.value })}
                />
              </div>

              <div className="formulario-item">
                <label>Apellidos:</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={selectedColaborador.Apellidos || ""}
                  onChange={(e) => setSelectedColaborador({ ...selectedColaborador, Apellidos: e.target.value })}
                />
              </div>

              <div className="formulario-item">
                <label>Cédula:</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={selectedColaborador.CedulaID || ""}
                  onChange={(e) => setSelectedColaborador({ ...selectedColaborador, CedulaID: e.target.value })}
                />
              </div>

              <div className="formulario-item">
                <label>ID Colaborador:</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={selectedColaborador.IDColaborador || ""}
                  onChange={(e) => setSelectedColaborador({ ...selectedColaborador, IDColaborador: e.target.value })}
                />
              </div>

              <div className="formulario-item">
                <label>Teléfono:</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={selectedColaborador.Telefono || ""}
                  onChange={(e) => setSelectedColaborador({ ...selectedColaborador, Telefono: e.target.value })}
                />
              </div>

              <div className="formulario-item">
                <label>Correo:</label>
                <input
                  type="email"
                  className="form-control form-control-sm"
                  value={selectedColaborador.Correo || ""}
                  onChange={(e) => setSelectedColaborador({ ...selectedColaborador, Correo: e.target.value })}
                />
              </div>

              <div className="formulario-item">
                <label>Dirección:</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={selectedColaborador.Direccion || ""}
                  onChange={(e) => setSelectedColaborador({ ...selectedColaborador, Direccion: e.target.value })}
                />
              </div>

              <div className="formulario-item">
                <label>Contrato:</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={selectedColaborador.Contrato || ""}
                  onChange={(e) => setSelectedColaborador({ ...selectedColaborador, Contrato: e.target.value })}
                />
              </div>

              <div className="formulario-item">
                <label>Cuenta:</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={selectedColaborador.Cuenta || ""}
                  onChange={(e) => setSelectedColaborador({ ...selectedColaborador, Cuenta: e.target.value })}
                />
              </div>

              <div className="formulario-item">
                <label>Salario Base:</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={selectedColaborador.SalarioBase || ""}
                  onChange={(e) => setSelectedColaborador({ ...selectedColaborador, SalarioBase: e.target.value })}
                />
              </div>

              <div className="formulario-item">
                <label>Empresa:</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={localStorage.getItem("localidad")}
                  readOnly
                />
              </div>

              <div className="formulario-item">
                <label>Contraseña:</label>
                <input
                  type="password"
                  className="form-control form-control-sm"
                  value={selectedColaborador.Contrasena || ""}
                  onChange={(e) => setSelectedColaborador({ ...selectedColaborador, Contrasena: e.target.value })}
                />
              </div>

              <div className="formulario-item">
                <label>Fecha Ingreso:</label>
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
              <button
                className="btn btn-primary"
                onClick={() => {
                  selectedColaborador.Empresa = localStorage.getItem("localidad"); // forzamos la localidad antes de guardar
                  handleUpdateColaborador();
                }}
              >
                Guardar Cambios
              </button>
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
                    <td style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {v.Detalle || 'Sin detalle'}
                      <button
                        className="btn btn-sm btn-warning ms-2"
                        onClick={() => {
                          setVacacionEditando({ ...v, ID: v.ID }); // Asegúrate que tenga el ID
                          setShowEditarVacacionModal(true);
                        }}
                      >
                        Editar
                      </button>
                    </td>

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

      {showListaColaboradoresAguinaldo && (
        <div className="modal-overlay" onClick={() => setShowListaColaboradoresAguinaldo(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Lista de Colaboradores - Aguinaldo</h3>
            <table className="table table-bordered table-striped">
              <thead className="table-dark">
                <tr>
                  <th>Nombre</th>
                  <th>Cédula</th>
                  <th>Fecha Ingreso</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {colaboradores.map((colab, index) => (
                  <tr key={index}>
                    <td>{colab.Nombre}</td>
                    <td>{colab.CedulaID}</td>
                    <td>{colab.FechaIngreso?.slice(0, 10)}</td>
                    <td>
                      <button className="btn btn-sm btn-success" onClick={() => calcularAguinaldo(colab)}>
                        Calcular
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-end">
              <button className="btn btn-secondary" onClick={() => setShowListaColaboradoresAguinaldo(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {showEditarVacacionModal && vacacionEditando && (
        <div className="modal-overlay" onClick={() => setShowEditarVacacionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Editar Vacación</h3>

            <label>Fecha Salida:</label>
            <input
              type="date"
              className="form-control"
              value={vacacionEditando.FechaSalida?.slice(0, 10)}
              onChange={(e) => setVacacionEditando({ ...vacacionEditando, FechaSalida: e.target.value })}
            />

            <label>Fecha Entrada:</label>
            <input
              type="date"
              className="form-control"
              value={vacacionEditando.FechaEntrada?.slice(0, 10)}
              onChange={(e) => setVacacionEditando({ ...vacacionEditando, FechaEntrada: e.target.value })}
            />

            <label>Detalle:</label>
            <textarea
              className="form-control"
              value={vacacionEditando.Detalle || ""}
              onChange={(e) => setVacacionEditando({ ...vacacionEditando, Detalle: e.target.value })}
            />

            <div className="text-end mt-3">
              <button className="btn btn-secondary me-2" onClick={() => setShowEditarVacacionModal(false)}>Cancelar</button>
              <button
                className="btn btn-primary"
                onClick={async () => {
                  try {
                    const dias = calcularDiasVacaciones(vacacionEditando.FechaSalida, vacacionEditando.FechaEntrada);
                    const response = await fetch("http://localhost:3001/api/vacaciones/editar", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ ...vacacionEditando, DiasTomados: dias })
                    });
                    const result = await response.json();
                    alert(result.message);
                    setShowEditarVacacionModal(false);
                    setShowDetalleModal(false); // Para forzar refresco
                    verDetalleVacaciones(selectedColaborador?.CedulaID); // Recargar
                  } catch (error) {
                    console.error("Error al editar vacaciones:", error);
                  }
                }}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {showAguinaldoModal && (
        <div className="modal-overlay" onClick={() => setShowAguinaldoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Aguinaldo de {selectedColaborador?.Nombre}</h3>
            <p><strong>Total Aguinaldo: ₡{parseFloat(aguinaldoCalculado).toLocaleString()}</strong></p>
            <table className="table">
              <thead><tr><th>Fecha</th><th>Monto</th></tr></thead>
              <tbody>
                {pagosDelAguinaldo.map((pago, i) => (
                  <tr key={i}>
                    <td>{pago.FechaRegistro?.slice(0, 10)}</td>
                    <td>₡{pago.TotalPago.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-secondary mt-3" onClick={() => setShowAguinaldoModal(false)}>Cerrar</button>
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
                  className="form-control form-control-sm"
                  value={localStorage.getItem("localidad")}
                  readOnly
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
                    const localidad = localStorage.getItem("localidad"); // ← aseguramos la localidad
                    const valeConEmpresa = { ...valeForm, Empresa: localidad }; // ← insertamos Empresa

                    await fetch("http://localhost:3001/api/vales", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(valeConEmpresa) // ← enviamos con Empresa incluida
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
                {!modoEditarFinanciamiento && (
                  <div className="formulario-item">
                    <label>Buscar colaborador (nombre o cédula):</label>
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="Buscar..."
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <select
                      className="form-select"
                      onChange={(e) => {
                        const selected = colaboradores.find(c => c.CedulaID === e.target.value);
                        if (selected) {
                          setFinanciamientoForm(prev => ({
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
                          c.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.CedulaID.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((colaborador, i) => (
                          <option key={i} value={colaborador.CedulaID}>
                            {colaborador.Nombre} {colaborador.Apellidos} - {colaborador.CedulaID}
                          </option>
                        ))}
                    </select>
                  </div>
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
                <label className="mt-2">Localidad:</label>
                <input
                  type="text"
                  className="form-control"
                  value={localStorage.getItem("localidad")}
                  readOnly
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
                        className="btn btn-sm btn-secondary me-1"
                        onClick={() => setShowReporteTabla(true)}
                      >
                        Reporte
                      </button>

                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setShowReporteColillas(true)}
                      >
                        Ver Colillas
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showReporteTabla && (
        <div className="modal-overlay" onClick={() => setShowReporteTabla(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Reporte de Pagos por Rango de Fechas</h3>

            <div className="d-flex gap-3 mb-3">
              <div>
                <label>Desde:</label>
                <input
                  type="date"
                  className="form-control"
                  value={fechaInicioReporte}
                  onChange={(e) => setFechaInicioReporte(e.target.value)}
                />
              </div>
              <div>
                <label>Hasta:</label>
                <input
                  type="date"
                  className="form-control"
                  value={fechaFinReporte}
                  onChange={(e) => setFechaFinReporte(e.target.value)}
                />
              </div>
              <div className="align-self-end">
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    try {
                      const localidad = localStorage.getItem("localidad");
                      const res = await fetch(`http://localhost:3001/api/reporte-pagos?inicio=${fechaInicioReporte}&fin=${fechaFinReporte}&localidad=${encodeURIComponent(localidad)}`);
                      const data = await res.json();
                      setPagosFiltrados(data);
                    } catch (err) {
                      console.error("Error al cargar reporte:", err);
                    }
                  }}
                >
                  Buscar
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-bordered table-striped">
                <thead className="table-dark">
                  <tr>
                    <th>Nombre</th>
                    <th>Cédula</th>
                    <th>Fecha</th>
                    <th>Total Pago</th>
                    <th>Horas Trabajadas</th>
                    <th>Horas Extra</th>
                    <th>Comisiones</th>
                    <th>Viáticos</th>
                    <th>CCSS</th>
                    <th>Préstamos</th>
                    <th>Vales</th>
                    <th>Adelantos</th>
                    <th>Ahorro</th>
                  </tr>
                </thead>
                <tbody>
                  {pagosFiltrados.map((pago, index) => (
                    <tr key={index}>
                      <td>{pago.Nombre}</td>
                      <td>{pago.CedulaID}</td>
                      <td>{pago.FechaRegistro?.slice(0, 10)}</td>
                      <td>₡{pago.TotalPago.toLocaleString()}</td>
                      <td>{pago.HorasTrabajadas}</td>
                      <td>{pago.HorasExtra}</td>
                      <td>₡{pago.Comisiones.toLocaleString()}</td>
                      <td>₡{pago.Viaticos.toLocaleString()}</td>
                      <td>₡{pago.CCSS.toLocaleString()}</td>
                      <td>₡{pago.Prestamos.toLocaleString()}</td>
                      <td>₡{pago.Vales.toLocaleString()}</td>
                      <td>₡{pago.Adelantos.toLocaleString()}</td>
                      <td>₡{pago.Ahorro.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-end">
              <button className="btn btn-secondary" onClick={() => setShowReporteTabla(false)}>Cerrar</button>
              <button className="btn btn-outline-primary me-2" onClick={() => window.print()}>
                Imprimir
              </button>
            </div>
            <div className="text-end mt-3">

              {/* <button className="btn btn-secondary" onClick={() => setShowReporteModal(false)}>
              Cerrar
            </button> */}
            </div>
          </div>

        </div>
      )}

      {showAplicarPagoModal && financiamientoSeleccionado && (
        <div className="modal-overlay" onClick={() => setShowAplicarPagoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Aplicar Pago a {financiamientoSeleccionado.Producto}</h3>
            <p>Monto Pendiente: ₡{(financiamientoSeleccionado?.MontoPendiente ?? 0).toLocaleString()}</p>

            <label>Fecha de Pago:</label>
            <input
              type="date"
              className="form-control"
              value={pagoForm.FechaPago}
              onChange={(e) => setPagoForm({ ...pagoForm, FechaPago: e.target.value })}
            />

            <label>Monto a Aplicar:</label>
            <input
              type="number"
              className="form-control"
              value={pagoForm.MontoAplicado}
              onChange={(e) => setPagoForm({ ...pagoForm, MontoAplicado: parseFloat(e.target.value) || 0 })}
            />

            <label>Observaciones:</label>
            <textarea
              className="form-control"
              rows={2}
              value={pagoForm.Observaciones}
              onChange={(e) => setPagoForm({ ...pagoForm, Observaciones: e.target.value })}
            />

            <div className="text-end mt-3">
              <button className="btn btn-secondary me-2" onClick={() => setShowAplicarPagoModal(false)}>Cancelar</button>
              <button className="btn btn-success" onClick={guardarPagoFinanciamiento}>Aplicar Pago</button>
            </div>
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
                  <th>Pendiente</th>
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
                      <td>₡{f.MontoPendiente?.toLocaleString()}</td>
                      <td>{f.Plazo} meses</td>
                      <td>{f.InteresPorcentaje}%</td>
                      <td>{f.Descripcion}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-1 button-lista-financimientos"
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
                          className="btn btn-sm btn-danger button-lista-financimientos"
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
                        <button
                          className="btn btn-sm btn-primary button-lista-financimientos"
                          onClick={() => {
                            setFinanciamientoSeleccionado(f); // guardas en estado el financiamiento
                            setShowVerFinanciamientos(false); // 👈 CIERRA el modal de lista
                            setShowAplicarPagoModal(true);    // 👈 ABRE el modal de aplicar pago
                          }}
                        >
                          Aplicar
                        </button>
                        <button
                          className="btn btn-sm btn-success me-1 button-lista-financimientos"
                          onClick={() => verAbonos(f.ID)}
                        >
                          Abonos
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

      {showVerPendientes && (
        <div className="modal-overlay" onClick={() => setShowVerPendientes(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Pendientes del Colaborador</h4>

            <h6 className="mt-3">Vales</h6>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Motivo</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {pendientesVale.map((vale, i) => (
                  <tr key={i}>
                    <td>{new Date(vale.FechaRegistro).toLocaleDateString()}</td>
                    <td>{vale.Motivo}</td>
                    <td>₡{parseFloat(vale.MontoVale).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h6 className="mt-3">Financiamientos</h6>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Monto Pendiente</th>
                </tr>
              </thead>
              <tbody>
                {pendientesFinanciamiento.map((fin, i) => (
                  <tr key={i}>
                    <td>{new Date(fin.FechaCreacion).toLocaleDateString()}</td>
                    <td>{fin.Descripcion}</td>
                    <td>₡{parseFloat(fin.MontoPendiente || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="d-flex justify-content-end mt-3">
              <button className="btn btn-secondary" onClick={() => setShowVerPendientes(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {showReporteColillas && (
        <div className="modal-overlay" onClick={() => setShowReporteTabla(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>Reporte de Pagos - Planilla</h3>

            {/* Filtro de fechas */}
            <div className="mb-3 d-flex flex-wrap gap-3 align-items-center">
              <div>
                <label>Desde:</label>
                <input
                  type="date"
                  className="form-control"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div>
                <label>Hasta:</label>
                <input
                  type="date"
                  className="form-control"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
              <div className="mt-4 d-flex gap-2">
                <button className="btn btn-primary" onClick={generarReportePagos}>Generar</button>
                <button className="btn btn-outline-primary" onClick={() => window.print()}>Imprimir</button>
                <button className="btn btn-outline-danger" onClick={descargarPDFColillas}>Descargar PDF</button>
              </div>



            </div>

            {/* Resultados */}

            <div className="reporte-colillas mt-4" id="contenido-colillas">
              {pagosFiltrados.length > 0 ? (
                pagosFiltrados.map((pago, i) => (
                  <table key={i} className="table table-bordered table-striped mb-4">
                    <thead className="table-dark">
                      <tr>
                        <th>Nombre</th>
                        <th>Cédula</th>
                        <th>Fecha</th>

                        <th>Horas Trabaj</th>
                        <th>Horas Extra</th>
                        <th>Comisiones</th>
                        <th>Viáticos</th>
                        <th>CCSS</th>
                        <th>Préstamos</th>
                        <th>Vales</th>
                        <th>Adelantos</th>
                        <th>Ahorro</th>
                        <th>Total Pago</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{pago.Nombre}</td>
                        <td>{pago.CedulaID}</td>
                        <td>{pago.FechaRegistro?.slice(0, 10)}</td>

                        <td>{pago.HorasTrabajadas}</td>
                        <td>{pago.HorasExtra}</td>
                        <td>₡{pago.Comisiones.toLocaleString()}</td>
                        <td>₡{pago.Viaticos.toLocaleString()}</td>
                        <td>₡{pago.CCSS.toLocaleString()}</td>
                        <td>₡{pago.Prestamos.toLocaleString()}</td>
                        <td>₡{pago.Vales.toLocaleString()}</td>
                        <td>₡{pago.Adelantos.toLocaleString()}</td>
                        <td>₡{pago.Ahorro.toLocaleString()}</td>
                        <td>₡{pago.TotalPago.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                ))
              ) : (
                <p className="text-center text-muted">No se encontraron pagos en el rango indicado.</p>
              )}
            </div>
            {/*
            <div className="reporte-colillas mt-4">
              {Array.isArray(pagosFiltrados) && pagosFiltrados.length > 0 ? (
                pagosFiltrados.map((pago, i) => (
                  <div key={i} className="colilla mb-4 p-3 border rounded shadow-sm">
                    <p><strong>Nombre:</strong> {pago.Nombre}</p>
                    <p><strong>Cédula:</strong> {pago.CedulaID}</p>
                    <p><strong>Fecha:</strong> {pago.FechaRegistro?.slice(0, 10)}</p>
                    <p><strong>Total a Pagar:</strong> ₡{pago.TotalPago.toLocaleString()}</p>
                    <hr />
                    <p><strong>Horas Trabajadas:</strong> {pago.HorasTrabajadas}</p>
                    <p><strong>Horas Extra:</strong> {pago.HorasExtra}</p>
                    <p><strong>Comisiones:</strong> ₡{pago.Comisiones.toLocaleString()}</p>
                    <p><strong>Viáticos:</strong> ₡{pago.Viaticos.toLocaleString()}</p>
                    <p><strong>CCSS:</strong> ₡{pago.CCSS.toLocaleString()}</p>
                    <p><strong>Préstamos:</strong> ₡{pago.Prestamos.toLocaleString()}</p>
                    <p><strong>Vales:</strong> ₡{pago.Vales.toLocaleString()}</p>
                    <p><strong>Adelantos:</strong> ₡{pago.Adelantos.toLocaleString()}</p>
                    <p><strong>Ahorro:</strong> ₡{pago.Ahorro.toLocaleString()}</p>
                    <div className="mt-3 text-muted text-center">- - - - - - - - - - - - - - - - - - - - - -</div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted">No se encontraron pagos en el rango indicado.</p>
              )}
            </div>
                 */}
            <div className="text-end mt-3">
              <button className="btn btn-secondary" onClick={() => setShowReporteColillas(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {showAbonosModal && (
        <div className="modal-overlay" onClick={() => setShowAbonosModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Historial de Abonos</h3>
            <table className="table table-bordered table-hover table-striped mt-2">
              <thead className="table-dark">
                <tr>
                  <th>Fecha</th>
                  <th>Monto Aplicado</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {listaAbonos.length > 0 ? (
                  listaAbonos.map((abono, i) => (
                    <tr key={i}>
                      <td>{abono.FechaPago?.slice(0, 10)}</td>
                      <td>₡{abono.MontoAplicado.toLocaleString()}</td>
                      <td>{abono.Observaciones || "—"}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="3" className="text-center text-muted">Sin abonos registrados</td></tr>
                )}
              </tbody>
            </table>
            <div className="text-end">
              <button className="btn btn-secondary" onClick={() => setShowAbonosModal(false)}>Cerrar</button>
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