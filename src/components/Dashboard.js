import { api } from "../apiBase";
import React, { useState, useEffect, forwardRef, useMemo } from "react";
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
import ContratoColaborador from './ContratoColaborador';
import GestionContratos from "./GestionCotratos";


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
  const [paginaActual, setPaginaActual] = useState(1);
  const historialOrdenado = [...vacacionesDetalle].sort((a, b) => new Date(b.FechaSalida) - new Date(a.FechaSalida));
  const totalPaginas = Math.ceil(historialOrdenado.length / boletasPorPagina);
  const inicio = (paginaActual - 1) * boletasPorPagina;
  const pagina = historialOrdenado.slice(inicio, inicio + boletasPorPagina);
  const pagosPorPagina = 6;
  const [showEliminarPagoModal, setShowEliminarPagoModal] = useState(false);
  const indexInicio = (paginaActual - 1) * pagosPorPagina;
  const indexFin = indexInicio + pagosPorPagina;
  const [pagoAEliminar, setPagoAEliminar] = useState(null);
  const [showConfirmarEliminar, setShowConfirmarEliminar] = useState(false);
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
  const [showContratoModal, setShowContratoModal] = useState(false);

  const [showConfirmEliminar, setShowConfirmEliminar] = useState(false);
  const [valeAEliminar, setValeAEliminar] = useState(null);
  const [eliminandoVale, setEliminandoVale] = useState(false);

  // Aguinaldo: acciones
  const [showConfirmEliminarAguinaldo, setShowConfirmEliminarAguinaldo] = useState(false);
  const [aguinaldoAEliminar, setAguinaldoAEliminar] = useState(null);

  // Pagos de aguinaldo (vista "VER pagos")
  const [listaPagosAguinaldo, setListaPagosAguinaldo] = useState([]);

  // VER pagos de aguinaldo
  const [showModalVerPagosAguinaldo, setShowModalVerPagosAguinaldo] = useState(false);
  const [colaboradorAguinaldo, setColaboradorAguinaldo] = useState(null);
  const [pagosAguinaldo, setPagosAguinaldo] = useState([]);


  // Modal de confirmación para eliminar colaborador
  const [showConfirmEliminarCol, setShowConfirmEliminarCol] = useState(false);
  const [colaboradorAEliminar, setColaboradorAEliminar] = useState(null);
  const [eliminandoCol, setEliminandoCol] = useState(false);

  const [buscarVale, setBuscarVale] = useState("");
  const [paginaVales, setPaginaVales] = useState(1);
  const pageSizeVales = 8;

  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");
  const [rangoActivo, setRangoActivo] = useState(false);

  // 📄 Lista y búsqueda/paginación de pagos de aguinaldo
  const [aguinaldosGuardados, setAguinaldosGuardados] = useState([]);
  const [busquedaAguinaldo, setBusquedaAguinaldo] = useState("");
  const [paginaAguinaldos, setPaginaAguinaldos] = useState(1);
  const pageSizeAguinaldos = 10;

  // 👁️ Detalle/imprimir
  const [showDetalleAguinaldo, setShowDetalleAguinaldo] = useState(false);
  const [aguinaldoSeleccionado, setAguinaldoSeleccionado] = useState(null);

  // VER AUMENTOS
  const [showModalVerAumentos, setShowModalVerAumentos] = useState(false);
  const [aumentos, setAumentos] = useState([]);           // historial desde BD
  const [searchAumentos, setSearchAumentos] = useState("");
  const [pagAumPage, setPagAumPage] = useState(1);
  const AUM_PER_PAGE = 10;


  // Pagos de un colaborador
  const [showPagosDeColab, setShowPagosDeColab] = useState(false);
  const [colabSeleccionadoAguinaldo, setColabSeleccionadoAguinaldo] = useState(null);

  // VER (lista de colaboradores para aguinaldo)
  const [showListaAguinaldos, setShowListaAguinaldos] = useState(false);
  const [colabsAguinaldo, setColabsAguinaldo] = useState([]);
  const [searchColabAguinaldo, setSearchColabAguinaldo] = useState("");
  const [pagColabPage, setPagColabPage] = useState(1);
  const ROWS_AG = 10;

  // Listado de colaboradores (VER)
  const rowsColabAguinaldo = 10;

  const colillasRef = useRef(null);

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

  const cerrarVacacionesModal = () => {
    setShowVacacionesModal(false);
  };

  const normaliza = (s) =>
    (s || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  // Cuando cambie la búsqueda o la lista, vuelve a la página 1
  useEffect(() => {
    setPaginaVales(1);
  }, [buscarVale, listaVales]);

  // Aplica filtro + pagina
  const valesFiltrados = (listaVales || []).filter((v) =>
    normaliza(v?.Nombre).includes(normaliza(buscarVale))
  );

  const totalPaginasVales = Math.max(
    1,
    Math.ceil(valesFiltrados.length / pageSizeVales)
  );

  const inicioVales = (paginaVales - 1) * pageSizeVales;
  const valesPagina = valesFiltrados.slice(
    inicioVales,
    inicioVales + pageSizeVales
  );

  const [paginaActualPagos, setPaginaActualPagos] = useState(1);


  const totalPaginasPagos = Math.ceil(pagosColaborador.length / pagosPorPagina);

  const pagosPaginados = pagosColaborador.slice(
    (paginaActualPagos - 1) * pagosPorPagina,
    paginaActualPagos * pagosPorPagina
  );

  const [showEditarPagoModal, setShowEditarPagoModal] = useState(false);
  const [pagoAEditar, setPagoAEditar] = useState(null);

  const abrirModalEditarPago = (pago) => {
    setPagoAEditar(pago);
    setShowEditarPagoModal(true);
  };

  const reiniciarModalVacaciones = () => {
    setShowVacacionesModal(false);
    setTimeout(() => {
      setShowVacacionesModal(true);
    }, 300); // suficiente para desmontar y volver a montar correctamente
  };

  // ✅ Toast de éxito para "Vale registrado correctamente"
  const [toastVale, setToastVale] = useState({ visible: false, message: "" });

  const showToastVale = (msg) => {
    setToastVale({ visible: true, message: msg });
    setTimeout(() => setToastVale({ visible: false, message: "" }), 2200);
  };

  // Helper: filtra por rango [desde, hasta] inclusivo
  const filtraListaPorRango = (lista, desde, hasta) => {
    if (!Array.isArray(lista)) return [];
    const d = (s) => (s || "").toString().slice(0, 10); // "YYYY-MM-DD"
    return lista.filter((p) => {
      const f = d(p.FechaRegistro);
      return f >= d(desde) && f <= d(hasta);
    });
  };

  // Pagos a mostrar (si el rango está activo, se usa el filtrado)
  const getPagosParaMostrar = () => {
    if (rangoActivo && filtroDesde && filtroHasta) {
      return filtraListaPorRango(pagosDelAguinaldo, filtroDesde, filtroHasta);
    }
    return pagosDelAguinaldo || [];
  };

  const confirmarEliminarVale = async () => {
    if (!valeAEliminar) return;
    try {
      setEliminandoVale(true);

      const resp = await api(`/api/vales/${valeAEliminar.ID}`, {
        method: "DELETE",
      });

      if (!resp.ok) {
        const msg = await resp.text().catch(() => "");
        throw new Error(msg || "Error al eliminar en servidor");
      }

      // ✅ refresco inmediato en la UI
      setListaVales(prev => prev.filter(item => item.ID !== valeAEliminar.ID));

      setShowConfirmEliminar(false);
      setValeAEliminar(null);
    } catch (err) {
      console.error("Error al eliminar vale:", err);
      alert("Error al eliminar el vale.");
    } finally {
      setEliminandoVale(false);
    }
  };

  const getLocalidadLS = () => {
    const ls = localStorage.getItem("localidad");
    if (ls) return ls;
    try {
      const u = JSON.parse(localStorage.getItem("usuario") || "null");
      return u?.Localidad || "";
    } catch {
      return "";
    }
  };

  useEffect(() => {
    if (!showListaAguinaldos) return;

    (async () => {
      try {
        let localidad = localStorage.getItem("localidad") || "";
        try {
          const o = JSON.parse(localidad);
          if (o && typeof o === "object") localidad = o.Localidad || o.Empresa || localidad;
        } catch { /* era string */ }

        const res = await fetch(
          `http://localhost:3001/api/colaboradores?localidad=${encodeURIComponent(localidad)}`
        );
        const data = await res.json();
        setColabsAguinaldo(Array.isArray(data) ? data : []);
        setPagColabPage(1);
      } catch (e) {
        console.error("Error cargando colaboradores para VER aguinaldos:", e);
        setColabsAguinaldo([]);
      }
    })();
  }, [showListaAguinaldos]);



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

  // cerca de tus otros estados
  const tablaReporteRef = useRef(null);

  // imprime SOLAMENTE el contenido del reporte (sin filtros/botones)
  const imprimirReportePagos = () => {
    if (!tablaReporteRef.current) return;

    const win = window.open("", "_blank", "width=900,height=700");
    const styles = `
    <style>
      @page { size: A4; margin: 12mm; }
      body { font-family: Arial, sans-serif; margin: 0; padding: 16px; }
      h3 { margin-top: 0; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #222; padding: 6px; font-size: 12px; }
      th { background: #eee; }
      thead { display: table-header-group; }
      tr, td, th { page-break-inside: avoid; }
    </style>
  `;

    win.document.open();
    win.document.write(`
    <html>
      <head>
        <title>Reporte de Colillas</title>
        ${styles}
      </head>
      <body>
        ${tablaReporteRef.current.innerHTML}
      </body>
    </html>
  `);
    win.document.close();
    win.focus();
    // importante: esperar un tick para que el navegador pinte la tabla
    setTimeout(() => {
      win.print();
      win.close();
    }, 50);
  };

  const imprimirSoloColillas = () => {
    if (!colillasRef.current) return;

    const win = window.open("", "_blank", "width=1100,height=800");

    const styles = `
    <style>
      @page { size: A4 landscape; margin: 12mm; } /* 👈 Horizontal */
      body { font-family: Arial, sans-serif; margin: 0; padding: 12px; }
      table { width: 100%; border-collapse: collapse; table-layout: fixed; }
      th, td { border: 1px solid #222; padding: 4px; font-size: 11px; vertical-align: middle; }
      th { background: #eee; }
      thead { display: table-header-group; }           /* encabezado en cada página */
      tr, td, th { page-break-inside: avoid; }
      .colilla { margin-bottom: 12px; }
      /* Un poco de control de ancho para que quepa “Total Pago” */
      /* Ajusta estos porcentajes si quieres más/menos espacio en alguna columna */
      .colillas-wrap table colgroup col:nth-child(1) { width: 14%; } /* Nombre */
      .colillas-wrap table colgroup col:nth-child(2) { width: 10%; } /* Cédula */
      .colillas-wrap table colgroup col:nth-child(3) { width: 8%;  } /* Fecha */
      .colillas-wrap table colgroup col:nth-child(4) { width: 7%;  } /* Horas Trabaj */
      .colillas-wrap table colgroup col:nth-child(5) { width: 7%;  } /* Horas Extra */
      .colillas-wrap table colgroup col:nth-child(6) { width: 8%;  } /* Comisiones */
      .colillas-wrap table colgroup col:nth-child(7) { width: 8%;  } /* Viáticos */
      .colillas-wrap table colgroup col:nth-child(8) { width: 7%;  } /* CCSS */
      .colillas-wrap table colgroup col:nth-child(9) { width: 7%;  } /* Préstamos */
      .colillas-wrap table colgroup col:nth-child(10){ width: 7%;  } /* Vales */
      .colillas-wrap table colgroup col:nth-child(11){ width: 7%;  } /* Adelantos */
      .colillas-wrap table colgroup col:nth-child(12){ width: 7%;  } /* Ahorro */
      .colillas-wrap table colgroup col:nth-child(13){ width: 13%; } /* Total Pago */
    </style>
  `;

    // Inyectamos un <colgroup> para fijar anchos de columnas
    // (no altera tu HTML original)
    const withColGroup = (html) => {
      return html.replace(
        /<table([^>]*)>/g,
        `<table$1>
        <colgroup>
          <col/><col/><col/><col/><col/><col/><col/><col/><col/><col/><col/><col/><col/>
        </colgroup>`
      );
    };

    const content = withColGroup(`
    <div class="colillas-wrap">
      ${colillasRef.current.innerHTML}
    </div>
  `);

    win.document.open();
    win.document.write(`
    <html>
      <head>
        <title>Colillas de Pago</title>
        ${styles}
      </head>
      <body>
        ${content}
      </body>
    </html>
  `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 80);
  };

  // === NUEVO: estado para el modal de generar pago de aguinaldo ===
  const [showGenerarAguinaldo, setShowGenerarAguinaldo] = useState(false);

  const [formPagoAguinaldo, setFormPagoAguinaldo] = useState({
    CedulaID: "",
    Nombre: "",
    Empresa: "",
    PeriodoDesde: "",
    PeriodoHasta: "",
    Monto: 0,
    FechaPago: new Date().toISOString().slice(0, 10),
    Observaciones: ""
  });

  // Periodo "oficial" 01/12 (año previo) — 30/11 (año actual)
  const getPeriodoActual = () => {
    const y = new Date().getFullYear();
    return {
      desde: `${y - 1}-12-01`,
      hasta: `${y}-11-30`
    };
  };



  // Abre el modal "Generar pago de aguinaldo"
  // Respeta el rango activo si el usuario filtró, si no usa el periodo oficial.
  // Verifica duplicado ANTES de abrir.
  const abrirGenerarPagoAguinaldo = async () => {
    try {
      if (!selectedColaborador) return;

      const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
      const empresa =
        localStorage.getItem('localidad') ||
        usuario?.Localidad ||
        "";

      const periodo = getPeriodoActual();
      const periodoDesde = (rangoActivo && filtroDesde) ? filtroDesde : periodo.desde;
      const periodoHasta = (rangoActivo && filtroHasta) ? filtroHasta : periodo.hasta;

      const monto = parseFloat(aguinaldoMostrado || 0) || 0;

      // 1) Verificar si ya existe para ese período
      const qs = new URLSearchParams({
        cedulaID: selectedColaborador.CedulaID,
        empresa,
        desde: periodoDesde,
        hasta: periodoHasta
      }).toString();

      const res = await fetch(`http://localhost:3001/api/aguinaldos-pagados/existe?${qs}`);
      if (!res.ok) throw new Error("Error verificando pago de aguinaldo");

      const { existe } = await res.json();
      if (existe) {
        alert("⚠️ Ya existe un pago de aguinaldo para este colaborador en ese período.");
        return;
      }

      // 2) Prellenar y abrir modal
      setFormPagoAguinaldo({
        CedulaID: selectedColaborador.CedulaID,
        Nombre: selectedColaborador.Nombre,
        Empresa: empresa,
        PeriodoDesde: periodoDesde,
        PeriodoHasta: periodoHasta,
        Monto: monto,
        FechaPago: new Date().toISOString().slice(0, 10),
        Observaciones: ""
      });
      setShowGenerarAguinaldo(true);

    } catch (err) {
      console.error("Error al preparar pago de aguinaldo:", err);
      alert("No se pudo preparar el pago de aguinaldo.");
    }
  };

  // Guarda el pago en BD
  const guardarPagoAguinaldo = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/aguinaldos-pagados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formPagoAguinaldo)
      });

      if (res.status === 409) {
        const j = await res.json();
        alert(j.message || "Ya existe un pago de aguinaldo para ese período.");
        return;
      }
      if (!res.ok) throw new Error("Error al guardar el pago");

      alert("✅ Pago de aguinaldo registrado correctamente.");
      setShowGenerarAguinaldo(false);

    } catch (err) {
      console.error("Error guardando pago de aguinaldo:", err);
      alert("No se pudo guardar el pago de aguinaldo.");
    }
  };

  const anyAguinaldoModalOpen =
    showAguinaldoModal ||
    showListaColaboradoresAguinaldo ||
    showModalVerPagosAguinaldo; // suma otros modales de aguinaldo si tienes

  // Obtiene localidad como usas en el resto de la app
  const getLocalidad = () => {
    const raw = localStorage.getItem("localidad");
    if (raw) return raw;
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
      return usuario?.Localidad || "";
    } catch {
      return "";
    }
  };

  // 🔎 Abrir lista de pagos de aguinaldo (filtrados por localidad)
  const abrirListaAguinaldos = async () => {
    try {
      const loc = getLocalidad();
      const res = await fetch(`http://localhost:3001/api/aguinaldos-pagados?localidad=${encodeURIComponent(loc)}`);
      const data = await res.json();
      setAguinaldosGuardados(Array.isArray(data) ? data : []);
      setBusquedaAguinaldo("");
      setPaginaAguinaldos(1);
      setShowListaAguinaldos(true);
    } catch (err) {
      console.error("Error cargando aguinaldos pagados:", err);
      alert("No se pudo cargar la lista de aguinaldos pagados.");
    }
  };

  // 🗑️ Eliminar un pago de aguinaldo
  const eliminarAguinaldoPago = async (id) => {
    const ok = window.confirm("¿Seguro que deseas eliminar este pago de aguinaldo?");
    if (!ok) return;
    try {
      const res = await fetch(`http://localhost:3001/api/aguinaldos-pagados/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar en servidor");
      // refrescar lista en memoria
      setAguinaldosGuardados(prev => prev.filter(a => a.ID !== id));
      // corregir paginación si quedaste fuera de rango
      setPaginaAguinaldos(p => {
        const total = Math.ceil((aguinaldosGuardados.length - 1) / pageSizeAguinaldos) || 1;
        return Math.min(p, total);
      });
    } catch (err) {
      console.error("Error eliminando aguinaldo:", err);
      alert("No se pudo eliminar el registro.");
    }
  };

  // 📄 Imprimir PDF del detalle seleccionado (usa tu html2pdf)
  const imprimirAguinaldoPagadoPDF = () => {
    const nodo = document.getElementById("vista-aguinaldo-pagado");
    if (!nodo) return;
    const nombreArchivo = `Aguinaldo_${aguinaldoSeleccionado?.Nombre || "Colaborador"}_${(aguinaldoSeleccionado?.PeriodoHasta || "").slice(0, 10)}.pdf`;

    const opciones = {
      margin: [10, 10, 10, 10],
      filename: nombreArchivo,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opciones).from(nodo).save();
  };

  // Normaliza distintas formas de respuesta del backend a un array
  const asArray = (data) => {
    if (Array.isArray(data)) return data;
    if (data?.pagos && Array.isArray(data.pagos)) return data.pagos;
    if (data?.recordset && Array.isArray(data.recordset)) return data.recordset;
    if (data?.data && Array.isArray(data.data)) return data.data;
    return [];
  };

  const verPagosAguinaldoDe = async (col) => {
    setColaboradorAguinaldo(col);

    // Localidad desde localStorage (string o JSON)
    let localidad = localStorage.getItem("localidad") || "";
    try {
      const o = JSON.parse(localidad);
      if (o && typeof o === "object") localidad = o.Localidad || o.Empresa || localidad;
    } catch { /* era string */ }

    try {
      // Endpoint principal (ajústalo si ya usas uno concreto)
      const url = `http://localhost:3001/api/aguinaldos-pagados?cedulaID=${encodeURIComponent(col.CedulaID)}&localidad=${encodeURIComponent(localidad)}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("No ok");

      const json = await res.json();
      // Acepta varias formas: array directo, {pagos: [...]}, {recordset: [...]}
      const rows = Array.isArray(json) ? json : (json.pagos || json.recordset || []);
      const list = Array.isArray(rows) ? rows : [];

      // Ordenar más recientes primero por FechaPago
      list.sort((a, b) =>
        new Date(b.FechaPago || b.FechaRegistro || 0) - new Date(a.FechaPago || a.FechaRegistro || 0)
      );

      setPagosAguinaldo(list);
    } catch (e) {
      console.error("Error cargando pagos de aguinaldo:", e);
      setPagosAguinaldo([]);
    }

    // Abre solo este modal (no llames handleView ni cambies activeCard aquí)
    setShowModalVerPagosAguinaldo(true);
  };

  const generarPDFFinanciamiento = async (fin) => {
    // ——— Helpers ———
    const formatMonto = (n) => Number(n || 0).toLocaleString('en-US');

    // Quita encabezado si lo trae y devuelve solo la parte base64
    const stripDataUrl = (s) => {
      if (typeof s !== 'string') return '';
      const i = s.indexOf('base64,');
      return i >= 0 ? s.slice(i + 7) : s;
    };

    // Detectar MIME por firma base64 (PNG/JPEG)
    const detectMime = (base64Raw) => {
      const head = base64Raw.slice(0, 10);
      if (head.startsWith('iVBOR')) return 'image/png'; // PNG
      if (head.startsWith('/9j/')) return 'image/jpeg'; // JPEG
      return 'image/png';
    };

    // Normaliza cualquier logo (dataURL, base64 crudo o URL) a dataURL válido
    const normalizeLogoToDataUrl = async (logo) => {
      if (!logo || typeof logo !== 'string') return null;

      // 1) Si ya es dataURL válido
      if (logo.startsWith('data:image/')) return logo;

      // 2) Si parece base64 crudo
      const looksLikeB64 = /^[A-Za-z0-9+/=\s]+$/.test(logo) && logo.replace(/\s/g, '').length > 100;
      if (looksLikeB64) {
        const raw = stripDataUrl(logo).replace(/\s/g, '');
        const mime = detectMime(raw);
        // Validación básica: longitud múltiplo de 4
        if (raw.length % 4 !== 0) return null;
        return `data:${mime};base64,${raw}`;
      }

      // 3) Si es URL: descargar y convertir a dataURL
      try {
        const res = await fetch(logo);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const blob = await res.blob();
        const dataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
        return typeof dataUrl === 'string' && dataUrl.startsWith('data:image/')
          ? dataUrl
          : null;
      } catch {
        return null;
      }
    };

    try {
      const localidad = localStorage.getItem('localidad') || '';
      let empresa = null;

      // Cargar encabezado (empresa)
      try {
        const res = await fetch(`http://localhost:3001/api/localidades/${encodeURIComponent(localidad)}`);
        if (res.ok) empresa = await res.json();
      } catch { }

      // 👇 Usa la importación que tengas en ese archivo:
      // import { jsPDF } from 'jspdf'
      const doc = new jsPDF({ unit: 'mm', format: 'letter' });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let y = 15;

      const center = (texto, font = { family: 'times', style: 'normal', size: 11 }, dy = 6) => {
        if (font.family) doc.setFont(font.family, font.style || 'normal');
        if (font.size) doc.setFontSize(font.size);
        const lines = doc.splitTextToSize(String(texto || ''), pageWidth - margin * 2);
        lines.forEach((l) => {
          if (!l) return;
          doc.text(l, pageWidth / 2, y, { align: 'center' });
          y += dy;
        });
      };

      const fila = (label, value) => {
        const texto = `${label}: ${value ?? ''}`;
        const lines = doc.splitTextToSize(String(texto), pageWidth - margin * 2);
        lines.forEach((l) => {
          if (y > pageHeight - 30) { doc.addPage(); y = 20; }
          doc.text(l, margin, y);
          y += 6;
        });
      };

      // ——— Encabezado con logo (si es válido) ———
      try {
        // empresa?.Logo viene como data:image/x-icon;base64,... en tu caso
        const logoData = await toPngDataUrl(empresa?.Logo);
        if (logoData) {
          const logoW = 28;
          const logoH = 25;
          const x = (pageWidth - logoW) / 2;
          doc.addImage(logoData, 'PNG', x, y, logoW, logoH);
          y += logoH + 4;
        }
      } catch {
        // Si el logo falla, continuamos sin él (evitamos PDF corrupto)
      }

      // ——— Texto del encabezado ———
      if (empresa?.Empresa) center(empresa.Empresa, { family: 'times', style: 'bold', size: 13 }, 7);
      if (empresa?.RazonSocial) center(empresa.RazonSocial, { size: 11 }, 6);

      const lineaEnc = [
        empresa?.NumeroCedula ? `N° Cédula: ${empresa.NumeroCedula}` : '',
        empresa?.Correo ? `Correo: ${empresa.Correo}` : '',
        empresa?.Telefono ? `Teléfono: ${empresa.Telefono}` : '',
        (empresa?.Dirreccion || empresa?.Direccion) ? (empresa.Dirreccion || empresa.Direccion) : ''
      ].filter(Boolean);
      lineaEnc.forEach((t) => center(t, { size: 10 }, 5));

      // Línea divisoria
      doc.setLineWidth(0.4);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      // ——— Título ———
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      doc.text('FINANCIAMIENTO', pageWidth / 2, y, { align: 'center' });
      y += 10;

      // ——— Cuerpo ———
      doc.setFont('times', 'normal');
      doc.setFontSize(11);

      const fecha = (fin.FechaCreacion || fin.FechaRegistro || '').toString().slice(0, 10);

      fila('Nombre', fin.Nombre);
      fila('Cédula', fin.CedulaID);
      fila('Producto', fin.Producto);
      fila('Monto', formatMonto(fin.Monto));                 // 150,000
      fila('Pendiente', formatMonto(fin.MontoPendiente));    // 150,000
      fila('Plazo', `${fin.Plazo} meses`);
      fila('Interés', `${fin.InteresPorcentaje}%`);
      if (fin.Descripcion) fila('Descripción', fin.Descripcion);
      if (fecha) fila('Fecha', fecha);

      // ——— Firmas ———
      y += 14;
      if (y > pageHeight - 40) { doc.addPage(); y = 30; }

      const firmaLineWidth = 60;
      const leftX1 = margin + 10;
      const leftX2 = leftX1 + firmaLineWidth;
      const rightX2 = pageWidth - margin - 10;
      const rightX1 = rightX2 - firmaLineWidth;

      doc.line(leftX1, y, leftX2, y);
      doc.line(rightX1, y, rightX2, y);
      y += 6;

      doc.setFontSize(10);
      doc.text('Firma de la persona colaboradora', (leftX1 + leftX2) / 2, y, { align: 'center' });
      doc.text('Firma del/de la encargado(a)', (rightX1 + rightX2) / 2, y, { align: 'center' });

      // ——— Guardar ———
      doc.save(`Financiamiento_${(fin.Nombre || 'colaborador')}.pdf`);
    } catch (e) {
      console.error('Error generando PDF de financiamiento:', e);
      alert('No se pudo generar el PDF del financiamiento.');
    }
  };

  // Util: localidad y logo (reutiliza lo que ya guardas en LS)
  const resolveLocalidad = () => {
    try {
      const u = JSON.parse(localStorage.getItem('usuario') || 'null');
      if (u?.Localidad) return u.Localidad;
    } catch { }
    const loc = localStorage.getItem('localidad');
    return loc || 'Empresa';
  };

  const getLogoEmpresaBase64 = () => {
    // ajusta al key que ya usas para el logo (si tienes otro, cámbialo aquí)
    return localStorage.getItem('logoEmpresaBase64') || '';
  };

  // ⚠️ Si ya tienes una función similar, conserva la tuya y usa ese nombre en el botón.
  const imprimirAguinaldoPagado = (p) => {
    try {
      // Logo (usa el que tengas guardado)
      const logo =
        localStorage.getItem("logoEmpresaBase64") ||
        localStorage.getItem("logoEmpresa") ||
        ""; // base64 data URL o vacío

      const locRaw = localStorage.getItem("localidad") || "";
      let localidad = locRaw;
      try { const o = JSON.parse(locRaw); localidad = o?.Localidad || o?.Empresa || locRaw; } catch { }

      const cont = document.createElement("div");
      cont.style.padding = "16px";
      cont.innerHTML = `
      <div style="font-family: Arial, sans-serif; width: 700px; margin: 0 auto;">
        <div style="display:flex; align-items:center; gap:16px; margin-bottom:12px;">
          ${logo ? `<img src="${logo}" alt="Logo" style="height:60px;"/>` : ""}
          <div>
            <div style="font-size:18px; font-weight:bold;">${localidad || "Empresa"}</div>
            <div style="font-size:13px; color:#555;">Comprobante de pago de Aguinaldo</div>
          </div>
        </div>
        <hr />
        <table style="width:100%; border-collapse:collapse; font-size:14px;">
          <tr>
            <td style="padding:6px; border:1px solid #ccc;"><b>Nombre:</b></td>
            <td style="padding:6px; border:1px solid #ccc;">${p.Nombre || ""}</td>
            <td style="padding:6px; border:1px solid #ccc;"><b>Cédula:</b></td>
            <td style="padding:6px; border:1px solid #ccc;">${p.CedulaID || ""}</td>
          </tr>
          <tr>
            <td style="padding:6px; border:1px solid #ccc;"><b>Período:</b></td>
            <td style="padding:6px; border:1px solid #ccc;" colspan="3">
              ${(p.PeriodoDesde || "").toString().slice(0, 10)} — ${(p.PeriodoHasta || "").toString().slice(0, 10)}
            </td>
          </tr>
          <tr>
            <td style="padding:6px; border:1px solid #ccc;"><b>Fecha de pago:</b></td>
            <td style="padding:6px; border:1px solid #ccc;">${(p.FechaPago || "").toString().slice(0, 10)}</td>
            <td style="padding:6px; border:1px solid #ccc;"><b>Monto:</b></td>
            <td style="padding:6px; border:1px solid #ccc;">${Number(p.Monto || 0).toLocaleString("es-CR")}</td>
          </tr>
          <tr>
            <td style="padding:6px; border:1px solid #ccc;"><b>Observaciones:</b></td>
            <td style="padding:6px; border:1px solid #ccc;" colspan="3">${p.Observaciones || "—"}</td>
          </tr>
        </table>
        <div style="height:40px;"></div>
        <div style="display:flex; justify-content:space-between; margin-top:32px;">
          <div style="text-align:center;">
            <div style="border-top:1px solid #000; width:240px; margin:0 auto;"></div>
            <div style="font-size:12px; margin-top:6px;">Firma del Colaborador</div>
          </div>
          <div style="text-align:center;">
            <div style="border-top:1px solid #000; width:240px; margin:0 auto;"></div>
            <div style="font-size:12px; margin-top:6px;">Firma del Encargado</div>
          </div>
        </div>
      </div>
    `;

      const opciones = {
        margin: 10,
        filename: `Aguinaldo_${(p.Nombre || "")}_${(p.FechaPago || "").toString().slice(0, 10)}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      };

      // html2pdf ya lo usas en otros lados; aquí igual
      // @ts-ignore
      html2pdf().set(opciones).from(cont).save();
    } catch (e) {
      console.error("Error generando PDF de Aguinaldo pagado:", e);
      alert("No se pudo generar el PDF.");
    }
  };

  const eliminarAguinaldoPagado = async (p) => {
    try {
      // Si tienes un modal lindo de confirmación, úsalo.
      // Aquí hago confirm simple; si ya tienes showConfirmEliminarAguinaldo/aguinaldoAEliminar, úsalo en su lugar.
      const ok = window.confirm("¿Seguro que deseas eliminar este pago de aguinaldo?");
      if (!ok) return;

      const res = await fetch(`http://localhost:3001/api/aguinaldos-pagados/${p.ID}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar");

      // Vuelve a cargar la lista de pagos de este colaborador (tu función existente)
      if (colaboradorAguinaldo) {
        await verPagosAguinaldoDe(colaboradorAguinaldo);
      } else {
        // o filtra local
        setPagosAguinaldo((prev) => prev.filter(x => x.ID !== p.ID));
      }
    } catch (err) {
      console.error("Error al eliminar aguinaldo pagado:", err);
      alert("Error al eliminar el registro.");
    }
  };

  const filteredColabsAg = colabsAguinaldo.filter((c) => {
    // localidad del colaborador y del usuario actual
    const locColab = (c.Empresa || c.Localidad || "").toString().toLowerCase();
    let locActual = (localStorage.getItem("localidad") || "").toString();
    try {
      const o = JSON.parse(locActual);
      if (o && typeof o === "object") locActual = o.Localidad || o.Empresa || locActual;
    } catch { }
    locActual = locActual.toLowerCase();

    const matchesLoc = !locActual || locColab === locActual;

    const s = (searchColabAguinaldo || "").toLowerCase();
    const matchesSearch =
      !s ||
      c.CedulaID?.toLowerCase().includes(s) ||
      c.Nombre?.toLowerCase().includes(s) ||
      c.Apellidos?.toLowerCase().includes(s);

    return matchesLoc && matchesSearch;
  });

  // Abrir modal de Aumentos (carga colaboradores por localidad)
  const abrirModalAumentos = async () => {
    try {
      const localidad = getLocalidad();
      const res = await fetch(`http://localhost:3001/api/colaboradores?localidad=${encodeURIComponent(localidad)}`);
      const data = await res.json();
      setListaColaboradoresAumento(Array.isArray(data) ? data : []);
      setBusquedaAumentos("");
      setPaginaAumentos(1);
      setShowAumentosModal(true);
    } catch (err) {
      console.error("Error al cargar colaboradores para aumentos:", err);
    }
  };

  // 👇 Helper pequeño para convertir lo que devuelva el backend en un array
  const normalizeAumentosResponse = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.recordset)) return payload.recordset;
    if (Array.isArray(payload.rows)) return payload.rows;
    if (Array.isArray(payload.data)) return payload.data;
    if (payload.results && Array.isArray(payload.results)) return payload.results;
    return [];
  };

  // ✅ Usa tu helper de localidad si ya lo tienes (resolveLocalidad / getLocalidadNombre).
  // Si no, este fallback interno te saca del apuro sin duplicarte funciones:
  const _resolveLocalidadSafe = () => {
    let loc = localStorage.getItem("localidad") || "";
    try { const o = JSON.parse(loc); loc = o?.Localidad || o?.Empresa || loc; } catch { }
    if (!loc) {
      try {
        const u = JSON.parse(localStorage.getItem("usuario") || "null");
        loc = u?.Localidad || "";
      } catch { }
    }
    return loc || "";
  };

  // 🔄 Reemplaza SOLO tu abrirModalVerAumentos actual por este:
  const abrirModalVerAumentos = async () => {
    const loc = (typeof resolveLocalidad === "function" ? resolveLocalidad() : _resolveLocalidadSafe());
    const base = "http://localhost:3001/api/aumentos-salariales";

    const tryFetch = async (url) => {
      try {
        const r = await fetch(url);
        if (!r.ok) return null;
        const json = await r.json();
        const arr = normalizeAumentosResponse(json);
        // Filtrado por empresa/localidad si el backend no filtra por query:
        if (loc) {
          return arr.filter(a => {
            const emp = a.Empresa || a.Localidad || a.empresa || a.localidad || "";
            return !emp || emp.toString().toLowerCase() === loc.toString().toLowerCase();
          });
        }
        return arr;
      } catch (e) {
        console.warn("Aumentos -> fallo fetch:", url, e);
        return null;
      }
    };


    // Intento 1: ?localidad=
    let arr = await tryFetch(`${base}?localidad=${encodeURIComponent(loc)}`);
    // Intento 2: ?empresa= (por si tu backend usa ese nombre)
    if (!arr || arr.length === 0) {
      arr = await tryFetch(`${base}?empresa=${encodeURIComponent(loc)}`);
    }
    // Intento 3: sin filtro (y filtramos en cliente)
    if (!arr || arr.length === 0) {
      arr = await tryFetch(base);
    }

    // Asegura array
    arr = Array.isArray(arr) ? arr : [];

    // Ordena descendente por fecha (toma 'Fecha' o variantes)
    arr.sort((a, b) => {
      const fa = new Date(a.Fecha || a.fecha || a.FechaRegistro || 0);
      const fb = new Date(b.Fecha || b.fecha || b.FechaRegistro || 0);
      return fb - fa;
    });

    // Debug opcional (puedes quitarlo cuando verifiques que carga bien)
    console.log("🔎 aumentos cargados:", arr);

    setAumentos(arr);
    setPagAumPage(1);
    setSearchAumentos("");
    setShowModalVerAumentos(true);
  };


  // Abrir sub-modal para crear aumento de un colaborador
  const abrirCrearAumento = (col) => {
    setColabSeleccionadoAumento(col);
    setAumentoForm({
      Fecha: new Date().toISOString().slice(0, 10),
      SalarioActual: Number(col.SalarioBase || 0),
      SalarioNuevo: Number(col.SalarioBase || 0),
      Observaciones: ""
    });
    setShowCrearAumentoModal(true);
  };

  // Helper: obtiene el nombre de la localidad (Empresa) de forma robusta
  const getLocalidadNombre = () => {
    let loc = localStorage.getItem("localidad") || "";
    try {
      const o = JSON.parse(loc);
      loc = o?.Localidad || o?.Empresa || loc;
    } catch { }
    return loc || "—";
  };

  // Fallback por si no hay logo en la API
  const getLogoFallback = () => {
    return localStorage.getItem("logoEmpresaPNG") || "/images/logo-empresa.png";
  };

  // Helper: intenta obtener el logo base64 PNG guardado en localStorage
  // Guarda tu logo en localStorage.setItem("logoEmpresaPNG", "data:image/png;base64,....")
  const getLogoEmpresa = () => {
    const posible = localStorage.getItem("logoEmpresaPNG");
    // Fallback a una ruta estática si no hay base64 guardado:
    return posible || "/images/logo-empresa.png";
  };

  // ⚠️ Usa números sin símbolo para evitar el carácter extraño del colón en algunos PDF
  const formatMonto = (n) => Number(n || 0).toLocaleString("es-CR", { minimumFractionDigits: 2 });

  // Genera el PDF del aumento salarial
  const imprimirAumentoPDF = async (aumento) => {
    // aumento: { CedulaID, Nombre, Empresa, SalarioAnterior, SalarioNuevo, Fecha, Observaciones }
    const loc = getLocalidadNombre();

    let header = null;
    try {
      const r = await fetch(`http://localhost:3001/api/localidades/${encodeURIComponent(loc)}`);
      header = await r.json(); // se espera { Empresa, RazonSocial, NumeroCedula, Correo, Telefono, Direccion, Logo? }
    } catch (e) {
      console.warn("No se pudo cargar encabezado empresa:", e);
    }

    const logo = (header && (header.Logo || header.LogoBase64)) || getLogoFallback();
    const empresaNombre = header?.Empresa || aumento.Empresa || loc || "—";

    const sAnt = Number(aumento.SalarioAnterior || 0);
    const sNvo = Number(aumento.SalarioNuevo || 0);
    const porc = sAnt > 0 ? ((sNvo - sAnt) / sAnt) * 100 : 0;

    // contenedor oculto
    const wrap = document.createElement("div");
    wrap.style.position = "fixed";
    wrap.style.left = "-9999px";
    wrap.style.top = "0";
    wrap.id = "print-aumento-wrap";

    wrap.innerHTML = `
  <div id="print-aumento" style="font-family: Arial, sans-serif; color:#000;">
    <style>
      @page { size: A4 portrait; margin: 15mm; }
      .encabezado { text-align: center; margin-bottom: 12px; }
      .encabezado .logo { height: 70px; margin-bottom: 6px; object-fit: contain; }
      .titulo { font-size: 18px; font-weight: 700; margin: 6px 0 2px; }
      .empresa { font-size: 13px; color:#333; margin-bottom: 6px; }
      .datos-empresa { font-size: 11px; color:#333; line-height: 1.3; }
      .hr { border: 0; border-top: 1px solid #555; margin: 10px 0 12px; }
      .tabla { width: 100%; border-collapse: collapse; font-size: 12px; }
      .tabla th, .tabla td { border: 1px solid #777; padding: 6px 8px; vertical-align: top; }
      .bloque { width: 720px; margin: 0 auto; }
      .firmas { margin-top: 36px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
      .firma { text-align: center; }
      .firma .linea { border-top: 1px solid #000; margin-top: 40px; }
      .small { font-size: 11px; color: #444; }
      .obs { white-space: pre-line; }
    </style>

    <div class="bloque">
      <div class="encabezado">
        <img class="logo" src="${logo}" alt="Logo" />
        <div class="titulo">COMPROBANTE DE AUMENTO SALARIAL</div>
        <div class="empresa">${empresaNombre}</div>
        <div class="datos-empresa">
          ${header?.RazonSocial ? `<div>${header.RazonSocial}</div>` : ""}
          ${header?.NumeroCedula ? `<div>N° Cédula: ${header.NumeroCedula}</div>` : ""}
          ${header?.Correo ? `<div>Correo: ${header.Correo}</div>` : ""}
          ${header?.Telefono ? `<div>Teléfono: ${header.Telefono}</div>` : ""}
          ${header?.Direccion ? `<div>${header.Direccion}</div>` : ""}
        </div>
      </div>

      <hr class="hr"/>

      <table class="tabla">
        <tbody>
          <tr><th style="width: 28%;">Colaborador</th><td>${aumento.Nombre || "—"}</td></tr>
          <tr><th>Cédula</th><td>${aumento.CedulaID || "—"}</td></tr>
          <tr><th>Salario anterior (mensual)</th><td>${formatMonto(sAnt)}</td></tr>
          <tr><th>Salario nuevo (mensual)</th><td>${formatMonto(sNvo)}</td></tr>
          <tr><th>Variación</th><td>${formatMonto(sNvo - sAnt)} (${porc.toFixed(2)}%)</td></tr>
          <tr><th>Fecha</th><td>${(aumento.Fecha || "").toString().slice(0, 10)}</td></tr>
          <tr><th>Observaciones</th><td class="obs">${aumento.Observaciones || "—"}</td></tr>
        </tbody>
      </table>

      <div class="firmas">
        <div class="firma">
          <div class="linea"></div>
          <div>Firma del Colaborador</div>
          <div class="small">${aumento.Nombre || "—"}</div>
        </div>
        <div class="firma">
          <div class="linea"></div>
          <div>Firma del Encargado</div>
          <div class="small">${empresaNombre}</div>
        </div>
      </div>
    </div>
  </div>`;

    document.body.appendChild(wrap);

    const elemento = document.getElementById("print-aumento");
    const opciones = {
      margin: 10,
      filename: `Aumento_${(aumento.Nombre || "colaborador").replace(/\s+/g, "_")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };

    await html2pdf().set(opciones).from(elemento).save().catch(() => { });
    document.body.removeChild(wrap);
  };


  // Guardar aumento: 1) actualiza salario base en Colaboradores  2) registra el aumento en otra tabla
  const guardarAumento = async () => {
    try {
      if (!colabSeleccionadoAumento) return alert("No hay colaborador seleccionado.");
      if (!aumentoForm.SalarioNuevo || aumentoForm.SalarioNuevo <= 0) return alert("Ingrese un salario nuevo válido.");

      const localidad = getLocalidad();

      // 1) Actualizar salario base
      const resUpdate = await fetch(`http://localhost:3001/api/colaboradores/${colabSeleccionadoAumento.ID}/salario`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ SalarioBase: aumentoForm.SalarioNuevo })
      });
      if (!resUpdate.ok) {
        const t = await resUpdate.text();
        throw new Error("No se pudo actualizar el salario base: " + t);
      }

      // 2) Registrar el aumento en AumentosSalariales
      const resInsert = await fetch("http://localhost:3001/api/aumentos-salariales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // 👇 añade el ID del colaborador (por si tu tabla no acepta NULL)
          ColaboradorID: colabSeleccionadoAumento.ID,
          CedulaID: colabSeleccionadoAumento.CedulaID,
          Nombre: `${colabSeleccionadoAumento.Nombre} ${colabSeleccionadoAumento.Apellidos || ""}`.trim(),
          Empresa: localidad,
          SalarioAnterior: Number(aumentoForm.SalarioActual || 0),
          SalarioNuevo: Number(aumentoForm.SalarioNuevo || 0),
          Fecha: aumentoForm.Fecha, // YYYY-MM-DD
          Observaciones: aumentoForm.Observaciones || ""
        })
      });
      if (!resInsert.ok) {
        const t = await resInsert.text();
        throw new Error("No se pudo registrar el aumento salarial: " + t);
      }

      // refrescar en UI
      setListaColaboradoresAumento(prev => prev.map(c =>
        c.ID === colabSeleccionadoAumento.ID ? { ...c, SalarioBase: aumentoForm.SalarioNuevo } : c
      ));

      setShowCrearAumentoModal(false);
      setColabSeleccionadoAumento(null);
      alert("Aumento guardado correctamente.");
    } catch (err) {
      console.error("Error guardando aumento:", err);
      alert("Ocurrió un error al guardar el aumento.");
    }
  };



  const fmtCRC = (n) => `₡${(Number(n) || 0).toLocaleString('es-CR')}`;

  const abrirListadoAguinaldos = async () => {
    try {
      const localidad = localStorage.getItem("localidad") || "";
      const res = await fetch(`http://localhost:3001/api/colaboradores?localidad=${encodeURIComponent(localidad)}`);
      const data = await res.json();
      setColabsAguinaldo(data || []);
      setSearchColabAguinaldo("");
      setPagColabPage(1);
      setShowListaAguinaldos(true);
    } catch (e) {
      console.error("Error cargando colaboradores (VER aguinaldo):", e);
      setColabsAguinaldo([]);
      setShowListaAguinaldos(true);
    }
  };

  const eliminarPagoAguinaldo = async (pagoID) => {
    const ok = window.confirm("¿Seguro que deseas eliminar este pago de aguinaldo?");
    if (!ok) return;

    try {
      // 👇 Ajusta si tu endpoint es otro (propuesto: /api/aguinaldo/pagos/:id)
      const res = await fetch(`http://localhost:3001/api/aguinaldo/pagos/${pagoID}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar el pago");
      // Refrescar la lista del colaborador
      if (colabSeleccionadoAguinaldo) {
        await verPagosAguinaldoDe(colabSeleccionadoAguinaldo);
      }
      alert("Pago de aguinaldo eliminado correctamente.");
    } catch (e) {
      console.error("Error eliminando pago aguinaldo:", e);
      alert("No se pudo eliminar el pago.");
    }
  };

  const imprimirPagosAguinaldoDe = () => {
    const el = document.getElementById("imp-agui-colab");
    if (!el || !colabSeleccionadoAguinaldo) return;

    const opciones = {
      margin: 10,
      filename: `Aguinaldos_${colabSeleccionadoAguinaldo.Nombre}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };

    // Necesitas tener html2pdf cargado (ya lo usas en otras partes)
    // eslint-disable-next-line no-undef
    html2pdf().set(opciones).from(el).save();
  };




  // ► Lista que realmente se muestra: completa o filtrada por rango
  const pagosMostrados = useMemo(() => {
    if (rangoActivo && filtroDesde && filtroHasta) {
      return (pagosDelAguinaldo || []).filter((p) => {
        const f = (p.FechaRegistro || '').slice(0, 10);
        return f >= filtroDesde && f <= filtroHasta;
      });
    }
    return pagosDelAguinaldo || [];
  }, [pagosDelAguinaldo, rangoActivo, filtroDesde, filtroHasta]);

  // ► Total bruto del período mostrado (filtrado o completo)
  const totalBrutoMostrado = useMemo(
    () => pagosMostrados.reduce((sum, p) => sum + (parseFloat(p.TotalBruto) || 0), 0),
    [pagosMostrados]
  );

  // ► Aguinaldo mostrado = total del período mostrado ÷ 12
  const aguinaldoMostrado = useMemo(
    () => totalBrutoMostrado / 12,
    [totalBrutoMostrado]
  );

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
          {/* {boleta.DiasDisponibles !== undefined && (
            <p><strong style={{ fontWeight: 'bold' }}>Días disponibles:</strong> {boleta.DiasDisponibles}</p>
          )} */}
          <p>
            <strong style={{ fontWeight: 'bold' }}>Días disponibles:</strong>{" "}
            {
              (() => {
                const diasAntes = Number(boleta.DiasAntes ?? boleta.DiasDisponibles ?? 0);
                const diasSolicitados = Number(boleta.CantidadDias ?? boleta.Dias ?? boleta.DiasTomados ?? 0);
                const actualizados = !isNaN(diasAntes) && !isNaN(diasSolicitados)
                  ? Math.max(0, diasAntes - diasSolicitados)
                  : "N/D";
                return actualizados;
              })()
            }
          </p>
          <table style={{ width: '100%', marginTop: '40px', fontSize: "11px" }}>
            <tbody>
              <tr>
                <td style={{ textAlign: "center" }}>
                  ______________________<br />
                  Firma Encargado
                </td>
                <td style={{ textAlign: "center" }}>
                  ______________________<br />
                  Firma Colaborador
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: "20px", textAlign: "center" }}>
          Fecha de impresión: {new Date().toLocaleDateString()}
        </p>
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

  // Abre el modal de historial y carga los pagos del colaborador seleccionado
  const abrirHistorialPagos = (col) => {
    setSelectedColaborador(col);

    // Muestra el modal primero (UX más rápida)
    setShowPagosModal(true);

    // Carga el historial; si tu verPagosColaborador ya abre el modal, no pasa nada.
    // Si verPagosColaborador devuelve una promesa, podrías hacer: await verPagosColaborador(col.CedulaID)
    verPagosColaborador(col.CedulaID);
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

  // Carga una imagen y devuelve el elemento <img> cuando esté lista
  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  // Normaliza cualquier logo (ICO/base64/URL) a un dataURL PNG compatible con jsPDF
  const toPngDataUrl = async (dataUrlOrBase64) => {
    if (!dataUrlOrBase64 || typeof dataUrlOrBase64 !== 'string') return null;
    let dataUrl = dataUrlOrBase64.trim();

    // Si viene como base64 crudo (sin encabezado data:)
    if (!dataUrl.startsWith('data:') && /^[A-Za-z0-9+/=\s]+$/.test(dataUrl)) {
      dataUrl = 'data:image/png;base64,' + dataUrl.replace(/\s/g, '');
    }

    // Si ya es PNG/JPEG válido, úsalo tal cual
    if (dataUrl.startsWith('data:image/png') || dataUrl.startsWith('data:image/jpeg')) {
      return dataUrl;
    }

    // Para ICO u otros formatos (data:image/x-icon, etc.), conviértelo a PNG vía canvas
    try {
      const img = await loadImage(dataUrl);
      const canvas = document.createElement('canvas');
      // usa tamaño natural si existe; si no, asume 128x128
      canvas.width = img.width || 128;
      canvas.height = img.height || 128;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/png');
    } catch {
      return null; // si falla el logo, seguimos sin logo (mejor que PDF corrupto)
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
    return Math.floor((f2 - f1) / (1000 * 60 * 60 * 24)) + 1;
  };

  const pageStart = (pagColabPage - 1) * ROWS_AG;
  const startIdxAg = (pagColabPage - 1) * rowsColabAguinaldo;

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
    { id: "aguinaldo", title: "AGUINALDO", img: "/images/aguinaldo.png" },
    { id: "contratos", title: "CONTRATO", img: "/images/contrato.png" },
    { id: "aumentos", title: "AUMENTOS", img: "/images/salario.png" }
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

  const guardarEdicionPago = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/pagos/editar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...pagoAEditar,
          FechaEdicion: new Date().toISOString().slice(0, 10),
          Localidad: localidad,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Pago editado correctamente.");
        setShowEditarPagoModal(false);

        // Actualizar pagosColaborador en pantalla
        setPagosColaborador((prev) =>
          prev.map((p) => (p.ID === pagoAEditar.ID ? { ...p, ...pagoAEditar } : p))
        );

        // También puede recargar de backend si prefiere consistencia total:
        // await cargarPagosColaborador(selectedColaborador?.CedulaID);
      } else {
        console.error("Error al editar:", data);
        alert("Error al editar el pago.");
      }
    } catch (error) {
      console.error("Error en guardarEdicionPago:", error);
      alert("Error inesperado al guardar la edición.");
    }
  };

  const eliminarPagoSimple = async (pagoID) => {
    try {
      if (!pagoID) {
        console.warn("ID de pago no definido");
        return alert("ID de pago no válido.");
      }

      const confirmacion = window.confirm(
        "¿Está seguro que desea eliminar este pago? Esta acción no se puede deshacer."
      );
      if (!confirmacion) return;

      const pago = pagosColaborador.find(p => p.ID === pagoID);
      if (!pago) return alert("Pago no encontrado.");

      // ✅ Ventana de 3 días
      const hoy = new Date();
      const fechaPago = new Date(pago.FechaRegistro);
      const diffDias = Math.floor((hoy - fechaPago) / (1000 * 60 * 60 * 24));
      if (diffDias > 3) {
        return alert("Solo se pueden eliminar pagos dentro de los 3 días posteriores.");
      }

      // ===== 1) Revertir VALES pagados de ese pago =====
      if (pago.Vales && pago.Vales > 0) {
        const resVales = await fetch(`http://localhost:3001/api/vales-pagados/por-pago/${pagoID}`);
        if (!resVales.ok) {
          console.error("No se pudieron obtener vales pagados asociados al pago");
        } else {
          const valesPagados = await resVales.json();

          for (const vale of valesPagados) {
            // Leer vale original
            const resVale = await fetch(`http://localhost:3001/api/vales/by-id/${vale.ValeID}`);
            if (!resVale.ok) continue;
            const valeOriginal = await resVale.json();

            const montoActual = parseFloat(valeOriginal.MontoVale) || 0;
            const nuevoMonto = montoActual + (parseFloat(vale.MontoAplicado) || 0);

            // Actualizar SOLO el monto del vale
            await fetch(`http://localhost:3001/api/vales/${vale.ValeID}/monto`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ MontoVale: nuevoMonto })
            });

            // Borrar registro de ValesPagados
            await fetch(`http://localhost:3001/api/vales-pagados/${vale.ID}`, { method: "DELETE" });
          }
        }
      }

      // ===== 2) Revertir ABONOS de financiamiento de ese pago =====
      if (pago.Prestamos && pago.Prestamos > 0) {
        const resAbonos = await fetch(`http://localhost:3001/api/pagos-financiamiento/por-pago/${pagoID}`);
        if (!resAbonos.ok) {
          console.error("No se pudieron obtener abonos de financiamiento asociados al pago");
        } else {
          const pagosFinanciamiento = await resAbonos.json();

          for (const abono of pagosFinanciamiento) {
            // Traer financiamiento
            const resFin = await fetch(`http://localhost:3001/api/financiamientos/${abono.FinanciamientoID}`);
            if (!resFin.ok) continue;
            const finOriginal = await resFin.json();

            const saldoActual = parseFloat(finOriginal.MontoPendiente) || 0;
            const nuevoSaldo = saldoActual + (parseFloat(abono.MontoAplicado) || 0);

            // Actualizar SOLO el saldo pendiente
            await fetch(`http://localhost:3001/api/financiamientos/${abono.FinanciamientoID}/monto-pendiente`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ MontoPendiente: nuevoSaldo })
            });

            // Borrar abono
            await fetch(`http://localhost:3001/api/pagos-financiamiento/${abono.ID}`, { method: "DELETE" });
          }
        }
      }

      // ===== 3) Eliminar el pago de planilla =====
      const res = await fetch(`http://localhost:3001/api/pago-planilla/${pagoID}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar el pago");

      alert("Pago eliminado correctamente");
      setShowPagosModal(false);
      setPagoAEliminar(null);
      if (selectedColaborador) verPagosColaborador(selectedColaborador.CedulaID);
    } catch (error) {
      console.error("❌ Error al eliminar el pago:", error);
      alert("Error al eliminar el pago");
    }
  };

  /**
   * Elimina el registro seleccionado (aguinaldoAEliminar) y refresca la lista.
   * Se usa desde el modal de confirmación "bonito".
   */
  const eliminarAguinaldoPagadoConfirmado = async () => {
    if (!aguinaldoAEliminar) return;
    try {
      const res = await fetch(
        `http://localhost:3001/api/aguinaldos-pagados/${aguinaldoAEliminar.ID}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("No se pudo eliminar");

      // Refresca la tabla de pagos del colaborador
      if (colaboradorAguinaldo) {
        await verPagosAguinaldoDe(colaboradorAguinaldo);
      } else {
        // Fallback local si no hay colaborador seleccionado
        setPagosAguinaldo(prev => (prev || []).filter(p => p.ID !== aguinaldoAEliminar.ID));
      }

      // Cierra confirmación y limpia selección
      setShowConfirmEliminarAguinaldo(false);
      setAguinaldoAEliminar(null);
    } catch (err) {
      console.error("Error al eliminar aguinaldo pagado:", err);
      alert("Error al eliminar el registro.");
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
      const localidad = localStorage.getItem("localidad"); // ✅ obtenemos la localidad

      const response = await fetch("http://localhost:3001/api/pagos-financiamiento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          FinanciamientoID: financiamientoSeleccionado.ID,
          FechaPago: pagoForm.FechaPago,
          MontoAplicado: pagoForm.MontoAplicado,
          Observaciones: pagoForm.Observaciones,
          Localidad: localidad // ✅ solo agregamos esta línea
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
      html2canvas: {
        scale: 2,
        // 👇 Oculta del PDF todo lo que tenga la clase "no-print"
        ignoreElements: (el) => el?.classList?.contains('no-print')
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opciones).from(elemento).save();
  };

  const descargarExcelAguinaldo = () => {
    if (!selectedColaborador || !pagosMostrados.length) return;

    const encabezado1 = [`Aguinaldo de ${selectedColaborador.Nombre}`];
    const encabezado2 = [
      `Total Aguinaldo: ₡${parseFloat(aguinaldoMostrado || 0).toLocaleString()}`
    ];

    const datos = pagosMostrados.map(p => [
      p.FechaRegistro?.slice(0, 10),
      parseFloat(p.TotalBruto || 0) // número limpio
    ]);

    const hojaDatos = [
      encabezado1,
      encabezado2,
      [],
      ['Fecha', 'Monto'],
      ...datos
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(hojaDatos);

    const totalPagado = totalBrutoMostrado;
    hojaDatos.push([], ['Total pagado en el período', totalPagado]);

    // Centrar celdas (si ya lo tienes, mantenlo)
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
      setShowListaColaboradoresAguinaldo(false); // ✅ Oculta la lista
      setShowAguinaldoModal(true); // ✅ Muestra el modal principal
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
    try {
      setEliminandoCol(true);
      await fetch(`http://localhost:3001/api/colaboradores/${id}`, { method: "DELETE" });
      // Cierra modal y limpia
      setShowConfirmEliminarCol(false);
      setColaboradorAEliminar(null);
      // Refresca la lista como ya hacías
      handleView("colaboradores");
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Ocurrió un error al eliminar el colaborador.");
    } finally {
      setEliminandoCol(false);
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
        ingresoBase = form.HorasTrabajadas * form.MontoPorHoraExtra;
        break;
    }

    const pagoHorasExtra = form.HorasExtra * form.MontoPorHoraExtra;

    const ingresos =
      ingresoBase + form.Comisiones + form.Viaticos + pagoHorasExtra;

    const egresos =
      form.CCSS + form.Prestamos + form.Vales + form.Adelantos + form.Ahorro;

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

  const pageSlice = filteredColabsAg.slice(pageStart, pageStart + ROWS_AG);

  const totalPagesAg = Math.max(1, Math.ceil(filteredColabsAg.length / rowsColabAguinaldo));

  const pageColabsAg = filteredColabsAg.slice(startIdxAg, startIdxAg + rowsColabAguinaldo);

  const guardarPagoPlanilla = async () => {
    try {
      // 1. Ya no se suman nuevamente los pendientes si ya fueron visualizados
      const valesTotal = pagoForm.Vales;
      const prestamosTotal = pagoForm.Prestamos;

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
        Localidad: localidad
      };

      // 2. Guardar el pago de planilla
      let response = await fetch("http://localhost:3001/api/pago-planilla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Error al guardar el pago");

      // 3. Aplicar pendientes SOLO AHORA (cuando se confirmó el pago)
      for (const p of pendientesAplicados) {
        if (p.tipo === "Financiamiento") {
          await fetch("http://localhost:3001/api/financiamientos/aplicar-abono", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              FinanciamientoID: p.id,
              MontoAplicado: p.monto,
              Observaciones: "Aplicado desde Planilla",
              Localidad: localidad
            })
          });
        } else if (p.tipo === "Vale") {
          // 1. Registrar en tabla ValesPagados (tu flujo actual)
          await fetch("http://localhost:3001/api/vales/pagado", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ValeID: p.id,
              CedulaID: selectedColaborador.CedulaID,
              Nombre: selectedColaborador.Nombre,
              FechaPago: new Date().toISOString().slice(0, 10),
              MontoAplicado: p.monto,
              Observaciones: "Aplicado desde Planilla",
              Empresa: localidad
            })
          });

          // 2. OBTENER vale por ID (nuevo endpoint específico)
          const resVale = await fetch(`http://localhost:3001/api/vales/by-id/${p.id}`);
          if (!resVale.ok) {
            console.error("No se pudo obtener el vale por ID");
            continue;
          }
          const valeOriginal = await resVale.json();

          // Calcula nuevo saldo con seguridad numérica
          const montoActual = parseFloat(valeOriginal.MontoVale) || 0;
          const montoAplicado = parseFloat(p.monto) || 0;
          const nuevoMonto = montoActual - montoAplicado;

          if (nuevoMonto <= 0) {
            // Si ya se pagó todo, eliminar
            await fetch(`http://localhost:3001/api/vales/${p.id}`, { method: "DELETE" });
          } else {
            // Si queda saldo, actualizar SOLO el monto (nuevo endpoint)
            await fetch(`http://localhost:3001/api/vales/${p.id}/monto`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ MontoVale: nuevoMonto })
            });
          }
        }
      }

      // 4. Finalizar
      alert("Pago guardado y pendientes aplicados correctamente");
      setShowCrearPago(false);
      setPendientesAplicados([]);
      setPagoForm({ ...formularioInicial });

      if (selectedColaborador) verPagosColaborador(selectedColaborador.CedulaID);

    } catch (error) {
      console.error("Error al guardar pago y aplicar pendientes:", error);
      alert("Error al guardar el pago");
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

  const confirmarEliminarPago = async (pago) => {
    if (!pago || !pago.ID) {
      console.error("ID de pago no definido:", pago);
      alert("Error: este pago no contiene un ID válido.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/eliminar-pago-planilla/${pago.ID}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Error al eliminar el pago");

      alert("Pago eliminado correctamente");
      setShowEliminarPagoModal(false);
      setPagoAEliminar(null);
      if (selectedColaborador) verPagosColaborador(selectedColaborador.CedulaID);
    } catch (error) {
      console.error("Error al eliminar pago:", error);
      alert("Error al eliminar el pago");
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

      imprimirBoletaVacaciones(nuevaBoleta);
      setShowGenerarVacaciones(false); // Cierra el modal de crear

      // 👇 Llama a la función que ya usa cuando se presiona "CREAR"
      await handleVacacionesModal(); // 🔁 Esto refresca los colaboradores con días actualizados

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

  // ✅ PDF: una colilla por fila (ancho completo), usando el DOM ya renderizado
  const descargarPDFReportePlanilla4x = () => {
    try {
      const host =
        (typeof colillasRef !== "undefined" && colillasRef?.current)
          ? colillasRef.current
          : document.getElementById("contenido-colillas");

      if (!host) {
        alert("No se encontró el contenedor del reporte (contenido-colillas).");
        return;
      }

      // Clona el contenido ya renderizado con datos
      const wrapper = document.createElement("div");

      // Estilos SOLO para el PDF (no tocan tu UI)
      const style = document.createElement("style");
      style.textContent = `
      @page { size: A4 landscape; margin: 8mm; }
      body { font-family: Arial, sans-serif; }
      .html2pdf__page-break { height: 0; }

      /* 🔸 UNA por fila: ancho completo y separación inferior */
      .colilla {
        display: block !important;
        width: 100% !important;
        margin: 0 0 12px 0 !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }

      table { width: 100% !important; border-collapse: collapse !important; table-layout: fixed !important; }
      thead { display: table-header-group; } /* mantiene encabezado si la tabla se parte */
      th, td {
        border: 1px solid #444 !important;
        padding: 7px !important;                 /* un poco más de aire */
        font-size: 10px !important;              /* tamaño legible con landscape */
        line-height: 1.25 !important;
        text-align: center !important;           /* centrado */
        vertical-align: middle !important;
        word-wrap: break-word !important;
        overflow-wrap: anywhere !important;
        color: #111 !important;
      }
      thead th { background: #f5f5f5 !important; font-weight: 700 !important; }

      /* Evitar que bootstrap "pinte" fondos en el PDF */
      .table, .table * { background: transparent !important; }
    `;
      wrapper.appendChild(style);

      const clone = host.cloneNode(true);
      wrapper.appendChild(clone);

      html2pdf()
        .set({
          margin: 8,
          filename: `reporte-planilla-${new Date().toISOString().slice(0, 10)}.pdf`,
          html2canvas: { scale: 2.2, useCORS: true, scrollY: 0 },
          jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
          pagebreak: { mode: ["css", "legacy"] }
        })
        .from(wrapper)
        .save();

    } catch (e) {
      console.error("Error generando PDF:", e);
      alert("No se pudo generar el PDF.");
    }
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

  // ---- AUMENTOS (nuevos estados) ----
  const [showAumentosModal, setShowAumentosModal] = useState(false);
  const [listaColaboradoresAumento, setListaColaboradoresAumento] = useState([]);
  const [busquedaAumentos, setBusquedaAumentos] = useState("");
  const [paginaAumentos, setPaginaAumentos] = useState(1);
  const rowsPorPaginaAumentos = 10;

  const [showCrearAumentoModal, setShowCrearAumentoModal] = useState(false);
  const [colabSeleccionadoAumento, setColabSeleccionadoAumento] = useState(null);
  const [aumentoForm, setAumentoForm] = useState({
    Fecha: new Date().toISOString().slice(0, 10),
    SalarioActual: 0,
    SalarioNuevo: 0,
    Observaciones: ""
  });



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
                        onClick={() => {
                          setColaboradorAEliminar(colaborador); // guarda todo el colaborador
                          setShowConfirmEliminarCol(true);      // abre modal bonito
                        }}
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
      case "contrato":
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
                  else if (card.id === "contratos") {
                    setShowContratoModal(true);
                  } else if (card.id === "aumentos") {
                    abrirModalAumentos();
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
                  }
                  else if (card.id === "planilla") {
                    setShowReporteColillas(true); // ✅ Este es el mismo modal usado por "Ver colillas"
                    setActiveCard(card.id);
                  }
                  else if (card.id === "aumentos") {
                    abrirModalVerAumentos();
                  }
                  else if (card.id === "vacaciones") {
                    obtenerTodasBoletas(); // 👈 esta función ya la tiene implementada
                    setMostrarModalListadoBoletas(true); // 👈 activa el modal
                    setActiveCard(card.id);
                    // 👇 NUEVO: abre tu flujo de Aguinaldo (selector de colaborador + cálculo)
                  } else if (card.id === "aguinaldo" || card.id === "aguinaldos") {
                    abrirListadoAguinaldos();   // 👈 NUEVO: listado/paginación + ver/eliminar pagos
                    setActiveCard(card.id);
                  }
                  else {
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

      {/* <div className="modal-overlay" onClick={() => setShowVacacionesModal(false)}></div> */}
      {showVacacionesModal && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ position: "absolute", top: 10, right: 10 }}>
              <button
                className="btn btn-sm btn-outline-info"
                onClick={async () => {
                  await obtenerTodasBoletas(); // ✅ Espera a que termine de cargar
                  setMostrarModalListadoBoletas(true); // ✅ Luego muestra el modal
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
            <button className="btn btn-secondary mt-3" onClick={() => setShowVacacionesModal(false)}>Cerrar vacaciones</button>
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
                        Descargar PDF BOLETA
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

      {/* <div className="modal-overlay" onClick={() => setShowCrearPago(false)}></div> */}
      {showCrearPago && selectedColaborador && (
        <div className="modal-overlay">
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
                  <label>
                    {campo === "MontoPorHoraExtra"
                      ? pagoForm.TipoPago === "Horas"
                        ? "₡ por Hora"
                        : "₡ por Hora Extra"
                      : campo}
                  </label>
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
              <button className="btn btn-primary btn-guardar-pago-planilla" onClick={guardarPagoPlanilla}>Guardar Pago Planilla</button>
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

      {/* <div className="modal-overlay" onClick={() => setShowGenerarVacaciones(false)}></div> */}
      {showGenerarVacaciones && selectedColaborador && (
        <div className="modal-overlay">
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
              <button className="btn btn-primary" onClick={handleSubmitVacaciones}>Guardar Boleta Vaca</button>
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

      {showModalVerPagosAguinaldo && (
        <div className="modal-overlay" onClick={() => setShowModalVerPagosAguinaldo(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Aguinaldos — {colaboradorAguinaldo?.Nombre}</h4>
            <p className="text-muted">
              Localidad: {(() => {
                let loc = localStorage.getItem("localidad") || "";
                try { const o = JSON.parse(loc); loc = o?.Localidad || o?.Empresa || loc; } catch { }
                return loc || "—";
              })()}
            </p>

            {pagosAguinaldo.length === 0 ? (
              <div className="alert alert-info">Sin pagos registrados para este colaborador.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered table-hover table-striped">
                  <thead className="table-dark">
                    <tr>
                      <th>Fecha pago</th>
                      <th>Período (desde — hasta)</th>
                      <th>Monto</th>
                      <th>Observaciones</th>
                      <th>Acciones</th> {/* 👈 NUEVO */}
                    </tr>
                  </thead>
                  <tbody>
                    {pagosAguinaldo.map((p, i) => (
                      <tr key={p.ID || i}>
                        <td>{(p.FechaPago || "").toString().slice(0, 10)}</td>
                        <td>
                          {(p.PeriodoDesde || "").toString().slice(0, 10)} — {(p.PeriodoHasta || "").toString().slice(0, 10)}
                        </td>
                        <td>₡{Number(p.Monto || 0).toLocaleString("es-CR")}</td>
                        <td>{p.Observaciones || "—"}</td>
                        <td className="text-nowrap">
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => imprimirAguinaldoPagado(p)}
                            title="Descargar PDF"
                          >
                            PDF
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              setAguinaldoAEliminar(p);
                              setShowConfirmEliminarAguinaldo(true);
                            }}
                          >
                            Eliminar
                          </button>

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            )}

            <div className="text-end">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowModalVerPagosAguinaldo(false); // cierra este modal
                  setColaboradorAguinaldo(null);        // limpia selección (opcional pero recomendable)
                  setPagosAguinaldo([]);                // limpia lista (opcional)
                  setActiveCard(null);                  // evita que aparezca “Selecciona una opción”
                }}
              >
                Cerrar
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

            {(() => {
              const boletasPorPagina = 10;
              const historialOrdenado = [...vacacionesDetalle].sort((a, b) => new Date(b.FechaSalida) - new Date(a.FechaSalida));
              const totalPaginas = Math.ceil(historialOrdenado.length / boletasPorPagina);
              const inicio = (paginaActual - 1) * boletasPorPagina;
              const pagina = historialOrdenado.slice(inicio, inicio + boletasPorPagina);

              return (
                <>
                  <table className="table table-bordered table-hover table-striped">
                    <thead className="table-dark">
                      <tr>
                        <th>Fecha Salida</th>
                        <th>Fecha Entrada</th>
                        <th>Días Tomados</th>
                        <th>Detalle</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagina.length > 0 ? pagina.map((v, i) => (
                        <tr key={i}>
                          <td>{v.FechaSalida?.slice(0, 10)}</td>
                          <td>{v.FechaEntrada?.slice(0, 10)}</td>
                          <td>{v.DiasTomados}</td>
                          <td>{v.Detalle || 'Sin detalle'}</td>
                          <td style={{ display: 'flex', gap: '5px' }}>
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => {
                                setVacacionEditando({ ...v, ID: v.ID });
                                setShowEditarVacacionModal(true);
                              }}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={async () => {
                                const confirmar = window.confirm("¿Desea eliminar esta boleta de vacaciones?");
                                if (!confirmar) return;

                                try {
                                  const res = await fetch(`http://localhost:3001/api/vacaciones/${v.ID}`, {
                                    method: 'DELETE'
                                  });

                                  if (res.ok) {
                                    alert("Boleta eliminada correctamente.");

                                    // ✅ Cierra el modal actual de historial
                                    setShowDetalleModal(false);

                                    // ✅ Refresca días disponibles en la tabla principal
                                    await handleVacacionesModal();

                                  } else {
                                    const err = await res.json();
                                    alert(err.message || "Error al eliminar la boleta.");
                                  }
                                } catch (err) {
                                  console.error("Error al eliminar:", err);
                                  alert("Error de conexión al eliminar.");
                                }
                              }}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="5" className="text-center text-muted">Sin registros</td></tr>
                      )}
                    </tbody>
                  </table>

                  <div className="d-flex justify-content-center mt-2">
                    {[...Array(totalPaginas)].map((_, i) => (
                      <button
                        key={i}
                        className={`btn btn-sm me-1 ${paginaActual === i + 1 ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setPaginaActual(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </>
              );
            })()}

            <div className="text-end mt-3">
              <button className="btn btn-secondary" onClick={() => setShowDetalleModal(false)}>Cerrar</button>
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
              <p><strong>Total Aguinaldo: ₡{parseFloat(aguinaldoMostrado || 0).toLocaleString()}</strong></p>

              <p className="text-muted">
                Cálculo del aguinaldo con base en pagos del <strong>01/12/{new Date().getFullYear() - 1}</strong> al <strong>30/11/{new Date().getFullYear()}</strong>
              </p>

              {/* 🔎 Filtro de fechas */}
              <div className="row g-2 align-items-end mb-3 no-print" style={{ maxWidth: 740, margin: "0 auto" }}>
                <div className="col-md-4 text-start">
                  <label className="form-label">Desde</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filtroDesde}
                    onChange={(e) => setFiltroDesde(e.target.value)}
                  />
                </div>
                <div className="col-md-4 text-start">
                  <label className="form-label">Hasta</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filtroHasta}
                    onChange={(e) => setFiltroHasta(e.target.value)}
                  />
                </div>
                <div className="col-md-4 text-start">
                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={() => {
                      if (!filtroDesde || !filtroHasta) return alert("Por favor selecciona 'Desde' y 'Hasta'.");
                      if (filtroDesde > filtroHasta) return alert("La fecha 'Desde' no puede ser mayor que 'Hasta'.");
                      setRangoActivo(true);
                    }}
                  >
                    Filtrar
                  </button>
                  {rangoActivo && (
                    <button
                      className="btn btn-link w-100 mt-2"
                      onClick={() => {
                        setRangoActivo(false);
                        setFiltroDesde("");
                        setFiltroHasta("");
                      }}
                    >
                      Quitar filtro
                    </button>
                  )}
                </div>
              </div>

              {/* Etiqueta del rango activo */}
              {rangoActivo && filtroDesde && filtroHasta && (
                <div className="alert alert-info py-2 no-print" style={{ maxWidth: 740, margin: "0 auto 10px" }}>
                  Mostrando pagos del <strong>{filtroDesde}</strong> al <strong>{filtroHasta}</strong>.
                </div>
              )}

              {/* 👇 Usa la lista que corresponde (filtrada o completa) */}
              {(() => {
                const pagosAMostrar = getPagosParaMostrar();
                return (
                  <>
                    <div className="row">
                      {[0, 1, 2].map(colIndex => (
                        <div className="col-md-4" key={colIndex}>
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                <th>Fecha</th>
                                <th>Monto</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pagosAMostrar
                                .slice(colIndex * 6, (colIndex + 1) * 6)
                                .map((pago, i) => (
                                  <tr key={i}>
                                    <td>{pago.FechaRegistro?.slice(0, 10)}</td>
                                    <td>₡{parseFloat(pago.TotalBruto || 0).toLocaleString()}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>

                    <p className="mt-3 text-end">
                      <strong>Total de Pagos: ₡{totalBrutoMostrado.toLocaleString()}</strong>
                    </p>
                  </>
                );
              })()}
            </div>

            {/* 👇👇 NUEVO: botón para generar pago (no afecta impresión) */}
            <div className="no-print text-start mt-2">
              <button
                className="btn btn-outline-success"
                onClick={abrirGenerarPagoAguinaldo}
              >
                Generar pago de aguinaldo
              </button>
            </div>

            <div className="d-flex justify-content-between mt-3">
              <button className="btn btn-primary" onClick={imprimirAguinaldo}>Imprimir PDF</button>
              <button className="btn btn-success" onClick={descargarExcelAguinaldo}>Descargar Excel</button>
              <button className="btn btn-secondary" onClick={() => setShowAguinaldoModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}


      {showListaColaboradoresAguinaldo && (
        <div className="modal-overlay" onClick={() => setShowListaColaboradoresAguinaldo(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Seleccione colaborador para calcular aguinaldo</h4>
            <p className="text-muted">
              Cálculo del aguinaldo con base en los pagos desde <strong>01/12/{new Date().getFullYear() - 1}</strong> hasta <strong>30/11/{new Date().getFullYear()}</strong>
            </p>
            <ul className="list-group">
              {colaboradores.map((col, i) => (
                <li
                  key={i}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <span>{col.Nombre} {col.Apellidos}</span>
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => calcularAguinaldo(col)}
                  >
                    Calcular
                  </button>
                </li>
              ))}
            </ul>
            <div className="text-end mt-3">
              <button
                className="btn btn-secondary"
                onClick={() => setShowListaColaboradoresAguinaldo(false)}
              >
                Cerrar
              </button>
            </div>
            {aguinaldoCalculado && pagosDelAguinaldo?.length > 0 && (
              <div className="mt-4 text-center">
                <hr />
                {/* <p><strong>Total pagado en el periodo:</strong> ₡{pagosDelAguinaldo.reduce((sum, p) => sum + (p.TotalBruto || 0), 0).toLocaleString()}</p> */}
                {/* <p style={{ marginTop: '20px' }}>
                  <strong>Total pagado en el período:</strong> ₡
                  {pagosDelAguinaldo.reduce((sum, p) => sum + (p.TotalBruto || 0), 0).toLocaleString()}
                </p> */}
              </div>
            )}
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

      {showEditarPagoModal && pagoAEditar && (
        <div className="modal-overlay" onClick={() => setShowEditarPagoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Editar Pago</h4>

            <div className="row">
              <div className="col-md-4">
                <label>Horas:</label>
                <input
                  type="number"
                  className="form-control"
                  value={pagoAEditar.HorasTrabajadas}
                  onChange={(e) => setPagoAEditar({ ...pagoAEditar, HorasTrabajadas: e.target.value })}
                />
              </div>

              <div className="col-md-4">
                <label>Préstamos:</label>
                <input
                  type="number"
                  className="form-control"
                  value={pagoAEditar.Prestamos}
                  onChange={(e) => setPagoAEditar({ ...pagoAEditar, Prestamos: e.target.value })}
                />
              </div>

              <div className="col-md-4">
                <label>Vales:</label>
                <input
                  type="number"
                  className="form-control"
                  value={pagoAEditar.Vales}
                  onChange={(e) => setPagoAEditar({ ...pagoAEditar, Vales: e.target.value })}
                />
              </div>

              {/* Repite para Comisiones, Viáticos, Adelantos, Ahorro, etc. */}
            </div>

            <div className="text-end mt-3">
              <button className="btn btn-secondary me-2" onClick={() => setShowEditarPagoModal(false)}>Cancelar</button>
              <button className="btn btn-success" onClick={() => guardarEdicionPago(pagoAEditar)}>Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

      {/* <div className="modal-overlay" onClick={() => setShowValesModal(false)}></div> */}

      {showValesModal && (
        <div className="modal-overlay">
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

                    // ✅ Toast bonito en lugar de alert
                    showToastVale("¡Vale registrado correctamente!");

                    imprimirVale();         // Primero imprimimos
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


      {/* Modal de Confirmación para eliminar pago */}
      {mostrarConfirmacionEliminar && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Confirmar eliminación</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarConfirmacionEliminar(false)}></button>
              </div>
              <div className="modal-body">
                <p>
                  ¿Está seguro que desea eliminar el pago de <strong>{pagoAEliminar?.Nombre}</strong> por <strong>₡{pagoAEliminar?.TotalPago?.toLocaleString()}</strong>?
                </p>
                <p className="text-danger">Esta acción no se puede deshacer.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setMostrarConfirmacionEliminar(false)}>
                  Cancelar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    eliminarPagoSimple(pagoAEliminar.ID);
                    setMostrarConfirmacionEliminar(false);
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModalVerVales && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Lista de Vales</h4>

              {/* 🔎 Buscador por colaborador */}
              <div className="input-group" style={{ maxWidth: 320 }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por colaborador..."
                  value={buscarVale}
                  onChange={(e) => setBuscarVale(e.target.value)}
                />
                <span className="input-group-text">
                  {valesFiltrados.length}
                </span>
              </div>
            </div>

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
                {valesPagina.length > 0 ? (
                  valesPagina.map((v) => (
                    <tr key={v.ID || `${v.CedulaID}-${v.FechaRegistro}`}>
                      <td>{v.Nombre}</td>
                      <td>{v.FechaRegistro?.slice(0, 10)}</td>
                      <td>₡{parseFloat(v.MontoVale).toLocaleString('es-CR')}</td>
                      <td>{v.Motivo}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => {
                            setValeEditando(v);
                            setShowModalEditarVale(true);
                          }}
                        >
                          Editar
                        </button>

                        <button
                          className="btn btn-sm btn-danger me-2"
                          onClick={() => {
                            setValeAEliminar(v);          // 👈 ya lo tienes
                            setShowConfirmEliminar(true); // 👈 tu modal bonito de confirmación
                          }}
                        >
                          Eliminar
                        </button>

                        <button
                          className="btn btn-info btn-sm ver-detalle-boton"
                          onClick={() => {
                            setValeSeleccionado(v);
                            setShowModalVerVales(false);
                            setShowModalDetalleVale(true);
                          }}
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      No hay vales registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* 🔢 Paginación */}
            <nav aria-label="Paginación de vales">
              <ul className="pagination justify-content-center mb-2">
                <li className={`page-item ${paginaVales === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setPaginaVales((p) => Math.max(1, p - 1))}
                  >
                    « Anterior
                  </button>
                </li>

                {Array.from({ length: totalPaginasVales }, (_, i) => i + 1).map((n) => (
                  <li key={n} className={`page-item ${paginaVales === n ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setPaginaVales(n)}>
                      {n}
                    </button>
                  </li>
                ))}

                <li className={`page-item ${paginaVales === totalPaginasVales ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setPaginaVales((p) => Math.min(totalPaginasVales, p + 1))}
                  >
                    Siguiente »
                  </button>
                </li>
              </ul>
            </nav>

            <div className="text-end">
              <button className="btn btn-secondary" onClick={() => setShowModalVerVales(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}


      {showFinanciamientoModal && (
        <div className="modal-overlay">
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

      {showModalVerAumentos && (
        <div className="modal-overlay" onClick={() => setShowModalVerAumentos(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "980px" }}>
            <h4>Aumentos Salariales</h4>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre o cédula..."
                style={{ maxWidth: 340 }}
                value={searchAumentos}
                onChange={(e) => { setSearchAumentos(e.target.value); setPagAumPage(1); }}
              />
              <span className="text-muted">Total: {
                aumentos.filter(a =>
                  (a.Nombre || "").toLowerCase().includes(searchAumentos.toLowerCase()) ||
                  (a.CedulaID || "").toLowerCase().includes(searchAumentos.toLowerCase())
                ).length
              }</span>
            </div>

            {(() => {
              const filtrados = aumentos.filter(a =>
                (a.Nombre || "").toLowerCase().includes(searchAumentos.toLowerCase()) ||
                (a.CedulaID || "").toLowerCase().includes(searchAumentos.toLowerCase())
              );
              const totalPages = Math.max(1, Math.ceil(filtrados.length / AUM_PER_PAGE));
              const start = (pagAumPage - 1) * AUM_PER_PAGE;
              const pageItems = filtrados.slice(start, start + AUM_PER_PAGE);

              return (
                <>
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover table-striped">
                      <thead className="table-dark">
                        <tr>
                          <th>Nombre</th>
                          <th>Cédula</th>
                          <th>Fecha</th>
                          <th>Salario Anterior</th>
                          <th>Salario Nuevo</th>
                          <th>Observaciones</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageItems.length > 0 ? pageItems.map((a) => (
                          <tr key={a.ID}>
                            <td>{a.Nombre}</td>
                            <td>{a.CedulaID}</td>
                            <td>{(a.Fecha || "").toString().slice(0, 10)}</td>
                            <td>₡{formatMonto(a.SalarioAnterior)}</td>
                            <td>₡{formatMonto(a.SalarioNuevo)}</td>
                            <td>{a.Observaciones || "—"}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => imprimirAumentoPDF({
                                  CedulaID: a.CedulaID,
                                  Nombre: a.Nombre,
                                  Empresa: a.Empresa,
                                  SalarioAnterior: a.SalarioAnterior,
                                  SalarioNuevo: a.SalarioNuevo,
                                  Fecha: a.Fecha,
                                  Observaciones: a.Observaciones
                                })}
                              >
                                PDF
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="7" className="text-center text-muted">No hay aumentos registrados.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      disabled={pagAumPage === 1}
                      onClick={() => setPagAumPage(pagAumPage - 1)}
                    >
                      &lt; Anterior
                    </button>
                    <span>Página {pagAumPage} de {totalPages}</span>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      disabled={pagAumPage === totalPages}
                      onClick={() => setPagAumPage(pagAumPage + 1)}
                    >
                      Siguiente &gt;
                    </button>
                  </div>
                </>
              );
            })()}

            <div className="text-end mt-3">
              <button className="btn btn-secondary" onClick={() => setShowModalVerAumentos(false)}>Cerrar</button>
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
                      {/* 👇 NUEVO: abre el mismo modal de “Pagos realizados a …” */}
                      <button
                        className="btn btn-sm btn-outline-info button-ver-pagos-historial"
                        onClick={() => abrirHistorialPagos(colaborador)}
                      >
                        Ver pagos historial
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* <div className="modal-overlay" onClick={() => setShowReporteTabla(false)}></div> */}

      {showReporteTabla && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Reporte de Pagos por Rango de Fechas</h3>

            {/* Filtros - NO se imprimen */}
            <div className="d-flex gap-3 mb-3 no-print">
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
                      const res = await fetch(
                        `http://localhost:3001/api/reporte-pagos?inicio=${fechaInicioReporte}&fin=${fechaFinReporte}&localidad=${encodeURIComponent(localidad)}`
                      );
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

            {/* SOLO esto se imprime */}
            <div ref={tablaReporteRef}>
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
            </div>

            {/* Botones - NO se imprimen */}
            <div className="text-end no-print">
              <button className="btn btn-secondary" onClick={() => setShowReporteTabla(false)}>Cerrar</button>
              <button className="btn btn-outline-primary me-2" onClick={imprimirReportePagos}>
                Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 
      {showListaAguinaldos && (
        <div className="modal-overlay" onClick={() => setShowListaAguinaldos(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 900 }}>
            <h4>Pagos de Aguinaldo — {getLocalidad()}</h4>

            <div className="d-flex justify-content-between align-items-center mb-2">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Buscar por nombre o cédula..."
                style={{ maxWidth: 320 }}
                value={busquedaAguinaldo}
                onChange={(e) => { setBusquedaAguinaldo(e.target.value); setPaginaAguinaldos(1); }}
              />
              <span className="text-muted">Total: {
                aguinaldosGuardados.length
              }</span>
            </div>

            {(() => {
              const filtro = (busquedaAguinaldo || "").toLowerCase();
              const filtrados = aguinaldosGuardados.filter(a =>
                (a.Nombre || "").toLowerCase().includes(filtro) ||
                (a.CedulaID || "").toLowerCase().includes(filtro)
              );

              const totalPaginas = Math.max(1, Math.ceil(filtrados.length / pageSizeAguinaldos));
              const pag = Math.min(paginaAguinaldos, totalPaginas);
              const start = (pag - 1) * pageSizeAguinaldos;
              const pageItems = filtrados.slice(start, start + pageSizeAguinaldos);

              return (
                <>
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover table-striped">
                      <thead className="table-dark">
                        <tr>
                          <th>Nombre</th>
                          <th>Cédula</th>
                          <th>Periodo</th>
                          <th>Monto</th>
                          <th>Fecha pago</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageItems.length > 0 ? pageItems.map((a) => (
                          <tr key={a.ID}>
                            <td>{a.Nombre}</td>
                            <td>{a.CedulaID}</td>
                            <td>{a.PeriodoDesde?.slice(0, 10)} — {a.PeriodoHasta?.slice(0, 10)}</td>
                            <td>₡{parseFloat(a.Monto || 0).toLocaleString('es-CR', { minimumFractionDigits: 2 })}</td>
                            <td>{a.FechaPago?.slice(0, 10)}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-info me-2"
                                onClick={() => { setAguinaldoSeleccionado(a); setShowDetalleAguinaldo(true); }}
                              >
                                Ver
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => eliminarAguinaldoPago(a.ID)}
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="6" className="text-center text-muted">No hay registros</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      disabled={pag <= 1}
                      onClick={() => setPaginaAguinaldos(p => Math.max(1, p - 1))}
                    >
                      &lt; Anterior
                    </button>
                    <span>Página {pag} de {totalPaginas}</span>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      disabled={pag >= totalPaginas}
                      onClick={() => setPaginaAguinaldos(p => Math.min(totalPaginas, p + 1))}
                    >
                      Siguiente &gt;
                    </button>
                  </div>

                  <div className="text-end mt-3">
                    <button className="btn btn-secondary" onClick={() => setShowListaAguinaldos(false)}>Cerrar</button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )} */}

      {showDetalleAguinaldo && aguinaldoSeleccionado && (
        <div className="modal-overlay" onClick={() => setShowDetalleAguinaldo(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
            {/* 🖨️ Contenido imprimible */}
            <div id="vista-aguinaldo-pagado" style={{ padding: 16 }}>
              {/* Encabezado centrado con logo (si lo tienes en LS) */}
              <div style={{ textAlign: "center", marginBottom: 8 }}>
                {(() => {
                  const logo = localStorage.getItem('logoEmpresaBase64') || ""; // Si tu clave es otra, cámbiala aquí
                  if (logo) {
                    return <img src={logo} alt="Logo" style={{ maxHeight: 70, marginBottom: 6 }} />;
                  }
                  return null;
                })()}
                <h5 style={{ margin: 0 }}>{getLocalidad() || "Empresa"}</h5>
                <div style={{ borderBottom: "1px solid #999", marginTop: 6 }} />
              </div>

              <h4 className="text-center" style={{ marginTop: 10 }}>COMPROBANTE DE PAGO DE AGUINALDO</h4>

              <table className="table table-sm table-bordered" style={{ marginTop: 12 }}>
                <tbody>
                  <tr>
                    <th>Colaborador</th>
                    <td>{aguinaldoSeleccionado.Nombre}</td>
                    <th>Cédula</th>
                    <td>{aguinaldoSeleccionado.CedulaID}</td>
                  </tr>
                  <tr>
                    <th>Empresa</th>
                    <td>{aguinaldoSeleccionado.Empresa}</td>
                    <th>Fecha de pago</th>
                    <td>{aguinaldoSeleccionado.FechaPago?.slice(0, 10)}</td>
                  </tr>
                  <tr>
                    <th>Período</th>
                    <td colSpan={3}>
                      {aguinaldoSeleccionado.PeriodoDesde?.slice(0, 10)} — {aguinaldoSeleccionado.PeriodoHasta?.slice(0, 10)}
                    </td>
                  </tr>
                  <tr>
                    <th>Monto</th>
                    <td colSpan={3}>₡{parseFloat(aguinaldoSeleccionado.Monto || 0).toLocaleString('es-CR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  {aguinaldoSeleccionado.Observaciones ? (
                    <tr>
                      <th>Observaciones</th>
                      <td colSpan={3}>{aguinaldoSeleccionado.Observaciones}</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>

              {/* Firmas */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 36 }}>
                <div style={{ width: "45%", textAlign: "center" }}>
                  <div style={{ borderTop: "1px solid #333", paddingTop: 6 }}>Recibido por</div>
                </div>
                <div style={{ width: "45%", textAlign: "center" }}>
                  <div style={{ borderTop: "1px solid #333", paddingTop: 6 }}>Autorizado por</div>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="d-flex justify-content-between mt-3">
              <button className="btn btn-outline-primary" onClick={imprimirAguinaldoPagadoPDF}>Imprimir PDF</button>
              <button className="btn btn-secondary" onClick={() => setShowDetalleAguinaldo(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {showAumentosModal && (
        <div className="modal-overlay" onClick={() => setShowAumentosModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Aumentos Salariales</h3>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre o cédula..."
                style={{ maxWidth: 340 }}
                value={busquedaAumentos}
                onChange={(e) => { setBusquedaAumentos(e.target.value); setPaginaAumentos(1); }}
              />
              <span className="text-muted">
                Localidad: {(() => { let l = localStorage.getItem("localidad") || ""; try { const o = JSON.parse(l); return o?.Localidad || o?.Empresa || l; } catch { return l; } })()}
              </span>
            </div>

            <div className="table-responsive">
              <table className="table table-bordered table-hover table-striped">
                <thead className="table-dark">
                  <tr>
                    <th>Nombre</th>
                    <th>Cédula</th>
                    <th>Salario Base (mensual)</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const q = busquedaAumentos.trim().toLowerCase();
                    const filtrados = listaColaboradoresAumento.filter(c =>
                      (c.Nombre || "").toLowerCase().includes(q) ||
                      (c.Apellidos || "").toLowerCase().includes(q) ||
                      (c.CedulaID || "").toLowerCase().includes(q)
                    );

                    const total = filtrados.length;
                    const ini = (paginaAumentos - 1) * rowsPorPaginaAumentos;
                    const fin = ini + rowsPorPaginaAumentos;
                    const pagina = filtrados.slice(ini, fin);

                    return pagina.length > 0 ? pagina.map((c) => (
                      <tr key={c.ID}>
                        <td>{c.Nombre} {c.Apellidos}</td>
                        <td>{c.CedulaID}</td>
                        <td>₡{Number(c.SalarioBase || 0).toLocaleString("es-CR", { minimumFractionDigits: 2 })}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => abrirCrearAumento(c)}
                          >
                            Crear aumento
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="text-center text-muted">No hay colaboradores.</td></tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {(() => {
              const q = busquedaAumentos.trim().toLowerCase();
              const totalFiltrados = listaColaboradoresAumento.filter(c =>
                (c.Nombre || "").toLowerCase().includes(q) ||
                (c.Apellidos || "").toLowerCase().includes(q) ||
                (c.CedulaID || "").toLowerCase().includes(q)
              ).length;
              const totalPags = Math.max(1, Math.ceil(totalFiltrados / rowsPorPaginaAumentos));

              return (
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    disabled={paginaAumentos === 1}
                    onClick={() => setPaginaAumentos(paginaAumentos - 1)}
                  >
                    &lt; Anterior
                  </button>
                  <span>Página {paginaAumentos} de {totalPags}</span>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    disabled={paginaAumentos === totalPags}
                    onClick={() => setPaginaAumentos(paginaAumentos + 1)}
                  >
                    Siguiente &gt;
                  </button>
                </div>
              );
            })()}

            <div className="text-end mt-3">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowAumentosModal(false);
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {showCrearAumentoModal && colabSeleccionadoAumento && (
        <div className="modal-overlay" onClick={() => setShowCrearAumentoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Crear aumento — {colabSeleccionadoAumento.Nombre} {colabSeleccionadoAumento.Apellidos}</h4>
            <p className="text-muted mb-2">Cédula: {colabSeleccionadoAumento.CedulaID}</p>

            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Fecha</label>
                <input
                  type="date"
                  className="form-control"
                  value={aumentoForm.Fecha}
                  onChange={(e) => setAumentoForm({ ...aumentoForm, Fecha: e.target.value })}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Salario actual</label>
                <input
                  type="text"
                  className="form-control"
                  value={`₡${Number(aumentoForm.SalarioActual || 0).toLocaleString("es-CR", { minimumFractionDigits: 2 })}`}
                  readOnly
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Salario nuevo</label>
                <input
                  type="number"
                  className="form-control"
                  min={0}
                  value={aumentoForm.SalarioNuevo}
                  onChange={(e) => setAumentoForm({ ...aumentoForm, SalarioNuevo: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Observaciones (opcional)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={aumentoForm.Observaciones}
                  onChange={(e) => setAumentoForm({ ...aumentoForm, Observaciones: e.target.value })}
                />
              </div>
            </div>

            <div className="text-end mt-3">
              <button className="btn btn-secondary me-2" onClick={() => setShowCrearAumentoModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardarAumento}>Guardar Aumento</button>
            </div>
          </div>
        </div>
      )}

      {showGenerarAguinaldo && (
        <div className="modal-overlay" onClick={() => setShowGenerarAguinaldo(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Generar Pago de Aguinaldo</h4>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Cédula</label>
                <input className="form-control" value={formPagoAguinaldo.CedulaID} readOnly />
              </div>
              <div className="col-md-6">
                <label className="form-label">Nombre</label>
                <input className="form-control" value={formPagoAguinaldo.Nombre} readOnly />
              </div>

              <div className="col-md-6">
                <label className="form-label">Empresa</label>
                <input className="form-control" value={formPagoAguinaldo.Empresa} readOnly />
              </div>
              <div className="col-md-3">
                <label className="form-label">Desde</label>
                <input className="form-control" value={formPagoAguinaldo.PeriodoDesde} readOnly />
              </div>
              <div className="col-md-3">
                <label className="form-label">Hasta</label>
                <input className="form-control" value={formPagoAguinaldo.PeriodoHasta} readOnly />
              </div>

              <div className="col-md-4">
                <label className="form-label">Monto (₡)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formPagoAguinaldo.Monto}
                  onChange={(e) => setFormPagoAguinaldo({ ...formPagoAguinaldo, Monto: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Fecha de Pago</label>
                <input
                  type="date"
                  className="form-control"
                  value={formPagoAguinaldo.FechaPago}
                  onChange={(e) => setFormPagoAguinaldo({ ...formPagoAguinaldo, FechaPago: e.target.value })}
                />
              </div>
              <div className="col-md-12">
                <label className="form-label">Observaciones</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formPagoAguinaldo.Observaciones}
                  onChange={(e) => setFormPagoAguinaldo({ ...formPagoAguinaldo, Observaciones: e.target.value })}
                />
              </div>
            </div>

            <div className="text-end mt-3">
              <button className="btn btn-secondary me-2" onClick={() => setShowGenerarAguinaldo(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardarPagoAguinaldo}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {showContratoModal && (
        <div className="modal-overlay" onClick={() => setShowContratoModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <GestionContratos />
            <div className="text-end mt-3">
              <button className="btn btn-secondary" onClick={() => setShowContratoModal(false)}>Cerrar</button>
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
              <button className="btn btn-success" onClick={guardarPagoFinanciamiento}>Aplicar Pago otro 2</button>
            </div>
          </div>
        </div>
      )}


      {/* <div className="modal-overlay" onClick={() => setShowVerFinanciamientos(false)}></div> */}
      {showVerFinanciamientos && (
        <div className="modal-overlay">
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
                          Edit
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
                          Elim
                        </button>
                        <button
                          className="btn btn-sm btn-primary button-lista-financimientos"
                          onClick={() => {
                            setFinanciamientoSeleccionado(f); // guardas en estado el financiamiento
                            setShowVerFinanciamientos(false); // 👈 CIERRA el modal de lista
                            setShowAplicarPagoModal(true);    // 👈 ABRE el modal de aplicar pago
                          }}
                        >
                          Apli
                        </button>
                        <button
                          className="btn btn-sm btn-success me-1 button-lista-financimientos"
                          onClick={() => verAbonos(f.ID)}
                        >
                          Abon
                        </button>
                        <button
                          className="btn btn-sm btn-outline-dark me-1 button-lista-financimientos"
                          onClick={() => generarPDFFinanciamiento(f)}
                        >
                          PDF
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
                  pagosPaginados.map((pago, index) => (
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
                        {/* <button
                          className="btn btn-sm btn-warning me-1"
                          onClick={() => abrirModalEditarPago(pago)}
                        >
                          Editar
                        </button> */}
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => {
                            setPagoAEliminar(pago); // Guarda temporalmente el pago
                            setMostrarConfirmacionEliminar(true); // Muestra el modal
                          }}
                        >
                          Eliminar Pago
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

            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>
                Página {paginaActualPagos} de {totalPaginasPagos}
              </div>
              <div>
                <button
                  className="btn btn-outline-primary btn-sm me-2"
                  disabled={paginaActualPagos === 1}
                  onClick={() => setPaginaActualPagos(paginaActualPagos - 1)}
                >
                  Anterior
                </button>
                <button
                  className="btn btn-outline-primary btn-sm"
                  disabled={paginaActualPagos === totalPaginasPagos}
                  onClick={() => setPaginaActualPagos(paginaActualPagos + 1)}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEliminarPagoModal && (
        <div className="modal-overlay" onClick={() => setShowEliminarPagoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-danger">¿Eliminar este pago?</h4>
            <p>Esta acción devolverá saldos a vales y financiamientos si aplica.</p>
            <div className="text-end">
              <button className="btn btn-secondary me-2" onClick={() => setShowEliminarPagoModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={async () => {
                try {
                  const response = await fetch(`http://localhost:3001/api/eliminar-pago-planilla/${pagoAEliminar.ID}`, {
                    method: "DELETE"
                  });

                  if (!response.ok) throw new Error("Error al eliminar el pago");

                  alert("Pago eliminado correctamente.");
                  setShowEliminarPagoModal(false);
                  setPagoAEliminar(null);

                  // Recargar pagos
                  if (selectedColaborador) verPagosColaborador(selectedColaborador.CedulaID);

                } catch (error) {
                  console.error("Error al eliminar pago:", error);
                  alert("Ocurrió un error al eliminar el pago");
                }
              }}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmEliminarCol && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Confirmar eliminación</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => !eliminandoCol && setShowConfirmEliminarCol(false)}
                />
              </div>
              <div className="modal-body">
                <p className="mb-2">
                  Vas a eliminar al colaborador:
                </p>
                <div className="p-3 border rounded bg-light">
                  <div><strong>Nombre:</strong> {colaboradorAEliminar?.Nombre} {colaboradorAEliminar?.Apellidos}</div>
                  <div><strong>Cédula:</strong> {colaboradorAEliminar?.CedulaID}</div>
                  {colaboradorAEliminar?.Correo && (
                    <div><strong>Correo:</strong> {colaboradorAEliminar.Correo}</div>
                  )}
                  {colaboradorAEliminar?.Telefono && (
                    <div><strong>Teléfono:</strong> {colaboradorAEliminar.Telefono}</div>
                  )}
                </div>
                <p className="mt-3 text-danger fw-semibold mb-0">
                  Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => !eliminandoCol && setShowConfirmEliminarCol(false)}
                  disabled={eliminandoCol}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteColaborador(colaboradorAEliminar?.ID)}
                  disabled={eliminandoCol}
                >
                  {eliminandoCol ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
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
                            const nuevosPendientes = pendientesAplicados.filter(
                              p => !(p.tipo === "Financiamiento" && p.id === fin.ID)
                            );
                            const actualizados = [...nuevosPendientes, {
                              tipo: "Financiamiento",
                              id: fin.ID,
                              monto: fin.MontoPendiente
                            }];
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
                Aplicar al Pago Pendientes
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
                Imprimir Vale
              </button>
            </div>
          </div>
        </div>
      )}
      {toastVale.visible && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x p-3"
          style={{ zIndex: 2000 }}
        >
          <div
            className="shadow rounded-3 text-white"
            style={{
              minWidth: 320,
              background:
                "linear-gradient(135deg, #22c55e, #16a34a)",
            }}
          >
            <div className="d-flex align-items-center p-3">
              <i className="bi bi-check-circle-fill me-3" style={{ fontSize: 22 }}></i>
              <div className="flex-grow-1 fw-semibold">
                {toastVale.message}
              </div>
              <button
                type="button"
                className="btn btn-sm btn-light ms-3"
                onClick={() => setToastVale({ visible: false, message: "" })}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}


      {showEditarPagoModal && (
        <div className="modal-overlay" onClick={() => setShowEditarPagoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Editar Pago</h4>

            <div className="mb-2">
              <label>Total Pago</label>
              <input
                type="number"
                className="form-control"
                value={pagoAEditar?.TotalPago || ""}
                onChange={(e) =>
                  setPagoAEditar({ ...pagoAEditar, TotalPago: parseFloat(e.target.value) || 0 })
                }
              />
            </div>

            <div className="mb-2">
              <label>Préstamos</label>
              <input
                type="number"
                className="form-control"
                value={pagoAEditar?.Prestamos || ""}
                onChange={(e) =>
                  setPagoAEditar({ ...pagoAEditar, Prestamos: parseFloat(e.target.value) || 0 })
                }
              />
            </div>

            {/* Agregue aquí otros campos que desee editar */}

            <div className="text-end">
              <button className="btn btn-success me-2" onClick={guardarEdicionPago}>
                Guardar Cambios
              </button>
              <button className="btn btn-secondary" onClick={() => setShowEditarPagoModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showReporteColillas && (
        <div className="modal-overlay" onClick={() => setShowReporteTabla(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: '90vh', overflowY: 'auto' }}
          >
            <h3>Reporte de Pagos - Planilla</h3>

            {/* Filtro de fechas (no imprime) */}
            <div className="mb-3 d-flex flex-wrap gap-3 align-items-center no-print">
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
                {/* 👇 ahora imprime SOLO las colillas */}
                <button className="btn btn-outline-primary" onClick={imprimirSoloColillas}>Imprimir</button>
                <button className="btn btn-outline-danger" onClick={descargarPDFReportePlanilla4x}>Descargar PDF</button>
              </div>
            </div>

            {/* Resultados: SOLO esto se imprime */}
            <div className="reporte-colillas mt-4" id="contenido-colillas" ref={colillasRef}>
              {pagosFiltrados.length > 0 ? (
                pagosFiltrados.map((pago, i) => (
                  <table key={i} className="table table-bordered table-striped mb-4 colilla">
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

            {/* Botón cerrar (no imprime) */}
            <div className="text-end mt-3 no-print">
              <button className="btn btn-secondary" onClick={() => setShowReporteColillas(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {showConfirmEliminar && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title d-flex align-items-center m-0">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Confirmar eliminación
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowConfirmEliminar(false)} />
              </div>

              <div className="modal-body">
                <div className="d-flex">
                  <div className="me-3 d-none d-sm-block">
                    <i className="bi bi-trash-fill text-danger" style={{ fontSize: 42 }}></i>
                  </div>
                  <div>
                    <p className="mb-1">
                      ¿Seguro que deseas eliminar este vale? Esta acción no se puede deshacer.
                    </p>
                    {valeAEliminar && (
                      <ul className="list-unstyled small mb-0">
                        <li><strong>Nombre:</strong> {valeAEliminar.Nombre}</li>
                        <li><strong>Fecha:</strong> {valeAEliminar.FechaRegistro?.slice(0, 10)}</li>
                        <li><strong>Monto:</strong> ₡{parseFloat(valeAEliminar.MontoVale).toLocaleString('es-CR')}</li>
                        <li><strong>Motivo:</strong> {valeAEliminar.Motivo}</li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowConfirmEliminar(false)}
                  disabled={eliminandoVale}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={confirmarEliminarVale}
                  disabled={eliminandoVale}
                >
                  {eliminandoVale ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Eliminando...
                    </>
                  ) : (
                    "Eliminar definitivamente"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showListaAguinaldos && (
        <div className="modal-overlay" onClick={() => setShowListaAguinaldos(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Colaboradores — Aguinaldo</h4>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre o cédula..."
                style={{ maxWidth: 340 }}
                value={searchColabAguinaldo}
                onChange={(e) => {
                  setSearchColabAguinaldo(e.target.value);
                  setPagColabPage(1);
                }}
              />
              <span className="text-muted">Total: {filteredColabsAg.length}</span>
            </div>

            <div className="table-responsive">
              <table className="table table-bordered table-hover table-striped mt-2">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Cédula</th>
                    <th>Empresa</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pageSlice.length > 0 ? (
                    pageSlice.map((c, i) => (
                      <tr key={c.CedulaID || i}>
                        <td>{pageStart + i + 1}</td>
                        <td>{c.Nombre} {c.Apellidos}</td>
                        <td>{c.CedulaID}</td>
                        <td>{c.Empresa || c.Localidad || "—"}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => {
                              // Abre el modal de pagos del colaborador y cierra éste para evitar overlays
                              verPagosAguinaldoDe(c);
                              setShowListaAguinaldos(false);
                            }}
                          >
                            Ver pagos Aguinaldo
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">No hay colaboradores.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-2">
              <button
                className="btn btn-outline-primary btn-sm"
                disabled={pagColabPage === 1}
                onClick={() => setPagColabPage(pagColabPage - 1)}
              >
                &lt; Anterior
              </button>
              <span>Página {pagColabPage} de {totalPagesAg}</span>
              <button
                className="btn btn-outline-primary btn-sm"
                disabled={pagColabPage === totalPagesAg}
                onClick={() => setPagColabPage(pagColabPage + 1)}
              >
                Siguiente &gt;
              </button>
            </div>

            <div className="text-end mt-3">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowListaAguinaldos(false);
                  // Limpieza opcional
                  // setColaboradorAguinaldo(null);
                  // setPagosAguinaldo([]);
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}


      {showPagosDeColab && (
        <div className="modal-overlay" onClick={() => setShowPagosDeColab(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div id="imp-agui-colab" style={{ padding: 10 }}>
              <h4 className="text-center mb-2">
                Aguinaldos — {colabSeleccionadoAguinaldo?.Nombre} {colabSeleccionadoAguinaldo?.Apellidos}
              </h4>
              <p className="text-center text-muted mb-3">
                Localidad: <strong>{localStorage.getItem("localidad")}</strong>
              </p>

              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead className="table-dark">
                    <tr>
                      <th>Período</th>
                      <th>Monto Aguinaldo</th>
                      <th>Fecha de Registro</th>
                      <th className="no-print">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagosAguinaldo.length > 0 ? pagosAguinaldo.map((p, i) => {
                      const desde = p.PeriodoDesde?.slice(0, 10) || p.Desde?.slice(0, 10) || "";
                      const hasta = p.PeriodoHasta?.slice(0, 10) || p.Hasta?.slice(0, 10) || "";
                      const fecha = (p.FechaCreacion || p.FechaPago || p.Fecha || "").slice(0, 10);
                      return (
                        <tr key={p.ID || i}>
                          <td>{desde} — {hasta}</td>
                          <td>{fmtCRC(p.TotalAguinaldo || p.Monto || p.Total || 0)}</td>
                          <td>{fecha}</td>
                          <td className="no-print">
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => eliminarPagoAguinaldo(p.ID)}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr><td colSpan="4" className="text-center text-muted">Sin pagos de aguinaldo</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="d-flex justify-content-between mt-3">
              <button className="btn btn-outline-primary" onClick={imprimirPagosAguinaldoDe}>
                Imprimir PDF
              </button>
              <button className="btn btn-secondary" onClick={() => setShowPagosDeColab(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}


      {showConfirmarEliminar && (
        <div className="modal-overlay" onClick={() => setShowConfirmarEliminar(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4 className="mb-3">¿Está seguro de eliminar este pago?</h4>
            <p>Esta acción no se puede deshacer.</p>
            <div className="text-end">
              <button className="btn btn-secondary me-2" onClick={() => setShowConfirmarEliminar(false)}>Cancelar</button>
              <button className="btn btn-danger" onClick={async () => {
                await confirmarEliminarPago(pagoAEliminar);
                setShowConfirmarEliminar(false);
              }}>Eliminar</button>
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

      {showConfirmEliminarAguinaldo && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Confirmar eliminación</h5>
                <button type="button" className="btn-close" onClick={() => setShowConfirmEliminarAguinaldo(false)}></button>
              </div>
              <div className="modal-body">
                <p>
                  Vas a eliminar el pago de aguinaldo de <strong>{aguinaldoAEliminar?.Nombre}</strong> por{" "}
                  <strong>₡{Number(aguinaldoAEliminar?.Monto || 0).toLocaleString("es-CR")}</strong>.
                </p>
                <p className="text-danger mb-0">Esta acción no se puede deshacer.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowConfirmEliminarAguinaldo(false)}>
                  Cancelar
                </button>
                <button className="btn btn-danger" onClick={eliminarAguinaldoPagadoConfirmado}>
                  Eliminar
                </button>
              </div>
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