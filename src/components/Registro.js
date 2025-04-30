import React, { useState } from 'react';

export const Registro = () => {
  const [cedula, setCedula] = useState('');
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const determinarTipoCedula = (cedula) => {
    if (!cedula) return 'Desconocido';
    if (cedula.length === 9) return 'Persona Física';
    if (cedula.length === 10) return 'Persona Jurídica';
    if (cedula.length === 12) return 'DIMEX';
    return 'Formato no reconocido';
  };

  const buscarContribuyente = async () => {
    try {
      setCargando(true);
      setError('');
      setResultado(null);

      const response = await fetch(`https://apis.gometa.org/cedulas/${cedula}`);

      if (!response.ok) {
        throw new Error('No se encontró la cédula o error en la búsqueda');
      }

      const data = await response.json();

      if (Object.keys(data).length === 0) {
        throw new Error('No se encontró información para esta cédula.');
      }

      // Agregamos tipo determinado por cantidad de dígitos
      data.tipoManual = determinarTipoCedula(cedula);

      setResultado(data);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al consultar la cédula.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Consultar Cédula (GoMeta API)</h2>

      <div className="mb-3">
        <label>Cédula (sin guiones):</label>
        <input
          type="text"
          className="form-control"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
          placeholder="Ej: 3101234567"
        />
      </div>

      <button
        className="btn btn-primary"
        onClick={buscarContribuyente}
        disabled={cargando || !cedula}
      >
        {cargando ? 'Buscando...' : 'Buscar'}
      </button>

      {/* Resultado */}
      {resultado && (
        <div className="mt-4 p-3 border rounded bg-light">
          <h5>Resultados:</h5>
          <p><strong>Nombre:</strong> {resultado.nombre}</p>
          <p><strong>Cédula:</strong> {resultado.cedula}</p>
          <p><strong>Tipo detectado:</strong> {resultado.tipoManual}</p>
          <p><strong>Fuente de datos:</strong> GoMeta API pública</p>
          {/* No hay correo ni teléfono, no se muestran */}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-danger mt-3">
          {error}
        </div>
      )}
    </div>
  );
};