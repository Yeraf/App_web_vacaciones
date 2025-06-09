import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { EncabezadoEmpresa } from './EncabezadoEmpresa';

export const ImpresionBoletaVacaciones = ({ boleta }) => {
  const ref = useRef();

  const handleImprimir = useReactToPrint({
    content: () => ref.current,
  });

  return (
    <>
      <div ref={ref} style={{ width: '80mm', padding: '10px' }}>
        <EncabezadoEmpresa />

        <div style={{ textAlign: 'center' }}>
          <h4>Boleta de Vacaciones</h4>
          <p><strong>Colaborador:</strong> {boleta.Nombre}</p>
          <p><strong>Cédula:</strong> {boleta.CedulaID}</p>
          <p><strong>Desde:</strong> {boleta.FechaSalida}</p>
          <p><strong>Hasta:</strong> {boleta.FechaEntrada}</p>
          <p><strong>Días solicitados:</strong> {boleta.Dias}</p>
          <p><strong>Motivo:</strong> {boleta.Detalle}</p>
          <p><strong>Boleta:</strong> {boleta.NumeroBoleta}</p>
        </div>
      </div>

      <div className="text-end mt-3">
        <button onClick={handleImprimir} className="btn btn-primary btn-sm">
          Imprimir Boleta
        </button>
      </div>
    </>
  );
};