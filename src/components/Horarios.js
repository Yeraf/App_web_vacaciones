// Código actualizado con animación suave para el modal
import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';


const usuario = JSON.parse(localStorage.getItem('usuario'));
const localidad = usuario?.Localidad || '';

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const Horarios = () => {
  const [empresas, setEmpresas] = useState([]);
  const [tituloSemana, setTituloSemana] = useState('SEMANA DEL 28/4/2025');
  const [empresaPreview, setEmpresaPreview] = useState(null);
  const [seccionesVisibles, setSeccionesVisibles] = useState({});
  const printRef = useRef();

  useEffect(() => {
    const empresasGuardadas = localStorage.getItem('empresasHorarios');
    const tituloGuardado = localStorage.getItem('tituloSemana');
    if (empresasGuardadas) {
      const cargadas = JSON.parse(empresasGuardadas).map(e => ({
        ...e,
        colaboradoresHoras: e.colaboradoresHoras || []
      }));
      setEmpresas(cargadas);
    }
    if (tituloGuardado) setTituloSemana(tituloGuardado);
  }, []);

  useEffect(() => {
    const empresasGuardadas = localStorage.getItem('empresasHorarios');
    const tituloGuardado = localStorage.getItem('tituloSemana');
    if (empresasGuardadas) {
      const todas = JSON.parse(empresasGuardadas).map(e => ({
        ...e,
        colaboradoresHoras: e.colaboradoresHoras || []
      }));

      const filtradas = todas.filter(e => e.localidad === localidad);
      setEmpresas(filtradas);
    }
    if (tituloGuardado) setTituloSemana(tituloGuardado);
  }, []);

  useEffect(() => {
    const todasEmpresas = JSON.parse(localStorage.getItem('empresasHorarios')) || [];
    const otrasEmpresas = todasEmpresas.filter(e => e.localidad !== localidad);
    const actualizadas = [...otrasEmpresas, ...empresas.map(e => ({ ...e, localidad }))];
    localStorage.setItem('empresasHorarios', JSON.stringify(actualizadas));
  }, [empresas]);

  useEffect(() => {
    localStorage.setItem('tituloSemana', tituloSemana);
  }, [tituloSemana]);

  const toggleSeccion = (empresaIdx, tipo) => {
    const key = `${empresaIdx}-${tipo}`;
    setSeccionesVisibles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const agregarEmpresa = () => {
    const nuevoNombre = prompt("Ingrese el nombre de la empresa:");
    if (nuevoNombre) {
      setEmpresas([
        ...empresas,
        { nombre: nuevoNombre, localidad, horarios: [], colaboradoresHoras: [] }
      ]);
    }
  };

  const eliminarEmpresa = (index) => {
    if (window.confirm("¿Deseas eliminar esta empresa?")) {
      const actualizadas = empresas.filter((_, i) => i !== index);
      setEmpresas(actualizadas);
    }
  };

  const agregarFila = (index, tipo) => {
    const nuevaEmpresa = [...empresas];
    const nuevaFila = {
      horario: '',
      personal: '',
      datos: diasSemana.reduce((acc, dia) => {
        acc[dia] = '';
        return acc;
      }, {})
    };
    nuevaEmpresa[index][tipo].push(nuevaFila);
    setEmpresas(nuevaEmpresa);
  };

  const handleCambio = (empresaIdx, filaIdx, campo, valor, tipo) => {
    const nuevasEmpresas = [...empresas];
    nuevasEmpresas[empresaIdx][tipo][filaIdx][campo] = valor;
    setEmpresas(nuevasEmpresas);
  };

  const handleCambioDia = (empresaIdx, filaIdx, dia, valor, tipo) => {
    const nuevasEmpresas = [...empresas];
    nuevasEmpresas[empresaIdx][tipo][filaIdx].datos[dia] = valor;
    setEmpresas(nuevasEmpresas);
  };

  const imprimirVista = () => {
    const contenido = printRef.current.innerHTML;
    const ventana = window.open('', '', 'height=700,width=900');
    ventana.document.write('<html><head><title>Vista Previa</title>');
    ventana.document.write("<style>body{font-family:sans-serif} table{width:100%;border-collapse:collapse} th,td{border:1px solid #ccc;padding:6px;text-align:center} th{background:#eee}</style>");
    ventana.document.write('</head><body>');
    ventana.document.write(contenido);
    ventana.document.write('</body></html>');
    ventana.document.close();
    ventana.print();
  };

  const exportarComoImagen = async () => {
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current);
    const link = document.createElement('a');
    link.download = `${empresaPreview.empresa.nombre}_horario.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="p-4 text-white bg-gray-950 min-h-screen div-horarios">
      <h3 className="text-center text-xl font-bold mb-4 text-title-h3-horarios">Organizador de Horarios Semanal</h3>
      <div className='input-buttom-crear-empresa'>
        <div className="text-center mb-6">
          <button
            className="bg-green-700 me-3 hover:bg-green-800 text-black px-3 py-1 rounded text-sm"
            onClick={agregarEmpresa}
          >
            ➕ Agregar Empresa
          </button>
        </div>

        <div className="text-center mb-4">
          <input
            className="text-center p-1 rounded bg-white text-black text-sm"
            value={tituloSemana}
            onChange={(e) => setTituloSemana(e.target.value)}
          />
        </div>

      </div>

      {empresas.map((empresa, idx) => (
        <div key={idx} className="mb-10 border border-gray-600 rounded p-4 bg-gray-800 overflow-x-auto">
          <div className="flex justify-between items-center mb-4 ">
            <h3 className="text-lg font-semibold text-white ">{empresa.nombre} <button
              onClick={() => eliminarEmpresa(idx)}
              className="text-red-400 hover:text-red-600 text-sm button-eliminar-empresa"
              title="Eliminar empresa"
            >
              ❌
            </button></h3>

          </div>

          {[['horarios', 'Tiempos Completos'], ['colaboradoresHoras', 'Colaboradores por Horas']].map(([tipo, titulo]) => {
            const key = `${idx}-${tipo}`;
            const visible = seccionesVisibles[key] ?? true;
            return (
              <div key={tipo} className="mb-6">
                <div className="flex justify-between items-center mb-2 text-white">
                  <h4 className="text-sm font-bold div-p-titulo-empresas">{titulo}</h4>
                  <button
                    onClick={() => toggleSeccion(idx, tipo)}
                    className="text-xs bg-gray-600 hover:bg-gray-700 text-black px-2 py-0.5 rounded"
                  >
                    {visible ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                {visible && (
                  <div className="overflow-x-auto">
                    <table className="table-auto text-sm w-full border-collapse border border-gray-700">
                      <thead>
                        <tr>
                          <th className="border border-gray-600 p-1 bg-gray-700 text-white">Horario</th>
                          <th className="border border-gray-600 p-1 bg-gray-700 text-white">Personal</th>
                          {diasSemana.map((dia) => (
                            <th key={dia} className="border border-gray-600 p-1 bg-gray-700 text-white">{dia}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {empresa[tipo].map((fila, filaIdx) => (
                          <tr key={filaIdx}>
                            <td className="border border-gray-600 p-1">
                              <input
                                className="w-full p-1 text-xs text-black rounded bg-white"
                                value={fila.horario}
                                onChange={(e) => handleCambio(idx, filaIdx, 'horario', e.target.value, tipo)}
                              />
                            </td>
                            <td className="border border-gray-600 p-1">
                              <input
                                className="w-full p-1 text-xs text-black rounded bg-white"
                                value={fila.personal}
                                onChange={(e) => handleCambio(idx, filaIdx, 'personal', e.target.value, tipo)}
                              />
                            </td>
                            {diasSemana.map((dia) => (
                              <td key={dia} className="border border-gray-600 p-1">
                                <input
                                  className="w-full p-1 text-xs text-black rounded bg-white"
                                  value={fila.datos[dia]}
                                  onChange={(e) => handleCambioDia(idx, filaIdx, dia, e.target.value, tipo)}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="text-right mt-2">
                      <button
                        onClick={() => agregarFila(idx, tipo)}
                        className="text-xs px-3 py-1 bg-blue-700 rounded hover:bg-blue-800 div-button-agregar-fila"
                      >
                        ➕ Agregar Fila
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex justify-end mt-4 gap-2">
            <button
              onClick={() => setEmpresaPreview({ empresa, titulo: tituloSemana })}
              className="text-xs px-3 py-1 bg-yellow-600 rounded hover:bg-yellow-700"
            >
              👁️ Vista
            </button>
          </div>
        </div>
      ))}

      {empresaPreview && (
        <div className="modal-overlay">
          <div className="modal-content animate-fadein">

            <div ref={printRef} className="mt-6 text-black">
              <h2 className="text-center text-xl font-bold mb-1">{empresaPreview.empresa.nombre}</h2>
              <p className="text-center mb-4 text-sm font-semibold">{empresaPreview.titulo}</p>
              {[['horarios', 'Tiempos Completos'], ['colaboradoresHoras', 'Colaboradores por Horas']].map(([tipo, titulo]) => (
                <div key={tipo} className="mb-6">
                  <h4 className="text-center text-sm font-bold mb-2">{titulo}</h4>
                  <table className="table-auto text-sm w-full border-collapse border border-gray-400">
                    <thead>
                      <tr>
                        <th className="border border-gray-400 p-1 bg-gray-200">Horario</th>
                        <th className="border border-gray-400 p-1 bg-gray-200">Personal</th>
                        {diasSemana.map((dia) => (
                          <th key={dia} className="border border-gray-400 p-1 bg-gray-200">{dia}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {empresaPreview.empresa[tipo].map((fila, idx) => (
                        <tr key={idx}>
                          <td className="border border-gray-300 p-1 text-center font-medium">{fila.horario}</td>
                          <td className="border border-gray-300 p-1 text-center font-medium">{fila.personal}</td>
                          {diasSemana.map((dia) => (
                            <td key={dia} className="border border-gray-300 p-1 text-center">{fila.datos[dia]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
            <div className="text-center mt-4 flex justify-center gap-4">
              <button onClick={imprimirVista} className="bg-green-600 hover:bg-green-700 text-black px-4 py-1 rounded div-button-icons">
                🖨️ Imprimir
              </button>
              <button onClick={exportarComoImagen} className="bg-blue-600 hover:bg-blue-700 text-black px-4 py-1 rounded">
                📸 Exportar Imagen
              </button>
            </div>
            <button
              onClick={() => setEmpresaPreview(null)}
              className="absolute text-sm font-bold btn-danger button-cerrar-modal"
            >CERRAR</button>
          </div>
        </div>
      )}
    </div>
  );
};
