import { useEffect, useState } from "react";
import jsPDF from "jspdf";

const EditarContratoModal = ({ contratoID, onCerrar }) => {
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (contratoID) {
      fetch(`http://localhost:3001/api/contratos/${contratoID}`)
        .then(res => res.json())
        .then(setForm)
        .catch(err => console.error("Error al cargar contrato:", err));
    }
  }, [contratoID]);

  const guardar = async () => {
    const response = await fetch(`http://localhost:3001/api/contratos/${contratoID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (response.ok) {
      alert("Contrato actualizado");
      onCerrar(); // cerrar modal y refrescar lista
    } else {
      alert("Error al actualizar contrato");
    }
  };

  const descargarPDF = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'letter' });
    let y = 20;
    doc.setFontSize(12);
    doc.text("Contrato Laboral", 105, y, { align: "center" });
    y += 10;

    const lineas = form.Contenido.split('\n');
    lineas.forEach((linea) => {
      const texto = doc.splitTextToSize(linea, 180);
      texto.forEach(l => {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.text(l, 15, y);
        y += 7;
      });
    });

    doc.save(`Contrato_${form.Nombre || 'colaborador'}.pdf`);
  };

  if (!form) return <div className="p-3">Cargando contrato...</div>;

  return (
    <div className="modal d-block bg-white p-4 rounded shadow">
      <h5>Editar Contrato</h5>
      <div className="mb-2">
        <label>Nombre</label>
        <input className="form-control" value={form.Nombre} onChange={e => setForm({ ...form, Nombre: e.target.value })} />
      </div>
      <div className="mb-2">
        <label>Cédula</label>
        <input className="form-control" value={form.CedulaID} onChange={e => setForm({ ...form, CedulaID: e.target.value })} />
      </div>
      <div className="mb-2">
        <label>Fecha de Contrato</label>
        <input type="date" className="form-control" value={form.FechaContrato?.substring(0, 10)} onChange={e => setForm({ ...form, FechaContrato: e.target.value })} />
      </div>
      <div className="mb-2">
        <label>Contenido</label>
        <textarea className="form-control" rows={15} value={form.Contenido} onChange={e => setForm({ ...form, Contenido: e.target.value })} />
      </div>

      <div className="text-end">
        <button className="btn btn-secondary me-2" onClick={descargarPDF}>Descargar PDF</button>
        <button className="btn btn-success" onClick={guardar}>Guardar Cambios</button>
        <button className="btn btn-danger ms-2" onClick={onCerrar}>Cerrar</button>
      </div>
    </div>
  );
};

export default EditarContratoModal;