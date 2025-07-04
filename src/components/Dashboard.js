import React, { useState, useEffect, forwardRef } from "react";
import html2pdf from "html2pdf.js";
import * as XLSX from 'xlsx';
import { saveAs } from "file-saver";
import { EncabezadoEmpresa } from './EncabezadoEmpresa';
import { useRef } from 'react';
import { useReactToPrint } from "react-to-print";
import { ModalImpresionBoleta } from './ModalImpresionBoleta';
import { generarPDFBoleta } from './ContenedorImpresionBoleta';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { generarPDFVale } from "./ContenedorImpresionVale";



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
  const [pendientesAplicados, setPendientesAplicados] = useState([]);
  const [ultimoNumeroBoleta, setUltimoNumeroBoleta] = useState("Cargando...");
  const [colaboradorSeleccionado, setColaboradorSeleccionado] = useState(null);
  const [financiamientos, setFinanciamientos] = useState([]);
  const [vacacionesHistorial, setVacacionesHistorial] = useState([]);
  const localidad = localStorage.getItem("localidad");
  const [ultimaBoletaGenerada, setUltimaBoletaGenerada] = useState(null);
  const [boletasFiltradas, setBoletasFiltradas] = useState([]);
  const [busquedaBoleta, setBusquedaBoleta] = useState("");
  const [paginaBoletas, setPaginaBoletas] = useState(1);
  const [mostrarModalListadoBoletas, setMostrarModalListadoBoletas] = useState(false);
  const [mostrarModalImpresion, setMostrarModalImpresion] = useState(false);
  const [showAplicarPagoModal, setShowAplicarPagoModal] = useState(false);
  const [financiamientoSeleccionado, setFinanciamientoSeleccionado] = useState(null);
  const [showListaFinanciamientos, setShowListaFinanciamientos] = useState(false);
  const [listaVales, setListaVales] = useState([]);
  const [showModalVerVales, setShowModalVerVales] = useState(false);
  const [valeSeleccionado, setValeSeleccionado] = useState(null);
  const [showModalDetalleVale, setShowModalDetalleVale] = useState(false);
  const [valeEditando, setValeEditando] = useState(null);
  const [showModalEditarVale, setShowModalEditarVale] = useState(false);


  const boletasPorPagina = 5;
  const rowsPerPage = 5;
  const componentRef = useRef();
  const formularioInicial = {
    Contrato: "",
    Cuenta: "",
    SalarioBase: 0,
    TipoPago: "Mensual",
    HorasTrabajadas: 0,
    HorasExtra: 0,
    Comisiones: 0,
    Viaticos: 0,
    CCSS: 0,
    Prestamos: 0,
    Vales: 0,
    Adelantos: 0,
    Ahorro: 0,
    MontoPorHoraExtra: 0
  };

  useEffect(() => {
    if (activeCard === "vacaciones") {
      fetchDiasTomados();
    }
  }, [activeCard]);


  useEffect(() => {
    if (showGenerarVacaciones) {
      obtenerUltimoNumeroBoleta();
    }
  }, [showGenerarVacaciones]);

  useEffect(() => {
    const obtenerNumeroBoleta = async () => {
      const res = await fetch("/api/vacaciones/numeroboleta");
      const data = await res.json();
      setVacacionesForm(prev => ({
        ...prev,
        NumeroBoleta: data.numeroBoleta
      }));
    };
    obtenerNumeroBoleta();
  }, []);


  useEffect(() => {
    if (showGenerarVacaciones) {
      const localidad = localStorage.getItem("localidad");
      fetch(`http://localhost:3001/api/vacaciones/ultimo-numero?localidad=${encodeURIComponent(localidad)}`)
        .then(res => res.json())
        .then(data => {
          const nuevoNumero = data.ultimo || "NINGUNO";
          setUltimoNumeroBoleta(nuevoNumero);

          // ✅ También actualiza el form automáticamente
          setVacacionesForm((prev) => ({
            ...prev,
            NumeroBoleta: nuevoNumero
          }));
        })
        .catch(err => {
          console.error("Error obteniendo último número:", err);
          setUltimoNumeroBoleta("NINGUNO");
        });
    }
  }, [showGenerarVacaciones]);

  useEffect(() => {
    const localidad = localStorage.getItem("localidad");
    fetch(`http://localhost:3001/api/colaboradores?localidad=${encodeURIComponent(localidad)}`)
      .then((res) => res.json())
      .then((data) => {
        setColaboradores(data); // 👈 Este array lo usamos en Excel, PDF e Imprimir
      })
      .catch((err) => {
        console.error("Error al cargar colaboradores:", err);
      });
  }, []);

  const verDetalleVacaciones = async (cedula) => {
    try {
      const localidad = localStorage.getItem("localidad");
      const response = await fetch(`http://localhost:3001/api/vacaciones/${cedula}?localidad=${encodeURIComponent(localidad)}`);
      const data = await response.json();
      setVacacionesDetalle(data);
      setShowDetalleModal(true);
    } catch (error) {
      console.error("Error al cargar detalle:", error);
    }
  };

  const ContenedorImpresionBoleta = forwardRef(({ boleta }, ref) => {
    return (
      <div ref={ref} style={{ width: "72mm", padding: "5px", fontSize: "12px", fontFamily: "monospace" }}>
        <EncabezadoEmpresa />
        <div style={{ textAlign: "center", marginTop: "10px" }}>
          <h5 style={{ fontWeight: "bold" }}>BOLETA DE VACACIONES</h5>
          <p><strong>Colaborador:</strong> {boleta.Nombre} {boleta.Apellidos || ''}</p>
          <p><strong>Apellidos:</strong> {boleta.Apellidos}</p>
          <p><strong>Cédula:</strong> {boleta.CedulaID}</p>
          <p><strong>Desde:</strong> {new Date(boleta.FechaSalida).toLocaleDateString()}</p>
          <p><strong>Hasta:</strong> {new Date(boleta.FechaEntrada).toLocaleDateString()}</p>
          <p><strong>Días solicitados:</strong> {boleta.Dias || boleta.DiasTomados || boleta.CantidadDias || 'N/D'}</p>
          <p><strong>Motivo:</strong> {boleta.Detalle}</p>
          <p><strong>Boleta:</strong> {boleta.NumeroBoleta}</p>
          {/* Días disponibles */}
          {boleta.DiasDisponibles !== undefined && (
            <p><strong style={{ fontWeight: 'bold' }}>Días disponibles:</strong> {boleta.DiasDisponibles}</p>
          )}
        </div>
      </div>
    );
  });



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

  const refImpresion = useRef();

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

  const handleChangePago = (e) => {
    const { name, value } = e.target;
    setPagoForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const [vales, setVales] = useState([]);

  const obtenerVales = async () => {
    try {
      const localidad = localStorage.getItem("localidad");
      const res = await fetch(`http://localhost:3001/api/vales?localidad=${encodeURIComponent(localidad)}`);
      const data = await res.json();
      setVales(data); // Asegúrate de tener un estado `vales`
    } catch (error) {
      console.error("Error al cargar vales:", error);
    }
  };


  const imprimirColaboradores = () => {
    if (!colaboradores || colaboradores.length === 0) {
      alert("No hay colaboradores disponibles.");
      return;
    }

    const ventana = window.open("", "_blank");
    const contenido = `
    <html>
    <head><title>Listado de Colaboradores</title></head>
    <body>
      <h2 style="text-align:center">Listado de Colaboradores</h2>
      <table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellidos</th>
            <th>Cédula</th>
            <th>Puesto</th>
            <th>Teléfono</th>
            <th>Correo</th>
            <th>Fecha Ingreso</th>
            <th>Empresa</th>
          </tr>
        </thead>
        <tbody>
          ${colaboradores.map(c => `
            <tr>
              <td>${c.Nombre || ""}</td>
              <td>${c.Apellidos || ""}</td>
              <td>${c.CedulaID || ""}</td>
              <td>${c.Puesto || ""}</td>
              <td>${c.Telefono || ""}</td>
              <td>${c.Correo || ""}</td>
              <td>${c.FechaIngreso ? new Date(c.FechaIngreso).toLocaleDateString() : ""}</td>
              <td>${c.Empresa || ""}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <br>
      <button onclick="window.print()">Imprimir</button>
    </body>
    </html>
  `;

    ventana.document.write(contenido);
    ventana.document.close();
  };

  const ImpresionBoletaVacaciones = forwardRef(({ boleta }, ref) => {
    return (
      <div ref={ref} style={{ width: '80mm', padding: '10px' }}>
        <EncabezadoEmpresa />
        <div style={{ textAlign: 'center' }}>
          <h4>Boleta de Vacaciones</h4>
          <p><strong>Colaborador:</strong> {boleta.Nombre}</p>
          <p><strong>Apellidos:</strong> {boleta.Apellidos}</p>
          <p><strong>Cédula:</strong> {boleta.CedulaID}</p>
          <p><strong>Desde:</strong> {boleta.FechaSalida?.slice(0, 10)}</p>
          <p><strong>Hasta:</strong> {boleta.FechaEntrada?.slice(0, 10)}</p>
          <p><strong>Días solicitados:</strong> {boleta.Dias}</p>
          <p><strong>Motivo:</strong> {boleta.Detalle}</p>
          <p><strong>Boleta:</strong> {boleta.NumeroBoleta}</p>
        </div>
      </div>
    );
  });

  const exportarColaboradoresAPDF = () => {
    if (!colaboradores || colaboradores.length === 0) {
      alert("No hay colaboradores disponibles.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Listado de Colaboradores", 105, 15, { align: "center" });

    const columnas = [
      "Nombre",
      "Apellidos",
      "Cédula",
      "Puesto",
      "Teléfono",
      "Correo",
      "Fecha Ingreso",
      "Empresa"
    ];

    const filas = colaboradores.map(c => [
      c.Nombre || "",
      c.Apellidos || "",
      c.CedulaID || "",
      c.Puesto || "",
      c.Telefono || "",
      c.Correo || "",
      c.FechaIngreso ? new Date(c.FechaIngreso).toLocaleDateString() : "",
      c.Empresa || ""
    ]);

    doc.autoTable({
      head: [columnas],
      body: filas,
      startY: 25,
      styles: { fontSize: 10 },
      margin: { left: 10, right: 10 }
    });

    doc.save(`Colaboradores_${new Date().toISOString().slice(0, 10)}.pdf`);
  };


  // export default ImpresionBoletaVacaciones;
  const handleVacacionesModal = async () => {
    try {
      const localidad = localStorage.getItem("localidad");
      const response = await fetch(`http://localhost:3001/api/colaboradores?localidad=${encodeURIComponent(localidad)}`);
      const data = await response.json();
      setColaboradores([]); // limpia antes de cargar
      setColaboradores(data);
      setCurrentPage(1);
      await fetchDiasTomados(); // aseguramos cargar días antes de mostrar
      setShowVacacionesModal(true);
    } catch (error) {
      console.error("Error al obtener colaboradores:", error);
    }
  };

  const obtenerTodasBoletas = async () => {
    try {
      const localidad = localStorage.getItem("localidad") || "";
      const res = await fetch(`http://localhost:3001/api/boletas-vacaciones?localidad=${encodeURIComponent(localidad)}`);

      // 🚨 Si la respuesta no es exitosa, lanza error
      if (!res.ok) {
        const texto = await res.text(); // <-- Esto evitará el crash de JSON
        throw new Error(`Error del servidor: ${res.status}\n${texto}`);
      }

      const data = await res.json();

      const ordenadas = data.sort((a, b) => new Date(b.FechaSalida) - new Date(a.FechaSalida));
      setBoletasFiltradas(ordenadas);
    } catch (error) {
      console.error("Error al obtener boletas:", error);
      alert("Error cargando las boletas. Detalles en consola.");
    }
  };

  const boletasPaginadas = boletasFiltradas.filter(b =>
    (b.Nombre || "").toLowerCase().includes(busquedaBoleta.toLowerCase()) ||
    (b.CedulaID || "").toLowerCase().includes(busquedaBoleta.toLowerCase())
  ).slice((paginaBoletas - 1) * boletasPorPagina, paginaBoletas * boletasPorPagina);

  const cambiarPaginaBoletas = (nuevaPagina) => {
    setPaginaBoletas(nuevaPagina);
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
    return Math.floor((f2 - f1) / (1000 * 60 * 60 * 24)) + 1;
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

  const actualizarMontosDesdePendientes = (pendientes) => {
    const totalVales = pendientes
      .filter(p => p.tipo === "Vale")
      .reduce((sum, p) => sum + p.monto, 0);

    const totalPrestamos = pendientes
      .filter(p => p.tipo === "Financiamiento")
      .reduce((sum, p) => sum + p.monto, 0);

    setPagoForm((prev) => ({
      ...prev,
      Vales: totalVales,
      Prestamos: totalPrestamos
    }));
  };

  const handleGenerarClick = async (colaborador) => {
    setSelectedColaborador(colaborador);
    const resumen = diasTomadosPorColaborador[colaborador.CedulaID?.trim()] || 0;
    setDiasTomadosResumen(resumen);

    const numeroBoletaGenerado = await generarNumeroBoleta();
    setNumeroBoletaTemp(numeroBoletaGenerado);


    setVacacionesForm((prev) => ({
      ...prev,
      Empresa: localStorage.getItem("localidad"),
      NumeroBoleta: numeroBoletaGenerado,
      FechaSalida: '',
      FechaEntrada: '',
      Detalle: '',
    }));

    setShowGenerarVacaciones(true);
    obtenerUltimoNumeroBoleta(); // 👈 nuevo
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



  const handleImprimir = useReactToPrint({
    content: () => componentRef.current,
  });

  const [colaboradorData, setColaboradorData] = useState({
    Nombre: "", Apellidos: "", CedulaID: "", IDColaborador: "", Telefono: "",
    Direccion: "", Contrasena: "", Correo: "", FechaIngreso: "", Empresa: "", Contrato: "", Cuenta: "", SalarioBase: 0
  });

  const verListaFinanciamientos = async () => {
    try {
      const localidad = localStorage.getItem("localidad");
      const res = await fetch(`http://localhost:3001/api/financiamientos-localidad?localidad=${encodeURIComponent(localidad)}`);
      const data = await res.json();

      setListaFinanciamientos(data);
      setShowVerFinanciamientos(true); // 👈 abre el modal después de tener la data
    } catch (error) {
      console.error("Error al cargar financiamientos:", error);
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
    const localidad = localStorage.getItem("localidad");

    if (!fechaInicio || !fechaFin) {
      alert("Seleccione ambas fechas para generar el reporte.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/api/reporte-pagos?inicio=${fechaInicio}&fin=${fechaFin}&localidad=${encodeURIComponent(localidad)}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setPagosFiltrados(data);
      } else {
        console.warn("Respuesta inesperada:", data);
      }
    } catch (error) {
      console.error("Error al generar el reporte:", error);
    }
  };

  const obtenerVacaciones = async () => {
    try {
      const cedula = colaboradorSeleccionado?.CedulaID;
      const localidad = localStorage.getItem("localidad");

      if (!cedula || !localidad) return;

      const res = await fetch(`/api/vacaciones/${cedula}?localidad=${encodeURIComponent(localidad)}`);
      const data = await res.json();
      setVacacionesHistorial(data);
    } catch (error) {
      console.error("Error al obtener historial de vacaciones:", error);
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
      const localidad = localStorage.getItem("localidad");

      const [valesRes, finanRes] = await Promise.all([
        fetch(`${backendUrl}/api/vales/${cedula}?localidad=${encodeURIComponent(localidad)}`),
        fetch(`${backendUrl}/api/financiamientos/${cedula}?localidad=${encodeURIComponent(localidad)}`)
      ]);

      const valesData = await valesRes.json();
      const financiamientosData = await finanRes.json();

      const financiamientosFiltrados = financiamientosData.filter(f => f.MontoPendiente > 0); // ✅ solo los que deben

      setPendientesVale(valesData);
      setPendientesFinanciamiento(financiamientosFiltrados);
      setShowVerPendientes(true);
    } catch (error) {
      console.error("Error cargando pendientes:", error);
    }
  };

  const abrirModalAplicarPago = (financiamiento) => {
    setFinanciamientoSeleccionado(financiamiento);
    setPagoForm({
      FechaPago: new Date().toISOString().slice(0, 10),
      MontoAplicado: 0,
      Observaciones: "",
    });
    setShowAplicarPagoModal(true);
  };

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

  const imprimirAguinaldo = () => {
    const elemento = document.getElementById("reporte-aguinaldo");

    const opciones = {
      margin: 10,
      filename: `Aguinaldo_${selectedColaborador?.Nombre}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opciones).from(elemento).save();
  };

  const descargarExcelAguinaldo = () => {
    if (!selectedColaborador || !pagosDelAguinaldo.length) return;

    const encabezado1 = [`Aguinaldo de ${selectedColaborador.Nombre}`];
    const encabezado2 = [`Total Aguinaldo: ₡${parseFloat(aguinaldoCalculado).toLocaleString()}`];

    const datos = pagosDelAguinaldo.map(p => [
      p.FechaRegistro?.slice(0, 10),
      `₡${parseFloat(p.TotalPago).toLocaleString()}`
    ]);

    const hojaDatos = [
      encabezado1,
      encabezado2,
      [],
      ['Fecha', 'Monto'],
      ...datos
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(hojaDatos);

    // Centrar celdas importantes
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let R = 0; R <= range.e.r; ++R) {
      for (let C = 0; C <= range.e.c; ++C) {
        const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cell_address]) continue;

        if (!worksheet[cell_address].s) worksheet[cell_address].s = {};
        worksheet[cell_address].s.alignment = { horizontal: "center" };
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Aguinaldo");

    // Aplicar estilos (necesita xlsx-style si desea más)
    XLSX.writeFile(workbook, `Aguinaldo_${selectedColaborador.Nombre}.xlsx`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const localidad = localStorage.getItem("localidad"); // ✅ toma del localStorage
      const body = {
        ...colaboradorData,
        Empresa: localidad,
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
      const localidad = localStorage.getItem("localidad");
      const res = await fetch(`http://localhost:3001/api/aguinaldo/${colaborador.CedulaID}?localidad=${encodeURIComponent(localidad)}`);
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

  const exportarColaboradoresAExcel = async () => {
    try {
      const localidad = localStorage.getItem("localidad");
      const res = await fetch(`http://localhost:3001/api/colaboradores?localidad=${encodeURIComponent(localidad)}`);
      const colaboradores = await res.json();

      if (!Array.isArray(colaboradores) || colaboradores.length === 0) {
        alert("No hay colaboradores para exportar.");
        return;
      }

      const datos = colaboradores.map(col => ({
        Nombre: col.Nombre || "",
        Apellidos: col.Apellidos || "",
        Cedula: col.CedulaID || "",
        Telefono: col.Telefono || "",
        Correo: col.Correo || "",
        FechaIngreso: col.FechaIngreso ? new Date(col.FechaIngreso).toLocaleDateString() : "",
        Empresa: col.Empresa || ""
      }));

      const hoja = XLSX.utils.json_to_sheet(datos);
      const libro = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(libro, hoja, "Colaboradores");

      const excelBuffer = XLSX.write(libro, { bookType: "xlsx", type: "array" });
      const archivo = new Blob([excelBuffer], { type: "application/octet-stream" });

      saveAs(archivo, `Colaboradores_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error("❌ Error al exportar colaboradores:", error);
      alert("Ocurrió un error al exportar el Excel.");
    }
  };

  const guardarPagoPlanilla = async () => {
    try {
      // 1. Sumamos los montos aplicados
      let valesTotal = pagoForm.Vales;
      let prestamosTotal = pagoForm.Prestamos;

      for (const p of pendientesAplicados) {
        if (p.tipo === "Vale") valesTotal += p.monto;
        if (p.tipo === "Financiamiento") prestamosTotal += p.monto;
      }

      const totalPagar = calcularPagoTotal({
        ...pagoForm,
        Vales: valesTotal,
        Prestamos: prestamosTotal
      });

      const localidad = localStorage.getItem("localidad") || "";

      const body = {
        CedulaID: selectedColaborador.CedulaID,
        Nombre: selectedColaborador.Nombre,
        FechaIngreso: selectedColaborador.FechaIngreso,
        ...pagoForm,
        Vales: valesTotal,
        Prestamos: prestamosTotal,
        TotalPago: totalPagar,
        Localidad: localidad // ✅ AÑADIDO AQUÍ
      };

      // 2. Guardar pago
      let response = await fetch("http://localhost:3001/api/pago-planilla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      // 3. Eliminar pendientes aplicados
      for (const p of pendientesAplicados) {
        if (p.tipo === "Vale") {
          await fetch(`http://localhost:3001/api/vales/${p.id}`, { method: "DELETE" });
        } else if (p.tipo === "Financiamiento") {
          await fetch(`http://localhost:3001/api/financiamientos/${p.id}`, { method: "DELETE" });
        }
      }

      alert("Pago guardado y pendientes aplicados correctamente");
      setShowCrearPago(false);
      setPendientesAplicados([]); // limpiar
      setPagoForm({ ...formularioInicial }); // limpiar

      if (selectedColaborador) verPagosColaborador(selectedColaborador.CedulaID);

    } catch (error) {
      console.error("Error al guardar pago y aplicar pendientes:", error);
    }

    // 4. Registrar pagos adicionales si hay financiamientos
    for (const p of pendientesAplicados) {
      if (p.tipo === "Financiamiento") {
        await fetch("http://localhost:3001/api/pagos-financiamiento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            IDFinanciamiento: p.id,
            MontoAplicado: p.monto,
            Fecha: new Date().toISOString().slice(0, 10),
            Observaciones: "Aplicado desde Planilla"
          })
        });

        // Eliminar el registro (si desea borrarlo visualmente)
        await fetch(`http://localhost:3001/api/financiamientos/${p.id}`, { method: "DELETE" });
      }
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

  const formatoFecha = (fecha) => {
    if (!fecha) return "";
    const f = new Date(fecha);
    return f.toLocaleDateString("es-CR", { year: "numeric", month: "long", day: "numeric" });
  };

  const imprimirVale = () => {
    const contenido = document.getElementById("reporte-vale");
    if (contenido) {
      const ventana = window.open("", "_blank");
      ventana.document.write(`
      <html>
        <head>
          <title>Comprobante de Vale</title>
          <style>
            body { font-family: Arial; text-align: center; margin-top: 100px; }
            h2 { margin-bottom: 30px; }
            p { font-size: 18px; margin: 10px 0; }
          </style>
        </head>
        <body>
          ${contenido.innerHTML}
        </body>
      </html>
    `);
      ventana.document.close();
      ventana.print();
    }
  };

  // ... Dentro de Dashboard.js o donde tenga su función de guardar boleta

  const handleSubmitVacaciones = async (e) => {
    e.preventDefault();

    try {
      const diasTomados = calcularDiasVacaciones(vacacionesForm.FechaSalida, vacacionesForm.FechaEntrada);

      if (!vacacionesForm.NumeroBoleta || vacacionesForm.NumeroBoleta.trim() === "") {
        alert("Debe ingresar el número de boleta manualmente.");
        return;
      }

      const body = {
        NumeroBoleta: vacacionesForm.NumeroBoleta,
        CedulaID: selectedColaborador.CedulaID,
        Nombre: selectedColaborador.Nombre,
        Apellidos: selectedColaborador.Apellidos, // ⬅️ Añadido
        FechaIngreso: selectedColaborador.FechaIngreso,
        FechaSalida: vacacionesForm.FechaSalida,
        FechaEntrada: vacacionesForm.FechaEntrada,
        DiasTomados: diasTomados,
        DiasDisponibles: selectedColaborador.DiasDisponibles, // ⬅️ Añadido
        Detalle: vacacionesForm.Detalle || "",
        Empresa: localStorage.getItem("localidad") || "",
        Usuario: localStorage.getItem("usuario") || "Sistema"
      };

      const response = await fetch("http://localhost:3001/api/vacaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      alert(data.message || "Boleta guardada correctamente");

      const nuevaBoleta = {
        Nombre: selectedColaborador.Nombre,
        Apellidos: selectedColaborador.Apellidos, // ⬅️ Añadido
        CedulaID: selectedColaborador.CedulaID,
        FechaSalida: vacacionesForm.FechaSalida,
        FechaEntrada: vacacionesForm.FechaEntrada,
        Dias: diasTomados, // ⬅️ Por si se requiere
        DiasDisponibles: selectedColaborador.DiasDisponibles, // ⬅️ Añadido
        CantidadDias: diasTomados,
        Detalle: vacacionesForm.Detalle,
        Usuario: localStorage.getItem("usuario") || "Sistema",
        NumeroBoleta: vacacionesForm.NumeroBoleta
      };

      setUltimaBoletaGenerada(nuevaBoleta);
      setUltimoNumeroBoleta(vacacionesForm.NumeroBoleta);
      setVacacionesForm({ ...formularioInicial });
      obtenerVacaciones();

      // Llama inmediatamente a imprimir
      imprimirBoletaVacaciones(nuevaBoleta);

      setTimeout(() => setShowGenerarVacaciones(false), 1200);

    } catch (error) {
      console.error("Error al guardar boleta:", error);
      alert("Error al guardar boleta");
    }
  };

  // ⬇️ Dentro del renderizado de la lista de boletas, por ejemplo en una tabla:
  {
    vacacionesHistorial.map((boleta, i) => (
      <tr key={i}>
        <td>{boleta.Nombre}</td>
        <td>{boleta.Apellidos}</td>
        <td>{boleta.FechaSalida}</td>
        <td>{boleta.FechaEntrada}</td>
        <td>{boleta.Detalle}</td>
        <td>{boleta.Usuario}</td>
        <td>{botonImprimir(boleta)}</td>
      </tr>
    ))
  }

  const guardarCambiosVale = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/vales/${valeEditando.ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(valeEditando),
      });

      if (!res.ok) throw new Error("Error al actualizar vale");

      alert("Vale actualizado correctamente");
      setShowModalEditarVale(false);
      obtenerVales(); // 👈 refresca la lista
    } catch (error) {
      console.error("Error al actualizar vale:", error);
      alert("Hubo un error al guardar los cambios.");
    }
  };


  /// ⬇️ La función de impresión
  const imprimirBoletaVacaciones = async (boleta) => {
    try {
      const localidad = localStorage.getItem("localidad");
      const encabezadoRes = await fetch(`/api/encabezado-localidad?localidad=${encodeURIComponent(localidad)}`);
      const encabezado = await encabezadoRes.json();

      const contenido = `
      <div style="text-align: center; font-family: Arial; font-size: 12px;">
        <strong>${encabezado.Empresa || ''}</strong><br/>
        ${encabezado.RazonSocial || ''}<br/>
        Cédula: ${encabezado.NumeroCedula || ''}<br/>
        Correo: ${encabezado.Correo || ''}<br/>
        Tel: ${encabezado.Telefono || ''}<br/>
        ${encabezado.Direccion || ''}<br/>
        <hr/>
        <h3>Boleta de Vacaciones</h3>
        <p><strong>Número de Boleta:</strong> ${boleta.NumeroBoleta || 'N/A'}</p>
        <p><strong>Nombre:</strong> ${boleta.Nombre}</p>
        <p><strong>Cédula:</strong> ${boleta.CedulaID}</p>
        <p><strong>Fecha Salida:</strong> ${boleta.FechaSalida}</p>
        <p><strong>Fecha Entrada:</strong> ${boleta.FechaEntrada}</p>
        <p><strong>Días:</strong> ${boleta.CantidadDias}</p>
        <p><strong>Detalle:</strong> ${boleta.Detalle}</p>
        <p><strong>Registrado por:</strong> ${boleta.Usuario}</p>
        <hr/>
        <p>Firma Colaborador: ______________________</p>
      </div>
    `;

      const ventana = window.open('', '_blank', 'width=600,height=800');
      ventana.document.write(`<html><head><title>Boleta Vacaciones</title></head><body>${contenido}</body></html>`);
      ventana.document.close();
      ventana.focus();
      ventana.print();
    } catch (error) {
      console.error("Error al imprimir boleta:", error);
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

  const obtenerUltimoNumeroBoleta = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/vacaciones/ultimoboleta?localidad=${encodeURIComponent(localidad)}`);
      const data = await res.json();

      // Validar que el campo venga definido, si no usar "Ninguno"
      const numero = data?.NumeroBoleta ?? "Ninguno";
      setUltimoNumeroBoleta(numero);
    } catch (error) {
      console.error("Error al obtener el último número de boleta:", error);
      setUltimoNumeroBoleta("Error");
    }
  };



  const botonImprimir = (boleta) => (
    <button
      className="btn btn-sm btn-success"
      onClick={() => generarPDFBoleta(boleta)}
    >
      Descargar PDF
    </button>
  );

  useEffect(() => {
    if (showGenerarVacaciones) {
      obtenerUltimoNumeroBoleta();
    }
  }, [showGenerarVacaciones]);

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

                <label>Salario Base Mensual:</label>
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

  <div id="reporte-vale" style={{ display: 'none', textAlign: 'center', padding: '40px', fontFamily: 'Arial' }}>
    <h2>Comprobante de Vale</h2>
    <p><strong>Nombre:</strong> {selectedColaborador?.Nombre}</p>
    <p><strong>Fecha:</strong> {formatoFecha(valeForm.FechaRegistro)}</p>
    <p><strong>Monto:</strong> ₡{parseFloat(valeForm.MontoVale || 0).toLocaleString()}</p>
    <p><strong>Motivo:</strong> {valeForm.Motivo}</p>
  </div>

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
                    verListaFinanciamientos();
                  } else if (card.id === "vales") {
                    const localidad = localStorage.getItem("localidad");
                    fetch(`http://localhost:3001/api/vales?localidad=${encodeURIComponent(localidad)}`)
                      .then(res => res.json())
                      .then(data => {
                        setListaVales(data);          // 👈 Asegúrese de tener este estado definido
                        setShowModalVerVales(true);   // 👈 Modal de impresión
                      })
                      .catch(err => console.error("Error al cargar vales:", err));
                  } else {
                    handleView(card.id);
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
            <div style={{ position: "absolute", top: 10, right: 10 }}>
              <button
                className="btn btn-sm btn-outline-info"
                onClick={() => {
                  obtenerTodasBoletas();
                  setMostrarModalListadoBoletas(true);
                }}
              >
                Ver Boletas
              </button>
            </div>
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

      {mostrarModalListadoBoletas && (
        <div className="modal-overlay" onClick={() => setMostrarModalListadoBoletas(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Listado de Boletas</h4>

            <input
              type="text"
              className="form-control mb-2"
              placeholder="Buscar por nombre o cédula"
              value={busquedaBoleta}
              onChange={(e) => setBusquedaBoleta(e.target.value)}
            />

            <table className="table table-sm table-striped">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Apellidos</th>
                  <th>Cédula</th>
                  <th>Boleta</th>
                  <th>Salida</th>
                  <th>Entrada</th>
                  {/* <th>Dias</th> */}
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {boletasPaginadas.map((boleta, i) => (
                  <tr key={i}>
                    <td>{boleta.Nombre}</td>
                    <td>{boleta.Apellidos}</td>
                    <td>{boleta.CedulaID}</td>
                    <td>{boleta.NumeroBoleta}</td>
                    <td>{boleta.FechaSalida?.slice(0, 10)}</td>
                    <td>{boleta.FechaEntrada?.slice(0, 10)}</td>
                    {/* <td>{boleta.DiasDisponibles}</td> */}
                    <td>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => {
                          const { diasDisponibles } = calcularDias(boleta.FechaIngreso, boleta.CedulaID);
                          const boletaConDias = { ...boleta, DiasDisponibles: diasDisponibles };
                          generarPDFBoleta(boletaConDias);
                        }}
                      >
                        Descargar PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="d-flex justify-content-center mt-2">
              <button
                className="btn btn-outline-secondary btn-sm me-2"
                disabled={paginaBoletas === 1}
                onClick={() => cambiarPaginaBoletas(paginaBoletas - 1)}
              >
                Anterior
              </button>
              <span className="mt-1">Página {paginaBoletas}</span>
              <button
                className="btn btn-outline-secondary btn-sm ms-2"
                disabled={paginaBoletas * 5 >= boletasFiltradas.length}
                onClick={() => cambiarPaginaBoletas(paginaBoletas + 1)}
              >
                Siguiente
              </button>
            </div>
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
            <div className="formulario-item">
              <label>Localidad:</label>
              <input
                type="text"
                className="form-control"
                value={localStorage.getItem("localidad") || ""}
                readOnly
              />
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
              <button
                className="btn btn-info me-2"
                onClick={() => cargarPendientes(selectedColaborador?.CedulaID)}
              >
                Ver Pendientes
              </button>
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
                <label>Fecha ultimo día de vacaciones:</label>
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
              <div className="formulario-item">
                <label>Empresa:</label>
                <input
                  type="text"
                  className="form-control"
                  value={localStorage.getItem("localidad") || ""}
                  readOnly
                />
              </div>
              <div className="formulario-item">
                <label>Último Número de Boleta:</label>
                <input
                  type="text"
                  className="form-control"
                  value={vacacionesForm.NumeroBoleta}
                  readOnly
                />
              </div>
            </div>


            <div className="d-flex justify-content-end mt-3">
              <button className="btn btn-secondary me-2" onClick={() => setShowGenerarVacaciones(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSubmitVacaciones}>Guardar Boleta</button>
            </div>
          </div>
        </div>

      )}



      {/* Modal para formularios */}
      {activeCard && !["planilla", "vales", "financiamientos", "vacaciones"].includes(activeCard) && (


        <div className="modal-overlay " onClick={() => setActiveCard(null)}>


          <div className="modal-content" onClick={(e) => e.stopPropagation()}>

            <div className="d-flex justify-content-end mb-3">
              <button
                className="btn btn-sm btn-outline-success me-2"
                onClick={exportarColaboradoresAExcel}
              >
                <i className="bi bi-file-earmark-excel"></i>Descargar Excel
              </button>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={imprimirColaboradores}
              >
                <i className="bi bi-printer"></i> Imprimir
              </button>
              <button
                className="btn btn-sm btn-outline-danger pdf-colaboradores"
                onClick={exportarColaboradoresAPDF}
              >
                <i className="bi bi-file-earmark-pdf"></i> Descargar PDF
              </button>
            </div>
            <h2>{viewMode ? "Ver" : "Crear"} {cards.find((c) => c.id === activeCard)?.title}</h2>
            {renderForm()}
            <div className="d-flex justify-content-end mt-3">
              <button
                className="btn btn-sm btn-danger"
                onClick={() => {
                  setActiveCard(null);
                  setViewMode(false);
                }}
              >
                Cerrar
              </button>
            </div>

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
            <div id="reporte-aguinaldo" style={{ padding: "20px", textAlign: "center" }}>
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
            </div>

            <div className="d-flex justify-content-between mt-3">
              <button className="btn btn-primary" onClick={imprimirAguinaldo}>Imprimir PDF</button>
              <button className="btn btn-success" onClick={descargarExcelAguinaldo}>Descargar Excel</button>
              <button className="btn btn-secondary" onClick={() => setShowAguinaldoModal(false)}>Cerrar</button>
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
                      c.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
                      c.Empresa === localStorage.getItem("localidad")
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
                    const localidad = localStorage.getItem("localidad");
                    const valeConEmpresa = { ...valeForm, Empresa: localidad };

                    await fetch("http://localhost:3001/api/vales", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(valeConEmpresa)
                    });

                    alert("Vale registrado correctamente");
                    imprimirVale(); // Primero imprimimos
                    setShowValesModal(false); // Luego cerramos el modal

                    // Limpiar formulario
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

      {showModalVerVales && (
        <div className="modal-overlay" onClick={() => setShowModalVerVales(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Lista de Vales</h4>
            <table className="table table-bordered mt-2">
              <thead className="table-dark">
                <tr>
                  <th>Nombre</th>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th>Motivo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {listaVales.length > 0 ? (
                  listaVales.map((v, idx) => (
                    <tr key={idx}>
                      <td>{v.Nombre}</td>
                      <td>{v.FechaRegistro?.slice(0, 10)}</td>
                      <td>₡{parseFloat(v.MontoVale).toLocaleString('es-CR')}</td>
                      <td>{v.Motivo}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => {
                            setValeEditando(v); // guarda el vale actual
                            setShowModalEditarVale(true); // muestra el modal de edición
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={async () => {
                            if (window.confirm("¿Está seguro que desea eliminar este vale?")) {
                              try {
                                await fetch(`http://localhost:3001/api/vales/${v.ID}`, {
                                  method: "DELETE"
                                });
                                alert("Vale eliminado correctamente");
                                obtenerVales(); // 👈 refresca la lista después de eliminar
                              } catch (error) {
                                console.error("Error al eliminar el vale:", error);
                                alert("Error al eliminar el vale.");
                              }
                            }
                          }}
                        >
                          Eliminar
                        </button>

                        {/* <button
                          className="btn btn-sm btn-info"
                          onClick={() => {
                            console.log("🟦 Vale enviado desde Dashboard.js:", valeSeleccionado);  // 🧪 VERIFICACIÓN
                            if (!valeSeleccionado || !valeSeleccionado.Nombre || !valeSeleccionado.MontoVale) {
                              console.error("❌ Vale inválido o incompleto:", valeSeleccionado);
                              alert("Este IMPRIMIRvale no tiene la información suficiente para imprimir.");
                              return;
                            }
                            generarPDFVale(valeSeleccionado);
                          }}
                        >
                          Imprimir OTRO
                        </button> */}
                        <button
                          className="btn btn-info btn-sm ver-detalle-boton"
                          onClick={() => {
                            setValeSeleccionado(v); // ✅ Asigna este vale al estado
                            setShowModalVerVales(false); // ✅ Cierra lista general
                            setShowModalDetalleVale(true); // ✅ Abre modal detalle
                          }}
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">No hay vales registrados</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="text-end">
              <button className="btn btn-secondary" onClick={() => setShowModalVerVales(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}


      {showFinanciamientoModal && (
        <div className="modal-overlay" onClick={() => setShowFinanciamientoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{modoEditarFinanciamiento ? "Editar Financiamiento" : "Crear Financiamiento"}</h3>

            <form onSubmit={(e) => {
              e.preventDefault();
              guardarFinanciamiento();
            }}>
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
                        required
                      />

                      <select
                        className="form-select"
                        required
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
                            (c.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              c.CedulaID.toLowerCase().includes(searchTerm.toLowerCase())) &&
                            c.Empresa === localStorage.getItem("localidad") // filtro por localidad
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
                    required
                    value={financiamientoForm.Producto}
                    onChange={(e) => setFinanciamientoForm({ ...financiamientoForm, Producto: e.target.value })}
                  />

                  <label className="mt-2">Monto:</label>
                  <input
                    type="number"
                    className="form-control"
                    required
                    value={financiamientoForm.Monto}
                    onChange={(e) => setFinanciamientoForm({ ...financiamientoForm, Monto: parseFloat(e.target.value) || 0 })}
                  />

                  <label className="mt-2">Fecha de Creación:</label>
                  <input
                    type="date"
                    className="form-control"
                    required
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
                    required
                    value={financiamientoForm.Plazo}
                    onChange={(e) => setFinanciamientoForm({ ...financiamientoForm, Plazo: parseInt(e.target.value) || 0 })}
                  />

                  <label className="mt-2">Interés (%):</label>
                  <input
                    type="number"
                    className="form-control"
                    required
                    value={financiamientoForm.InteresPorcentaje}
                    onChange={(e) => setFinanciamientoForm({ ...financiamientoForm, InteresPorcentaje: parseFloat(e.target.value) || 0 })}
                  />

                  <label className="mt-2">Descripción:</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    required
                    value={financiamientoForm.Descripcion}
                    onChange={(e) => setFinanciamientoForm({ ...financiamientoForm, Descripcion: e.target.value })}
                  />

                  <label className="mt-2">Localidad:</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={localStorage.getItem("localidad")}
                    readOnly
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="text-end mt-3">
                <button type="button" className="btn btn-secondary me-2" onClick={() => setShowFinanciamientoModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar
                </button>
              </div>
            </form>
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
                  <th>Aplicar</th>
                </tr>
              </thead>
              <tbody>
                {pendientesVale.map((vale, i) => (
                  <tr key={i}>
                    <td>{new Date(vale.FechaRegistro).toLocaleDateString()}</td>
                    <td>{vale.Motivo}</td>
                    <td>₡{parseFloat(vale.MontoVale).toLocaleString()}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          placeholder="₡0.00"
                          min={0}
                          max={vale.MontoVale}
                          value={
                            pendientesAplicados.find(p => p.tipo === "Vale" && p.id === vale.ID)?.monto || ""
                          }
                          onChange={(e) => {
                            const montoAplicar = parseFloat(e.target.value) || 0;
                            const nuevosPendientes = pendientesAplicados.filter(p => !(p.tipo === "Vale" && p.id === vale.ID));
                            const actualizados = [...nuevosPendientes, { tipo: "Vale", id: vale.ID, monto: montoAplicar }];
                            setPendientesAplicados(actualizados);
                            actualizarMontosDesdePendientes(actualizados);
                          }}
                        />
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => {
                            setPendientesAplicados((prev) => {
                              const sinEste = prev.filter(p => !(p.tipo === "Vale" && p.id === vale.ID));
                              return [...sinEste, { tipo: "Vale", id: vale.ID, monto: vale.MontoVale }];
                            });
                          }}
                        >
                          Aplicar todo
                        </button>
                      </div>
                    </td>
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
                  <th>Aplicar</th> {/* <-- Esta línea es clave */}
                </tr>
              </thead>
              <tbody>
                {pendientesFinanciamiento.map((fin, i) => (
                  <tr key={i}>
                    <td>{new Date(fin.FechaCreacion).toLocaleDateString()}</td>
                    <td>{fin.Descripcion}</td>
                    <td>₡{parseFloat(fin.MontoPendiente || 0).toLocaleString()}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          placeholder="₡0.00"
                          min={0}
                          max={fin.MontoPendiente}
                          value={
                            pendientesAplicados.find(p => p.tipo === "Financiamiento" && p.id === fin.ID)?.monto || ""
                          }
                          onChange={(e) => {
                            const montoAplicar = parseFloat(e.target.value) || 0;
                            const nuevosPendientes = pendientesAplicados.filter(p => !(p.tipo === "Financiamiento" && p.id === fin.ID));
                            const actualizados = [...nuevosPendientes, { tipo: "Financiamiento", id: fin.ID, monto: montoAplicar }];
                            setPendientesAplicados(actualizados);
                            actualizarMontosDesdePendientes(actualizados);
                          }}
                        />
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => {
                            const nuevosPendientes = pendientesAplicados.filter(p => !(p.tipo === "Financiamiento" && p.id === fin.ID));
                            const actualizados = [...nuevosPendientes, { tipo: "Financiamiento", id: fin.ID, monto: fin.MontoPendiente }];
                            setPendientesAplicados(actualizados);
                            actualizarMontosDesdePendientes(actualizados);
                          }}
                        >
                          Aplicar todo
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="d-flex justify-content-between mt-3">
              <button
                className="btn btn-success"
                onClick={() => {
                  actualizarMontosDesdePendientes(pendientesAplicados);
                  setShowVerPendientes(false);
                }}
              >
                Aplicar al Pago
              </button>
              <button className="btn btn-secondary" onClick={() => setShowVerPendientes(false)}>Cerrar</button>
            </div>

            {/* <div className="d-flex justify-content-end mt-3">
              <button className="btn btn-secondary" onClick={() => setShowVerPendientes(false)}>Cerrar</button>
            </div> */}
          </div>
        </div>
      )}

      {showModalEditarVale && valeEditando && (
        <div className="modal-overlay" onClick={() => setShowModalEditarVale(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Editar Vale</h3>

            <div className="form-group mb-2">
              <label>Cédula</label>
              <input type="text" className="form-control" value={valeEditando.CedulaID} readOnly />
            </div>

            <div className="form-group mb-2">
              <label>Nombre</label>
              <input type="text" className="form-control" value={valeEditando.Nombre} readOnly />
            </div>

            <div className="form-group mb-2">
              <label>Fecha de Registro</label>
              <input
                type="date"
                className="form-control"
                value={valeEditando.FechaRegistro?.slice(0, 10)}
                onChange={(e) =>
                  setValeEditando({ ...valeEditando, FechaRegistro: e.target.value })
                }
              />
            </div>

            <div className="form-group mb-2">
              <label>Monto del Vale</label>
              <input
                type="number"
                className="form-control"
                value={valeEditando.MontoVale}
                onChange={(e) =>
                  setValeEditando({ ...valeEditando, MontoVale: parseFloat(e.target.value) || 0 })
                }
              />
            </div>

            <div className="form-group mb-2">
              <label>Motivo</label>
              <textarea
                className="form-control"
                rows={2}
                value={valeEditando.Motivo}
                onChange={(e) =>
                  setValeEditando({ ...valeEditando, Motivo: e.target.value })
                }
              />
            </div>

            <div className="text-end mt-3">
              <button className="btn btn-secondary me-2" onClick={() => setShowModalEditarVale(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardarCambiosVale}>Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

      {showModalDetalleVale && valeSeleccionado && (
        <div className="modal-overlay" onClick={() => setShowModalDetalleVale(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Detalle del Vale</h3>
            <p><strong>Nombre:</strong> {valeSeleccionado.Nombre}</p>
            {/* <p><strong>Apellidos:</strong> {valeSeleccionado.Apellidos || ''}</p> */}
            <p><strong>Fecha:</strong> {valeSeleccionado.FechaRegistro?.slice(0, 10)}</p>
            <p><strong>Monto:</strong> ₡{parseFloat(valeSeleccionado.MontoVale || 0).toLocaleString()}</p>
            <p><strong>Motivo:</strong> {valeSeleccionado.Motivo}</p>
            <p><strong>Empresa:</strong> {valeSeleccionado.Empresa}</p>

            <div className="text-end mt-3">
              <button className="btn btn-secondary me-2" onClick={() => setShowModalDetalleVale(false)}>Cerrar</button>
              <button
                className="btn btn-danger me-2"
                onClick={async () => {
                  if (window.confirm("¿Desea eliminar este vale?")) {
                    await fetch(`http://localhost:3001/api/vales/${valeSeleccionado.ID}`, {
                      method: "DELETE"
                    });
                    setShowModalDetalleVale(false);
                    obtenerVales(); // ✅ recarga los datos
                  }
                }}
              >
                Eliminar
              </button>
              <button
                className="btn btn-sm btn-info"
                onClick={() => {
                  if (!valeSeleccionado || !valeSeleccionado.Nombre || !valeSeleccionado.MontoVale) {
                    alert("Este vale no tiene la información suficiente para imprimir.");
                    return;
                  }
                  generarPDFVale(valeSeleccionado);
                }}
              >
                Imprimir otro 2
              </button>
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

      <ModalImpresionBoleta
        mostrar={mostrarModalImpresion}
        cerrar={() => setMostrarModalImpresion(false)}
        boleta={ultimaBoletaGenerada}
      />
    </div>


  );
};