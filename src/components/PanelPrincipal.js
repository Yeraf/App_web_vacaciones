import React, { useEffect, useState } from 'react';

export const PanelPrincipal = () => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const [tipoCambio, setTipoCambio] = useState(null);
  const [tipoCambioManual, setTipoCambioManual] = useState('');
  const [usarManual, setUsarManual] = useState(false);
  const [colones, setColones] = useState('');
  const [dolares, setDolares] = useState('');

  const [expresion, setExpresion] = useState('');
  const [resultado, setResultado] = useState('');

  useEffect(() => {
    const fetchTipoCambio = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();
        if (data && data.rates && data.rates.CRC) {
          setTipoCambio(data.rates.CRC);
        }
      } catch (error) {
        console.error('Error al obtener tipo de cambio:', error);
      }
    };

    fetchTipoCambio();
    const interval = setInterval(fetchTipoCambio, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getTipoCambioActual = () =>
    usarManual && parseFloat(tipoCambioManual) > 0
      ? parseFloat(tipoCambioManual)
      : tipoCambio;

  const handleColonesChange = (e) => {
    const valor = e.target.value;
    setColones(valor);
    const tc = getTipoCambioActual();
    if (tc) {
      setDolares((valor / tc).toFixed(2));
    }
  };

  const handleDolaresChange = (e) => {
    const valor = e.target.value;
    setDolares(valor);
    const tc = getTipoCambioActual();
    if (tc) {
      setColones((valor * tc).toFixed(2));
    }
  };

  const handleButtonClick = (valor) => {
    if (valor === 'C') {
      setExpresion('');
      setResultado('');
    } else if (valor === '=') {
      try {
        // eslint-disable-next-line no-eval
        const res = eval(expresion);
        setResultado(res);
      } catch {
        setResultado('Error');
      }
    } else {
      setExpresion(expresion + valor);
    }
  };

  const botones = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '0', 'C', '=', '+'
  ];

  return (
    <div style={{ padding: '20px' }}>

      {/* CONTENEDOR FLEX */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        marginTop: '30px',
        alignItems: 'center',
        textAlign: 'center',
        
      }}>
        {/* CARD DE TIPO DE CAMBIO */}
        <div style={{
          background: '#f1f1f1',
          borderRadius: '10px',
          padding: '20px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          maxWidth: '360px',
          width: '100%',
          flex: '1'
        }}>
          <h4 className="mb-3">Tipo de Cambio (₡ / $)</h4>

          {tipoCambio ? (
            <>
              <p>
                <strong>
                  ₡{tipoCambio.toLocaleString('es-CR', { minimumFractionDigits: 2 })} = $1
                </strong>
              </p>

              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="usarManual"
                  checked={usarManual}
                  onChange={(e) => setUsarManual(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="usarManual">
                  Usar tipo de cambio personalizado
                </label>
              </div>

              {usarManual && (
                <div className="mb-3">
                  <label>Mi tipo de cambio ($):</label>
                  <input
                    type="number"
                    className="form-control"
                    value={tipoCambioManual}
                    onChange={(e) => setTipoCambioManual(e.target.value)}
                    placeholder="Ej. 610"
                  />
                </div>
              )}

              <div className="mb-3">
                <label>Colones (₡):</label>
                <input
                  type="number"
                  className="form-control"
                  value={colones}
                  onChange={handleColonesChange}
                />
                <span className="text-muted small">
                  ₡{parseFloat(colones || 0).toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="mb-3">
                <label>Dólares ($):</label>
                <input
                  type="number"
                  className="form-control"
                  value={dolares}
                  onChange={handleDolaresChange}
                />
                <span className="text-muted small">
                  ${parseFloat(dolares || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </>
          ) : (
            <p>Cargando tipo de cambio...</p>
          )}
        </div>

        {/* CARD CALCULADORA */}
        <div style={{
          background: '#fefefe',
          borderRadius: '10px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          maxWidth: '360px',
          width: '100%',
          flex: '1'
        }}>
          <h4 className="mb-3">Calculadora</h4>

          <div className="form-control text-end mb-2" style={{ fontSize: '1.2rem' }}>
            {expresion || '0'}
          </div>

          <div className="form-control text-end mb-3 bg-light" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {resultado !== '' ? resultado.toLocaleString('es-CR') : ' '}
          </div>

          <div className="d-grid gap-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)', display: 'grid' }}>
            {botones.map((btn) => (
              <button
                key={btn}
                className={`btn ${btn === '=' ? 'btn-success' : btn === 'C' ? 'btn-danger' : 'btn-secondary'}`}
                onClick={() => handleButtonClick(btn)}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};