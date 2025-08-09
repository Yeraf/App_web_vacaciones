import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

export const Estadisticas = () => {
  const [colaboradores, setColaboradores] = useState([]);
  const [financiamientos, setFinanciamientos] = useState([]);

  // Citas / modal
  const [showCitasModal, setShowCitasModal] = useState(false);
  const [citas, setCitas] = useState([]);

  // Resolver localidad igual que en Calendario
  const resolveLocalidad = () => {
    const raw = localStorage.getItem('localidad');
    if (raw) {
      try {
        const obj = JSON.parse(raw);
        if (obj && typeof obj === 'object') {
          return obj.Localidad || obj.Empresa || raw;
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

  const localidad = resolveLocalidad();

  useEffect(() => {
    const fetchColaboradores = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/colaboradores?localidad=${encodeURIComponent(localidad)}`);
        const data = await res.json();
        setColaboradores(data);
      } catch (error) {
        console.error('Error cargando colaboradores:', error);
      }
    };

    const fetchFinanciamientos = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/financiamientos?localidad=${encodeURIComponent(localidad)}`);
        const data = await res.json();
        setFinanciamientos(data);
      } catch (error) {
        console.error('Error cargando financiamientos:', error);
      }
    };

    fetchColaboradores();
    fetchFinanciamientos();
  }, [localidad]);

  // Abrir modal y cargar citas por localidad
  const abrirModalCitas = () => {
    try {
      const raw = localStorage.getItem('eventosCalendario');
      if (!raw) {
        setCitas([]);
        setShowCitasModal(true);
        return;
      }

      const parsed = JSON.parse(raw);

      // Si es formato nuevo: { [localidad]: { 'YYYY-MM-DD': [citas] } }
      const porLocalidad = parsed && typeof parsed === 'object' ? parsed[localidad] : null;

      let fuente = porLocalidad;
      // Fallback a formato viejo: { 'YYYY-MM-DD': [citas] }
      if (!fuente || typeof fuente !== 'object') {
        // Si parsed parece ser viejo (claves fecha), úsalo directo
        const esViejo = parsed && typeof parsed === 'object' &&
          Object.keys(parsed).every(k => /^\d{4}-\d{2}-\d{2}$/.test(k));
        fuente = esViejo ? parsed : {};
      }

      const items = Object.entries(fuente)
        .flatMap(([fecha, lista]) =>
          Array.isArray(lista) ? lista.map((texto) => ({ fecha, texto })) : []
        )
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

      setCitas(items);
      setShowCitasModal(true);
    } catch (e) {
      console.error('Error leyendo citas:', e);
      setCitas([]);
      setShowCitasModal(true);
    }
  };

  const totalColaboradores = colaboradores.length;
  const totalSalarioBaseQuincenal = colaboradores.reduce((acc, curr) => acc + parseFloat(curr.SalarioBase / 2 || 0), 0);
  const totalSalarioBaseMensual = totalSalarioBaseQuincenal * 2;
  const totalFinanciamientosPendientes = financiamientos.reduce((acc, curr) => acc + parseFloat(curr.MontoPendiente || 0), 0);
  const cantidadFinanciamientos = financiamientos.length;

  const totalMontoOriginal = financiamientos.reduce((acc, curr) => acc + parseFloat(curr.Monto || 0), 0);
  const totalPagado = totalMontoOriginal - totalFinanciamientosPendientes;

  const dataPie = [
    { name: 'Pendiente', value: totalFinanciamientosPendientes },
    { name: 'Pagado', value: totalPagado > 0 ? totalPagado : 0 }
  ];

  const COLORS = ['#42a5f5', '#66bb6a'];

  return (
    <div style={{ padding: '20px' }}>
      <div className="d-flex justify-content-between align-items-center">
        <h2>Estadísticas</h2>
        <button className="btn btn-outline-primary" onClick={abrirModalCitas}>
          VER CITAS
        </button>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        marginTop: '20px'
      }}>

        {/* CARD COLABORADORES */}
        <div style={{
          background: 'linear-gradient(135deg, #fdfbfb, #ebedee, #dbeafe, #e0f2f1, #fef9f8)',
          borderRadius: '10px',
          padding: '20px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          maxWidth: '400px',
          width: '100%',
          flex: '1'
        }}>
          <h4 className="mb-2">Colaboradores</h4>
          <hr />
          <p><strong>Total colaboradores:</strong> {totalColaboradores}</p>
          <p><strong>Total planilla quincenal:</strong> ₡{totalSalarioBaseQuincenal.toLocaleString('es-CR', { minimumFractionDigits: 2 })} </p>
          <hr />
          <p><strong>Total planilla mensual:</strong> ₡{totalSalarioBaseMensual.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</p>
        </div>

        {/* CARD FINANCIAMIENTOS */}
        <div style={{
          background: 'linear-gradient(135deg, #fdfbfb, #ebedee, #dbeafe, #e0f2f1, #fef9f8)',
          borderRadius: '10px',
          padding: '20px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          maxWidth: '400px',
          width: '100%',
          flex: '1'
        }}>
          <h4 className="mb-2">Financiamientos</h4>
          <hr />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p><strong>Total de financiamientos:</strong> {cantidadFinanciamientos}</p>
              <p><strong>Monto total pendiente:</strong></p>
              <p className="mt-2">₡{totalFinanciamientosPendientes.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</p>
            </div>

            <div style={{ width: '120px', height: '120px' }}>
              <PieChart width={120} height={120}>
                <Pie
                  data={dataPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={50}
                  labelLine={false}
                >
                  {dataPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
          </div>

          <div className="d-flex justify-content-center gap-3 mt-3">
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '15px', height: '15px', backgroundColor: '#42a5f5', borderRadius: '3px' }}></div>
              <span style={{ fontSize: '0.9rem' }}>Monto Pendiente</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '15px', height: '15px', backgroundColor: '#66bb6a', borderRadius: '3px' }}></div>
              <span style={{ fontSize: '0.9rem' }}>Monto Pagado</span>
            </div>
          </div>
        </div>

      </div>

      {/* Modal Citas */}
      {showCitasModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Citas — {localidad}</h5>
                <button type="button" className="btn-close" onClick={() => setShowCitasModal(false)}></button>
              </div>
              <div className="modal-body">
                {citas.length === 0 ? (
                  <div className="alert alert-info mb-0">No hay citas registradas para esta localidad.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th style={{ width: 140 }}>Fecha</th>
                          <th>Descripción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {citas.map((c, i) => (
                          <tr key={i}>
                            <td>{new Date(c.fecha + 'T00:00:00').toLocaleDateString()}</td>
                            <td>{c.texto}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowCitasModal(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
