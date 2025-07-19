// ContenedorImpresionBoleta.js
import html2pdf from 'html2pdf.js';
import ReactDOMServer from 'react-dom/server';

const ContenedorImpresion = ({ boleta, empresa }) => (
  <div style={{ width: '100%', padding: '30px', fontFamily: 'Arial', fontSize: '14px' }}>
    {empresa && (
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        {empresa.Logo && (
          <div style={{ marginBottom: '10px' }}>
            <img src={empresa.Logo} alt="Logo empresa" style={{ maxWidth: '150px', maxHeight: '100px' }} />
          </div>
        )}
        <h3>{empresa.Empresa}</h3>
        <p>{empresa.RazonSocial}</p>
        <p><strong>N° Cédula:</strong> {empresa.NumeroCedula}</p>
        <p><strong>Correo:</strong> {empresa.Correo}</p>
        <p><strong>Teléfono:</strong> {empresa.Telefono}</p>
        <hr />
      </div>
    )}
    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
      <h4>Boleta de Vacaciones</h4>
    </div>
    <div style={{ lineHeight: '1.6' }}>
      <p><strong>Colaborador:</strong> {boleta.Nombre} {boleta.Apellidos || ''}</p>
      <p><strong>Cédula:</strong> {boleta.CedulaID}</p>
      <p><strong>Desde:</strong> {boleta.FechaSalida?.slice(0, 10)}</p>
      <p><strong>Hasta:</strong> {boleta.FechaEntrada?.slice(0, 10)}</p>
      <p><strong>Días solicitados:</strong> {boleta.Dias || boleta.DiasTomados || boleta.CantidadDias || 'N/D'}</p>
      <p><strong>Motivo:</strong> {boleta.Detalle}</p>
      <p><strong>Boleta:</strong> {boleta.NumeroBoleta}</p>
      <p><strong style={{ fontWeight: 'bold' }}>Días disponibles:</strong> <strong>{boleta.DiasDisponibles || 'N/D'}</strong></p>
    </div>
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
    <div style={{ textAlign: 'center', marginTop: '30px' }}>
      <hr />
      <p style={{ marginTop: "20px", textAlign: "center" }}>
        Fecha de impresión: {new Date().toLocaleDateString()}
      </p>
      <em>Gracias por su gestión</em>
    </div>
  </div>
);

export const generarPDFBoleta = async (boleta) => {
  const localidad = localStorage.getItem("localidad");
  if (!boleta || !localidad) {
    alert("Faltan datos para generar la boleta.");
    return;
  }

  try {
    const res = await fetch(`http://localhost:3001/api/localidades/${encodeURIComponent(localidad)}`);
    if (!res.ok) throw new Error("Error al obtener datos de la empresa");
    const empresa = await res.json();

    // Renderizar el componente a HTML estático
    const contenidoHTML = ReactDOMServer.renderToStaticMarkup(
      <ContenedorImpresion boleta={boleta} empresa={empresa} />
    );

    // Crear un contenedor temporal
    const div = document.createElement("div");
    div.innerHTML = contenidoHTML;
    document.body.appendChild(div);

    html2pdf().from(div).set({
      margin: 10,
      filename: `Boleta_${boleta.NumeroBoleta || 'vacaciones'}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' }
    }).save().then(() => {
      document.body.removeChild(div);
    });

  } catch (error) {
    console.error("❌ Error generando PDF:", error);
    alert("Error generando PDF. Ver consola.");
  }
};