import { EncabezadoEmpresa } from './EncabezadoEmpresa';
import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ContratoColaborador = () => {
  const [form, setForm] = useState({
    CedulaID: "",
    Nombre: "",
    FechaContrato: "",
    Contenido: `CONTRATO INDIVIDUAL DE TRABAJO
Entre el patrono: ____________________________________________, con cédula jurídica/número de identificación: _______________________, con domicilio en: ____________________________________________________, en adelante llamado "EL PATRONO";

Y la persona trabajadora:
Nombre completo: _________________________________________
Cédula de identidad: _______________________________________
Teléfono: _________________________________________________
Correo electrónico: ________________________________________
Domicilio: _________________________________________________

En adelante denominada "LA PERSONA TRABAJADORA", se acuerda lo siguiente:

CLÁUSULAS
PRIMERA: Puesto de trabajo
La persona trabajadora se obliga a prestar sus servicios personales al patrono en el puesto de:
____________________________________________
Desempeñando sus labores de forma responsable, eficiente y en estricto apego a las instrucciones dadas por el patrono.

SEGUNDA: Jornada laboral
La jornada laboral será de:
____ horas por día, de __________ a __________, de lunes a viernes (o indicar días específicos).
Cualquier modificación será comunicada y acordada entre ambas partes.

TERCERA: Lugar de trabajo
El trabajo se realizará en:
___________________________________________________________

CUARTA: Remuneración
El patrono pagará a la persona trabajadora un salario de:
_________________________________________ colones).
El cual se cancelará de forma [semanal/quincenal/mensual] mediante [efectivo, transferencia u otro medio], cumpliendo con las obligaciones legales (CCSS, INS, etc.).

QUINTA: Obligaciones
La persona trabajadora se compromete a:
- Cumplir con el horario establecido.
- Respetar el reglamento interno.
- Cuidar las herramientas y equipo de trabajo.
- Mantener confidencialidad sobre la información del negocio.

SEXTA: Periodo de prueba (opcional)
Se establece un período de prueba de ___ días, durante el cual cualquiera de las partes podrá dar por terminado este contrato sin responsabilidad alguna.

SÉPTIMA: Terminación del contrato
Este contrato podrá darse por terminado según lo establecido en el Código de Trabajo, por mutuo acuerdo, renuncia, despido justificado o sin justa causa.

OCTAVA: Disposiciones finales
Cualquier aspecto no previsto en este contrato se regirá por lo dispuesto en el Código de Trabajo y demás leyes laborales aplicables.

Firmado en _________________________, a los ______ días del mes de __________ del año _______.

Firma del patrono: _______________________________
Nombre completo: _______________________________

Firma de la persona trabajadora: _______________________________
Nombre completo: _______________________________`
  });

  const [empresa, setEmpresa] = useState(null);

  useEffect(() => {
    const localidad = localStorage.getItem("localidad");
    if (localidad) {
      fetch(`http://localhost:3001/api/localidades/${encodeURIComponent(localidad)}`)
        .then(res => res.json())
        .then(data => setEmpresa(data))
        .catch(err => console.error("Error cargando encabezado:", err));
    }
  }, []);

  const guardarContrato = async () => {
    const body = {
      ...form,
      Empresa: localStorage.getItem("localidad"),
      Usuario: localStorage.getItem("usuario"),
      FechaRegistro: new Date().toISOString()
    };

    const res = await fetch("http://localhost:3001/api/contratos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (res.ok) alert("Contrato guardado correctamente.");
    else alert("Error al guardar contrato.");
  };

  const descargarPDF = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'letter' });
    let y = 15;

    if (empresa) {
      doc.setFontSize(11);
      doc.setFont("times", "bold");
      doc.text(empresa.Empresa || '', 15, y); y += 6;
      doc.setFont("times", "normal");
      doc.text(empresa.RazonSocial || '', 15, y); y += 6;
      doc.text(`N° Cédula: ${empresa.NumeroCedula || ''}`, 15, y); y += 6;
      doc.text(`Correo: ${empresa.Correo || ''}`, 15, y); y += 6;
      doc.text(`Teléfono: ${empresa.Telefono || ''}`, 15, y); y += 6;
      doc.text(empresa.Direccion || '', 15, y); y += 10;
    }

    doc.setFontSize(12);
    doc.setFont("times", "bold");
    doc.text("Contrato Laboral", 105, y, { align: "center" });
    y += 10;

    doc.setFont("times", "normal");
    const lineas = form.Contenido.split('\n');
    lineas.forEach((linea) => {
      const textoDividido = doc.splitTextToSize(linea, 180);
      textoDividido.forEach((l) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
        doc.text(l, 15, y);
        y += 7;
      });
    });

    doc.save(`Contrato_${form.Nombre || "colaborador"}.pdf`);
  };

  return (
    <div className="container mt-4">
      <EncabezadoEmpresa />
      <h4>Contrato Laboral</h4>

      <div className="row mb-2">
        <div className="col-md-4">
          <label>Cédula</label>
          <input className="form-control" value={form.CedulaID} onChange={e => setForm({ ...form, CedulaID: e.target.value })} />
        </div>
        <div className="col-md-4">
          <label>Nombre</label>
          <input className="form-control" value={form.Nombre} onChange={e => setForm({ ...form, Nombre: e.target.value })} />
        </div>
        <div className="col-md-4">
          <label>Fecha Contrato</label>
          <input type="date" className="form-control" value={form.FechaContrato} onChange={e => setForm({ ...form, FechaContrato: e.target.value })} />
        </div>
      </div>

      <div className="mb-3">
        <label>Contenido del Contrato</label>
        <textarea
          rows={25}
          className="form-control"
          value={form.Contenido}
          onChange={e => setForm({ ...form, Contenido: e.target.value })}
        />
      </div>

      <div className="text-end">
        <button className="btn btn-secondary me-2" onClick={descargarPDF}>Descargar PDF</button>
        <button className="btn btn-primary" onClick={guardarContrato}>Guardar</button>
      </div>
    </div>
  );
};

export default ContratoColaborador;


