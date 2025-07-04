// ContenedorImpresionVale.js
import html2pdf from 'html2pdf.js';
import ReactDOMServer from 'react-dom/server';
import React from 'react';

const ContenedorImpresionVale = ({ vale, empresa }) => (
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
      <h4>Vale de Dinero</h4>
    </div>
    <div style={{ lineHeight: '1.6' }}>
      <p><strong>Nombre:</strong> {vale.Nombre}</p>
      <p><strong>Fecha:</strong> {vale.FechaRegistro?.slice(0, 10)}</p>
      <p><strong>Monto:</strong> ₡{parseFloat(vale.MontoVale || 0).toLocaleString('es-CR', { minimumFractionDigits: 2 })}</p>
      <p><strong>Motivo:</strong> {vale.Motivo}</p>
      <p><strong>Empresa:</strong> {vale.Empresa}</p>
    </div>
    <div style={{ textAlign: 'center', marginTop: '30px' }}>
      <hr />
      <em>Gracias por su gestión</em>
    </div>
  </div>
);

export const generarPDFVale = async (vale) => {
  const localidad = localStorage.getItem("localidad");
  if (!vale || !localidad) {
    alert("Faltan datos para imprimir el vale.");
    return;
  }

  try {
    const res = await fetch(`http://localhost:3001/api/localidades/${encodeURIComponent(localidad)}`);
    if (!res.ok) throw new Error("Error al obtener datos de la empresa");
    const empresa = await res.json();

    // ✅ Renderiza el componente como HTML estático confiable
    const contenidoHTML = ReactDOMServer.renderToStaticMarkup(
      <ContenedorImpresionVale vale={vale} empresa={empresa} />
    );

    const div = document.createElement("div");
    div.innerHTML = contenidoHTML;
    document.body.appendChild(div);

    html2pdf().from(div).set({
      margin: 10,
      filename: `Vale_${vale.Nombre || 'vale'}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' }
    }).save().then(() => {
      document.body.removeChild(div);
    });

  } catch (error) {
    console.error("❌ Error generando PDF del vale:", error);
    alert("Error generando PDF del vale. Ver consola.");
  }
};