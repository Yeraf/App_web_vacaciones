import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

export const Estadisticas = () => {
  const [colaboradores, setColaboradores] = useState([]);
  const [financiamientos, setFinanciamientos] = useState([]);

  useEffect(() => {
    const fetchColaboradores = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/colaboradores');
        const data = await res.json();
        setColaboradores(data);
      } catch (error) {
        console.error('Error cargando colaboradores:', error);
      }
    };

    const fetchFinanciamientos = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/financiamientos');
        const data = await res.json();
        setFinanciamientos(data);
      } catch (error) {
        console.error('Error cargando financiamientos:', error);
      }
    };

    fetchColaboradores();
    fetchFinanciamientos();
  }, []);

  const totalColaboradores = colaboradores.length;
  const totalSalarioBaseQuincenal = colaboradores.reduce((acc, curr) => acc + parseFloat(curr.SalarioBase || 0), 0);
  const totalSalarioBaseMensual = totalSalarioBaseQuincenal * 2;
  const totalFinanciamientosPendientes = financiamientos.reduce((acc, curr) => acc + parseFloat(curr.MontoPendiente || 0), 0);
  const cantidadFinanciamientos = financiamientos.length;

  // Simulamos monto original como la suma de Monto + lo que ya pagaron
  const totalMontoOriginal = financiamientos.reduce((acc, curr) => acc + parseFloat(curr.Monto || 0), 0);
  const totalPagado = totalMontoOriginal - totalFinanciamientosPendientes;

  const dataPie = [
    { name: 'Pendiente', value: totalFinanciamientosPendientes },
    { name: 'Pagado', value: totalPagado > 0 ? totalPagado : 0 }
  ];

  const COLORS = ['#42a5f5', '#66bb6a']; // Azul y verde

  return (
    <div style={{ padding: '20px' }}>
      <h2>Estadísticas</h2>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        marginTop: '20px'
      }}>

        {/* CARD COLABORADORES */}
        <div style={{
          background: '#f1f1f1',
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
          <p><strong>Total planilla quincenal:</strong> ₡{totalSalarioBaseQuincenal.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</p>
          <hr />
          <p><strong>Total planilla mensual:</strong> ₡{totalSalarioBaseMensual.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</p>
        </div>

        {/* CARD FINANCIAMIENTOS */}
        <div style={{
          background: '#e3f2fd',
          borderRadius: '10px',
          padding: '20px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          maxWidth: '400px',
          width: '100%',
          flex: '1'
        }}>
          <h4 className="mb-2">Financiamientos</h4>
          <hr />

          {/* CONTENEDOR FLEX INTERNO */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

            {/* TEXTOS */}
            <div>
              <p><strong>Total de financiamientos:</strong> {cantidadFinanciamientos}</p>
              <p><strong>Monto total pendiente:</strong></p>
              <p className="mt-2">₡{totalFinanciamientosPendientes.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</p>
            </div>

            {/* GRAFICO PIE */}
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

          {/* CUADROS DE LEYENDA */}
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
    </div>
  );
};