import { useEffect, useState } from 'react';

const ListaContratos = ({ onEditar }) => {
  const [contratos, setContratos] = useState([]);
  const empresa = localStorage.getItem('localidad');

  useEffect(() => {
    fetch(`http://localhost:3001/api/contratos?empresa=${encodeURIComponent(empresa)}`)
      .then(res => res.json())
      .then(setContratos)
      .catch(err => console.error("Error cargando contratos:", err));
  }, [empresa]);

  return (
    <div className="container mt-4">
      <h5>Contratos registrados</h5>
      <table className="table table-bordered table-sm">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Cédula</th>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {contratos.map(c => (
            <tr key={c.ID}>
              <td>{c.Nombre}</td>
              <td>{c.CedulaID}</td>
              <td>{new Date(c.FechaContrato).toLocaleDateString()}</td>
              <td>{c.Usuario}</td>
              <td>
                <button className="btn btn-primary btn-sm" onClick={() => onEditar(c.ID)}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaContratos;